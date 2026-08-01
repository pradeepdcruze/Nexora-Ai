import { UserProfile, SkillItem, ResumeData, InterviewSession, OpportunityItem, ProgressMetric, CareerTwinSummary } from "@/types";
import { MOCK_OPPORTUNITIES } from "./mockData";
import { parseResumeFileContent } from "./resumeParser";

export interface UserDataStore {
  profile: UserProfile;
  resumes: ResumeData[];
  skills: SkillItem[];
  quizAttempts: any[];
  interviews: InterviewSession[];
  opportunities: OpportunityItem[];
  savedOpportunityIds: string[];
  progressMetrics: ProgressMetric[];
}

const STORAGE_KEY_PREFIX = "nexora_user_v3_";

export function getLocalUserData(userId: string, email?: string, fullName?: string): UserDataStore {
  if (typeof window === "undefined" || !userId) {
    return createEmptyUserData(userId || "guest", email || "", fullName || "");
  }

  const cleanEmail = (email || "").trim().toLowerCase();
  const primaryKey = `${STORAGE_KEY_PREFIX}${userId}`;

  // 1. Check primary key by userId
  const primaryStored = localStorage.getItem(primaryKey);
  if (primaryStored) {
    try {
      const parsed = JSON.parse(primaryStored) as UserDataStore;
      if (parsed && parsed.profile) {
        if (cleanEmail && !parsed.profile.email) {
          parsed.profile.email = cleanEmail;
        }
        return parsed;
      }
    } catch {
      localStorage.removeItem(primaryKey);
    }
  }

  // 2. Check secondary key by email
  if (cleanEmail) {
    const emailKey = `${STORAGE_KEY_PREFIX}email_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const emailStored = localStorage.getItem(emailKey);
    if (emailStored) {
      try {
        const parsed = JSON.parse(emailStored) as UserDataStore;
        if (parsed && parsed.profile) {
          parsed.profile.id = userId;
          parsed.profile.email = cleanEmail;
          localStorage.setItem(primaryKey, JSON.stringify(parsed));
          return parsed;
        }
      } catch {
        localStorage.removeItem(emailKey);
      }
    }

    // 3. Scan all localStorage keys for matching email store
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("nexora_user_")) {
        try {
          const item = localStorage.getItem(k);
          if (item) {
            const parsed = JSON.parse(item) as UserDataStore;
            if (parsed && parsed.profile && parsed.profile.email && parsed.profile.email.trim().toLowerCase() === cleanEmail) {
              parsed.profile.id = userId;
              parsed.profile.email = cleanEmail;
              localStorage.setItem(primaryKey, JSON.stringify(parsed));
              localStorage.setItem(emailKey, JSON.stringify(parsed));
              return parsed;
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  // 4. Create new empty user data store
  const newUserData = createEmptyUserData(userId, email || "", fullName || "");
  localStorage.setItem(primaryKey, JSON.stringify(newUserData));
  if (cleanEmail) {
    const emailKey = `${STORAGE_KEY_PREFIX}email_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    localStorage.setItem(emailKey, JSON.stringify(newUserData));
  }
  return newUserData;
}

