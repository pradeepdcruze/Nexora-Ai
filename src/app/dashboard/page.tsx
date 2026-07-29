"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { calculateOpportunityMatches } from "@/lib/supabase/dataStore";
import {
  BrainCircuit,
  UserCheck,
  Video,
  FileText,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Zap,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const recTypeIcons: Record<string, React.FC<{ className?: string }>> = {
  "Resume Enhancement": FileText,
  "Interview Prep": Video,
  "Skill Quiz": Zap,
  default: Sparkles,
};

function CircleProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 9,
  color = "#3b82f6",
  gradient,
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradient?: string;
  label?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;
  const id = `grad-${label?.replace(/\s/g, "")}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradient.split(",")[0]} />
            <stop offset="100%" stopColor={gradient.split(",")[1]} />
          </linearGradient>
        </defs>
      )}
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={gradient ? `url(#${id})` : color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${filled} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, careerTwinSummary } = useAuth();

  const activeName = user?.full_name || "Member";

  const currentSummary = React.useMemo(() => {
    return careerTwinSummary || {
      completion_score: 0,
      interview_readiness: 0,
      resume_status: "Not Uploaded" as const,
      top_skills: [],
      skill_gaps: [],
      ai_recommendations: [],
    };
  }, [careerTwinSummary]);

  const matches = React.useMemo(() => {
    return userDataStore
      ? calculateOpportunityMatches(userDataStore.skills, userDataStore.opportunities)
      : [];
  }, [userDataStore]);

  const topMatchedRole = React.useMemo(() => {
    return matches.length > 0 && userDataStore && userDataStore.skills.length > 0 ? matches[0] : null;
  }, [matches, userDataStore]);

  const nextAction = React.useMemo(() => {
    const hasResume = (userDataStore?.resumes?.length || 0) > 0;
    const hasInterviews = (userDataStore?.interviews?.length || 0) > 0;

    return !hasResume
      ? { label: "Upload Resume", href: "/resume", icon: FileText, color: "from-blue-600 to-indigo-600", desc: "Boost Twin score by +35%" }
      : !hasInterviews
      ? { label: "Start AI Interview", href: "/interviews", icon: Video, color: "from-purple-600 to-indigo-600", desc: "Unlock interview readiness score" }
      : { label: "Explore Opportunities", href: "/opportunities", icon: Compass, color: "from-emerald-600 to-teal-600", desc: "Find your best-matched roles" };
  }, [userDataStore]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                  <span>AI Career Twin Ready</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
                  <span className="p-1.5 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 shadow-md hover:scale-105 transition-transform duration-200 inline-flex items-center justify-center">
                    <BrainCircuit className="w-6 h-6 text-blue-400 fill-blue-400/20 filter drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  </span>
                  <span>Welcome, {activeName.split(" ")[0]}</span>
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                  {currentSummary.completion_score === 0
                    ? "Your digital Career Twin is initialized. Complete the actions below to build your personalized career model."
                    : `Your Career Twin is ${currentSummary.completion_score}% complete. Keep completing assessments and mock interviews to increase role matches.`}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/resume"
                  className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-white" />
                  <span>Upload Resume</span>
                </Link>
                <Link
                  href="/interviews"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-white" />
                  <span>Practice AI Interview</span>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Quick Metrics Bar — Enhanced with progress rings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
              <div className="relative shrink-0">
                <CircleProgress
                  value={currentSummary.completion_score}
                  size={56}
                  strokeWidth={8}
                  gradient="#3b82f6,#a855f7"
                  label="twin"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-400">
                  {currentSummary.completion_score}%
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Career Twin</span>
                <span className="text-xl font-black text-blue-400">{currentSummary.completion_score}%</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Completion</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
              <div className="relative shrink-0">
                <CircleProgress
                  value={currentSummary.interview_readiness}
                  size={56}
                  strokeWidth={8}
                  color={currentSummary.interview_readiness > 0 ? "#10b981" : "#334155"}
                  label="readiness"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-emerald-400">
                  {currentSummary.interview_readiness}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Readiness</span>
                <span className="text-xl font-black text-white">{currentSummary.interview_readiness}/100</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Interview score</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
              <div className="relative shrink-0">
                <CircleProgress
                  value={Math.min((userDataStore?.skills?.length || 0) * 10, 100)}
                  size={56}
                  strokeWidth={8}
                  color="#a855f7"
                  label="skills"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-purple-400">
                  {userDataStore?.skills?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Skills</span>
                <span className="text-xl font-black text-purple-400">{userDataStore?.skills?.length || 0}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Verified</p>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center gap-4">
              <div className="relative shrink-0">
                <CircleProgress
                  value={Math.min((userDataStore?.interviews?.length || 0) * 20, 100)}
                  size={56}
                  strokeWidth={8}
                  color="#f59e0b"
                  label="sessions"
                />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-400">
                  {userDataStore?.interviews?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sessions</span>
                <span className="text-xl font-black text-amber-400">{userDataStore?.interviews?.length || 0}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Completed</p>
              </div>
            </div>
          </div>

          {/* Next Action Banner */}
          <div className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-r ${nextAction.color} shadow-xl relative overflow-hidden`}>
            <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                  <nextAction.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white/60 uppercase tracking-wider">Suggested Next Step</p>
                  <p className="text-sm font-extrabold text-white">{nextAction.label}</p>
                  <p className="text-xs text-white/70">{nextAction.desc}</p>
                </div>
              </div>
              <Link
                href={nextAction.href}
                className="px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all flex items-center gap-2 border border-white/20 shrink-0"
              >
                <span>Go Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Core Feature Quick Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-blue-500/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">AI Career Twin</h3>
                <p className="text-xs text-slate-400">View your verified skill matrix and personalized role readiness score.</p>
              </div>
              <Link href="/career-twin" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:underline pt-2">
                <span>Open Twin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-purple-500/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <Video className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">AI Mock Interviews</h3>
                <p className="text-xs text-slate-400">10-question AI practice sessions with 2-minute timer countdown & 6D scoring.</p>
              </div>
              <Link href="/interviews" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:underline pt-2">
                <span>Start Practice Session</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl hover:border-emerald-500/30 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Opportunity Scanner</h3>
                <p className="text-xs text-slate-400">Match your Career Twin skills against software engineering roles.</p>
              </div>
              <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline pt-2">
                <span>Explore Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* AI Recommendations Panel */}
          {currentSummary.ai_recommendations.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                    <span>AI Career Recommendations</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Actions that will have the highest impact on your Career Twin.</p>
                </div>
                <Link href="/career-twin" className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1">
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {currentSummary.ai_recommendations.map((rec) => {
                  const IconComponent = recTypeIcons[rec.type] || recTypeIcons.default;
                  return (
                    <div key={rec.id} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/30 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <IconComponent className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-white">{rec.title}</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase">{rec.type}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{rec.reason}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{rec.est_time}</span>
                        </div>
                        <Link
                          href={rec.type === "Resume Enhancement" ? "/resume" : rec.type === "Interview Prep" ? "/interviews" : "/career-twin"}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <span>Start</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Job Alignment Preview */}
          {topMatchedRole && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-white">Top Matched Role Alignment</h3>
                  <p className="text-xs text-slate-400">Highest matching opportunity based on your active skills.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                  {topMatchedRole.match_score}% Skill Match
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white">{topMatchedRole.title}</h4>
                  <p className="text-xs text-slate-400">{topMatchedRole.company} • {topMatchedRole.location}</p>
                </div>
                <Link
                  href="/opportunities"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
