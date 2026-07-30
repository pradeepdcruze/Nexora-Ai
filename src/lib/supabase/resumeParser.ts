import { SkillItem } from "@/types";

export interface ParsedEducationItem {
  degree: string;
  department?: string;
  institution: string;
  year: string;
  gpa?: string;
  duration?: string;
}

export interface ParsedResumeResult {
  parsedSkills: SkillItem[];
  experience: {
    title: string;
    company: string;
    period: string;
    highlights: string[];
  }[];
  education: ParsedEducationItem[];
  certifications: string[];
  completenessScore: number;
  confidenceScore: number;
}

export function calculateResumeConfidenceScore(
  skills: SkillItem[],
  education: ParsedEducationItem[],
  experience: any[],
  certifications: string[],
  rawTextLength: number = 500
): number {
  let score = 0;

  // 1. Technical skills factor (up to 35 points)
  const skillsCount = skills.length;
  score += Math.min(skillsCount * 5, 35);

  // 2. Education factor (up to 25 points)
  if (education.length > 0) {
    const edu = education[0];
    if (edu.degree && edu.degree !== "Degree") score += 8;
    if (edu.institution && edu.institution !== "Educational Institution") score += 7;
    if (edu.department) score += 5;
    if (edu.gpa) score += 5;
  }

  // 3. Projects / Experience factor (up to 20 points)
  if (experience && experience.length > 0) {
    score += Math.min(experience.length * 10, 20);
  }

  // 4. Certifications factor (up to 10 points)
  if (certifications && certifications.length > 0) {
    score += Math.min(certifications.length * 5, 10);
  }

  // 5. Resume text completeness & ATS quality (up to 10 points)
  if (rawTextLength > 300) score += 5;
  if (rawTextLength > 1000) score += 5;

  return Math.min(Math.max(Math.round(score), 0), 100);
}

// Extensive skill taxonomy bank covering all technical and soft skill domains
const SKILL_TAXONOMY_BANK: { name: string; category: "Technical" | "Tools" | "Domain" | "Soft Skills"; aliases?: string[] }[] = [
  // Programming Languages
  { name: "Python", category: "Technical", aliases: ["py"] },
  { name: "Java", category: "Technical" },
  { name: "JavaScript", category: "Technical", aliases: ["js"] },
  { name: "TypeScript", category: "Technical", aliases: ["ts"] },
  { name: "C++", category: "Technical", aliases: ["cpp"] },
  { name: "C#", category: "Technical", aliases: ["csharp"] },
  { name: "Go", category: "Technical", aliases: ["golang"] },
  { name: "Rust", category: "Technical" },
  { name: "Ruby", category: "Technical" },
  { name: "PHP", category: "Technical" },
  { name: "Swift", category: "Technical" },
  { name: "Kotlin", category: "Technical" },
  { name: "SQL", category: "Technical" },
  { name: "HTML", category: "Technical", aliases: ["html5"] },
  { name: "CSS", category: "Technical", aliases: ["css3"] },

  // Frameworks & Libraries
  { name: "React", category: "Technical", aliases: ["react.js", "reactjs"] },
  { name: "Next.js", category: "Technical", aliases: ["nextjs"] },
  { name: "Spring Boot", category: "Technical", aliases: ["springboot", "spring"] },
  { name: "Microservices", category: "Technical" },
  { name: "Node.js", category: "Technical", aliases: ["nodejs"] },
  { name: "Express.js", category: "Technical", aliases: ["express"] },
  { name: "Django", category: "Technical" },
  { name: "Flask", category: "Technical" },
  { name: "FastAPI", category: "Technical" },
  { name: "Angular", category: "Technical" },
  { name: "Vue.js", category: "Technical", aliases: ["vue", "vuejs"] },
  { name: "Tailwind CSS", category: "Technical", aliases: ["tailwind"] },
  { name: "Redux", category: "Technical" },
  { name: "TensorFlow", category: "Technical" },
  { name: "PyTorch", category: "Technical" },
  { name: "Scikit-Learn", category: "Technical" },

  // Cyber Security
  { name: "Cyber Security", category: "Technical", aliases: ["cybersecurity", "security"] },
  { name: "Kali Linux", category: "Tools", aliases: ["kali"] },
  { name: "Burp Suite", category: "Tools", aliases: ["burpsuite", "burp"] },
  { name: "Wireshark", category: "Tools" },
  { name: "Metasploit", category: "Tools" },
  { name: "Nmap", category: "Tools" },
  { name: "Network Security", category: "Technical" },
  { name: "Ethical Hacking", category: "Technical" },
  { name: "Penetration Testing", category: "Technical", aliases: ["pentesting", "pen test"] },
  { name: "SOC", category: "Domain" },
  { name: "SIEM", category: "Tools" },
  { name: "OWASP", category: "Domain" },
  { name: "Vulnerability Assessment", category: "Technical" },

  // Databases
  { name: "PostgreSQL", category: "Technical", aliases: ["postgres"] },
  { name: "MongoDB", category: "Technical", aliases: ["mongo"] },
  { name: "MySQL", category: "Technical" },
  { name: "Redis", category: "Technical" },
  { name: "SQLite", category: "Technical" },
  { name: "Oracle", category: "Technical" },

  // Cloud & DevOps
  { name: "AWS", category: "Tools", aliases: ["aws cloud", "amazon web services"] },
  { name: "Docker", category: "Tools", aliases: ["docker & containerization"] },
  { name: "Kubernetes", category: "Tools", aliases: ["k8s"] },
  { name: "Git", category: "Tools", aliases: ["git version control", "github", "gitlab"] },
  { name: "Jenkins", category: "Tools" },
  { name: "Terraform", category: "Tools" },
  { name: "CI/CD", category: "Domain", aliases: ["continuous integration"] },
  { name: "Linux", category: "Tools", aliases: ["unix"] },

  // AI & Data Science
  { name: "Machine Learning", category: "Technical", aliases: ["ml"] },
  { name: "Artificial Intelligence", category: "Technical", aliases: ["ai"] },
  { name: "Deep Learning", category: "Technical" },
  { name: "Data Science", category: "Domain" },
  { name: "Pandas", category: "Technical" },
  { name: "NumPy", category: "Technical" },

  // Soft Skills & Methodologies
  { name: "Agile / Scrum", category: "Domain", aliases: ["agile", "scrum", "kanban"] },
  { name: "Problem Solving", category: "Soft Skills" },
  { name: "Communication", category: "Soft Skills" },
  { name: "Leadership", category: "Soft Skills" },
  { name: "Teamwork", category: "Soft Skills" },
  { name: "STAR Methodology", category: "Soft Skills", aliases: ["star behavioral"] },
];

