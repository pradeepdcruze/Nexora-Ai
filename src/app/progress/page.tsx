"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import {
  TrendingUp,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProgressGenomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userDataStore, careerTwinSummary } = useAuth();

  const twinScore = careerTwinSummary?.completion_score || 0;
  const readinessScore = careerTwinSummary?.interview_readiness || 0;

  const hasHistory = (userDataStore?.resumes.length || 0) > 0 || (userDataStore?.interviews.length || 0) > 0;

  const chartData = hasHistory
    ? [
        { date: "Day 1", twin_score: 0, interview_score: 0 },
        { date: "Current", twin_score: twinScore, interview_score: readinessScore },
      ]
    : [];

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                <span>Analytics & Trajectory Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                Progress Genome
              </h1>
              <p className="text-xs sm:text-sm text-slate-secondary">
                Track how your verified skills and interview readiness evolve over time.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-brand-50 px-4 py-2 rounded-2xl border border-brand-200 text-brand-700 text-xs font-bold shrink-0">
              <Flame className="w-4 h-4 text-brand-600 fill-brand-600" />
              <span>{hasHistory ? "1 Day Active" : "0 Active Days"}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Career Twin Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-brand-600">{twinScore}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Interview Score</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-dark-text">{readinessScore}/100</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Verified Skills</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-purple-600">{userDataStore?.skills.length || 0}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
              <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Mock Rounds Completed</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-emerald-600">{userDataStore?.interviews.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Trajectory Area */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-border gap-2">
              <div>
                <h3 className="text-base font-extrabold text-dark-text">Skill Growth & Readiness Trajectory</h3>
                <p className="text-xs text-slate-secondary">Live trajectory calculated from your actions.</p>
              </div>
            </div>

            {hasHistory ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTwin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="twin_score" name="Career Twin Score" stroke="#2563EB" strokeWidth={3} fill="url(#colorTwin)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-12 text-center bg-surface rounded-2xl border border-slate-border space-y-3">
                <TrendingUp className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-dark-text">No Progress History Yet</h4>
                <p className="text-xs text-slate-secondary max-w-sm mx-auto">
                  Complete your onboarding actions to start logging your progress genome.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link href="/resume" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600">
                    Upload Resume
                  </Link>
                  <Link href="/interviews" className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-white border border-slate-border">
                    Start Mock Interview
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
