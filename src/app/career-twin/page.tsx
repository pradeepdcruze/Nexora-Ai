"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { SkillItem } from "@/types";
import { saveLocalUserData, UserDataStore } from "@/lib/supabase/dataStore";
import {
  UserCheck,
  Sparkles,
  Edit3,
  Plus,
  Target,
  Award,
  Zap,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileText,
  Video,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const impactColors = {
  High: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
  Medium: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
  Low: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
};

const recTypeIcons: Record<string, React.FC<{ className?: string }>> = {
  "Resume Enhancement": FileText,
  "Interview Prep": Video,
  "Skill Quiz": Zap,
  default: Sparkles,
};

export default function CareerTwinPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, careerTwinSummary, refreshUserData, updateUserProfile } = useAuth();

  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [headline, setHeadline] = useState("");
  const [newSkillName, setNewSkillName] = useState("");
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  useEffect(() => {
    if (user) {
      setHeadline(user.headline || "");
    }
  }, [user]);

  const handleSaveHeadline = () => {
    updateUserProfile({ headline });
    setIsEditingSummary(false);
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim() || !user || !userDataStore) return;

    const newSkill: SkillItem = {
      id: `skill_${Date.now()}`,
      name: newSkillName.trim(),
      category: "Technical",
      proficiency: 85,
      confidence: 90,
      source: "manual",
    };

    const existingMap = new Map(userDataStore.skills.map((s) => [s.name.toLowerCase(), s]));
    if (!existingMap.has(newSkill.name.toLowerCase())) {
      existingMap.set(newSkill.name.toLowerCase(), newSkill);
    }

    const updatedStore: UserDataStore = {
      ...userDataStore,
      skills: Array.from(existingMap.values()),
    };

    saveLocalUserData(user.id, updatedStore);
    refreshUserData();
    setNewSkillName("");
    setShowAddSkillModal(false);
  };

  const currentSummary = careerTwinSummary || {
    completion_score: 0,
    interview_readiness: 0,
    resume_status: "Not Uploaded" as const,
    top_skills: [],
    skill_gaps: [],
    ai_recommendations: [],
  };

  const skillsList = userDataStore?.skills || [];

  // Readiness ring calculation
  const readinessAngle = (currentSummary.interview_readiness / 100) * 283;
  const completionAngle = (currentSummary.completion_score / 100) * 283;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>Living Profile Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Your AI Career Twin
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                Synthesizes data from your resume, skill assessments, and mock interview performance into an evolving digital model.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 shrink-0 relative z-10">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-400 uppercase">Precision Score</p>
                <p className="text-3xl font-black text-blue-400">{currentSummary.completion_score}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          {/* Dual Score Rings Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Career Twin Score Ring */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 shadow-xl">
              <div className="relative shrink-0">
                <svg width="72" height="72" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke="url(#twinGrad)" strokeWidth="10"
                    strokeDasharray={`${completionAngle} 283`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="twinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-blue-400">
                  {currentSummary.completion_score}%
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career Twin</p>
                <p className="text-base font-extrabold text-white">Profile Score</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Resume + Skills + Interviews</p>
              </div>
            </div>

            {/* Interview Readiness Ring */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 shadow-xl">
              <div className="relative shrink-0">
                <svg width="72" height="72" viewBox="0 0 100 100" className="-rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={currentSummary.interview_readiness > 0 ? "#10b981" : "#334155"}
                    strokeWidth="10"
                    strokeDasharray={`${readinessAngle} 283`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-400">
                  {currentSummary.interview_readiness}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Readiness</p>
                <p className="text-base font-extrabold text-white">Interview Score</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Average across all sessions</p>
              </div>
            </div>

            {/* Resume Status */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 shadow-xl">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                currentSummary.resume_status === "Synced"
                  ? "bg-emerald-500/10 border border-emerald-500/30"
                  : "bg-slate-800 border border-slate-700"
              }`}>
                {currentSummary.resume_status === "Synced"
                  ? <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  : <FileText className="w-7 h-7 text-slate-500" />
                }
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resume</p>
                <p className={`text-base font-extrabold ${currentSummary.resume_status === "Synced" ? "text-emerald-400" : "text-white"}`}>
                  {currentSummary.resume_status}
                </p>
                <Link href="/resume" className="text-[11px] text-blue-400 hover:underline mt-0.5 block">
                  {currentSummary.resume_status === "Synced" ? "Update Resume →" : "Upload Resume →"}
                </Link>
              </div>
            </div>
          </div>

          {/* Profile Identity Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                <span>Professional Identity Summary</span>
              </h3>
              <button
                onClick={() => {
                  if (isEditingSummary) {
                    handleSaveHeadline();
                  } else {
                    setIsEditingSummary(true);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditingSummary ? "Save Summary" : "Edit Summary"}</span>
              </button>
            </div>

            {isEditingSummary ? (
              <div className="space-y-3">
                <textarea
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full p-3 text-xs rounded-2xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-blue-500"
                  rows={3}
                />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {headline || "No summary set. Click Edit Summary to add your headline."}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Roles</span>
                <div className="flex flex-wrap gap-2">
                  {userDataStore?.profile.target_roles.map((role, idx) => (
                    <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold text-white">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Location</span>
                <p className="text-xs font-bold text-white">{userDataStore?.profile.location || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Verified Skills Grid */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white">Verified Skills ({skillsList.length})</h3>
                <p className="text-xs text-slate-400">Skills parsed from your resume or verified via mock interviews.</p>
              </div>
              <button
                onClick={() => setShowAddSkillModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {skillsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsList.map((skill) => (
                  <div key={skill.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{skill.name}</span>
                      <span className="text-xs font-black text-blue-400">{skill.proficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <Target className="w-10 h-10 text-blue-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Skills Verified Yet</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Upload your resume or add your core skills manually to build your Career Twin.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/resume"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500"
                  >
                    Upload Resume
                  </Link>
                  <button
                    onClick={() => setShowAddSkillModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800"
                  >
                    Add Skill Manually
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Skill Gaps Section */}
          {currentSummary.skill_gaps.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span>Identified Skill Gaps</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Closing these gaps will unlock higher-match roles and boost your Career Twin score.
                </p>
              </div>

              <div className="space-y-3">
                {currentSummary.skill_gaps.map((gap, idx) => {
                  const colors = impactColors[gap.impact];
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{gap.skill}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${colors.bg} ${colors.border} border ${colors.text}`}>
                            {gap.impact} Impact
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{gap.recommendation}</p>
                      </div>
                      <button
                        onClick={() => setShowAddSkillModal(true)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Skill</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Recommendations Section */}
          {currentSummary.ai_recommendations.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div className="pb-4 border-b border-slate-800">
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                  <span>AI-Powered Recommendations</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Personalized actions to accelerate your Career Twin score and unlock new opportunities.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSummary.ai_recommendations.map((rec) => {
                  const IconComponent = recTypeIcons[rec.type] || recTypeIcons.default;
                  return (
                    <div key={rec.id} className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/20 hover:border-blue-500/40 transition-all space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shrink-0">
                          <IconComponent className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{rec.title}</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                              {rec.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.reason}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{rec.est_time}</span>
                        </div>
                        <Link
                          href={rec.type === "Resume Enhancement" ? "/resume" : rec.type === "Interview Prep" ? "/interviews" : "/career-twin"}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          <span>Take Action</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Skill Modal */}
      <AnimatePresence>
        {showAddSkillModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-800 shadow-2xl space-y-4"
            >
              <h3 className="text-lg font-bold text-white">Add Skill to Career Twin</h3>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. React, TypeScript, Python, SQL"
                  className="w-full p-3 text-xs rounded-2xl border border-slate-800 bg-slate-950 text-white focus:outline-none focus:border-blue-500 font-sans"
                  autoFocus
                />
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSkillModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
                  >
                    Save Skill
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </ProtectedRoute>
  );
}
