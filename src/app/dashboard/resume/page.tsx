"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardResumePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/resume");
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-400">Loading Resume Intelligence...</span>
      </div>
    </div>
  );
}