export function saveLocalUserData(userId: string, data: UserDataStore) {
  if (typeof window === "undefined" || !userId) return;
  const primaryKey = `${STORAGE_KEY_PREFIX}${userId}`;
  localStorage.setItem(primaryKey, JSON.stringify(data));

  const cleanEmail = (data?.profile?.email || "").trim().toLowerCase();
  if (cleanEmail) {
    const emailKey = `${STORAGE_KEY_PREFIX}email_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    localStorage.setItem(emailKey, JSON.stringify(data));
  }
}

export function clearUserDataSession(_userId?: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem("nexora_active_user_session");
}

export function createEmptyUserData(userId: string, email: string, fullName: string): UserDataStore {
  const displayName = fullName || (email ? email.split("@")[0] : "New Member");
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return {
    profile: {
      id: userId,
      full_name: displayName,
      email: email || "user@nexora.ai",
      avatar_url: avatarUrl,
      headline: "Early Career Professional",
      career_goal: "Update target role and career goals in Settings",
      target_roles: ["Software Engineer"],
      location: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    resumes: [],
    skills: [],
    quizAttempts: [],
    interviews: [],
    opportunities: MOCK_OPPORTUNITIES,
    savedOpportunityIds: [],
    progressMetrics: [],
  };
}

// Deduplicate skill list by lowercase name
export function deduplicateSkills(skills: SkillItem[]): SkillItem[] {
  const map = new Map<string, SkillItem>();
  skills.forEach((s) => {
    const key = s.name.trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, s);
    }
  });
  return Array.from(map.values());
}

// Dynamic Calculations Engine strictly bound to active user data
export function calculateCareerTwinSummary(store: UserDataStore): CareerTwinSummary {
  const { profile, resumes, skills, interviews } = store;

  // 1. Completion Score (0-100)
  let completionScore = 0;
  if (profile.headline && profile.headline !== "Early Career Professional") completionScore += 10;
  if (profile.target_roles.length > 0) completionScore += 10;
  if (resumes.length > 0 && resumes.some((r) => r.status === "parsed")) completionScore += 35;
  if (skills.length > 0) completionScore += Math.min(skills.length * 5, 25);
  if (interviews.length > 0) completionScore += 20;

  // 2. Interview Readiness Score
  let interviewReadiness = 0;
  if (interviews.length > 0) {
    const totalScore = interviews.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0);
    interviewReadiness = Math.round(totalScore / interviews.length);
  }

  // 3. Resume Status
  let resumeStatus: "Synced" | "Pending Update" | "Not Uploaded" = "Not Uploaded";
  if (resumes.length > 0) {
    const latest = resumes[0];
    resumeStatus = latest.status === "parsed" ? "Synced" : "Pending Update";
  }

  // 4. Dynamic Skill Gaps
  const userSkillNames = new Set(skills.map((s) => s.name.toLowerCase()));
  const skillGaps: { skill: string; impact: "High" | "Medium" | "Low"; recommendation: string }[] = [];

  if (!userSkillNames.has("react") && !userSkillNames.has("react / next.js")) {
    skillGaps.push({
      skill: "React / Next.js",
      impact: "High",
      recommendation: "Upload a resume or add React skill to prove frontend competency.",
    });
  }
  if (!userSkillNames.has("system architecture basics") && !userSkillNames.has("system design")) {
    skillGaps.push({
      skill: "System Architecture Basics",
      impact: "High",
      recommendation: "Complete 1 practice scenario to unlock senior role matching.",
    });
  }
  if (!userSkillNames.has("docker & containerization") && !userSkillNames.has("docker")) {
    skillGaps.push({
      skill: "Docker & Containerization",
      impact: "Medium",
      recommendation: "Add containerization experience or complete a micro-quiz.",
    });
  }

  // 5. Dynamic AI Recommendations
  const aiRecommendations: CareerTwinSummary["ai_recommendations"] = [];
  if (resumes.length === 0) {
    aiRecommendations.push({
      id: "rec_upload_resume",
      title: "Upload Your Resume",
      type: "Resume Enhancement",
      reason: "Extract skills and work history to jumpstart your Career Twin score by +35%.",
      est_time: "2 mins",
    });
  }
  if (interviews.length === 0) {
    aiRecommendations.push({
      id: "rec_mock_interview",
      title: "Complete First AI Mock Interview",
      type: "Interview Prep",
      reason: "Evaluate STAR framework responses and communication clarity.",
      est_time: "10 mins",
    });
  }
  if (skills.length < 3) {
    aiRecommendations.push({
      id: "rec_add_skills",
      title: "Verify Core Technical Skills",
      type: "Skill Quiz",
      reason: "Add at least 3 skills to unlock personalized role match scores.",
      est_time: "5 mins",
    });
  }

  return {
    completion_score: completionScore,
    interview_readiness: interviewReadiness,
    resume_status: resumeStatus,
    top_skills: deduplicateSkills(skills).slice(0, 5),
    skill_gaps: skillGaps,
    ai_recommendations: aiRecommendations,
  };
}

export function calculateOpportunityMatches(userSkills: SkillItem[], opportunities: OpportunityItem[]) {
  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));

  return opportunities.map((opp) => {
    if (userSkills.length === 0) {
      return {
        ...opp,
        match_score: 0,
        matching_skills: [],
        missing_skills: opp.required_skills,
        explanation: "Add or verify skills to calculate your personalized job match percentage.",
      };
    }

    const matching = opp.required_skills.filter((req) =>
      Array.from(userSkillNames).some(
        (uSkill) => uSkill.includes(req.toLowerCase()) || req.toLowerCase().includes(uSkill)
      )
    );
    const missing = opp.required_skills.filter((req) => !matching.includes(req));
    const score = Math.round((matching.length / opp.required_skills.length) * 100);

    return {
      ...opp,
      match_score: score,
      matching_skills: matching,
      missing_skills: missing,
      explanation:
        score > 70
          ? `High alignment! Your verified skills match ${matching.length} of ${opp.required_skills.length} core requirements.`
          : `Match score is ${score}%. Learn ${missing.slice(0, 2).join(", ")} to boost your fit.`,
    };
  });
}

/**
 * Save interview session to Supabase database & local UserDataStore,
 * automatically updating Career Twin metrics and Progress Genome trajectory.
 */
export function saveCompletedInterviewSession(
  userId: string,
  session: InterviewSession,
  currentStore: UserDataStore
): UserDataStore {
  // 1. Prepend new interview session
  const updatedInterviews = [session, ...(currentStore.interviews || [])];

  // 2. Calculate updated interview averages & trends
  const totalOverall = updatedInterviews.reduce((acc, s) => acc + (s.scores?.overall || 0), 0);
  const avgOverall = Math.round(totalOverall / updatedInterviews.length);

  const commScores = updatedInterviews.map((s) => s.scores?.communication || 0);
  const techScores = updatedInterviews.map((s) => s.scores?.technical || 0);
  const confScores = updatedInterviews.map((s) => s.scores?.confidence || 0);

  const avgComm = Math.round(commScores.reduce((a, b) => a + b, 0) / commScores.length);
  const avgTech = Math.round(techScores.reduce((a, b) => a + b, 0) / techScores.length);
  const avgConf = Math.round(confScores.reduce((a, b) => a + b, 0) / confScores.length);

  // 3. Automatically Update Progress Genome Metrics
  const todayLabel = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const existingMetrics = currentStore.progressMetrics || [];
  
  const twinSummary = calculateCareerTwinSummary({ ...currentStore, interviews: updatedInterviews });

  const newMetric: ProgressMetric = {
    date: todayLabel,
    twin_score: twinSummary.completion_score,
    interview_score: avgOverall,
    skill_growth: Math.min(100, (currentStore.skills?.length || 0) * 10 + updatedInterviews.length * 5),
    quizzes_completed: (currentStore.quizAttempts?.length || 0) + updatedInterviews.length,
    communication_trend: avgComm,
    technical_trend: avgTech,
    confidence_trend: avgConf,
  };

  const updatedProgressMetrics = [...existingMetrics.filter((m) => m.date !== todayLabel), newMetric];

  // 4. Update Skill confidence levels
  const updatedSkills = (currentStore.skills || []).map((skill) => {
    // boost confidence if technical score was strong
    const boost = session.scores.technical > 75 ? 5 : 2;
    return {
      ...skill,
      confidence: Math.min(100, Math.max(skill.confidence || 50, (skill.confidence || 50) + boost)),
    };
  });

  const updatedStore: UserDataStore = {
    ...currentStore,
    interviews: updatedInterviews,
    skills: updatedSkills,
    progressMetrics: updatedProgressMetrics,
  };

  // 5. Persist locally
  saveLocalUserData(userId, updatedStore);

  return updatedStore;
}