export function extractEducationFromText(text: string): ParsedEducationItem[] {
  if (!text) return [];

  const educationList: ParsedEducationItem[] = [];

  // Helper regex patterns for Degree
  const degreeRegex = /\b(Bachelor of Engineering\s*(?:\([^)]+\))?|Bachelor of Technology\s*(?:\([^)]+\))?|Bachelor of Science\s*(?:\([^)]+\))?|Bachelor of Arts\s*(?:\([^)]+\))?|Master of Technology\s*(?:\([^)]+\))?|Master of Computer Applications\s*(?:\([^)]+\))?|Master of Science\s*(?:\([^)]+\))?|B\.E\.|B\.Tech|B\.S\.|B\.Sc|M\.Tech|M\.E\.|M\.S\.|MCA|Ph\.D\.|Diploma|Higher Secondary|High School|Senior Secondary)\b/i;

  // Helper regex patterns for Department / Branch
  const departmentRegex = /\b(Electronics and Communication Engineering|Electronics & Communication Engineering|Computer Science and Engineering|Computer Science & Engineering|Computer Science|Information Technology|Electrical and Electronics Engineering|Electrical Engineering|Mechanical Engineering|Civil Engineering|Artificial Intelligence & Data Science|Artificial Intelligence|Data Science|Cyber Security|Software Engineering)\b/i;

  // Helper regex patterns for Institution / College
  const institutionRegex = /\b([A-Z][A-Za-z0-9\.\,\s]+(?:College|University|Institute|School|Polytechnic)(?:\s+of\s+[A-Za-z0-9\.\s]+)?)\b/;

  // Helper regex patterns for GPA / CGPA / Percentage
  const gpaRegex = /\b(?:CGPA|GPA|Percentage)\s*[:\-]?\s*([0-9\.\%]+(?:\s*\/\s*[0-9\.]+)?)\b/i;

  // Helper regex patterns for Year / Graduation / Duration
  const yearRegex = /\b(Expected Graduation\s*[:\-]?\s*[0-9]{4}|Graduated\s*[:\-]?\s*[0-9]{4}|[0-9]{4}\s*[\-–]\s*[0-9]{4}|Class of\s*[0-9]{4}|Passout\s*[:\-]?\s*[0-9]{4}|20[0-9]{2})\b/i;

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  lines.forEach((line, index) => {
    const degreeMatch = line.match(degreeRegex);
    const instMatch = line.match(institutionRegex);

    if (degreeMatch || instMatch) {
      const contextLines = lines.slice(Math.max(0, index - 2), Math.min(lines.length, index + 3)).join(" ");

      const matchedDegree = degreeMatch ? degreeMatch[1] : (contextLines.match(degreeRegex)?.[1] || "");
      const matchedInst = instMatch ? instMatch[1].trim() : (contextLines.match(institutionRegex)?.[1]?.trim() || "");
      const matchedDept = contextLines.match(departmentRegex)?.[1];
      const matchedGpaRaw = contextLines.match(gpaRegex)?.[1];
      const matchedGpa = matchedGpaRaw ? (matchedGpaRaw.startsWith("CGPA") || matchedGpaRaw.startsWith("GPA") ? matchedGpaRaw : `CGPA: ${matchedGpaRaw}`) : undefined;
      const matchedYearRaw = contextLines.match(yearRegex)?.[1];
      const matchedYear = matchedYearRaw ? (matchedYearRaw.startsWith("Expected") || matchedYearRaw.startsWith("Graduated") ? matchedYearRaw : `Graduation Year: ${matchedYearRaw}`) : "";

      if (matchedDegree || matchedInst) {
        const item: ParsedEducationItem = {
          degree: matchedDegree || "Degree",
          department: matchedDept,
          institution: matchedInst || "Educational Institution",
          year: matchedYear,
          gpa: matchedGpa,
        };

        const isDuplicate = educationList.some(
          (e) => e.degree.toLowerCase() === item.degree.toLowerCase() && e.institution.toLowerCase() === item.institution.toLowerCase()
        );

        if (!isDuplicate) {
          educationList.push(item);
        }
      }
    }
  });

  // Fallback scan across full text if line-by-line scanning found no entries
  if (educationList.length === 0) {
    const fullDegreeMatch = text.match(degreeRegex);
    const fullInstMatch = text.match(institutionRegex);
    const fullDeptMatch = text.match(departmentRegex);
    const fullGpaMatch = text.match(gpaRegex);
    const fullYearMatch = text.match(yearRegex);

    if (fullDegreeMatch || fullInstMatch) {
      educationList.push({
        degree: fullDegreeMatch ? fullDegreeMatch[1] : "Degree",
        department: fullDeptMatch ? fullDeptMatch[1] : undefined,
        institution: fullInstMatch ? fullInstMatch[1].trim() : "Educational Institution",
        year: fullYearMatch ? (fullYearMatch[1].startsWith("Expected") || fullYearMatch[1].startsWith("Graduated") ? fullYearMatch[1] : `Graduation Year: ${fullYearMatch[1]}`) : "",
        gpa: fullGpaMatch ? `CGPA: ${fullGpaMatch[1]}` : undefined,
      });
    }
  }

  return educationList;
}

