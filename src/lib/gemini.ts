import { SkillItem } from "@/types";

export interface EvaluationResult {
  technical: number;
  communication: number;
  confidence: number;
  grammar: number;
  completeness: number;
  problem_solving: number;
  feedback: string;
  improvement: string;
  // Extended evaluation fields (strict relevance-first scoring)
  relevance: number;
  final_score: number;
  verdict: "Excellent" | "Good" | "Average" | "Poor" | "Unrelated";
  missing_points: string[];
  strengths: string[];
}

export interface ReportFeedback {
  strengths: string[];
  weaknesses: string[];
  ai_feedback: string;
  improvement_tip: string;
  recommended_topics: string[];
  interview_readiness: "Needs Practice" | "Developing" | "Interview Ready" | "Exceptional";
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

/**
 * Executes a call to the Gemini API REST endpoint with single automatic retry.
 */
async function callGeminiApi(prompt: string, apiKey: string): Promise<string> {
  const url = `${GEMINI_API_URL}?key=${apiKey}`;
  const payload = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      maxOutputTokens: 2048,
      responseMimeType: "application/json"
    }
  };

  const executeFetch = async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP Error ${res.status}: ${errText}`);
    }
    const data = await res.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOutput) {
      throw new Error("Empty response payload from Gemini API");
    }
    return textOutput;
  };

  try {
    return await executeFetch();
  } catch (firstError) {
    console.warn("Gemini API call failed. Retrying once...", firstError);
    // Retry once
    try {
      return await executeFetch();
    } catch (secondError) {
      console.error("Gemini API retry failed:", secondError);
      throw secondError;
    }
  }
}

/**
 * Generate 10 interview questions based on type, skills, resume, target role, and career twin profile.
 */
export async function generateInterviewQuestions(params: {
  type: "Technical" | "HR" | "Behavioral";
  skills?: SkillItem[] | string[];
  targetRole?: string;
  resumeHighlights?: string;
}): Promise<string[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
  const skillsList = Array.isArray(params.skills)
    ? params.skills.map(s => (typeof s === "string" ? s : s.name)).join(", ")
    : "General Software Engineering, Problem Solving";
  const role = params.targetRole || "Software Engineer";

  if (apiKey) {
    try {
      const prompt = `You are a senior tech interviewer at a top company.
Generate exactly 10 high-quality, realistic interview questions for a candidate applying for the role of "${role}".

Interview Type: ${params.type}

Context:
- User's Verified Skills: ${skillsList || "Java, JavaScript, React, SQL, Problem Solving"}
- Resume Context: ${params.resumeHighlights || "Relevant projects and technical experience"}

Rules for Question Generation:
1. If Type is "Technical": Generate 10 specific technical and system architectural questions tailored specifically to the candidate's skills (${skillsList}). For example, if Java/SQL/Spring Boot are listed, ask about Java memory model, Spring Boot dependency injection, SQL join optimization, etc.
2. If Type is "HR": Generate 10 realistic placement & culture-fit questions (e.g., "Tell me about yourself", "Why should we hire you?", "What is your greatest strength and greatest weakness?", "Where do you see yourself in 5 years?", etc.).
3. If Type is "Behavioral": Generate 10 questions strictly using the STAR methodology (Situation, Task, Action, Result), focusing on teamwork, pressure, conflicts, and project leadership.

