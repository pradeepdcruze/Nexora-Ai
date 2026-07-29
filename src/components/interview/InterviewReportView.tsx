"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Zap,
  Target,
  XCircle,
  ListChecks,
  Download,
} from "lucide-react";
import { InterviewSession } from "@/types";

interface InterviewReportViewProps {
  session: InterviewSession;
  onStartNewSession: () => void;
}

export function InterviewReportView({ session, onStartNewSession }: InterviewReportViewProps) {
  const { scores, feedback_report, interview_type, target_role, transcript } = session;

  const overall = scores?.overall || 0;
  const technical = scores?.technical || 0;
  const communication = scores?.communication || 0;
  const confidence = scores?.confidence || 0;
  const grammar = scores?.grammar || 0;
  const problemSolving = scores?.problem_solving || 0;
  const completeness = scores?.completeness || 0;

  const readiness = feedback_report?.interview_readiness || (overall >= 78 ? "Interview Ready" : "Developing");
  const strengths = feedback_report?.strengths || ["Structured responses", "Clear focus"];
  const weaknesses = feedback_report?.weaknesses || ["Could elaborate with more metrics"];
  const topics = feedback_report?.recommended_topics || ["System Architecture", "STAR Methodology"];

  const handleDownloadReport = () => {
    let reportContent = `====================================================\n`;
    reportContent += ` NEXORA AI MOCK INTERVIEW EVALUATION REPORT\n`;
    reportContent += `====================================================\n\n`;
    reportContent += `Interview Track: ${interview_type}\n`;
    reportContent += `Target Role: ${target_role}\n`;
    reportContent += `Date Completed: ${new Date(session.completed_at).toLocaleString()}\n`;
    reportContent += `Overall Score: ${overall}/100\n`;
    reportContent += `Readiness Level: ${readiness}\n\n`;

    reportContent += `--- COMPETENCY BREAKDOWN ---\n`;
    reportContent += `Technical Accuracy: ${technical}%\n`;
    reportContent += `Communication: ${communication}%\n`;
    reportContent += `Confidence & Tone: ${confidence}%\n`;
    reportContent += `Grammar & Syntax: ${grammar}%\n`;
    reportContent += `Problem Solving: ${problemSolving}%\n`;
    reportContent += `Completeness: ${completeness}%\n\n`;

    reportContent += `--- AI FEEDBACK SUMMARY ---\n`;
    reportContent += `${feedback_report?.ai_feedback || "Solid effort."}\n\n`;

    reportContent += `--- KEY STRENGTHS ---\n`;
    strengths.forEach((s) => (reportContent += `• ${s}\n`));
    reportContent += `\n--- AREAS FOR IMPROVEMENT ---\n`;
    weaknesses.forEach((w) => (reportContent += `• ${w}\n`));

    reportContent += `\n--- QUESTION TRANSCRIPT & EVALUATION ---\n`;
    transcript?.forEach((t, i) => {
      reportContent += `\nQ${i + 1}: ${t.question}\n`;
      reportContent += `Answer: ${t.answer || "[Skipped]"}\n`;
      reportContent += `Score: ${t.score}/100 | Feedback: ${t.feedback}\n`;
    });

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Nexora_AI_${interview_type}_Interview_Report.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Circular score stroke calculation
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interview Evaluation Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {interview_type} Interview Report
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Target Role: <strong className="text-slate-200">{target_role}</strong> • Completed {new Date(session.completed_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-2 border border-slate-700"
            title="Download report text file"
          >
            <Download className="w-4 h-4 text-blue-400" />
            <span>Export Report</span>
          </button>
          <button
            onClick={onStartNewSession}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors flex items-center gap-2 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Session</span>
          </button>
          <Link
            href="/progress"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>View Progress</span>
          </Link>
        </div>
      </motion.div>

      {/* Main Score Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Animated Score Gauge (Col 5) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Interview Score</span>

          {/* SVG Score Circle */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={circleRadius}
                className="stroke-slate-800"
                strokeWidth="12"
                fill="transparent"
              />
              <motion.circle
                cx="88"
                cy="88"
                r={circleRadius}
                className="stroke-blue-500"
                strokeWidth="12"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{overall}</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase">out of 100</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Readiness: {readiness}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs pt-1">
              Your score automatically updated your Career Twin and Progress Genome metrics.
            </p>
          </div>
        </motion.div>

        {/* 6-Dimensional Score Breakdown Cards (Col 7) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl"
        >
          <h3 className="text-base font-extrabold text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <span>Multi-Dimensional Competency Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Technical Score", score: technical, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { label: "Communication", score: communication, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
              { label: "Confidence", score: confidence, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
              { label: "Grammar & Syntax", score: grammar, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { label: "Problem Solving", score: problemSolving, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { label: "Completeness", score: completeness, color: "text-pink-400", bg: "bg-pink-500/10 border-pink-500/20" },
            ].map((item, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${item.bg} text-center space-y-1`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.label}</span>
                <span className={`text-2xl font-black ${item.color}`}>{item.score}%</span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
            <strong className="text-white block font-semibold">AI Feedback Summary:</strong>
            <p className="leading-relaxed text-slate-400">
              {feedback_report?.ai_feedback || "Strong performance with structured reasoning. Continue practicing STAR framework stories to maximize score."}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Strengths, Weaknesses & Recommended Learning Topics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Strengths */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Strengths</span>
          </h4>
          <ul className="space-y-2.5">
            {strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Areas for Improvement</span>
          </h4>
          <ul className="space-y-2.5">
            {weaknesses.map((weak, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Learning Topics */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-blue-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>Recommended Learning Topics</span>
          </h4>
          <div className="space-y-2">
            {topics.map((topic, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300 flex items-center justify-between">
                <span>{topic}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transcript Review Accordion / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-base font-extrabold text-white pb-3 border-b border-slate-800">
          Question Transcript & Detailed Evaluated Feedback ({transcript?.length || 0} Questions)
        </h3>

        <div className="space-y-4">
          {transcript?.map((item, idx) => {
            const verdict = (item as any).verdict as string | undefined;
            const relevance = (item as any).relevance as number | undefined;
            const missingPoints = (item as any).missing_points as string[] | undefined;
            const itemStrengths = (item as any).strengths as string[] | undefined;

            const verdictConfig: Record<string, { bg: string; border: string; text: string }> = {
              Excellent: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400" },
              Good: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
              Average: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400" },
              Poor: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400" },
              Unrelated: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
            };
            const vc = verdictConfig[verdict || "Average"] || verdictConfig.Average;

            return (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                {/* Header row */}
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <span className="font-bold text-blue-400 uppercase tracking-wider">Question {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    {verdict && (
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${vc.bg} ${vc.border} ${vc.text}`}>
                        {verdict === "Unrelated" && <XCircle className="w-3 h-3 inline mr-1" />}
                        {verdict}
                      </span>
                    )}
                    {relevance !== undefined && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold">
                        Relevance: {relevance}%
                      </span>
                    )}
                    <span className={`px-2.5 py-1 rounded-full font-bold ${
                      item.score >= 75 ? "bg-blue-500/10 border border-blue-500/30 text-blue-300" :
                      item.score >= 50 ? "bg-amber-500/10 border border-amber-500/30 text-amber-300" :
                      "bg-red-500/10 border border-red-500/30 text-red-300"
                    }`}>
                      Score: {item.score}/100
                    </span>
                  </div>
                </div>

                {/* Question */}
                <p className="text-sm font-bold text-white">"{item.question}"</p>

                {/* Answer */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-300">
                  <strong className="text-slate-400 block mb-1">Your Response:</strong>
                  <p className="italic text-slate-300">{item.answer || "[Skipped]"}</p>
                </div>

                {/* Feedback */}
                <p className="text-xs text-purple-300/90 font-medium">
                  <strong className="text-purple-400">Interviewer Feedback:</strong> {item.feedback}
                </p>

                {/* Strengths + Missing Points side by side */}
                {(itemStrengths?.length || missingPoints?.length) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {itemStrengths && itemStrengths.length > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Strengths</span>
                        </div>
                        <ul className="space-y-1">
                          {itemStrengths.map((s, si) => (
                            <li key={si} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {missingPoints && missingPoints.length > 0 && (
                      <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          <ListChecks className="w-3.5 h-3.5" />
                          <span>Missing Points</span>
                        </div>
                        <ul className="space-y-1">
                          {missingPoints.map((m, mi) => (
                            <li key={mi} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-red-400 mt-1.5 shrink-0" />
                              <span>{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
