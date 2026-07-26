"use client";

import React, { useState } from "react";
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
  Star,
  Target,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const heroChartData = [
  { week: "W1", readiness: 45 },
  { week: "W2", readiness: 58 },
  { week: "W3", readiness: 72 },
  { week: "W4", readiness: 81 },
  { week: "W5", readiness: 89 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-dark-text selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-gradient-subtle">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-cyan-accent/20 rounded-full blur-2xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600 animate-pulse" />
                <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                  AI-Powered Career Intelligence
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-text tracking-tight leading-[1.12]">
                Build the Career You’re{" "}
                <span className="text-gradient-cyan underline decoration-cyan-accent/40 decoration-wavy decoration-2">
                  Actually Ready For
                </span>
              </h1>

              <p className="text-lg text-slate-secondary leading-relaxed max-w-xl font-normal">
                Nexora AI creates an evolving digital <strong className="font-semibold text-dark-text">Career Twin</strong> from your resume, skill assessments, and realistic mock interviews to unlock personalized role matches and job readiness insights.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/auth/signup"
                  className="px-7 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 shadow-lg shadow-brand-600/30 hover:shadow-xl hover:shadow-brand-600/40 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                  <span>Create Your Career Twin</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <a
                  href="#how-it-works"
                  className="px-6 py-3.5 rounded-full text-base font-semibold text-dark-text bg-white border border-slate-border hover:bg-surface hover:border-slate-300 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Play className="w-4 h-4 text-brand-600 fill-brand-600" />
                  <span>See How It Works</span>
                </a>
              </div>

              <div className="pt-2 flex items-center gap-2 text-xs font-medium text-slate-secondary">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Free to start • No credit card required • Instant setup</span>
              </div>
            </div>

            {/* Right Column - Generic Product Preview Dashboard */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -top-6 -left-6 z-20 hidden sm:flex items-center gap-3 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-border animate-float">
                <div className="w-9 h-9 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-text">Career Twin Sync</p>
                  <p className="text-[11px] text-brand-600 font-semibold">Live Skill Synthesis</p>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-4 z-20 hidden sm:flex items-center gap-3 p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-border animate-float" style={{ animationDelay: "2s" }}>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-dark-text">AI Mock Round</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">+8 pts STAR Evaluation</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-glass border border-slate-border relative overflow-hidden">
                <div className="flex items-center justify-between pb-5 border-b border-slate-border">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-extrabold flex items-center justify-center text-sm ring-2 ring-brand-200">
                      AI
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-dark-text">Live Career Twin Demo</h3>
                      <p className="text-xs text-slate-secondary">Target: Full-Stack Engineer</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-extrabold rounded-full">
                    Twin Ready
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 py-5">
                  <div className="p-4 rounded-2xl bg-surface border border-slate-border">
                    <p className="text-xs font-semibold text-slate-secondary uppercase tracking-wider mb-1">
                      Twin Completion
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-brand-600">89%</span>
                      <span className="text-[11px] font-bold text-emerald-600">+14% boost</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-slate-border">
                    <p className="text-xs font-semibold text-slate-secondary uppercase tracking-wider mb-1">
                      Interview Readiness
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-dark-text">92/100</span>
                      <span className="text-[11px] font-bold text-brand-600">Advanced Tier</span>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-dark-text uppercase tracking-wider">Verified Skills</span>
                    <span className="text-[11px] text-brand-600 font-semibold">3 Sources Synced</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
                      React / Next.js
                    </span>
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
                      TypeScript
                    </span>
                    <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200">
                      STAR Method
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-dark-text uppercase tracking-wider">Readiness Trajectory</span>
                    <span className="text-xs text-slate-secondary font-medium">5 Weeks Logged</span>
                  </div>
                  <div className="h-28 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={heroChartData}>
                        <defs>
                          <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="readiness" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#heroGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-slate-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-secondary mb-8">
            Built for ambitious students, graduates, and early-career professionals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-extrabold text-xl text-slate-secondary tracking-wider">STANFORD</span>
            <span className="font-extrabold text-xl text-slate-secondary tracking-wider">MIT TECH</span>
            <span className="font-extrabold text-xl text-slate-secondary tracking-wider">BERKELEY</span>
            <span className="font-extrabold text-xl text-slate-secondary tracking-wider">GOOGLE ACADEMY</span>
            <span className="font-extrabold text-xl text-slate-secondary tracking-wider">META FELLOWS</span>
          </div>
        </div>
      </section>

      {/* Four Product Pillars */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-600">
              Core Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
              Four Pillars of Career Intelligence
            </h3>
            <p className="text-slate-secondary text-base leading-relaxed">
              Nexora AI integrates your real resume data, objective skill assessments, and AI mock interviews into one unified progression system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-7 rounded-3xl bg-surface border border-slate-border hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-dark-text mb-3">1. AI Career Twin</h4>
                <p className="text-slate-secondary text-sm leading-relaxed mb-6">
                  A living professional profile that continuously learns from your resume, assessments, interviews, and progress.
                </p>
              </div>
              <Link href="/auth/signup" className="text-xs font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Explore Career Twin</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-7 rounded-3xl bg-surface border border-slate-border hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Compass className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-dark-text mb-3">2. Opportunity Scanner</h4>
                <p className="text-slate-secondary text-sm leading-relaxed mb-6">
                  Discover roles that match your real skills, experience, strengths, and career goals with clear skill-gap breakdowns.
                </p>
              </div>
              <Link href="/auth/signup" className="text-xs font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Scan Openings</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-7 rounded-3xl bg-surface border border-slate-border hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-dark-text mb-3">3. AI Mock Interviews</h4>
                <p className="text-slate-secondary text-sm leading-relaxed mb-6">
                  Practice technical, behavioral, and HR interview rounds with personalized AI feedback and scoring.
                </p>
              </div>
              <Link href="/auth/signup" className="text-xs font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>Start Mock Session</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-7 rounded-3xl bg-surface border border-slate-border hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-brand-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-dark-text mb-3">4. Progress Genome</h4>
                <p className="text-slate-secondary text-sm leading-relaxed mb-6">
                  Track how your skills, readiness, confidence, and career opportunities improve over time through analytics.
                </p>
              </div>
              <Link href="/auth/signup" className="text-xs font-bold text-brand-600 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                <span>View Analytics</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-surface border-y border-slate-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-brand-600">
              Clear 4-Step Process
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
              How Nexora AI Works
            </h3>
            <p className="text-slate-secondary text-base leading-relaxed">
              From raw resume text to continuous job offer readiness in four effortless steps.
            </p>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-1/2 left-[12%] right-[12%] h-0.5 bg-brand-200 -translate-y-1/2 -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="bg-white p-6 rounded-3xl border border-slate-border shadow-sm text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 ring-4 ring-brand-100 shadow-md">
                  1
                </div>
                <h4 className="text-lg font-bold text-dark-text mb-2">Upload Resume</h4>
                <p className="text-slate-secondary text-xs leading-relaxed">
                  Our parser extracts verified technical skills, work achievements, and educational context.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-border shadow-sm text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 ring-4 ring-brand-100 shadow-md">
                  2
                </div>
                <h4 className="text-lg font-bold text-dark-text mb-2">Complete Assessments</h4>
                <p className="text-slate-secondary text-xs leading-relaxed">
                  Take adaptive micro-quizzes designed to evaluate domain depth and confidence levels.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-border shadow-sm text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 ring-4 ring-brand-100 shadow-md">
                  3
                </div>
                <h4 className="text-lg font-bold text-dark-text mb-2">Practice Mock Interviews</h4>
                <p className="text-slate-secondary text-xs leading-relaxed">
                  Engage in realistic roleplay with instant scorecards on communication & relevance.
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-border shadow-sm text-center relative group hover:border-brand-300 transition-all">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-600 text-white font-extrabold text-lg flex items-center justify-center mb-5 ring-4 ring-brand-100 shadow-md">
                  4
                </div>
                <h4 className="text-lg font-bold text-dark-text mb-2">Continuous Growth</h4>
                <p className="text-slate-secondary text-xs leading-relaxed">
                  Receive evolving job match alerts, skill gap fixes, and career readiness updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-brand-50 border-y border-brand-200/60 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-dark-text tracking-tight leading-tight">
            Your Career Preparation Should Be as Unique as You Are.
          </h2>
          <p className="text-slate-secondary text-base sm:text-lg max-w-2xl mx-auto">
            Create your Career Twin and turn every assessment, application, and interview into meaningful career progress.
          </p>
          <div className="pt-4">
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 shadow-xl shadow-brand-600/30 hover:scale-105 transition-all duration-200"
            >
              <span>Start Building Your Career Twin</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