Return strictly a JSON array of 10 strings:
[
  "Question 1",
  "Question 2",
  ...
]`;

      const responseText = await callGeminiApi(prompt, apiKey);
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed) && parsed.length >= 5) {
        return parsed.slice(0, 10).map((q: any) => String(q));
      }
    } catch (err) {
      console.warn("Failed to generate AI questions via Gemini. Using smart dynamic fallback questions.", err);
    }
  }

  // Fallback question generators (Never crash application)
  return getFallbackQuestions(params.type, skillsList, role);
}

function getFallbackQuestions(type: "Technical" | "HR" | "Behavioral", skillsList: string, role: string): string[] {
  const skillsArray = skillsList.split(",").map(s => s.trim()).filter(Boolean);
  const primarySkill = skillsArray[0] || "Software Engineering";
  const secondarySkill = skillsArray[1] || "System Architecture";

  if (type === "Technical") {
    return [
      `How do you handle performance bottlenecks and optimize applications built with ${primarySkill}?`,
      `Explain key architecture design patterns you apply when implementing backend services with ${secondarySkill}.`,
      `How do you manage state and data synchronization reliably in production systems?`,
      `What strategy do you use for database indexing and query optimization when working with high-volume data?`,
      `Describe how you ensure security, authentication, and token management in modern APIs.`,
      `How do you structure unit tests and integration tests for code written in ${primarySkill}?`,
      `Explain the differences between asynchronous execution and synchronous blocking operations in your stack.`,
      `How do you design RESTful or GraphQL endpoints for scalability and backward compatibility?`,
      `What approaches do you take to handle memory management, caching, and connection pooling?`,
      `Describe a scenario where you debugged a complex concurrency or race condition issue.`
    ];
  } else if (type === "HR") {
    return [
      "Tell me about yourself and your professional background.",
      `Why are you interested in pursuing a ${role} position with our company?`,
      "What is your greatest professional strength, and how does it add value to a engineering team?",
      "What is your greatest weakness, and what concrete steps are you taking to improve it?",
      "Where do you see yourself in 3 to 5 years in your career trajectory?",
      "How do you handle constructive criticism or feedback from senior engineers and peers?",
      "Describe your ideal work culture and environment for maximum productivity.",
      "How do you prioritize multiple tight deadlines when work requirements conflict?",
      "What motivates you to perform your best work every day?",
      "Why should we select you for this role over other qualified candidates?"
    ];
  } else {
    // Behavioral (STAR Method)
    return [
      "Describe a situation where you encountered a severe production bug or emergency and how you resolved it (STAR framework).",
      "Tell me about a time when you had a disagreement with a teammate or project lead on technical implementation.",
      "Give an example of a project where you had to quickly master a new library or tool under tight deadlines.",
      "Describe a scenario where you took the initiative to refactor messy code or improve software architecture.",
      "Tell me about a time you failed to meet a target deliverable and how you handled communication with stakeholders.",
      "Describe a situation where you had to explain a complex technical concept to a non-technical stakeholder.",
      "Give an example of how you handled receiving harsh feedback on a pull request or design doc.",
      "Describe a time when you helped onboard or mentor a teammate to help them succeed.",
      "Tell me about a high-stress scenario where priorities changed unexpectedly and how you adapted.",
      "Describe a project you are most proud of: outline the Situation, Task, your specific Action, and the final Result."
    ];
  }
}

/**
 * Performs strict validation on user interview answers BEFORE calling Gemini.
 */
export function validateInterviewAnswerInput(question: string, rawAnswer: string): EvaluationResult | null {
  const answer = (rawAnswer || "").trim();

  // 1. Empty Answers
  if (!answer || answer === "[Skipped]" || answer === "[No Response]") {
    return {
      technical: 0,
      communication: 0,
      confidence: 0,
      grammar: 0,
      completeness: 0,
      problem_solving: 0,
      relevance: 0,
      final_score: 0,
      verdict: "Unrelated",
      feedback: "Answer cannot be empty.",
      improvement: "Please answer the interview question with detailed explanations.",
      missing_points: ["Answer cannot be empty."],
      strengths: [],
    };
  }

  // 2. Random Characters & Keyboard Smashing
  const lowerAns = answer.toLowerCase();
  const isOnlyNumbers = /^\d+$/.test(answer);
  const isOnlySymbols = /^[^a-zA-Z0-9]+$/.test(answer);
  const isRepetitiveSmashing = /(.)\1{4,}/.test(answer);

  const words = answer.replace(/[^a-zA-Z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const knownGibberishList = [
    "asdfgh", "qwerty", "shxsj1233", "abc123", "aaaaaa", "111111", "!!!!!!", ".....", "$$$$", "xxxxx", "zxcvbnm", "asdfghjkl"
  ];
  const hasKnownGibberish = knownGibberishList.some((pattern) => lowerAns.includes(pattern));

  const alphabeticChars = answer.replace(/[^a-zA-Z]/g, "");
  const hasNoVowels = alphabeticChars.length >= 4 && !/[aeiouyAEIOUY]/.test(alphabeticChars);

  if (isOnlyNumbers || isOnlySymbols || isRepetitiveSmashing || hasKnownGibberish || hasNoVowels) {
    return {
      technical: 0,
      communication: 0,
      confidence: 0,
      grammar: 0,
      completeness: 0,
      problem_solving: 0,
      relevance: 0,
      final_score: 0,
      verdict: "Unrelated",
      feedback: "This answer appears to be invalid or meaningless. Please answer the interview question using complete and relevant sentences.",
      improvement: "Express an actual idea using complete English sentences.",
      missing_points: ["Valid sentence structure", "Meaningful vocabulary"],
      strengths: [],
    };
  }

  // 3. Very Short Answers / Single-word replies
  const singleWordReplies = [
    "yes", "no", "maybe", "ok", "fine", "good", "nothing", "idk", "hello", "hi", "sure", "yep", "nope", "thanks", "done"
  ];
  const isSingleWord = words.length === 1 || singleWordReplies.includes(lowerAns);

  if (isSingleWord) {
    return {
      technical: 0,
      communication: 0,
      confidence: 0,
      grammar: 0,
      completeness: 0,
      problem_solving: 0,
      relevance: 0,
      final_score: 0,
      verdict: "Poor",
      feedback: "Please answer in complete sentences with sufficient explanation.",
      improvement: "Expand your answer with real examples and technical context.",
      missing_points: ["Complete sentence explanation"],
      strengths: [],
    };
  }

  // 4. Sentence Validation: Must contain at least 10 meaningful words
  if (words.length < 10) {
    return {
      technical: 0,
      communication: 0,
      confidence: 0,
      grammar: 0,
      completeness: 0,
      problem_solving: 0,
      relevance: 0,
      final_score: 0,
      verdict: "Poor",
      feedback: "Please answer in complete sentences with sufficient explanation.",
      improvement: "Include at least 10 words providing context, actions, and results.",
      missing_points: ["Sufficient detail and length (at least 10 meaningful words)"],
      strengths: [],
    };
  }

  // 5. Relevance Validation: Check if answer is completely off-topic from question
  const isOffTopic = checkRelevanceOffTopic(question, answer);
  if (isOffTopic) {
    return {
      technical: 0,
      communication: 0,
      confidence: 0,
      grammar: 0,
      completeness: 0,
      problem_solving: 0,
      relevance: 0,
      final_score: 0,
      verdict: "Unrelated",
      feedback: "Your answer does not address the interview question.",
      improvement: "Focus directly on what the interviewer is asking.",
      missing_points: ["Direct relevance to the question topic"],
      strengths: [],
    };
  }

  // Valid answer passes all rules -> proceed to Gemini evaluation
  return null;
}

function checkRelevanceOffTopic(question: string, answer: string): boolean {
  const lowerQ = question.toLowerCase();
  const lowerA = answer.toLowerCase();

  const qWords = lowerQ
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !["what", "how", "why", "where", "when", "describe", "explain", "tell", "your", "with", "have", "been", "this", "that", "from", "role", "position"].includes(w));

  if (qWords.length === 0) return false;

  const generalDomainTerms = [
    "code", "data", "system", "design", "team", "project", "developer", "api", "database",
    "feature", "bug", "user", "server", "app", "application", "test", "testing", "performance",
    "scale", "architecture", "component", "function", "state", "react", "java", "python", "sql",
    "node", "git", "web", "interview", "experience", "strength", "weakness", "star", "result", "situation", "task", "action"
  ];

  const matchesQuestionKeyword = qWords.some((kw) => lowerA.includes(kw));
  const matchesDomainTerm = generalDomainTerms.some((term) => lowerA.includes(term));

  if (!matchesQuestionKeyword && !matchesDomainTerm) {
    return true;
  }

  return false;
}

/**
 * Evaluates a single answer using Gemini API returning strict JSON.
 */
export async function evaluateInterviewAnswer(params: {
  question: string;
  answer: string;
  type: string;
  targetRole?: string;
}): Promise<EvaluationResult> {
  // STRICT PRE-EVALUATION ANSWER VALIDATION
  const invalidResult = validateInterviewAnswerInput(params.question, params.answer);
  if (invalidResult) {
    return invalidResult;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  if (apiKey) {
    try {
      const prompt = `You are an expert technical interview evaluator.

