"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { validateAvatarFile, processAvatarImage } from "@/lib/storage";
import { Save, CheckCircle2, UploadCloud, Trash2, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [location, setLocation] = useState("");
  const [savedToast, setSavedToast] = useState(false);

  // Avatar Upload States
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
      setCareerGoal(user.career_goal || "");
      setLocation(user.location || "");
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleAvatarFileSelected = async (file: File) => {
    setAvatarError("");
    setAvatarSuccess("");

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      setAvatarError(validation.error || "Invalid file.");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setAvatarProgress(30);

      // Process & compress to square WebP image preview
      const processedWebpUrl = await processAvatarImage(file);
      setAvatarPreview(processedWebpUrl);
      setAvatarProgress(70);

      // Post to backend API
      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user?.id || "",
        },
        body: JSON.stringify({ avatarDataUrl: processedWebpUrl }),
      });

      setAvatarProgress(100);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setAvatarError(result.message || "Failed to update profile photo.");
        return;
      }

      // Update global AuthContext user profile (immediately updates navbar)
      updateUserProfile({ avatar_url: result.avatarUrl });
      setAvatarSuccess("Profile photo updated! Navbar avatar refreshed.");
    } catch (err: any) {
      console.error("Avatar process error:", err);
      setAvatarError(err.message || "Error processing image file.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError("");
    setAvatarSuccess("");

    try {
      if (user?.id) {
        await fetch("/api/profile/avatar", {
          method: "DELETE",
          headers: {
            "x-user-id": user.id,
          },
        });
      }
      setAvatarPreview(null);
      updateUserProfile({ avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || "User")}` });
      setAvatarSuccess("Profile photo removed.");
    } catch (err: any) {
      setAvatarError("Failed to remove profile photo.");
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      full_name: fullName,
      email: email,
      headline: headline,
      career_goal: careerGoal,
      location: location,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const initials = fullName
    ? fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "NX";

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto w-full">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-dark-text tracking-tight">Account & Twin Settings</h1>
              <p className="text-xs text-slate-secondary mt-1">
                Updates saved here immediately sync across your Career Twin, navbar, and dashboard.
              </p>
            </div>
          </div>

          {savedToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Profile updated successfully! Navbar and Career Twin refreshed.</span>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-dark-text pb-3 border-b border-slate-border">
              Profile Photo Management
            </h3>

            {avatarError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{avatarError}</span>
              </div>
            )}

            {avatarSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{avatarSuccess}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar Preview Display */}
              <div className="relative group shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile Avatar"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-100 border border-slate-border shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brand-600 text-white font-black text-2xl flex items-center justify-center ring-4 ring-brand-100 shadow-md">
                    {initials}
                  </div>
                )}
              </div>

              {/* Action Buttons & Drop Zone */}
              <div className="space-y-3 flex-1 text-center sm:text-left">
                <div>
                  <h4 className="text-xs font-bold text-dark-text">Upload Custom Avatar</h4>
                  <p className="text-[11px] text-slate-secondary">Supports JPG, PNG, and WebP (Max 5MB). Automatically cropped to square.</p>
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
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </label>

                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove Photo</span>
                    </button>
                  )}
                </div>

                {isUploadingAvatar && (
                  <div className="max-w-xs space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-secondary">
                      <span>Cropping & compressing...</span>
                      <span>{avatarProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-brand-600 h-full rounded-full transition-all duration-300" style={{ width: `${avatarProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-dark-text pb-3 border-b border-slate-border">
                Personal Profile & Goals
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-1.5">
                  Professional Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Computer Science Graduate | Aspiring Frontend Developer"
                  className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-1.5">
                    Career Goal
                  </label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={(e) => setCareerGoal(e.target.value)}
                    placeholder="e.g. Land a Software Engineer role at a Tech SaaS company"
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA (Open to Remote)"
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
