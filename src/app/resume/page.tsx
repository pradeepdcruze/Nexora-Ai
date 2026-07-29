"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ResumeData, SkillItem } from "@/types";
import { saveLocalUserData, createEmptyUserData, UserDataStore } from "@/lib/supabase/dataStore";
import { authService } from "@/lib/supabase/client";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

export default function ResumePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, refreshUserData } = useAuth();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [successToast, setSuccessToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = async (file: File) => {
    setErrorMsg("");
    setSuccessToast("");

    const activeUser = user || userDataStore?.profile || authService.getCachedUser();

    if (!activeUser) {
      setErrorMsg("Authentication required. Please log in to upload resumes.");
      return;
    }

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
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        headers: {
          "x-user-id": activeUser.id,
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
        confidence_score: parsedData.confidenceScore || 85,
      };

      const currentSkills = userDataStore?.skills || [];
      const existingSkillNames = new Set(currentSkills.map((s) => s.name.toLowerCase()));
      const uniqueNewSkills = extractedSkills.filter(
        (s) => !existingSkillNames.has(s.name.toLowerCase())
      );

      const updatedStore: UserDataStore = {
        ...(userDataStore || createEmptyUserData(activeUser.id, activeUser.email, activeUser.full_name)),
        resumes: [newResume],
        skills: [...uniqueNewSkills, ...currentSkills],
      };

      saveLocalUserData(activeUser.id, updatedStore);
      refreshUserData();

      setSuccessToast(
        `Resume analyzed successfully! ${extractedSkills.length} verified skills synced to your Career Twin.`
      );
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("Resume upload error:", err);
      setErrorMsg(err.message || "Network error occurred while uploading resume.");
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
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                <span>AI Resume Parser Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Resume Intelligence
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Upload your latest PDF or DOCX resume to extract technical skills and update your Career Twin.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shrink-0 relative z-10">
              <CheckCircle2 className="w-4 h-4" />
              <span>Status: {latestResume ? "Synced" : "No Resume Uploaded"}</span>
            </div>
          </motion.div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{successToast}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <h3 className="text-base font-extrabold text-white">Upload Resume Document</h3>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                  : "border-slate-800 hover:border-slate-700 bg-slate-950"
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
                <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Drag & drop your PDF or DOCX resume here, or <span className="text-blue-400 underline">browse files</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports PDF and DOCX (Max 5MB) • Replaces existing resume</p>
                </div>
              </label>

              {isUploading && (
                <div className="mt-6 max-w-xs mx-auto space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400">
                    <span>Extracting text & skills...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 rounded-full" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Parsed Extracted Details */}
          {latestResume ? (() => {
            const dynamicConfidence = latestResume.confidence_score ?? (
              Math.min(100, Math.max(0, (latestResume.parsed_skills?.length || 0) * 5 + (latestResume.education?.length ? 40 : 0) + 30))
            );

            return (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Extracted Resume Information</h3>
                    <p className="text-xs text-slate-400">
                      Active document: <strong className="text-slate-200">{latestResume.file_name}</strong>
                    </p>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold self-start sm:self-auto">
                    Confidence Score: {dynamicConfidence}%
                  </div>
                </div>

                {/* Skills */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span>Extracted Skills & Technologies ({latestResume.parsed_skills.length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {latestResume.parsed_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1.5"
                      >
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education Background */}
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                    <span>Education Background</span>
                  </h4>

                  {latestResume.education && latestResume.education.length > 0 ? (
                    <div className="space-y-3">
                      {latestResume.education.map((edu, idx) => (
                        <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                          <p className="text-base font-extrabold text-white">{edu.degree}</p>

                          {edu.department && (
                            <p className="text-xs font-bold text-blue-400">{edu.department}</p>
                          )}

                          {edu.institution && (
                            <p className="text-xs text-slate-300 font-semibold">{edu.institution}</p>
                          )}

                          {edu.year && (
                            <p className="text-xs font-medium text-emerald-400">{edu.year}</p>
                          )}

                          {edu.gpa && (
                            <p className="text-xs font-bold text-purple-400">{edu.gpa}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 italic">
                      No education details extracted from resume yet.
                    </div>
                  )}
                </div>

                {/* Certifications */}
                {latestResume.certifications && latestResume.certifications.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Verified Certifications</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {latestResume.certifications.map((cert, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3 shadow-xl">
              <FileText className="w-12 h-12 text-slate-600 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Resume Uploaded Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload your resume above to extract skills and boost your Career Twin precision.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
