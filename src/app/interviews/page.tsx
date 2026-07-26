"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { InterviewSession } from "@/types";
import { saveLocalUserData, UserDataStore } from "@/lib/supabase/dataStore";
import {
  Video,
  Clock,
  Sparkles,
  ArrowRight,
  Bot,
} from "lucide-react";

export default function InterviewsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, refreshUserData } = useAuth();

  const [interviewType, setInterviewType] = useState<"HR" | "Behavioral" | "Technical" | "Role-specific">("Behavioral");
  const [targetRole, setTargetRole] = useState("Junior Software Engineer");
  const [difficulty, setDifficulty] = useState<"Entry Level" | "Intermediate" | "Advanced">("Intermediate");

  const [sessionActive, setSessionActive] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(900);
  const [showResultCard, setShowResultCard] = useState(false);
  const [latestSession, setLatestSession] = useState<InterviewSession | null>(null);

  const sampleQuestions = [
    "Tell me about a time you encountered a severe bug in production and how you diagnosed it under pressure.",
    "How do you approach communicating technical trade-offs between speed-to-market and architectural refactoring?",
    "Describe a project where you had to quickly learn a new technology to meet a deadline.",
  ];

  const handleStartInterview = () => {
    setSessionActive(true);
    setCurrentQuestionIdx(0);
    setAnswerInput("");
    setTimerSeconds(900);
    setShowResultCard(false);
  };

  const handleCompleteInterview = () => {
    if (!user || !userDataStore) return;

    const newSession: InterviewSession = {
      id: `int_${Date.now()}`,
      interview_type: interviewType,
      target_role: targetRole,
      difficulty: difficulty,
      completed_at: new Date().toISOString(),
      scores: {
        overall: 88,
        communication: 92,
        technical: 84,
        confidence: 90,
        relevance: 86,
      },
      transcript: sampleQuestions.map((q) => ({
        question: q,
        answer: "Practiced response using STAR framework.",
        feedback: "Good structure and technical clarity.",
        score: 88,
        ideal_response: "Clear situation, quantifiable action, and outcome.",
      })),
    };

    const updatedStore: UserDataStore = {
      ...userDataStore,
      interviews: [newSession, ...userDataStore.interviews],
    };

    saveLocalUserData(user.id, updatedStore);
    refreshUserData();
    setLatestSession(newSession);
    setSessionActive(false);
    setShowResultCard(true);
  };

  const handleNextQuestion = () => {
    setAnswerInput("");
    if (currentQuestionIdx < sampleQuestions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      handleCompleteInterview();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-600 fill-brand-600" />
                <span>AI Interview Simulator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                AI Mock Interviews
              </h1>
              <p className="text-xs sm:text-sm text-slate-secondary max-w-2xl">
                Practice technical, behavioral, and HR interview rounds with instant scorecards.
              </p>
            </div>

            {!sessionActive && (
              <button
                onClick={handleStartInterview}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                <span>Start Practice Round</span>
              </button>
            )}
          </div>

          {/* SETUP FORM */}
          {!sessionActive && !showResultCard && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
              <h3 className="text-base font-extrabold text-dark-text pb-3 border-b border-slate-border">
                Configure Interview Session
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={interviewType}
                    onChange={(e: any) => setInterviewType(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text"
                  >
                    <option value="Behavioral">Behavioral (STAR Method)</option>
                    <option value="Technical">Technical & System Architecture</option>
                    <option value="HR">HR Screen & Culture Fit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-2">Target Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-text uppercase tracking-wider mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl bg-surface border border-slate-border font-semibold text-dark-text"
                  >
                    <option value="Entry Level">Entry Level</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced / Senior</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE SESSION */}
          {sessionActive && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-glass space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-border">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-dark-text uppercase tracking-wider">
                    Question {currentQuestionIdx + 1} of {sampleQuestions.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-50 rounded-xl border border-brand-200 text-xs font-extrabold text-brand-700">
                  <Clock className="w-4 h-4 text-brand-600" />
                  <span>{formatTime(timerSeconds)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-4 bg-surface p-6 rounded-3xl border border-slate-border text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dark-text">Nexora AI Coach</h4>
                    <p className="text-[11px] text-slate-secondary">Evaluating Response Structure</p>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div className="p-5 rounded-2xl bg-brand-50/70 border border-brand-200">
                    <p className="text-sm font-bold text-dark-text leading-relaxed">
                      "{sampleQuestions[currentQuestionIdx]}"
                    </p>
                  </div>

                  <textarea
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Type your STAR framework response here..."
                    className="w-full p-4 text-xs rounded-2xl border border-slate-border bg-surface text-dark-text focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    rows={5}
                  />

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/20 transition-all flex items-center gap-2"
                    >
                      <span>{currentQuestionIdx < sampleQuestions.length - 1 ? "Next Question" : "Submit Session"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCORECARD RESULTS */}
          {showResultCard && latestSession && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-glass space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-border">
                <div>
                  <h3 className="text-2xl font-extrabold text-dark-text">Session Evaluation Complete</h3>
                  <p className="text-xs text-slate-secondary">Your Career Twin score has been updated with these results.</p>
                </div>
                <button
                  onClick={handleStartInterview}
                  className="px-5 py-2.5 rounded-xl border border-slate-border text-xs font-bold text-dark-text hover:bg-surface"
                >
                  Start New Session
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-center">
                  <p className="text-[10px] font-bold uppercase text-brand-700">Overall Score</p>
                  <p className="text-3xl font-black text-brand-600 mt-1">{latestSession.scores.overall}/100</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-slate-border text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-secondary">Communication</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{latestSession.scores.communication}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-slate-border text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-secondary">Technical</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{latestSession.scores.technical}%</p>
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-slate-border text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-secondary">Confidence</p>
                  <p className="text-2xl font-bold text-dark-text mt-1">{latestSession.scores.confidence}%</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
