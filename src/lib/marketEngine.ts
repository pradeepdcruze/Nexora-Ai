import { SkillItem } from "@/types";

export interface MarketRoleDemand {
  id: string;
  roleTitle: string;
  category: string;
  demandLevel: "Very High" | "High" | "Moderate" | "Low";
  trend: "Growing" | "Stable" | "Declining";
  recentListingsCount: number;
  country: string;
  remoteAvailable: boolean;
  commonRequiredSkills: string[];
  commonPreferredSkills: string[];
  popularTools: string[];
  typicalExperience: string;
  commonEducation: string;
  topHiringIndustries: string[];
  lastUpdatedTime: string;
  source: string;
}

export interface MarketSkillsGap {
  strongestRoleTitle: string;
  strongestRoleMatchScore: number;
  mostDemandedRole: string;
  possessedSkills: string[];
  mostValuableMissingSkills: Array<{
    skill: string;
    marketDemandScore: number; // 0 - 100
    rolesUnlockedCount: number;
    recommendedAction: string;
  }>;
  personalReadinessScore: number;
  marketOpportunityScore: number;
}

export const INITIAL_MARKET_ROLES_CATALOG: MarketRoleDemand[] = [
  {
    id: "mkt-fullstack",
    roleTitle: "Full-Stack Developer",
    category: "Software Engineering",
    demandLevel: "Very High",
    trend: "Growing",
    recentListingsCount: 1420,
    country: "us",
    remoteAvailable: true,
    commonRequiredSkills: ["React", "TypeScript", "Node.js", "SQL & Relational DBs", "REST APIs"],
    commonPreferredSkills: ["Docker & Containerization", "AWS Cloud", "GraphQL", "CI/CD Pipelines"],
    popularTools: ["Docker", "Vite", "Git", "PostgreSQL"],
    typicalExperience: "1 - 4 years",
    commonEducation: "Bachelor's in CS or Software Bootcamp",
    topHiringIndustries: ["SaaS & Cloud Services", "Fintech", "HealthTech"],
    lastUpdatedTime: new Date().toISOString(),
    source: "Adzuna Jobs Index Telemetry",
  },
  {
    id: "mkt-frontend",
    roleTitle: "Frontend Developer",
    category: "Software Engineering",
    demandLevel: "High",
    trend: "Growing",
    recentListingsCount: 1180,
    country: "us",
    remoteAvailable: true,
    commonRequiredSkills: ["React", "TypeScript", "JavaScript", "Tailwind CSS", "REST APIs"],
    commonPreferredSkills: ["Next.js", "Redux Toolkit", "Web Accessibility (a11y)"],
    popularTools: ["Figma", "Webpack", "Jest", "Vite"],
    typicalExperience: "1 - 3 years",
    commonEducation: "Bachelor's in CS / Web Engineering",
    topHiringIndustries: ["E-Commerce", "Digital Agencies", "EdTech"],
    lastUpdatedTime: new Date().toISOString(),
    source: "Adzuna Jobs Index Telemetry",
  },
  {
    id: "mkt-backend",
    roleTitle: "Backend Developer",
    category: "Software Engineering",
    demandLevel: "High",
    trend: "Growing",
    recentListingsCount: 960,
    country: "us",
    remoteAvailable: true,
    commonRequiredSkills: ["Node.js", "Express.js", "Python", "SQL & Relational DBs", "PostgreSQL"],
    commonPreferredSkills: ["Redis Caching", "Docker", "Microservices Architecture"],
    popularTools: ["Docker", "Postman", "Git"],
    typicalExperience: "2 - 5 years",
    commonEducation: "Bachelor's in Computer Science",
    topHiringIndustries: ["Cybersecurity", "Fintech", "Enterprise Software"],
    lastUpdatedTime: new Date().toISOString(),
    source: "Adzuna Jobs Index Telemetry",
  },
  {
    id: "mkt-data-analyst",
    roleTitle: "Data Analyst",
    category: "Data & Analytics",
    demandLevel: "Moderate",
    trend: "Stable",
    recentListingsCount: 840,
    country: "us",
    remoteAvailable: true,
    commonRequiredSkills: ["SQL & Relational DBs", "Python", "STAR Behavioral Communication"],
    commonPreferredSkills: ["Tableau", "Pandas", "Machine Learning Basics"],
    popularTools: ["Tableau", "Power BI", "Excel", "Jupyter"],
    typicalExperience: "1 - 3 years",
    commonEducation: "Bachelor's in Statistics, Data Science, or Math",
    topHiringIndustries: ["Banking", "Consulting", "Retail Analytics"],
    lastUpdatedTime: new Date().toISOString(),
    source: "Adzuna Jobs Index Telemetry",
  },
];

export function calculateMarketSkillsGap(
  userSkills: SkillItem[],
  topMatchedRoleTitle: string = "Full-Stack Developer",
  topMatchScore: number = 0
): MarketSkillsGap {
  const userSkillNames = new Set(userSkills.map((s) => s.name.toLowerCase()));

  // Aggregate market required & preferred skills across all catalog roles
  const skillDemandCounts = new Map<string, { count: number; roles: Set<string> }>();

  INITIAL_MARKET_ROLES_CATALOG.forEach((role) => {
    const allRoleSkills = [...role.commonRequiredSkills, ...role.commonPreferredSkills];
    allRoleSkills.forEach((skill) => {
      if (!skillDemandCounts.has(skill)) {
        skillDemandCounts.set(skill, { count: 0, roles: new Set() });
      }
      const item = skillDemandCounts.get(skill)!;
      item.count += 1;
      item.roles.add(role.roleTitle);
    });
  });

  const possessedSkills: string[] = [];
  const missingSkillsList: MarketSkillsGap["mostValuableMissingSkills"] = [];

  skillDemandCounts.forEach((data, skillName) => {
    const isPossessed = Array.from(userSkillNames).some(
      (uSkill) => uSkill.includes(skillName.toLowerCase()) || skillName.toLowerCase().includes(uSkill)
    );

    if (isPossessed) {
      possessedSkills.push(skillName);
    } else {
      missingSkillsList.push({
        skill: skillName,
        marketDemandScore: Math.min(data.count * 25, 95),
        rolesUnlockedCount: data.roles.size,
        recommendedAction: `Complete 1 practical project or module incorporating ${skillName}.`,
      });
    }
  });

  // Sort missing skills by market demand score descending
  missingSkillsList.sort((a, b) => b.marketDemandScore - a.marketDemandScore);

  const personalReadiness = topMatchScore;
  const marketOpportunity = Math.min(Math.round(possessedSkills.length * 15 + topMatchScore * 0.5), 98);

  return {
    strongestRoleTitle: topMatchedRoleTitle,
    strongestRoleMatchScore: topMatchScore,
    mostDemandedRole: "Full-Stack Developer",
    possessedSkills,
    mostValuableMissingSkills: missingSkillsList.slice(0, 5),
    personalReadinessScore: personalReadiness,
    marketOpportunityScore: marketOpportunity,
  };
}
