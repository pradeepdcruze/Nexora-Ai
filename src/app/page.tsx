"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Compass,
  Video,
  TrendingUp,
  FileText,
  BrainCircuit,
  CheckCircle2,
  Play,
  Target,
  Upload,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
} from "recharts";

const heroChartData = [
  { week: "W1", readiness: 45 },
  { week: "W2", readiness: 58 },
  { week: "W3", readiness: 72 },
  { week: "W4", readiness: 81 },
  { week: "W5", readiness: 89 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700/80 px-3 py-2 rounded-xl shadow-xl backdrop-blur-md">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-extrabold text-blue-400">
          Readiness: <span className="text-white">{payload[0].value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function LandingPage() {
  const { user, userDataStore, careerTwinSummary } = useAuth();

  // User details fallback (No Alex Morgan demo persona)
  const hasUser = !!user;
  const userName = userDataStore?.profile?.full_name || user?.full_name || user?.email?.split("@")[0] || "Logged In Candidate";
  const userInitials = userName ? userName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "AI";
  const userRole = userDataStore?.profile?.target_roles?.[0] || user?.headline || "Software Engineer Candidate";
  const userReadiness = careerTwinSummary?.interview_readiness || (userDataStore as any)?.career_twin_summary?.interview_readiness || 89;
  const userSkillsList = userDataStore?.skills?.length
    ? userDataStore.skills.slice(0, 4).map((s: any) => (typeof s === "string" ? s : s.name)).join(", ")
    : "No skills detected in resume yet";
  const mockCount = (userDataStore as any)?.interview_sessions?.length ?? 4;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30 selection:text-blue-200 font-sans transition-colors duration-200">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-10 md:pt-24 md:pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400 animate-pulse" />
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  AI-Powered Career Intelligence
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Build the Career You're{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Actually Ready For
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg font-normal">
                Nexora AI creates an evolving digital <strong className="font-semibold text-white">Career Twin</strong> from your resume, skill assessments, and realistic mock interviews to unlock personalized role matches.
              </p>

              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/auth/signup"
                  prefetch={true}
                  className="px-7 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/35 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <span>Create Your Career Twin</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-full text-base font-semibold text-slate-200 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4 text-blue-400 fill-blue-400" />
                  <span>See How It Works</span>
                </a>
              </div>

              <div className="pt-1 flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Free to start • No credit card required • Instant setup</span>
              </div>
            </div>

            {/* Right Column - Product Preview Dashboard Card */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -top-6 -left-6 z-20 hidden sm:flex items-center gap-3 p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 animate-float">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Career Twin Sync</p>
                  <p className="text-[11px] text-blue-400 font-semibold">Live Skill Synthesis</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 z-20 hidden sm:flex items-center gap-3 p-3 bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 animate-float" style={{ animationDelay: "2s" }}>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">AI Mock Round</p>
                  <p className="text-[11px] text-emerald-400 font-semibold">+8 pts STAR Evaluation</p>
                </div>
              </div>

              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 relative overflow-hidden backdrop-blur-xl">
                {hasUser ? (
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm ring-2 ring-blue-400/40 shadow-md">
                        {userInitials}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{userName}</h4>
                        <p className="text-xs text-slate-400">{userRole}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold">
                      {userReadiness}% Job Ready
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <BrainCircuit className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">Career Twin Intelligence</h4>
                        <p className="text-xs text-slate-400">Continuous AI Skill & Interview Synthesis</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-extrabold">
                      Live Analytics
                    </span>
                  </div>
                )}

                {/* Modernized Recharts Area Chart */}
                <div className="py-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Interview Readiness Trajectory</span>
                    <span className="font-bold text-blue-400">+34% this month</span>
                  </div>
                  <div className="h-40 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={heroChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                          </linearGradient>
                          <linearGradient id="heroLineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="readiness"
                          stroke="url(#heroLineGradient)"
                          strokeWidth={3}
                          fill="url(#heroGradient)"
                          dot={{ r: 4, fill: "#3B82F6", strokeWidth: 2, stroke: "#0F172A" }}
                          activeDot={{ r: 6, fill: "#8B5CF6", stroke: "#FFFFFF", strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Top Skills</p>
                    <p className="text-xs font-extrabold text-white mt-1 truncate">{userSkillsList}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">AI Mock Sessions</p>
                    <p className="text-xs font-extrabold text-purple-400 mt-1">{mockCount} Rounds Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Grid */}
      <section id="features" className="py-16 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Core Career Engine
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Four Connected Modules Powering Your Growth
            </p>
            <p className="text-slate-400 text-sm">
              Every action feeds directly into your central Career Twin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: UserCheck,
                title: "Career Twin Engine",
                desc: "An evolving digital profile combining resume parsing, verified skills, and interview scorecards.",
                color: "text-blue-400",
                badge: "Core",
                border: "hover:border-blue-500/50",
              },
              {
                icon: Video,
                title: "AI Mock Interviews",
                desc: "Technical, HR, and Behavioral rounds with 2-minute timer countdown and 6D Gemini AI scoring.",
                color: "text-purple-400",
                badge: "AI Powered",
                border: "hover:border-purple-500/50",
              },
              {
                icon: Compass,
                title: "Opportunity Scanner",
                desc: "Ranks live software engineering roles against your exact Career Twin skills and gaps.",
                color: "text-emerald-400",
                badge: "Job Fit",
                border: "hover:border-emerald-500/50",
              },
              {
                icon: TrendingUp,
                title: "Progress Genome",
                desc: "Recharts analytics tracking communication, technical accuracy, and readiness trends over time.",
                color: "text-indigo-400",
                badge: "Analytics",
                border: "hover:border-indigo-500/50",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`bg-slate-900/90 rounded-3xl p-6 border border-slate-800 transition-all duration-300 space-y-4 ${f.border} shadow-xl hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${f.color}`} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-full">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-slate-900/50 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Simple 3-Step Process
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Profile to Job-Ready in Minutes
            </p>
            <p className="text-slate-400 text-sm leading-relaxed">
              No lengthy setup. Your AI Career Twin is built automatically as you complete each step.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-px bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50" />

            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload Your Resume",
                desc: "Drop your PDF or DOCX resume. Our AI parser extracts skills, experience, certifications, and education to bootstrap your Career Twin instantly.",
                color: "text-blue-400",
                ring: "ring-blue-500/30",
                bg: "bg-blue-500/10",
                border: "border-blue-500/30",
                time: "~2 minutes",
              },
              {
                step: "02",
                icon: Video,
                title: "Complete AI Mock Interviews",
                desc: "Pick Technical, HR, or Behavioral. Answer 10 AI-generated questions with a 2-minute timer per question. Get instant 6-dimensional scoring.",
                color: "text-purple-400",
                ring: "ring-purple-500/30",
                bg: "bg-purple-500/10",
                border: "border-purple-500/30",
                time: "~10 minutes",
              },
              {
                step: "03",
                icon: Target,
                title: "Get Matched & Grow",
                desc: "Your Career Twin generates personalized job matches, identifies skill gaps, and tracks your interview readiness trajectory over time.",
                color: "text-emerald-400",
                ring: "ring-emerald-500/30",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/30",
                time: "Instant results",
              },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center ring-4 ${step.ring} shadow-xl`}>
                    <Icon className={`w-7 h-7 ${step.color}`} />
                  </div>

                  <span className={`text-xs font-black uppercase tracking-widest ${step.color}`}>
                    Step {step.step}
                  </span>

                  <div className="space-y-2 max-w-xs">
                    <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${step.bg} border ${step.border} ${step.color}`}>
                    {step.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/auth/signup"
              prefetch={true}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-0.5 group"
            >
              <span>Start Building Your Career Twin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Career Twin Spotlight */}
      <section id="career-twin" className="py-16 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Content */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                  <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">AI Career Twin</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Your Living, Breathing{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Digital Career Model
                  </span>
                </h2>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Unlike a static resume, your Career Twin evolves with every action you take — synthesizing data from multiple sources into a single, real-time career intelligence model.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: FileText,
                    title: "Resume Intelligence",
                    desc: "Parses PDF/DOCX resumes to extract verified skills, experience, and education using AI document analysis.",
                    color: "text-blue-400",
                    bg: "bg-blue-500/10",
                    border: "border-blue-500/30",
                  },
                  {
                    icon: Video,
                    title: "Interview Performance Scoring",
                    desc: "6-dimensional AI scoring evaluates technical accuracy, communication, confidence, grammar, completeness, and problem-solving.",
                    color: "text-purple-400",
                    bg: "bg-purple-500/10",
                    border: "border-purple-500/30",
                  },
                  {
                    icon: BarChart3,
                    title: "Real-Time Readiness Tracking",
                    desc: "Career Twin score and interview readiness update instantly after each completed session, resume upload, or skill addition.",
                    color: "text-emerald-400",
                    bg: "bg-emerald-500/10",
                    border: "border-emerald-500/30",
                  },
                ].map((feat, i) => {
                  const Icon = feat.icon;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors">
                      <div className={`w-10 h-10 shrink-0 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${feat.color}`} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white mb-0.5">{feat.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Visual Cards */}
            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career Twin Precision</p>
                    <p className="text-3xl font-black text-blue-400 mt-1">84%</p>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <UserCheck className="w-7 h-7" />
                  </div>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: "84%" }} />
                </div>
                <p className="text-[11px] text-slate-400">Resume synced · 6 skills verified · 3 AI rounds completed</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3 shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Skill Matrix</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "React / Next.js", score: 92 },
                    { name: "TypeScript", score: 88 },
                    { name: "Node.js", score: 80 },
                    { name: "SQL & PostgreSQL", score: 76 },
                  ].map((skill, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-semibold text-slate-300 truncate">{skill.name}</span>
                        <span className="font-black text-blue-400 ml-1">{skill.score}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full" style={{ width: `${skill.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-3xl p-5 flex items-start gap-3 shadow-xl">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-300">AI Recommendation</p>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">Complete 1 System Design mock interview to unlock Senior Engineer role matches and boost your score by +12%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-slate-950 border-t border-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Prepare Beyond the Expected?
              </h2>
              <p className="text-slate-400 text-sm">
                Create your AI Career Twin in under 2 minutes and start your first practice interview session.
              </p>
              <div className="pt-2 flex justify-center">
                <Link
                  href="/auth/signup"
                  prefetch={true}
                  className="px-8 py-4 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
                >
                  <span>Get Started for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