Your job is NOT to check whether the answer sounds good.
Your PRIMARY responsibility is to determine whether the candidate's answer actually addresses the interview question.

Role Being Evaluated: ${params.targetRole || "Software Engineer"}
Interview Round: ${params.type}

Question: "${params.question}"
Candidate Answer: "${params.answer}"

Evaluate using the following process:

STEP 1 - Question Understanding
- Identify what the interviewer is asking.
- Identify the core concepts that MUST be present in a correct answer.

STEP 2 - Answer Relevance
- Determine whether the candidate is answering THIS specific question.
- Ignore fluency, grammar, and confidence.
- Focus only on semantic relevance.

STEP 3 - Technical Correctness
- If relevant, evaluate technical accuracy.
- Reward partially correct concepts.
- Penalize incorrect technical statements.

SCORING RULES (CRITICAL):
- If the answer is completely unrelated to the question: relevance=0, technical_accuracy=0, final_score=0. Do NOT give partial marks.
- If the answer discusses a different topic entirely: final_score=0
- If the answer is generic interview filler without answering the question: final_score=0
- Only give marks when the answer actually addresses the asked question.

Scoring Guide for final_score:
0 = Answer is unrelated or completely wrong.
1-20 = Very weak answer with minimal relevance.
21-40 = Partially relevant but misses most required concepts.
41-60 = Moderately relevant with some correct technical points.
61-80 = Mostly correct with minor mistakes.
81-100 = Directly answers the question with technically correct explanation.

