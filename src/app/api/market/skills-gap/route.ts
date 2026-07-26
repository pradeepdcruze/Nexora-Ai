import { NextRequest, NextResponse } from "next/server";
import { calculateMarketSkillsGap } from "@/lib/marketEngine";
import { calculateRoleRecommendations } from "@/lib/careerEngine";
import { getLocalUserData } from "@/lib/supabase/dataStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const userIdHeader = req.headers.get("x-user-id");
    const userId = userIdHeader || (authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null);

    if (!userId) {
      return NextResponse.json(
        { success: false, code: "UNAUTHORIZED", message: "Authentication required." },
        { status: 401 }
      );
    }

    const userData = getLocalUserData(userId);
    const resume = userData.resumes[0] || null;
    const recommendations = calculateRoleRecommendations(userData.skills, resume);
    const topRole = recommendations[0] || null;

    const skillsGap = calculateMarketSkillsGap(
      userData.skills,
      topRole ? topRole.title : "Full-Stack Developer",
      topRole ? topRole.matchScore : 0
    );

    return NextResponse.json({
      success: true,
      skillsGap,
    });
  } catch (error: any) {
    console.error("Skills gap API error:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR", message: error.message || "Failed to calculate skills gap." },
      { status: 500 }
    );
  }
}
