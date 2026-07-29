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
  Bookmark,
  Target,
} from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          <main className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Role Intelligence Not Found</h2>
            <p className="text-xs text-slate-400">
              The specified career role could not be located. Explore active career recommendations in the Opportunity Scanner.
            </p>
            <Link
              href="/opportunities"
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Opportunity Scanner</span>
            </Link>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Back Navigation */}
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunities Hub</span>
          </Link>

          {goalToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{goalToast}</span>
            </div>
          )}

          {/* Role Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
          >
            <div className="space-y-3 relative z-10">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase">
                  {roleData.category}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black border ${
                    roleData.matchScore >= 85
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : roleData.matchScore >= 70
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                      : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  }`}
                >
                  {roleData.matchLevel} ({roleData.matchScore}%)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {roleData.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Personalized alignment computed from your verified skills, project history, and experience.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 relative z-10">
              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  isSaved
                    ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>{isSaved ? "Saved Role" : "Save Role"}</span>
              </button>

              <button
                onClick={handleSetCareerGoal}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                <span>Set as Career Goal</span>
              </button>
            </div>
          </motion.div>

          {/* Grid Layout: Match Analysis vs Skill Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Match Explanation */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <h3 className="text-base font-extrabold text-white pb-3 border-b border-slate-800">
                  Why This Role Matches You
                </h3>
                <div className="space-y-3">
                  {roleData.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched vs Missing Skills */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Matched Skills ({roleData.matchedSkills.length})</span>
                  </h3>
                  {roleData.matchedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roleData.matchedSkills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">No direct skill matches logged yet.</p>
                  )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Missing Skills ({roleData.missingSkills.length})</span>
                  </h3>
                  {roleData.missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {roleData.missingSkills.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-bold border border-amber-500/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-400 font-bold">100% Core Skill Coverage!</p>
                  )}
                </div>
              </div>

              {/* Recommended Learning Roadmap */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h3 className="text-base font-extrabold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                  <span>Actionable Skill Growth Roadmap</span>
                </h3>

                <div className="space-y-4">
                  {roleData.recommendedActions.map((action, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <p className="text-xs font-bold text-white">{action}</p>
                      </div>
                      <Link
                        href="/interviews"
                        className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 text-xs font-bold hover:bg-slate-800 shrink-0"
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
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Recommended Projects</span>
                </h3>
                <div className="space-y-3">
                  {roleData.recommendedProjects.map((proj, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <h4 className="text-xs font-bold text-white">{proj}</h4>
                      <p className="text-[11px] text-slate-400">Demonstrates portfolio readiness for {roleData.title}.</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider pb-3 border-b border-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span>Recommended Certifications</span>
                </h3>
                <div className="space-y-3">
                  {roleData.recommendedCertifications.map((cert, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-1">
                      <h4 className="text-xs font-bold text-purple-300">{cert}</h4>
                      <p className="text-[11px] text-purple-400/80">Industry recognized validation.</p>
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
