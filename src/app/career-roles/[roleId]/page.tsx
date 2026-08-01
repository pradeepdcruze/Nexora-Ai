"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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

function RoleDetailsContent() {
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Opportunity Scanner</span>
          </Link>

          {/* Goal Set Toast */}
          {goalToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between shadow-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-bold">{goalToast}</span>
              </div>
              <Link href="/dashboard" className="underline font-semibold hover:text-emerald-300">
                View Dashboard
              </Link>
            </motion.div>
          )}

          {/* Hero Header */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-md shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {roleData.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {roleData.matchLevel}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {roleData.title}
                </h1>
                <p className="text-xs text-slate-400 max-w-xl">
                  AI-calculated match analysis based on your verified skills, resume experience, and career trajectory.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSetCareerGoal}
                  className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  <span>Set as Target Career Goal</span>
                </button>
                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`p-3 rounded-2xl border transition-all ${
                    isSaved
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Matched & Missing Skills */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Matched Verified Skills ({roleData.matchedSkills.length})
                </h3>
                {roleData.matchedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roleData.matchedSkills.map((s, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No verified skills matched yet. Upload resume or take quizzes to add skills.</p>
                )}
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  Recommended Skill Gaps ({roleData.missingSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {roleData.missingSkills.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Recommended Projects
                </h3>
                <div className="space-y-3">
                  {roleData.recommendedProjects.map((p, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <h4 className="text-xs font-bold text-slate-200">{p}</h4>
                      <p className="text-[11px] text-slate-400">Boosts overall role match precision.</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  Certifications
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

export default function RoleDetailsPage() {
  return (
    <ProtectedRoute>
      <RoleDetailsContent />
    </ProtectedRoute>
  );
}
