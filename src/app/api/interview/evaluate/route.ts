import { NextRequest, NextResponse } from "next/server";
import { evaluateInterviewAnswer, generateSessionReportFeedback } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, question, answer, type, targetRole, sessionAnswers, scores } = body || {};

    if (action === "evaluate_single") {
      const evaluation = await evaluateInterviewAnswer({
        question: question || "",
        answer: answer || "",
        type: type || "Technical",
        targetRole: targetRole || "Software Engineer",
      });

      return NextResponse.json({
        success: true,
        evaluation,
      });
    } else if (action === "evaluate_session") {
      const reportFeedback = generateSessionReportFeedback(scores, type || "Technical");
      return NextResponse.json({
        success: true,
        reportFeedback,
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid evaluation action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Evaluate Interview Answer Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "We couldn't evaluate your interview at the moment. Please try again.",
      },
      { status: 500 }
    );
  }
}