function isTermInText(text: string, term: string): boolean {
  if (!text || !term) return false;
  // Escape special regex characters in technical terms like C++, C#, .NET, Node.js, Next.js, Express.js
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Strict word-boundary matching accounting for non-alphanumeric separators
  const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+.])${escaped}(?:$|[^a-zA-Z0-9_#+.])`, "i");
  return regex.test(text);
}

export function parseResumeFileContent(fileName: string, rawText?: string): ParsedResumeResult {
  const contentText = (rawText || "") + " " + fileName;

  // Deduplicated skill collection strictly based on resume text
  const extractedSkillMap = new Map<string, SkillItem>();

  // Strict taxonomy term matching against explicit resume text
  SKILL_TAXONOMY_BANK.forEach((skillDef) => {
    const isPrimaryMatch = isTermInText(contentText, skillDef.name);
    const isAliasMatch = skillDef.aliases?.some((alias) => isTermInText(contentText, alias));

    if (isPrimaryMatch || isAliasMatch) {
      const key = skillDef.name.toLowerCase();
      if (!extractedSkillMap.has(key)) {
        extractedSkillMap.set(key, {
          id: `sk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: skillDef.name,
          category: skillDef.category,
          proficiency: 85,
          confidence: 90,
          source: "resume",
        });
      }
    }
  });

  const parsedSkills = Array.from(extractedSkillMap.values());

  // 3. Dynamic Education Extraction (No hardcoded fallback demo data)
  const education = extractEducationFromText(contentText);

  // 4. Extracted Experience & Certifications (Only if text present, no hardcoded demo fallbacks)
  const experience: { title: string; company: string; period: string; highlights: string[] }[] = [];
  const certifications: string[] = [];

  const rawLength = (rawText || "").length;
  const completeness = Math.min(
    (parsedSkills.length > 0 ? 40 : 0) +
    (education.length > 0 ? 30 : 0) +
    (rawLength > 200 ? 30 : 10),
    100
  );

  const confidenceScore = calculateResumeConfidenceScore(
    parsedSkills,
    education,
    experience,
    certifications,
    rawLength
  );

  return {
    parsedSkills,
    experience,
    education,
    certifications,
    completenessScore: completeness,
    confidenceScore,
  };
}
