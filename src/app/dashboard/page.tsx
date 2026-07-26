"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { calculateOpportunityMatches } from "@/lib/supabase/dataStore";
import {
  UserCheck,
  Video,
  FileText,
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, careerTwinSummary } = useAuth();

  const activeName = user?.full_name || "Member";
  const currentSummary = careerTwinSummary || {
    completion_score: 0,
    interview_readiness: 0,
    resume_status: "Not Uploaded" as const,
    top_skills: [],
    skill_gaps: [],
    ai_recommendations: [],
  };

  const matches = userDataStore
    ? calculateOpportunityMatches(userDataStore.skills, userDataStore.opportunities)
    : [];

  const topMatchedRole = matches.length > 0 && userDataStore && userDataStore.skills.length > 0 ? matches[0] : null;

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-brand-900 text-white rounded-3xl p-6 sm:p-8 shadow-glass relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-accent/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-accent fill-cyan-accent" />
                  <span>AI Career Twin Ready</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome to Nexora AI, {activeName.split(" ")[0]} 👋
                </h1>
                <p className="text-brand-100 text-xs sm:text-sm max-w-xl">
                  {currentSummary.completion_score === 0
                    ? "Your digital Career Twin is initialized. Complete the actions below to start building your personalized career model."
                    : `Your Career Twin is ${currentSummary.completion_score}% complete. Keep completing assessments and mock interviews to increase role matches.`}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/resume"
                  className="px-5 py-2.5 rounded-xl bg-white text-brand-700 font-extrabold text-xs hover:bg-brand-50 transition-all shadow-md flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>Upload Resume</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Core Dynamic Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-secondary uppercase tracking-wider">Twin Completion</span>
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-brand-600">{currentSummary.completion_score}%</span>
              </div>
              <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentSummary.completion_score}%` }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-secondary uppercase tracking-wider">Interview Readiness</span>
                <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                  <Video className="w-4 h-4 text-cyan-accent" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-dark-text">
                  {currentSummary.interview_readiness > 0 ? `${currentSummary.interview_readiness}/100` : "0/100"}
                </span>
              </div>
              <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-cyan-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentSummary.interview_readiness}%` }}
                />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-secondary uppercase tracking-wider">Resume Status</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span
                  className={`text-lg font-extrabold ${
                    currentSummary.resume_status === "Synced" ? "text-emerald-600" : "text-amber-800"
                  }`}
                >
                  {currentSummary.resume_status}
                </span>
              </div>
              <p className="text-[11px] text-slate-secondary">
                {userDataStore && userDataStore.resumes.length > 0
                  ? `${userDataStore.skills.length} verified skills`
                  : "Upload PDF or DOCX file"}
              </p>
            </div>

            {/* Metric 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs hover:shadow-card transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-secondary uppercase tracking-wider">Top Role Match</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-black text-brand-600">
                  {topMatchedRole ? `${topMatchedRole.match_score}%` : "0%"}
                </span>
                <span className="text-xs font-bold text-dark-text truncate">
                  {topMatchedRole ? topMatchedRole.title : "Needs Skills"}
                </span>
              </div>
              <p className="text-[11px] text-slate-secondary">
                {topMatchedRole ? topMatchedRole.company : "Scan roles to calculate match"}
              </p>
            </div>
          </div>

          {/* Onboarding Blueprint */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-secondary mb-4">
              Onboarding Blueprint
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/resume"
                className="p-5 rounded-2xl bg-white border border-slate-border hover:border-brand-300 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark-text">1. Upload Resume</h4>
                  <p className="text-[11px] text-slate-secondary mt-0.5">Extract skills & history (+35% score)</p>
                </div>
                <div className="text-[11px] font-bold text-brand-600 flex items-center gap-1 pt-1">
                  <span>Start Upload</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                href="/career-twin"
                className="p-5 rounded-2xl bg-white border border-slate-border hover:border-brand-300 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark-text">2. Take Your First Quiz</h4>
                  <p className="text-[11px] text-slate-secondary mt-0.5">Verify technical skills</p>
                </div>
                <div className="text-[11px] font-bold text-purple-700 flex items-center gap-1 pt-1">
                  <span>Take Quiz</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                href="/interviews"
                className="p-5 rounded-2xl bg-white border border-slate-border hover:border-brand-300 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark-text">3. Start Mock Interview</h4>
                  <p className="text-[11px] text-slate-secondary mt-0.5">Practice STAR feedback rounds</p>
                </div>
                <div className="text-[11px] font-bold text-cyan-700 flex items-center gap-1 pt-1">
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>

              <Link
                href="/opportunities"
                className="p-5 rounded-2xl bg-white border border-slate-border hover:border-brand-300 hover:shadow-md transition-all space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark-text">4. Scan Opportunities</h4>
                  <p className="text-[11px] text-slate-secondary mt-0.5">Discover roles matching your skills</p>
                </div>
                <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1 pt-1">
                  <span>Explore Openings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            </div>
          </div>

          {/* Dynamic Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Skill Gap Priority Matrix */}
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-border mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-dark-text">Skill Gap Priority Matrix</h3>
                    <p className="text-xs text-slate-secondary">
                      Recommended focus areas to unlock target job match thresholds.
                    </p>
                  </div>
                  <Link href="/career-twin" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
                    <span>View Twin</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {currentSummary.skill_gaps.length > 0 ? (
                  <div className="space-y-4">
                    {currentSummary.skill_gaps.map((gap, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-surface border border-slate-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-dark-text">{gap.skill}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                gap.impact === "High" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {gap.impact} Impact Gap
                            </span>
                          </div>
                          <p className="text-xs text-slate-secondary">{gap.recommendation}</p>
                        </div>
                        <Link
                          href="/interviews"
                          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-border text-brand-600 hover:bg-brand-50 shrink-0 text-center shadow-xs"
                        >
                          Bridge Gap
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-surface rounded-2xl border border-slate-border space-y-3">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h4 className="text-sm font-bold text-dark-text">No Skill Gaps Identified Yet</h4>
                    <p className="text-xs text-slate-secondary max-w-sm mx-auto">
                      Upload your resume or take your first quiz so Nexora AI can analyze your technical skill gaps.
                    </p>
                    <Link
                      href="/resume"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Upload Resume Now</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Recommended Roles */}
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-border mb-5">
                  <div>
                    <h3 className="text-base font-extrabold text-dark-text">Opportunity Match Scanner</h3>
                    <p className="text-xs text-slate-secondary">Calculated from your verified profile skills.</p>
                  </div>
                  <Link href="/opportunities" className="text-xs font-bold text-brand-600 hover:underline">
                    View All Openings
                  </Link>
                </div>

                <div className="space-y-4">
                  {matches.slice(0, 3).map((opp) => (
                    <div
                      key={opp.id}
                      className="p-5 rounded-2xl bg-surface border border-slate-border hover:border-brand-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h4 className="text-sm font-bold text-dark-text">{opp.title}</h4>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                              opp.match_score > 0 ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opp.match_score > 0 ? `${opp.match_score}% Match` : "Needs Skills"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-secondary">
                          {opp.company} • {opp.location}
                        </p>
                      </div>
                      <Link
                        href="/opportunities"
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs shrink-0"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Getting Started & Activity Log */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-border">
                  <h3 className="text-sm font-extrabold text-dark-text uppercase tracking-wider">Getting Started</h3>
                  <span className="text-xs font-bold text-brand-600">
                    {userDataStore && userDataStore.resumes.length > 0 ? "1 / 3" : "0 / 3"} Done
                  </span>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/resume"
                    className={`flex items-center justify-between text-xs p-3 rounded-xl border transition-all ${
                      userDataStore && userDataStore.resumes.length > 0
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-surface border-slate-border hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {userDataStore && userDataStore.resumes.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-secondary" />
                      )}
                      <span className="font-semibold text-dark-text">Upload your resume</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        userDataStore && userDataStore.resumes.length > 0
                          ? "bg-white text-emerald-700"
                          : "bg-brand-50 text-brand-600"
                      }`}
                    >
                      {userDataStore && userDataStore.resumes.length > 0 ? "Done" : "Pending"}
                    </span>
                  </Link>

                  <Link
                    href="/career-twin"
                    className={`flex items-center justify-between text-xs p-3 rounded-xl border transition-all ${
                      userDataStore && userDataStore.skills.length > 0
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-surface border-slate-border hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {userDataStore && userDataStore.skills.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-secondary" />
                      )}
                      <span className="font-semibold text-dark-text">Verify core skills</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        userDataStore && userDataStore.skills.length > 0
                          ? "bg-white text-emerald-700"
                          : "bg-brand-50 text-brand-600"
                      }`}
                    >
                      {userDataStore && userDataStore.skills.length > 0 ? "Done" : "Pending"}
                    </span>
                  </Link>

                  <Link
                    href="/interviews"
                    className={`flex items-center justify-between text-xs p-3 rounded-xl border transition-all ${
                      userDataStore && userDataStore.interviews.length > 0
                        ? "bg-emerald-50/60 border-emerald-200"
                        : "bg-surface border-slate-border hover:border-brand-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {userDataStore && userDataStore.interviews.length > 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-secondary" />
                      )}
                      <span className="font-semibold text-dark-text">Complete 1 mock session</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        userDataStore && userDataStore.interviews.length > 0
                          ? "bg-white text-emerald-700"
                          : "bg-brand-50 text-brand-600"
                      }`}
                    >
                      {userDataStore && userDataStore.interviews.length > 0 ? "Done" : "Pending"}
                    </span>
                  </Link>
                </div>
              </div>

              {/* Activity Log Feed */}
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-dark-text uppercase tracking-wider pb-3 border-b border-slate-border">
                  Activity Feed
                </h3>

                {userDataStore && (userDataStore.resumes.length > 0 || userDataStore.interviews.length > 0) ? (
                  <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {userDataStore.resumes.map((res, i) => (
                      <div key={i} className="flex items-start gap-3 relative z-10 pl-1">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          ✓
                        </div>
                        <div>
                          <p className="text-xs font-bold text-dark-text">Resume Uploaded</p>
                          <p className="text-[11px] text-slate-secondary">{res.file_name}</p>
                        </div>
                      </div>
                    ))}
                    {userDataStore.interviews.map((int, i) => (
                      <div key={i} className="flex items-start gap-3 relative z-10 pl-1">
                        <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          AI
                        </div>
                        <div>
                          <p className="text-xs font-bold text-dark-text">{int.interview_type} Session Completed</p>
                          <p className="text-[11px] text-slate-secondary">Score: {int.scores.overall}/100</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 space-y-2">
                    <p className="text-xs font-bold text-dark-text">No activity recorded yet</p>
                    <p className="text-[11px] text-slate-secondary">
                      Your actions will automatically populate this timeline.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
