import { NextRequest, NextResponse } from "next/server";
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

    return NextResponse.json({
      success: true,
      resumeUploaded: Boolean(resume),
      recommendations,
    });
  } catch (error: any) {
    console.error("Recommendations API error:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR", message: error.message || "Failed to fetch recommendations." },
      { status: 500 }
    );
  }
}
