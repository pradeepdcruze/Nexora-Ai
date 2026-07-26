import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { avatarDataUrl } = body;

    if (!avatarDataUrl || !avatarDataUrl.startsWith("data:image/")) {
      return NextResponse.json(
        { success: false, code: "INVALID_IMAGE", message: "Invalid image data provided." },
        { status: 400 }
      );
    }

    let finalAvatarUrl = avatarDataUrl;

    if (isSupabaseConfigured && supabase) {
      // Supabase Bucket Upload under authenticated user's unique path
      const base64Data = avatarDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filePath = `profile-images/${userId}/avatar.webp`;

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, buffer, {
          contentType: "image/webp",
          upsert: true,
        });

      if (!uploadErr) {
        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalAvatarUrl = publicUrlData.publicUrl;
      }

      // Update Supabase profile table
      await supabase
        .from("profiles")
        .update({ avatar_url: finalAvatarUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }

    return NextResponse.json({
      success: true,
      avatarUrl: finalAvatarUrl,
      message: "Profile photo updated successfully.",
    });
  } catch (error: any) {
    console.error("Avatar upload API error:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR", message: error.message || "Failed to update avatar." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
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

    if (isSupabaseConfigured && supabase) {
      const filePath = `profile-images/${userId}/avatar.webp`;
      await supabase.storage.from("avatars").remove([filePath]);

      await supabase
        .from("profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", userId);
    }

    return NextResponse.json({
      success: true,
      message: "Profile photo removed.",
    });
  } catch (error: any) {
    console.error("Avatar delete API error:", error);
    return NextResponse.json(
      { success: false, code: "SERVER_ERROR", message: error.message || "Failed to remove avatar." },
      { status: 500 }
    );
  }
}
