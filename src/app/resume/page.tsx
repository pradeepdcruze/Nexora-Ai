"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { ResumeData, SkillItem } from "@/types";
import { saveLocalUserData, UserDataStore } from "@/lib/supabase/dataStore";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Zap,
} from "lucide-react";

export default function ResumePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, refreshUserData } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [noticeMsg, setNoticeMsg] = useState("");
  const [analysisMode, setAnalysisMode] = useState<"local" | "ai" | null>(null);

  const handleFileUpload = async (file: File) => {
    setErrorMsg("");
    setSuccessToast("");
    setNoticeMsg("");
    setAnalysisMode(null);

    if (!user) {
      setErrorMsg("Authentication required. Please log in to upload resumes.");
      return;
    }

    // Client-side quick pre-checks
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx") && !lowerName.endsWith(".doc")) {
      setErrorMsg("Only PDF (.pdf) and Word (.docx) documents are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(`File size exceeds 5MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? 85 : prev + 15));
    }, 150);

    try {
      // Create FormData to post to backend API endpoint
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        headers: {
          "x-user-id": user.id,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMsg(result.message || "Failed to process resume document.");
        setIsUploading(false);
        return;
      }

      // Successful text extraction & parsing
      setAnalysisMode(result.analysisMode);
      setNoticeMsg(result.message);

      const parsedData = result.parsedData;
      const extractedSkills: SkillItem[] = parsedData.skills || [];

      const newResume: ResumeData = {
        id: result.resumeId || `res_${Date.now()}`,
        file_name: file.name,
        status: "parsed",
        uploaded_at: new Date().toISOString(),
        parsed_skills: extractedSkills.map((s) => s.name),
        experience: parsedData.experience || [],
        education: parsedData.education || [],
        certifications: parsedData.certifications || [],
      };

      // Merge extracted skills with user's skills, avoiding duplicates
      const currentSkills = userDataStore?.skills || [];
      const existingSkillNames = new Set(currentSkills.map((s) => s.name.toLowerCase()));
      const uniqueNewSkills = extractedSkills.filter(
        (s) => !existingSkillNames.has(s.name.toLowerCase())
      );

      const updatedStore: UserDataStore = {
        ...userDataStore!,
        resumes: [newResume], // Replace previous resume
        skills: [...uniqueNewSkills, ...currentSkills],
      };

      saveLocalUserData(user.id, updatedStore);
      refreshUserData();

      setSuccessToast(
        `Successfully analyzed ${file.name}! ${extractedSkills.length} verified skills synced to your Career Twin.`
      );
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Resume upload network error:", err);
      setErrorMsg(err.message || "Network error occurred while uploading resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const latestResume = userDataStore?.resumes[0];

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                <span>AI Resume Parser Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                Resume Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-secondary">
                Upload your latest PDF or DOCX resume to extract technical skills and update your Career Twin.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: {latestResume ? "Synced" : "No Resume Uploaded"}</span>
            </div>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
          )}

          {/* Notice Banner (Local vs AI Mode) */}
          {noticeMsg && (
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-800 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-600 shrink-0" />
                <span>{noticeMsg}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-brand-700 font-extrabold text-[10px] uppercase border border-brand-200">
                Mode: {analysisMode}
              </span>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-dark-text">Upload Resume Document</h3>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-brand-600 bg-brand-50/50 scale-[1.01]"
                  : "border-slate-300 hover:border-brand-400 bg-surface"
              }`}
            >
              <input
                type="file"
                id="resumeUpload"
                accept=".pdf,.docx,.doc"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />

              <label htmlFor="resumeUpload" className="cursor-pointer space-y-3 block">
                <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-sm font-bold text-dark-text">
                    Drag & drop your PDF or DOCX resume here, or <span className="text-brand-600 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-secondary mt-1">Supports PDF and DOCX (Max 5MB)</p>
                </div>
              </label>

              {isUploading && (
                <div className="mt-6 max-w-xs mx-auto space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-secondary">
                    <span>Extracting text & skills...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-brand-600 h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parsed Extracted Details */}
          {latestResume ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-border gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-dark-text">Extracted Resume Information</h3>
                  <p className="text-xs text-slate-secondary">
                    Active document: <strong className="text-dark-text">{latestResume.file_name}</strong>
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-dark-text uppercase tracking-wider">
                  Extracted Skills ({latestResume.parsed_skills.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {latestResume.parsed_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 flex items-center gap-1.5 shadow-xs"
                    >
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-border text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-dark-text">No Resume Uploaded Yet</h4>
              <p className="text-xs text-slate-secondary max-w-sm mx-auto">
                Upload your resume above to extract skills and automatically boost your Career Twin score.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
