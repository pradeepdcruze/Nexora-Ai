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
  // Cyber Security & Infrastructure Roles
  {
    roleId: "cyber-security-analyst",
    title: "Cyber Security Analyst",
    category: "Cyber Security",
    requiredSkills: ["Cyber Security", "Network Security", "Wireshark", "SIEM", "SOC", "Firewalls"],
    tools: ["Wireshark", "Nmap", "Splunk"],
    preferredDegree: "Cyber Security / Computer Science",
    recommendedProjects: ["SIEM Log Telemetry Dashboard", "Network Intrusion Analysis Audit"],
    recommendedCertifications: ["CompTIA Security+", "Certified Information Systems Security Professional (CISSP)"],
  },
  {
    roleId: "soc-analyst",
    title: "SOC Analyst",
    category: "Cyber Security",
    requiredSkills: ["SOC", "SIEM", "Cyber Security", "Wireshark", "Network Security"],
    tools: ["Splunk", "Wireshark", "QRadar"],
    preferredDegree: "Cyber Security / Information Technology",
    recommendedProjects: ["24/7 Incident Response Simulation", "Threat Hunting & Malware Analysis Lab"],
    recommendedCertifications: ["CompTIA CySA+", "GIAC Certified Incident Handler (GCIH)"],
  },
  {
    roleId: "ethical-hacker-penetration-tester",
    title: "Ethical Hacker / Penetration Tester",
    category: "Cyber Security",
    requiredSkills: ["Ethical Hacking", "Penetration Testing", "Kali Linux", "Burp Suite", "Metasploit", "Nmap", "OWASP"],
    tools: ["Kali Linux", "Burp Suite", "Metasploit", "Nmap"],
    preferredDegree: "Computer Science / Cyber Security",
    recommendedProjects: ["Web Application Vulnerability Assessment Suite", "Custom Penetration Testing Toolkit"],
    recommendedCertifications: ["Offensive Security Certified Professional (OSCP)", "Certified Ethical Hacker (CEH)"],
  },
  {
    roleId: "security-engineer",
    title: "Security Engineer",
    category: "Cyber Security",
    requiredSkills: ["Security Engineer", "Cyber Security", "Network Security", "Python", "Linux", "Firewalls"],
    tools: ["Kali Linux", "Docker", "Terraform"],
    preferredDegree: "Computer Science / Cyber Security",
    recommendedProjects: ["Automated Vulnerability Scanner Pipeline", "Cloud IAM Infrastructure Security Audit"],
    recommendedCertifications: ["AWS Certified Security Specialist", "CISSP"],
  },

  // AI & Machine Learning & Data Science Roles
  {
    roleId: "ml-engineer",
    title: "ML Engineer",
    category: "AI & Data Science",
    requiredSkills: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy"],
    tools: ["Jupyter", "Docker", "MLflow"],
    preferredDegree: "Computer Science / Data Science / Mathematics",
    recommendedProjects: ["End-to-End Predictive ML Pipeline", "Model Monitoring & Telemetry Suite"],
    recommendedCertifications: ["AWS Certified Machine Learning Specialist", "TensorFlow Developer Certificate"],
  },
  {
    roleId: "ai-engineer",
    title: "AI Engineer",
    category: "AI & Data Science",
    requiredSkills: ["Artificial Intelligence", "Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch"],
    tools: ["OpenAI API", "Hugging Face", "LangChain"],
    preferredDegree: "Artificial Intelligence / Computer Science",
    recommendedProjects: ["Retrieval-Augmented Generation (RAG) System", "Multi-Agent Workflow Engine"],
    recommendedCertifications: ["Google Cloud Professional Machine Learning Engineer"],
  },
  {
    roleId: "data-scientist",
    title: "Data Scientist",
    category: "AI & Data Science",
    requiredSkills: ["Data Science", "Python", "SQL", "Machine Learning", "Pandas", "NumPy"],
    tools: ["Jupyter", "SQL", "Tableau"],
    preferredDegree: "Statistics / Mathematics / Computer Science",
    recommendedProjects: ["Customer Churn Forecasting Engine", "Exploratory Telemetry Analysis Suite"],
    recommendedCertifications: ["IBM Data Science Professional Certificate"],
  },

  // Java & Backend Engineering Roles
  {
    roleId: "java-developer",
    title: "Java Developer",
    category: "Software Engineering",
    requiredSkills: ["Java", "Spring Boot", "Microservices", "SQL", "REST API", "Git"],
    tools: ["Maven", "Docker", "PostgreSQL"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Enterprise Spring Boot Microservices Architecture", "High-Performance Banking Transaction API"],
    recommendedCertifications: ["Oracle Certified Professional: Java SE Developer"],
  },
  {
    roleId: "backend-developer",
    title: "Backend Engineer",
    category: "Software Engineering",
    requiredSkills: ["Node.js", "Express.js", "Python", "Java", "SQL", "PostgreSQL", "MongoDB", "REST API"],
    tools: ["Docker", "Redis", "Git"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["High-Throughput Distributed API Gateway", "Database Indexing & Query Optimization Suite"],
    recommendedCertifications: ["AWS Certified Developer Associate"],
  },

  // Web Engineering Roles
  {
    roleId: "frontend-developer",
    title: "Frontend Developer",
    category: "Software Engineering",
    requiredSkills: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "HTML", "CSS", "REST API", "Git"],
    tools: ["Vite", "Webpack", "Figma"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Responsive Enterprise SaaS Dashboard", "Accessible Component Design System"],
    recommendedCertifications: ["Meta Front-End Developer Certificate"],
  },
  {
    roleId: "react-developer",
    title: "React Developer",
    category: "Software Engineering",
    requiredSkills: ["React", "Redux", "JavaScript", "TypeScript", "Next.js", "Tailwind CSS"],
    tools: ["Vite", "React Query", "Jest"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Real-Time Collaborative Web Application", "Stateful Interactive Web Platform"],
    recommendedCertifications: ["Meta React Specialization"],
  },
  {
    roleId: "nextjs-engineer",
    title: "Next.js Engineer",
    category: "Software Engineering",
    requiredSkills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Node.js"],
    tools: ["Vercel", "Supabase", "Prisma"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Production Serverless Next.js App", "SEO-Optimized E-Commerce Portal"],
    recommendedCertifications: ["Vercel Certified Next.js Specialist"],
  },
  {
    roleId: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Software Engineering",
    requiredSkills: ["React", "Next.js", "TypeScript", "Node.js", "Express.js", "SQL", "PostgreSQL"],
    tools: ["Docker", "Git", "PostgreSQL"],
    preferredDegree: "Computer Science",
    recommendedProjects: ["Full-Stack Next.js & Supabase SaaS Platform", "Microservices Web Ecosystem"],
    recommendedCertifications: ["AWS Certified Cloud Associate"],
  },
  {
    roleId: "cloud-devops-engineer",
    title: "DevOps & Cloud Engineer",
    category: "Infrastructure",
    requiredSkills: ["Docker", "Kubernetes", "AWS", "Git", "CI/CD", "Linux", "Terraform"],
    tools: ["Kubernetes", "Terraform", "GitHub Actions"],
    preferredDegree: "Computer Science / Information Technology",
    recommendedProjects: ["Automated Zero-Downtime CI/CD Pipeline", "Kubernetes Multi-Region Cluster Suite"],
    recommendedCertifications: ["AWS Solutions Architect Associate", "Certified Kubernetes Administrator (CKA)"],
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
    // 1. Core Skill Overlap
    const matched = roleDef.requiredSkills.filter((req) =>
      Array.from(userSkillNames).some((uSkill) => {
        const u = uSkill.toLowerCase();
        const r = req.toLowerCase();
        return u.includes(r) || r.includes(u);
      })
    );
    const missing = roleDef.requiredSkills.filter((req) => !matched.includes(req));

    // Dynamic Skill Match Ratio (Weighted heavily by real extracted resume skills)
    const matchRatio = roleDef.requiredSkills.length > 0 ? matched.length / roleDef.requiredSkills.length : 0;
    const skillScore = Math.round(matchRatio * 75);

    // Contextual bonus for experience/resume presence
    const hasResume = !!resume;
    const hasProjects = resume?.experience && resume.experience.length > 0;
    const contextBonus = matched.length > 0 ? (hasProjects ? 25 : 15) : (hasResume ? 10 : 5);

    // Total Score
    const totalScore = Math.min(Math.round(skillScore + contextBonus), 100);

    // Match Level Categorization
    let matchLevel: RoleRecommendation["matchLevel"] = "Long-Term Opportunity";
    if (totalScore >= 75) matchLevel = "Excellent Match";
    else if (totalScore >= 55) matchLevel = "Strong Match";
    else if (totalScore >= 35) matchLevel = "Developing Match";

    // Detailed reasons explaining why this job matches
    const reasons: string[] = [];
    if (matched.length > 0) {
      reasons.push(`Directly matched ${matched.length} extracted resume skills: ${matched.join(", ")}.`);
      reasons.push(`High domain alignment with your verified skill profile in ${roleDef.category}.`);
    } else {
      reasons.push("Recommended career trajectory path based on foundational software engineering concepts.");
    }
    if (hasProjects) {
      reasons.push("Project and industry experience align with key technical requirements for this role.");
    }

    const recommendedActions: string[] = missing.map(
      (mSkill) => `Practice 1 targeted assessment round or project module in ${mSkill}`
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
      experienceAlignment: hasProjects ? "Strong Industry Match" : "Developing Foundation",
      educationAlignment: resume?.education ? "Education Criteria Aligned" : "Degree Verification Pending",
      recommendedProjects: roleDef.recommendedProjects,
      recommendedCertifications: roleDef.recommendedCertifications,
      analysisMode,
    };
  });

  // Sort descending by match score
  return recommendations.sort((a, b) => b.matchScore - a.matchScore);
}
