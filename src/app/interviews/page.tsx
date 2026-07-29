"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { InterviewDashboard } from "@/components/interview/InterviewDashboard";
import { InterviewSessionView } from "@/components/interview/InterviewSessionView";
import { InterviewReportView } from "@/components/interview/InterviewReportView";
import { InterviewSession } from "@/types";
import { saveCompletedInterviewSession } from "@/lib/supabase/dataStore";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function InterviewsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, userDataStore, refreshUserData, careerTwinSummary } = useAuth();

  // Workflow state: "dashboard" | "session" | "report"
  const [viewState, setViewState] = useState<"dashboard" | "session" | "report">("dashboard");
  const [selectedType, setSelectedType] = useState<"Technical" | "HR" | "Behavioral">("Technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<string[]>([]);
  const [latestCompletedSession, setLatestCompletedSession] = useState<InterviewSession | null>(null);

  const targetRole = userDataStore?.profile?.target_roles?.[0] || "Software Engineer";
  const userSkills = userDataStore?.skills || [];

  const handleStartInterview = async (type: "Technical" | "HR" | "Behavioral") => {
    setSelectedType(type);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          userId: user?.id,
          targetRole,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await res.json();
      const generatedQuestions = data.questions || [];

      if (generatedQuestions.length > 0) {
        setActiveQuestions(generatedQuestions);
        setViewState("session");
      } else {
        throw new Error("No questions returned");
      }
    } catch (err) {
      console.warn("Failed to generate AI questions. Utilizing dynamic fallback.", err);
      // Fallback questions to ensure app NEVER crashes
      setActiveQuestions([
        `How do you approach performance optimization and architecture design for ${targetRole} positions?`,
        "Tell me about a time you encountered a severe bug in production and how you diagnosed it under pressure.",
        "How do you approach communicating technical trade-offs between speed-to-market and architectural refactoring?",
        "Describe a project where you had to quickly learn a new technology to meet a deadline.",
        "What strategies do you use for database indexing and query optimization when working with high volume data?",
        "Tell me about yourself and your career goals in software development.",
        "Why should we hire you for this engineering role over other candidates?",
        "Describe a situation where you had a conflict with a lead or peer and how you resolved it.",
        "How do you structure unit tests and integration tests for production applications?",
        "Describe a project you are most proud of: outline the Situation, Task, your specific Action, and final Result."
      ]);
      setViewState("session");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSessionComplete = async (results: {
    answers: { question: string; answer: string; score: number; feedback: string; category_scores: any }[];
    scores: {
      overall: number;
      technical: number;
      communication: number;
      confidence: number;
      grammar: number;
      completeness: number;
      problem_solving: number;
    };
  }) => {
    const userId = user?.id || "guest";

    // Request AI feedback report summary
    let reportFeedbackData: any = null;
    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate_session",
          type: selectedType,
          scores: results.scores,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        reportFeedbackData = data.reportFeedback;
      }
    } catch (err) {
      console.warn("Failed to fetch session report feedback", err);
    }

    const newSession: InterviewSession = {
      id: `int_${Date.now()}`,
      user_id: userId,
      interview_type: selectedType,
      target_role: targetRole,
      difficulty: "Intermediate",
      scores: results.scores,
      feedback_report: reportFeedbackData || {
        strengths: ["Structured delivery", "Clear communication"],
        weaknesses: ["Add more quantifiable business metrics"],
        ai_feedback: `Great performance scoring ${results.scores.overall}/100 in this ${selectedType} round!`,
        improvement_tip: "Focus on highlighting measurable results using the STAR framework.",
        recommended_topics: ["System Design", "STAR Storytelling"],
        interview_readiness: results.scores.overall >= 78 ? "Interview Ready" : "Developing",
      },
      transcript: results.answers.map((a) => ({
        question: a.question,
        answer: a.answer,
        feedback: a.feedback,
        score: a.score,
        category_scores: a.category_scores,
      })),
      questions: activeQuestions,
      completed_at: new Date().toISOString(),
    };

    // Store in Supabase DB if configured
    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from("interview_sessions").insert({
          id: newSession.id,
          user_id: user.id,
          interview_type: newSession.interview_type,
          target_role: newSession.target_role,
          difficulty: newSession.difficulty,
          questions: newSession.questions,
          answers: results.answers.map((a) => ({ question: a.question, answer: a.answer })),
          scores: newSession.scores,
          feedback: newSession.feedback_report,
          overall_score: newSession.scores.overall,
          completed_at: newSession.completed_at,
        });

        // Also update Supabase career_twin record
        await supabase.from("career_twin").upsert({
          user_id: user.id,
          completion_score: careerTwinSummary?.completion_score || 70,
          interview_readiness: newSession.scores.overall,
          communication_score: newSession.scores.communication,
          confidence_score: newSession.scores.confidence,
          technical_score: newSession.scores.technical,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.warn("Supabase interview insert error (falling back to local store):", dbErr);
      }
    }

    // Save locally, update Career Twin and Progress Genome
    if (userDataStore) {
      saveCompletedInterviewSession(userId, newSession, userDataStore);
      refreshUserData();
    }

    setLatestCompletedSession(newSession);
    setViewState("report");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          {viewState === "dashboard" && (
            <InterviewDashboard
              onStartInterview={handleStartInterview}
              userSkills={userSkills}
              targetRole={targetRole}
              isGenerating={isGenerating}
              selectedType={selectedType}
            />
          )}

          {viewState === "session" && (
            <InterviewSessionView
              questions={activeQuestions}
              interviewType={selectedType}
              targetRole={targetRole}
              onSessionComplete={handleSessionComplete}
              onCancelSession={() => setViewState("dashboard")}
            />
          )}

          {viewState === "report" && latestCompletedSession && (
            <InterviewReportView
              session={latestCompletedSession}
              onStartNewSession={() => setViewState("dashboard")}
            />
          )}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
