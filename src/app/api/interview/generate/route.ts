import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/lib/gemini";
import { getLocalUserData } from "@/lib/supabase/dataStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, userId, targetRole, difficulty } = body || {};

    const validTypes = ["Technical", "HR", "Behavioral"];
    const interviewType = validTypes.includes(type) ? (type as "Technical" | "HR" | "Behavioral") : "Technical";

    let skills: string[] = [];
    let resumeHighlights = "";
    let role = targetRole || "Software Engineer";

    if (userId) {
      const userData = getLocalUserData(userId);
      skills = userData.skills.map((s) => s.name);
      if (userData.resumes.length > 0 && userData.resumes[0].parsed_skills) {
        skills = Array.from(new Set([...skills, ...userData.resumes[0].parsed_skills]));
      }
      if (userData.profile?.target_roles?.[0]) {
        role = userData.profile.target_roles[0];
      }
      if (userData.resumes[0]?.experience?.length) {
        resumeHighlights = userData.resumes[0].experience.map((e) => `${e.title} at ${e.company}`).join("; ");
      }
    }

    const questions = await generateInterviewQuestions({
      type: interviewType,
      skills,
      targetRole: role,
      resumeHighlights,
    });

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        type: interviewType,
        targetRole: role,
        difficulty: difficulty || "Intermediate",
        totalQuestions: questions.length,
      },
    });
  } catch (error: any) {
    console.error("Generate Interview Questions Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "We couldn't evaluate your interview at the moment. Please try again.",
        questions: [],
      },
      { status: 500 }
    );
  }
}
