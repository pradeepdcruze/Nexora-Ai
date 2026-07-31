"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Sparkles,
  Flame,
  Award,
  Video,
  Target,
  BarChart2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomGlassTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-2xl shadow-2xl backdrop-blur-xl space-y-1.5 min-w-[170px]">
        <p className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider">{label}</p>
        <div className="space-y-1 text-xs font-semibold">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="text-white font-extrabold">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function ProgressGenomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { userDataStore, careerTwinSummary } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const twinScore = careerTwinSummary?.completion_score || 0;
  const readinessScore = careerTwinSummary?.interview_readiness || 0;

  const interviews = userDataStore?.interviews || [];
  const progressMetrics = userDataStore?.progressMetrics || [];
  const skillsCount = userDataStore?.skills.length || 0;

  // Calculate Average Score across all interviews
  const totalScore = interviews.reduce((acc, curr) => acc + (curr.scores?.overall || 0), 0);
  const avgInterviewScore = interviews.length > 0 ? Math.round(totalScore / interviews.length) : 0;

  // Build Recharts data series dynamically from real user database state
  const rawPoints = progressMetrics.length > 0
    ? progressMetrics.map((m) => ({
        session: m.date,
        overall: m.interview_score || 0,
        technical: m.technical_trend || 0,
        communication: m.communication_trend || 0,
        confidence: m.confidence_trend || 0,
      }))
    : interviews.length > 0
    ? interviews
        .slice()
        .reverse()
        .map((item, idx) => ({
          session: `Round ${idx + 1}`,
          overall: item.scores?.overall || 0,
          technical: item.scores?.technical || 0,
          communication: item.scores?.communication || 0,
          confidence: item.scores?.confidence || 0,
        }))
    : [];

  // When only 1 data point exists, prepend an Initial Baseline point so Recharts renders a full area line
  const chartData = rawPoints.length === 1
    ? [
        {
          session: "Initial Baseline",
          overall: Math.max(0, Math.round(rawPoints[0].overall * 0.5)),
          technical: Math.max(0, Math.round(rawPoints[0].technical * 0.5)),
          communication: Math.max(0, Math.round(rawPoints[0].communication * 0.5)),
          confidence: Math.max(0, Math.round(rawPoints[0].confidence * 0.5)),
        },
        rawPoints[0],
      ]
    : rawPoints;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>Progress Genome Telemetry</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Progress Genome & Skill Trajectory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Continuous real-time tracking of technical proficiency, communication structure, confidence scorecards, and Career Twin evolution.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-blue-500/10 px-4 py-2 rounded-2xl border border-blue-500/20 text-blue-300 text-xs font-bold shrink-0 relative z-10">
              <Flame className="w-4 h-4 text-blue-400 fill-blue-400" />
              <span>{interviews.length} Mock Sessions Recorded</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Career Twin Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-blue-400">{twinScore}%</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Interview Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{avgInterviewScore}/100</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Verified Skills</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-purple-400">{skillsCount}</span>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-1 backdrop-blur-md">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mock Rounds Completed</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-400">{interviews.length}</span>
              </div>
            </div>
          </div>

          {/* Progress Genome Area Chart */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-blue-400" />
                  <span>Communication, Technical & Readiness Trajectory</span>
                </h3>
                <p className="text-xs text-slate-400">Live multi-dimensional telemetry calculated automatically from your real database state.</p>
              </div>

              <Link
                href="/interviews"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-2 self-start sm:self-auto shadow-md"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Practice New Session</span>
              </Link>
            </div>

            <div className="min-h-[300px] w-full pt-4 flex flex-col justify-center">
              {!mounted ? (
                <div className="h-72 w-full animate-pulse bg-slate-950/40 rounded-2xl" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="techGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                    <XAxis dataKey="session" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomGlassTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#94A3B8", paddingTop: "12px" }} />
                    <Area
                      type="monotone"
                      dataKey="overall"
                      name="Overall Readiness"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#overallGrad)"
                      dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#0F172A" }}
                      activeDot={{ r: 6, fill: "#FFFFFF", stroke: "#3B82F6", strokeWidth: 2 }}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                    <Area
                      type="monotone"
                      dataKey="technical"
                      name="Technical Growth"
                      stroke="#A855F7"
                      strokeWidth={2.5}
                      fill="url(#techGrad)"
                      dot={{ r: 3, fill: "#A855F7" }}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                    <Area
                      type="monotone"
                      dataKey="communication"
                      name="Communication Structure"
                      stroke="#10B981"
                      strokeWidth={2.5}
                      fill="url(#commGrad)"
                      dot={{ r: 3, fill: "#10B981" }}
                      isAnimationActive={true}
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-72 w-full flex flex-col items-center justify-center text-center p-6 bg-slate-950/50 rounded-2xl border border-slate-800/60 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No progress data available yet</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Complete your first AI mock interview session or upload a resume to start tracking your skill trajectory.
                  </p>
                  <Link
                    href="/interviews"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all shadow-md inline-flex items-center gap-2 mt-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Start Practice Session</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Interview History Log Table */}
          <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl">
            <h3 className="text-base font-extrabold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Interview Session Log ({interviews.length} Total)</span>
            </h3>

            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((session, idx) => (
                  <div
                    key={session.id || idx}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
                          {session.interview_type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {session.completed_at ? new Date(session.completed_at).toLocaleDateString() : "Recent Session"}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{session.target_role} Interview</h4>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Score</p>
                        <p className="text-lg font-black text-emerald-400">{session.scores?.overall || 0}/100</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm font-bold text-white">No interview logs found yet</p>
                <p className="text-xs text-slate-400">
                  Complete your first AI mock interview round to record trajectory analytics.
                </p>
                <Link
                  href="/interviews"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Start AI Interview Round</span>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