Map these scores to the 6-criteria output as well:
- technical = technical_accuracy score
- communication = how clearly and structurally the relevant parts were expressed (0 if unrelated)
- confidence = how decisively the candidate owned their answer (0 if unrelated)
- grammar = grammar quality of the response (independent, can be non-zero even if unrelated)
- completeness = how completely the question was answered
- problem_solving = analytical quality of the answer

Return ONLY valid JSON:
{
  "relevance": 0-100,
  "technical": 0-100,
  "communication": 0-100,
  "confidence": 0-100,
  "grammar": 0-100,
  "completeness": 0-100,
  "problem_solving": 0-100,
  "final_score": 0-100,
  "verdict": "Excellent | Good | Average | Poor | Unrelated",
  "feedback": "Short explanation of why this score was given",
  "improvement": "Concrete suggestion for what was missing or wrong",
  "missing_points": ["...", "..."],
  "strengths": ["...", "..."]
}`;

      const responseText = await callGeminiApi(prompt, apiKey);
      const parsed = JSON.parse(responseText);

      // Enforce strict 0-score for unrelated answers
      const isUnrelated = Number(parsed.relevance) === 0 || parsed.verdict === "Unrelated";
      return {
        technical: isUnrelated ? 0 : Number(parsed.technical) || 75,
        communication: isUnrelated ? 0 : Number(parsed.communication) || 75,
        confidence: isUnrelated ? 0 : Number(parsed.confidence) || 75,
        grammar: Number(parsed.grammar) || 85,
        completeness: isUnrelated ? 0 : Number(parsed.completeness) || 75,
        problem_solving: isUnrelated ? 0 : Number(parsed.problem_solving) || 75,
        feedback: String(parsed.feedback || "Good structure and technical clarity."),
        improvement: String(parsed.improvement || "Elaborate more on practical results and trade-offs."),
        relevance: Number(parsed.relevance) ?? 75,
        final_score: isUnrelated ? 0 : Number(parsed.final_score) || 75,
        verdict: (parsed.verdict as EvaluationResult["verdict"]) || "Average",
        missing_points: Array.isArray(parsed.missing_points) ? parsed.missing_points.map(String) : [],
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : []
      };
    } catch (err) {
      console.warn("Gemini evaluation error. Using fallback heuristic evaluator.", err);
    }
  }

  // Smart heuristic evaluation fallback when API is unconfigured/error
  return fallbackEvaluateAnswer(params.question, params.answer);
}

function fallbackEvaluateAnswer(question: string, answer: string): EvaluationResult {
  const len = answer.trim().length;
  let baseScore = 70;
  if (len > 300) baseScore += 18;
  else if (len > 150) baseScore += 10;
  else if (len < 50) baseScore -= 20;

  const hasKeywords = /STAR|result|situation|action|code|database|API|system|design|optimized|team|solution|improved/i.test(answer);
  if (hasKeywords) baseScore += 5;

  const score = Math.min(Math.max(baseScore, 35), 96);

  // Basic relevance check: if answer is very short or lacks any domain terms, flag as low relevance
  const lowRelevance = len < 30 && !hasKeywords;
  const verdict: EvaluationResult["verdict"] = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Average" : score >= 20 ? "Poor" : "Unrelated";

  return {
    technical: lowRelevance ? 20 : Math.min(score, 95),
    communication: lowRelevance ? 20 : Math.min(score + 2, 98),
    confidence: lowRelevance ? 20 : Math.min(score - 2, 92),
    grammar: 92,
    completeness: lowRelevance ? 15 : Math.min(score - 4, 90),
    problem_solving: lowRelevance ? 20 : Math.min(score, 94),
    feedback: len > 150
      ? "Well-articulated response with solid technical terminology and clear focus."
      : "Brief response. Expanding with real-world examples will strengthen your answer.",
    improvement: "Incorporate the STAR methodology (Situation, Task, Action, Result) with quantitative metrics.",
    relevance: lowRelevance ? 10 : Math.min(score + 5, 95),
    final_score: lowRelevance ? 10 : score,
    verdict,
    missing_points: lowRelevance ? ["Answer must directly address the question asked", "Include domain-specific technical content"] : [],
    strengths: len > 150 && hasKeywords ? ["Demonstrated familiarity with relevant concepts", "Adequate response length"] : []
  };
}

/**
 * Generate overall interview session report feedback from evaluated questions.
 */
export function generateSessionReportFeedback(scores: {
  overall: number;
  technical: number;
  communication: number;
  confidence: number;
  grammar: number;
  completeness: number;
  problem_solving: number;
}, type: string): ReportFeedback {
  const avgScore = scores.overall;

  let readiness: ReportFeedback["interview_readiness"] = "Developing";
  if (avgScore >= 88) readiness = "Exceptional";
  else if (avgScore >= 78) readiness = "Interview Ready";
  else if (avgScore >= 60) readiness = "Developing";
  else readiness = "Needs Practice";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendedTopics: string[] = [];

  if (scores.communication >= 80) strengths.push("Clear and structured verbal presentation");
  else weaknesses.push("Communication structure & concise phrasing");

  if (scores.technical >= 80) strengths.push("Strong technical accuracy & relevant industry terminology");
  else weaknesses.push("Technical depth and architectural nuances");

  if (scores.confidence >= 80) strengths.push("Decisive, confident delivery with strong ownership");
  else weaknesses.push("Tone confidence and assertive positioning");

  if (scores.problem_solving >= 80) strengths.push("Methodical problem-solving and trade-off evaluation");
  else weaknesses.push("Framework-driven problem decomposition");

  if (type === "Technical") {
    recommendedTopics.push("System Design & Scalability Patterns", "Data Structures & Time Complexity", "API Security & Database Indexing");
  } else if (type === "HR") {
    recommendedTopics.push("Elevator Pitch Refinement", "Career Trajectory Narrative", "Conflict Resolution Scenarios");
  } else {
    recommendedTopics.push("STAR Framework Storytelling", "Quantifiable Metrics & Business Impact", "Cross-Functional Collaboration");
  }

  return {
    strengths: strengths.length ? strengths : ["Demonstrated good engagement and prompt responses"],
    weaknesses: weaknesses.length ? weaknesses : ["Focus on elaborating with specific metrics"],
    ai_feedback: `Your overall performance scored ${avgScore}/100 in this ${type} session. You performed best in ${scores.communication >= scores.technical ? "Communication" : "Technical Knowledge"}. Keep refining your structured delivery.`,
    improvement_tip: "Before answering, outline 3 core points: the context, the exact action you owned, and the measurable outcome achieved.",
    recommended_topics: recommendedTopics,
    interview_readiness: readiness
  };
}
