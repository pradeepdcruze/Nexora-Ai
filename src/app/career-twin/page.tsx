"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { SkillItem } from "@/types";
import { saveLocalUserData, UserDataStore } from "@/lib/supabase/dataStore";
import {
  UserCheck,
  Sparkles,
  Edit3,
  Plus,
  Target,
} from "lucide-react";

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

    // Avoid duplicate skills
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

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                <span>Living Profile Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                Your AI Career Twin
              </h1>
              <p className="text-xs sm:text-sm text-slate-secondary max-w-2xl">
                Synthesizes data from your resume, assessments, and interview performance into an evolving professional profile.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-brand-50 p-4 rounded-2xl border border-brand-200 shrink-0">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-secondary uppercase">Precision Score</p>
                <p className="text-3xl font-black text-brand-600">{currentSummary.completion_score}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-600/20">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Profile Identity Summary */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-border">
              <h3 className="text-base font-extrabold text-dark-text">Professional Identity Summary</h3>
              <button
                onClick={() => {
                  if (isEditingSummary) {
                    handleSaveHeadline();
                  } else {
                    setIsEditingSummary(true);
                  }
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-border text-xs font-bold text-slate-secondary hover:text-brand-600 hover:bg-surface transition-all flex items-center gap-1.5"
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
                  className="w-full p-3 text-xs rounded-xl border border-slate-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  rows={3}
                />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-dark-text leading-relaxed font-medium">
                {headline || "No summary set. Click Edit Summary to add your headline."}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-surface border border-slate-border">
                <span className="text-xs font-bold text-slate-secondary uppercase tracking-wider block mb-2">Target Roles</span>
                <div className="flex flex-wrap gap-2">
                  {userDataStore?.profile.target_roles.map((role, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-slate-border rounded-full text-xs font-semibold text-dark-text shadow-xs">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface border border-slate-border">
                <span className="text-xs font-bold text-slate-secondary uppercase tracking-wider block mb-2">Location</span>
                <p className="text-xs font-bold text-dark-text">{userDataStore?.profile.location || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Verified Skills Grid */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-border">
              <div>
                <h3 className="text-base font-extrabold text-dark-text">Verified Skills ({skillsList.length})</h3>
                <p className="text-xs text-slate-secondary">Skills parsed from your resume or added manually.</p>
              </div>
              <button
                onClick={() => setShowAddSkillModal(true)}
                className="px-4 py-2 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {skillsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skillsList.map((skill) => (
                  <div key={skill.id} className="p-4 rounded-2xl bg-surface border border-slate-border space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-dark-text">{skill.name}</span>
                      <span className="text-xs font-black text-brand-600">{skill.proficiency}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-600 h-full rounded-full transition-all" style={{ width: `${skill.proficiency}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-surface rounded-2xl border border-slate-border space-y-3">
                <Target className="w-10 h-10 text-brand-600 mx-auto" />
                <h4 className="text-sm font-bold text-dark-text">No Skills Verified Yet</h4>
                <p className="text-xs text-slate-secondary max-w-sm mx-auto">
                  Upload your resume or add your core skills manually to start building your Career Twin.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <Link
                    href="/resume"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
                  >
                    Upload Resume
                  </Link>
                  <button
                    onClick={() => setShowAddSkillModal(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-brand-600 bg-white border border-slate-border"
                  >
                    Add Skill Manually
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 bg-dark-text/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-border shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-dark-text">Add Skill to Career Twin</h3>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <input
                type="text"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g. React, TypeScript, Python, SQL"
                className="w-full p-3 text-xs rounded-xl border border-slate-border bg-surface focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                autoFocus
              />
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-secondary hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
