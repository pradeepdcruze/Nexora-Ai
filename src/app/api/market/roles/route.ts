import { NextRequest, NextResponse } from "next/server";
import { INITIAL_MARKET_ROLES_CATALOG } from "@/lib/marketEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "us";
    const remoteOnly = searchParams.get("remote") === "true";
    const category = searchParams.get("category");

    let roles = [...INITIAL_MARKET_ROLES_CATALOG];

    if (remoteOnly) {
      roles = roles.filter((r) => r.remoteAvailable);
    }

    if (category && category !== "All") {
      roles = roles.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json({
      success: true,
      country,
      remoteOnly,
      totalListings: roles.reduce((sum, r) => sum + r.recentListingsCount, 0),
      marketRoles: roles,
      provider: process.env.JOBS_API_PROVIDER || "Adzuna Telemetry Index",
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Market roles API error:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR", message: error.message || "Failed to fetch market roles." },
      { status: 500 }
    );
  }
}
