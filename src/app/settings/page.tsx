"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { validateAvatarFile, processAvatarImage } from "@/lib/storage";
import { Save, CheckCircle2, UploadCloud, Trash2, AlertCircle, Sparkles, Sun, Moon, Phone, GraduationCap, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, updateUserProfile, refreshUserData } = useAuth();
  const { theme: activeTheme, setTheme } = useTheme();

  // Draft profile form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [location, setLocation] = useState("");
  const [education, setEducation] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [draftTheme, setDraftTheme] = useState<"dark" | "light">("dark");

  const [savedToast, setSavedToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  // Avatar Draft State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setHeadline(user.headline || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setCareerGoal(user.career_goal || "");
      setLocation(user.location || "");
      setEducation(user.education || "");
      setGithubUrl(user.social_links?.github || "");
      setLinkedinUrl(user.social_links?.linkedin || "");
      setDraftTheme((user.theme as "dark" | "light") || activeTheme || "dark");
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user, activeTheme]);

  const handleAvatarFileSelected = async (file: File) => {
    setAvatarError("");
    setAvatarSuccess("");

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error || "Invalid image file.");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarProgress(40);

      const processedWebpUrl = await processAvatarImage(file);
      setAvatarProgress(100);
      setAvatarPreview(processedWebpUrl);
      setAvatarSuccess("Photo ready for saving. Click 'Save Profile Changes' below to apply.");
    } catch (err: any) {
      console.error("Avatar preview error:", err);
      setAvatarError(err.message || "Error processing image file.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarError("");
    setAvatarSuccess("");
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || "User")}`;
    setAvatarPreview(defaultAvatar);
    setAvatarSuccess("Photo reset to default. Click 'Save Profile Changes' below to apply.");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvatarError("");
    setSavedToast(false);
    setIsSavedSuccess(false);

    if (!fullName.trim()) {
      setAvatarError("Full Name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setAvatarError("Please enter a valid email address.");
      return;
    }

    try {
      setSaving(true);

      // Apply theme preference
      if (draftTheme !== activeTheme) {
        setTheme(draftTheme);
      }

      // Single source of truth update to Supabase & local state
      await updateUserProfile({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        headline: headline.trim(),
        bio: bio.trim(),
        phone: phone.trim(),
        career_goal: careerGoal.trim(),
        location: location.trim(),
        education: education.trim(),
        social_links: {
          github: githubUrl.trim(),
          linkedin: linkedinUrl.trim(),
        },
        theme: draftTheme,
        avatar_url: avatarPreview || undefined,
      });

      refreshUserData();

      setSavedToast(true);
      setIsSavedSuccess(true);
      setTimeout(() => {
        setSavedToast(false);
        setIsSavedSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setSavedToast(false);
      setIsSavedSuccess(false);
      setAvatarError("Unable to save profile changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "NX";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
            {/* Header Banner */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex items-center justify-between relative overflow-hidden"
            >
              <div className="space-y-1 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                  <span>Account Management</span>
                </div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Account & Twin Settings</h1>
                <p className="text-xs text-slate-400">
                  Changes will take effect across your Career Twin, navbar, and dashboard only after clicking <strong>Save Profile Changes</strong>.
                </p>
              </div>
            </motion.div>

            {savedToast && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile changes saved successfully.</span>
              </div>
            )}

            {avatarError && (
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{avatarError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
              {/* Profile Photo Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800">
                  Profile Photo Management
                </h3>

                {avatarSuccess && (
                  <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{avatarSuccess}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Preview Display */}
                  <div className="relative shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile Avatar"
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/40 border border-slate-800 shadow-xl"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-blue-500/40 shadow-xl">
                        {initials}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 flex-1 text-center sm:text-left">
                    <div>
                      <h4 className="text-xs font-bold text-white">Upload Custom Avatar</h4>
                      <p className="text-[11px] text-slate-400">Supports JPG, PNG, and WebP (Max 5MB). Photo will be saved upon submitting changes.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                      <input
                        type="file"
                        id="avatarFileInput"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={(e) => e.target.files?.[0] && handleAvatarFileSelected(e.target.files[0])}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatarFileInput"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Upload Photo</span>
                      </label>

                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Reset Photo</span>
                        </button>
                      )}
                    </div>

                    {isUploadingAvatar && (
                      <div className="max-w-xs space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400">
                          <span>Optimizing photo...</span>
                          <span>{avatarProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${avatarProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Appearance Theme Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800">
                  Appearance & Interface Theme
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setDraftTheme("dark")}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      draftTheme === "dark"
                        ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Dark Mode (Default)</p>
                        <p className="text-[11px] text-slate-400">Sleek, high-contrast dark aesthetic</p>
                      </div>
                    </div>
                    {draftTheme === "dark" && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDraftTheme("light")}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      draftTheme === "light"
                        ? "bg-blue-600/10 border-blue-500 ring-2 ring-blue-500/20 text-slate-900"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-indigo-600">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Light Mode</p>
                        <p className="text-[11px] text-slate-400">Clean, crisp light interface</p>
                      </div>
                    </div>
                    {draftTheme === "light" && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                  </button>
                </div>
              </div>

              {/* Personal Details & Contact */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-3 border-b border-slate-800">
                  Personal Profile & Contact
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Professional Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Full-Stack Developer | Next.js & React Specialist"
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Phone Number</span>
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Professional Bio
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell recruiters and your Career Twin about your technical background and experience..."
                    className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Target Career Goal
                    </label>
                    <input
                      type="text"
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      placeholder="e.g. Land a Senior Software Engineer role"
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Location / Preference
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA (Open to Remote)"
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Education History</span>
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="e.g. B.S. in Computer Science - Stanford University (2024)"
                    className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5 text-slate-400" />
                      <span>GitHub Profile URL</span>
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-slate-400" />
                      <span>LinkedIn Profile URL</span>
                    </label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/yourusername"
                      className="w-full p-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 font-semibold text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Save Profile Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : isSavedSuccess ? (
                    <div className="flex items-center gap-2 text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Saved</span>
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
