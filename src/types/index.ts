export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  headline: string;
  bio?: string;
  phone?: string;
  career_goal: string;
  target_roles: string[];
  location: string;
  education?: string;
  social_links?: {
    github?: string;
    linkedin?: string;
    website?: string;
  };
  theme?: "dark" | "light";
  skills?: string[];
  created_at: string;
  updated_at: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Technical' | 'Behavioral' | 'Domain' | 'Tools' | 'Soft Skills';
  proficiency: number; // 0 - 100
  confidence: number; // 0 - 100
  source: 'resume' | 'quiz' | 'interview' | 'manual';
}

export interface ResumeData {
  id: string;
  file_name: string;
  file_url?: string;
  status: 'uploading' | 'parsing' | 'parsed' | 'error';
  uploaded_at: string;
  parsed_skills: string[];
  experience: {
    title: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  education: {
    degree: string;
    department?: string;
    institution: string;
    year: string;
    gpa?: string;
    duration?: string;
  }[];
  certifications: string[];
  confidence_score?: number;
}

export interface InterviewSession {
  id: string;
  user_id?: string;
  interview_type: 'HR' | 'Behavioral' | 'Technical' | 'Role-specific';
  target_role: string;
  difficulty: 'Entry Level' | 'Intermediate' | 'Advanced' | 'Senior';
  scores: {
    overall: number;
    communication: number;
    technical: number;
    confidence: number;
    grammar: number;
    completeness: number;
    problem_solving: number;
    relevance?: number;
  };
  feedback_report?: {
    strengths: string[];
    weaknesses: string[];
    ai_feedback: string;
    improvement_tip: string;
    recommended_topics: string[];
    interview_readiness: 'Needs Practice' | 'Developing' | 'Interview Ready' | 'Exceptional';
  };
  transcript: {
    question: string;
    answer: string;
    feedback: string;
    score: number;
    ideal_response?: string;
    // Strict relevance-first evaluator fields
    verdict?: "Excellent" | "Good" | "Average" | "Poor" | "Unrelated";
    relevance?: number;
    final_score?: number;
    missing_points?: string[];
    strengths?: string[];
    category_scores?: {
      technical: number;
      communication: number;
      confidence: number;
      grammar: number;
      completeness: number;
      problem_solving: number;
    };
  }[];
  questions?: string[];
  completed_at: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';
  description: string;
  required_skills: string[];
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
  explanation: string;
  is_saved?: boolean;
}

export interface ProgressMetric {
  date: string;
  twin_score: number;
  interview_score: number;
  skill_growth: number;
  quizzes_completed: number;
  communication_trend?: number;
  technical_trend?: number;
  confidence_trend?: number;
}

export interface CareerTwinSummary {
  completion_score: number;
  interview_readiness: number;
  resume_status: 'Synced' | 'Pending Update' | 'Not Uploaded';
  top_skills: SkillItem[];
  skill_gaps: {
    skill: string;
    impact: 'High' | 'Medium' | 'Low';
    recommendation: string;
  }[];
  ai_recommendations: {
    id: string;
    title: string;
    type: 'Interview Prep' | 'Skill Quiz' | 'Resume Enhancement';
    reason: string;
    est_time: string;
  }[];
}
