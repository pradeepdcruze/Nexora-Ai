"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase, authService } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUserData } = useAuth();

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await authService.getCurrentUser();
            refreshUserData();
          }
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
      } finally {
        router.replace("/dashboard");
      }
    }

    handleAuthCallback();
  }, [router, refreshUserData]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
      <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-300">Completing sign-in...</span>
      </div>
    </div>
  );
}
