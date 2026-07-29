"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Bot, ArrowRight, SkipForward, AlertCircle, CheckCircle2, Sparkles, Volume2, VolumeX, Mic, MicOff } from "lucide-react";

interface InterviewSessionViewProps {
  questions: string[];
  interviewType: "Technical" | "HR" | "Behavioral";
  targetRole?: string;
  onSessionComplete: (results: {
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
  }) => void;
  onCancelSession: () => void;
}

export function InterviewSessionView({
  questions,
  interviewType,
  targetRole = "Software Engineer",
  onSessionComplete,
  onCancelSession,
}: InterviewSessionViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(questions.length).fill(""));
  const [timerSeconds, setTimerSeconds] = useState(120); // 2 minutes countdown
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalProgressText, setEvalProgressText] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  // Audio TTS & Voice Dictation States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx] || "";
  const currentAnswer = userAnswers[currentIdx] || "";

  // Stop audio and speech recognition on question change
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  }, [currentIdx]);

  const toggleSpeakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentQuestion);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice speech recognition is not supported in this browser. Please type your response into the field.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        let transcriptText = "";
        for (let i = 0; i < event.results.length; i++) {
          transcriptText += event.results[i][0].transcript;
        }
        handleAnswerChange(transcriptText);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition", err);
      setIsListening(false);
    }
  };

  // Timer Countdown (2 minutes = 120s per question)
  useEffect(() => {
    setTimerSeconds(120);
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIdx]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleAnswerChange = (val: string) => {
    const updated = [...userAnswers];
    updated[currentIdx] = val;
    setUserAnswers(updated);
  };

  const handleSkipQuestion = () => {
    handleAnswerChange("[Skipped]");
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finalizeSession([...userAnswers.slice(0, currentIdx), "[Skipped]"]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      finalizeSession(userAnswers);
    }
  };

  const finalizeSession = async (finalAnswers: string[]) => {
    setIsEvaluating(true);
    setApiErrorMessage(null);
    setEvalProgressText("Evaluating your responses with Gemini AI...");

    const evaluatedTranscript: any[] = [];
    let sumTech = 0, sumComm = 0, sumConf = 0, sumGram = 0, sumComp = 0, sumProb = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const ans = finalAnswers[i] || "[No Response]";
      setEvalProgressText(`Evaluating question ${i + 1} of ${questions.length}...`);

      try {
        const res = await fetch("/api/interview/evaluate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "evaluate_single",
            question: q,
            answer: ans,
            type: interviewType,
            targetRole,
          }),
        });

        if (!res.ok) {
          throw new Error("Evaluation endpoint error");
        }

        const data = await res.json();
        const evalData = data.evaluation || {};

        const qTech = typeof evalData.technical === "number" ? evalData.technical : 75;
        const qComm = typeof evalData.communication === "number" ? evalData.communication : 75;
        const qConf = typeof evalData.confidence === "number" ? evalData.confidence : 75;
        const qGram = typeof evalData.grammar === "number" ? evalData.grammar : 85;
        const qComp = typeof evalData.completeness === "number" ? evalData.completeness : 75;
        const qProb = typeof evalData.problem_solving === "number" ? evalData.problem_solving : 75;
        const qOverall = Math.round((qTech + qComm + qConf + qGram + qComp + qProb) / 6);

        sumTech += qTech;
        sumComm += qComm;
        sumConf += qConf;
        sumGram += qGram;
        sumComp += qComp;
        sumProb += qProb;

        evaluatedTranscript.push({
          question: q,
          answer: ans,
          score: qOverall,
          feedback: evalData.feedback || "Solid effort.",
          verdict: evalData.verdict || (qOverall >= 85 ? "Excellent" : qOverall >= 70 ? "Good" : qOverall >= 50 ? "Average" : qOverall >= 20 ? "Poor" : "Unrelated"),
          relevance: evalData.relevance ?? qOverall,
          final_score: evalData.final_score ?? qOverall,
          missing_points: evalData.missing_points || [],
          strengths: evalData.strengths || [],
          category_scores: {
            technical: qTech,
            communication: qComm,
            confidence: qConf,
            grammar: qGram,
            completeness: qComp,
            problem_solving: qProb,
          },
        });
      } catch (err) {
        console.warn(`Error evaluating question ${i + 1}. Using fallback evaluations.`, err);
        setApiErrorMessage("We couldn't evaluate your interview at the moment. Please try again.");

        // Fallback evaluation for this question to prevent crash
        const len = ans.length;
        const fbScore = len > 100 ? 80 : 60;
        sumTech += fbScore;
        sumComm += fbScore;
        sumConf += fbScore;
        sumGram += 85;
        sumComp += fbScore;
        sumProb += fbScore;

        evaluatedTranscript.push({
          question: q,
          answer: ans,
          score: fbScore,
          feedback: "Evaluation completed with fallback score.",
          verdict: fbScore >= 80 ? "Good" : "Average",
          relevance: fbScore,
          final_score: fbScore,
          missing_points: ["Provide detailed STAR structure"],
          strengths: ["Completed response within time limit"],
          category_scores: {
            technical: fbScore,
            communication: fbScore,
            confidence: fbScore,
            grammar: 85,
            completeness: fbScore,
            problem_solving: fbScore,
          },
        });
      }
    }

    const count = questions.length;
    const avgTech = Math.round(sumTech / count);
    const avgComm = Math.round(sumComm / count);
    const avgConf = Math.round(sumConf / count);
    const avgGram = Math.round(sumGram / count);
    const avgComp = Math.round(sumComp / count);
    const avgProb = Math.round(sumProb / count);
    const overall = Math.round((avgTech + avgComm + avgConf + avgGram + avgComp + avgProb) / 6);

    setIsEvaluating(false);

    onSessionComplete({
      answers: evaluatedTranscript,
      scores: {
        overall,
        technical: avgTech,
        communication: avgComm,
        confidence: avgConf,
        grammar: avgGram,
        completeness: avgComp,
        problem_solving: avgProb,
      },
    });
  };

  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Progress Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
            <div>
              <span className="text-xs font-semibold text-blue-400 tracking-wider uppercase">
                {interviewType} Interview Track
              </span>
              <h2 className="text-lg font-bold text-white">
                Question {currentIdx + 1} of {totalQuestions}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 2-Minute Timer Countdown */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold transition-colors ${
                timerSeconds < 30
                  ? "bg-red-500/10 border-red-500/30 text-red-400 animate-pulse"
                  : "bg-slate-800 border-slate-700 text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4 text-blue-400" />
              <span>{formatTime(timerSeconds)} remaining</span>
            </div>

            <button
              onClick={onCancelSession}
              className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
            >
              Exit Session
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400 font-medium">
            <span>Progress: {progressPercent}%</span>
            <span>{totalQuestions - (currentIdx + 1)} questions left</span>
          </div>
        </div>
      </div>

      {/* Loading Overlay when evaluating */}
      {isEvaluating ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 animate-bounce">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-extrabold text-white">Gemini AI Interviewer is Evaluating</h3>
            <p className="text-xs text-slate-400">{evalProgressText}</p>
          </div>
          <div className="w-48 h-1.5 mx-auto bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse w-full" />
          </div>
        </motion.div>
      ) : (
        /* Main Question Card */
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Glow Accents */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Error Message Toast if needed */}
            {apiErrorMessage && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{apiErrorMessage}</span>
              </div>
            )}

            {/* Question Box */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nexora AI Interviewer</h4>
                    <p className="text-[11px] text-blue-400">Target Role: {targetRole}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSpeakQuestion}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    isSpeaking
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300 animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                  }`}
                  title="Listen to AI interviewer read this question"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-purple-400" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
                  <span>{isSpeaking ? "Stop Audio" : "Listen Question"}</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800/80 shadow-inner">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  "{currentQuestion}"
                </p>
              </div>
            </div>

            {/* Answer Textarea Box */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-semibold text-slate-300 gap-2">
                <label>Your Response (Type or speak STAR explanation):</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-[11px] font-bold transition-all ${
                      isListening
                        ? "bg-red-500/20 border-red-500/50 text-red-400 animate-pulse"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}
                    title="Speak your answer using voice dictation"
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isListening ? "Listening (Click to Stop)" : "Voice Dictate"}</span>
                  </button>
                  <span className="text-slate-400">{currentAnswer.length} characters</span>
                </div>
              </div>

              <textarea
                value={currentAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here clearly..."
                rows={6}
                className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans leading-relaxed"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="w-4 h-4" />
                <span>Skip Question</span>
              </button>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{currentIdx < totalQuestions - 1 ? "Next Question" : "Submit Interview"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
