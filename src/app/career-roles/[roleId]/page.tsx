"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { CAREER_ROLES_TAXONOMY, calculateRoleRecommendations, RoleRecommendation } from "@/lib/careerEngine";
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  BookOpen,
  Award,
  ChevronRight,
  Bookmark,
  Target,
} from "lucide-react";

export default function RoleDetailsPage() {
  const params = useParams();
  const roleId = params?.roleId as string;

  const [mobileOpen, setMobileOpen] = useState(false);
  const { userDataStore, updateUserProfile } = useAuth();
  const [roleData, setRoleData] = useState<RoleRecommendation | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [goalToast, setGoalToast] = useState("");

  useEffect(() => {
    if (roleId && userDataStore) {
      const resume = userDataStore.resumes[0] || null;
      const recs = calculateRoleRecommendations(userDataStore.skills, resume);
      const match = recs.find((r) => r.roleId === roleId);

      if (match) {
        setRoleData(match);
      } else {
        const taxonomyItem = CAREER_ROLES_TAXONOMY.find((r) => r.roleId === roleId);
        if (taxonomyItem) {
          setRoleData({
            roleId: taxonomyItem.roleId,
            title: taxonomyItem.title,
            category: taxonomyItem.category,
            matchScore: 65,
            matchLevel: "Developing Match",
            matchedSkills: [],
            missingSkills: taxonomyItem.requiredSkills,
            reasons: ["Standard market alignment role."],
            recommendedActions: ["Add skills to verify readiness."],
            experienceAlignment: "Baseline Evaluation",
            educationAlignment: "Pending",
            recommendedProjects: taxonomyItem.recommendedProjects,
            recommendedCertifications: taxonomyItem.recommendedCertifications,
            analysisMode: "local",
          });
        }
      }
    }
  }, [roleId, userDataStore]);

  const handleSetCareerGoal = () => {
    if (roleData) {
      updateUserProfile({ career_goal: `Land a ${roleData.title} role` });
      setGoalToast(`Set "${roleData.title}" as your active career goal!`);
      setTimeout(() => setGoalToast(""), 3500);
    }
  };

  if (!roleData) {
    return (
      <div className="min-h-screen bg-surface flex">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="p-8 text-center">Loading Role Intelligence...</main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Back Navigation */}
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-secondary hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities Hub</span>
          </Link>

          {goalToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>{goalToast}</span>
            </div>
          )}

          {/* Role Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase">
                  {roleData.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    roleData.matchScore >= 85
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : roleData.matchScore >= 70
                      ? "bg-brand-50 border-brand-200 text-brand-700"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  {roleData.matchLevel} ({roleData.matchScore}%)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-dark-text tracking-tight">
                {roleData.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-secondary max-w-2xl">
                Personalized alignment computed from your verified skills, project history, and experience.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isSaved
                    ? "bg-brand-50 border-brand-300 text-brand-700"
                    : "bg-white border-slate-border text-slate-secondary hover:text-dark-text"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? "Saved Role" : "Save Role"}</span>
              </button>

              <button
                onClick={handleSetCareerGoal}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Set as Career Goal</span>
              </button>
            </div>
          </div>

          {/* Grid Layout: Match Analysis vs Skill Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Match Explanation */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-dark-text pb-3 border-b border-slate-border">
                  Why This Role Matches You
                </h3>
                <div className="space-y-3">
                  {roleData.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-surface border border-slate-border text-xs text-dark-text font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-dark-text uppercase tracking-wider pb-2 border-b border-slate-border flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Skills ({roleData.matchedSkills.length})</span>
                  </h3>
                  {roleData.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roleData.matchedSkills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-secondary">No direct skill matches logged yet.</p>
                  )}
                </div>

                <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                  <h3 className="text-sm font-extrabold text-dark-text uppercase tracking-wider pb-2 border-b border-slate-border flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Missing Skills ({roleData.missingSkills.length})</span>
                  </h3>
                  {roleData.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roleData.missingSkills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-bold">100% Core Skill Coverage!</p>
                  )}
                </div>
              </div>

              {/* Recommended Learning Roadmap */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
                <h3 className="text-base font-extrabold text-dark-text pb-3 border-b border-slate-border flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-brand-600" />
                  <span>Actionable Skill Growth Roadmap</span>
                </h3>

                <div className="space-y-4">
                  {roleData.recommendedActions.map((action, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-surface border border-slate-border flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-xs font-bold text-dark-text">{action}</p>
                      </div>
                      <Link
                        href="/interviews"
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-border text-brand-600 text-xs font-bold hover:bg-brand-50 shrink-0"
                      >
                        Practice
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Projects & Certifications */}
            <div className="lg:col-span-4 space-y-8">
              {/* Projects */}
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-dark-text uppercase tracking-wider pb-3 border-b border-slate-border flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-600" />
                  <span>Recommended Projects</span>
                </h3>
                <div className="space-y-3">
                  {roleData.recommendedProjects.map((proj, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-surface border border-slate-border space-y-1">
                      <h4 className="text-xs font-bold text-dark-text">{proj}</h4>
                      <p className="text-[11px] text-slate-secondary">Demonstrates portfolio readiness for {roleData.title}.</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-dark-text uppercase tracking-wider pb-3 border-b border-slate-border flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Recommended Certifications</span>
                </h3>
                <div className="space-y-3">
                  {roleData.recommendedCertifications.map((cert, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-1">
                      <h4 className="text-xs font-bold text-purple-900">{cert}</h4>
                      <p className="text-[11px] text-purple-700">Industry recognized validation.</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
