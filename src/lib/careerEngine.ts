import { SkillItem, ResumeData } from "@/types";
import { validateEnvironment } from "./env";

export interface RoleRecommendation {
  roleId: string;
  title: string;
  category: string;
  matchScore: number;
  matchLevel: "Excellent Match" | "Strong Match" | "Developing Match" | "Long-Term Opportunity";
  matchedSkills: string[];
  missingSkills: string[];
  reasons: string[];
  recommendedActions: string[];
  experienceAlignment: string;
  educationAlignment: string;
  recommendedProjects: string[];
  recommendedCertifications: string[];
  analysisMode: "local" | "ai";
}

export const CAREER_ROLES_TAXONOMY = [
  {
    roleId: "frontend-developer",
    title: "Frontend Developer",
    category: "Software Engineering",
    requiredSkills: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "REST APIs", "Git"],
    tools: ["Webpack", "Vite", "Figma"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Responsive SaaS Dashboard", "Interactive Component Library"],
    recommendedCertifications: ["Meta Front-End Developer Certificate"],
  },
  {
    roleId: "full-stack-developer",
    title: "Full-Stack Developer",
    category: "Software Engineering",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "Express.js", "SQL & Relational DBs", "REST APIs"],
    tools: ["Docker", "Git", "PostgreSQL"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Full-Stack Next.js & Supabase Web App", "RESTful Microservice API"],
    recommendedCertifications: ["AWS Certified Cloud Associate"],
  },
  {
    roleId: "backend-developer",
    title: "Backend Developer",
    category: "Software Engineering",
    requiredSkills: ["Node.js", "Express.js", "Python", "SQL & Relational DBs", "PostgreSQL", "REST APIs"],
    tools: ["Docker", "Redis", "Git"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["High-Throughput API Gateway", "Database Query Performance Suite"],
    recommendedCertifications: ["AWS Certified Developer"],
  },
  {
    roleId: "data-analyst",
    title: "Data Analyst",
    category: "Data & Analytics",
    requiredSkills: ["SQL & Relational DBs", "Python", "STAR Behavioral Communication"],
    tools: ["Tableau", "Pandas", "Excel"],
    preferredDegree: "Statistics / Data Science / Math",
    recommendedProjects: ["Telemetry Visualization Dashboard", "Customer Churn Prediction Model"],
    recommendedCertifications: ["Google Data Analytics Professional Certificate"],
  },
  {
    roleId: "cloud-devops-engineer",
    title: "Cloud & DevOps Engineer",
    category: "Infrastructure",
    requiredSkills: ["Docker & Containerization", "AWS Cloud", "Git Version Control", "Python"],
    tools: ["Kubernetes", "Terraform", "GitHub Actions"],
    preferredDegree: "Computer Science / Information Technology",
    recommendedProjects: ["Automated CI/CD Pipeline Deployment", "Containerized Infrastructure Suite"],
    recommendedCertifications: ["AWS Solutions Architect Associate"],
  },
];

export function calculateRoleRecommendations(
  userSkills: SkillItem[],
  resume?: ResumeData | null
): RoleRecommendation[] {
  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));
  const envCaps = validateEnvironment();
  const analysisMode: "local" | "ai" = envCaps.hasAiKey ? "ai" : "local";

  const recommendations: RoleRecommendation[] = CAREER_ROLES_TAXONOMY.map((roleDef) => {
    // 1. Skill Overlap (40% weight)
    const matched = roleDef.requiredSkills.filter((req) =>
      Array.from(userSkillNames).some(
        (uSkill) => uSkill.includes(req.toLowerCase()) || req.toLowerCase().includes(uSkill)
      )
    );
    const missing = roleDef.requiredSkills.filter((req) => !matched.includes(req));
    const skillScore = roleDef.requiredSkills.length > 0 ? (matched.length / roleDef.requiredSkills.length) * 40 : 0;

    // 2. Project Overlap (20% weight)
    const hasProjects = resume?.experience && resume.experience.length > 0;
    const projectScore = hasProjects ? 15 : 5;

    // 3. Experience Alignment (15% weight)
    const expScore = resume?.experience && resume.experience.length > 0 ? 12 : 3;

    // 4. Education Alignment (10% weight)
    const eduScore = resume?.education && resume.education.length > 0 ? 8 : 2;

    // 5. Tools & Tech (10% weight)
    const matchedTools = roleDef.tools.filter((tool) =>
      Array.from(userSkillNames).some((uSkill) => uSkill.includes(tool.toLowerCase()))
    );
    const toolScore = roleDef.tools.length > 0 ? (matchedTools.length / roleDef.tools.length) * 10 : 5;

    // 6. Certification Alignment (5% weight)
    const certScore = resume?.certifications && resume.certifications.length > 0 ? 4 : 1;

    // Total Score
    const totalScore = Math.min(Math.round(skillScore + projectScore + expScore + eduScore + toolScore + certScore), 100);

    // Match Level Label
    let matchLevel: RoleRecommendation["matchLevel"] = "Long-Term Opportunity";
    if (totalScore >= 85) matchLevel = "Excellent Match";
    else if (totalScore >= 70) matchLevel = "Strong Match";
    else if (totalScore >= 50) matchLevel = "Developing Match";

    // Reasons & Recommendations
    const reasons: string[] = [];
    if (matched.length > 0) {
      reasons.push(`Matched ${matched.length} core required skills: ${matched.slice(0, 3).join(", ")}.`);
    } else {
      reasons.push("Baseline role match calculated from career target criteria.");
    }
    if (hasProjects) {
      reasons.push("Experience and project background align with core expectations.");
    }

    const recommendedActions: string[] = missing.map(
      (mSkill) => `Complete 1 practical assessment round or project in ${mSkill}`
    );

    return {
      roleId: roleDef.roleId,
      title: roleDef.title,
      category: roleDef.category,
      matchScore: totalScore,
      matchLevel,
      matchedSkills: matched,
      missingSkills: missing,
      reasons,
      recommendedActions: recommendedActions.slice(0, 3),
      experienceAlignment: hasProjects ? "Strong Experience Match" : "Developing Baseline",
      educationAlignment: resume?.education ? "Education Criteria Aligned" : "Degree Verification Pending",
      recommendedProjects: roleDef.recommendedProjects,
      recommendedCertifications: roleDef.recommendedCertifications,
      analysisMode,
    };
  });

  // Sort descending by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
