"use client";

import React from "react";
import { motion } from "framer-motion";
import { Code, Users, Brain, Sparkles, ArrowRight, Target, ShieldCheck, Zap } from "lucide-react";
import { SkillItem } from "@/types";

interface InterviewDashboardProps {
  onStartInterview: (type: "Technical" | "HR" | "Behavioral") => void;
  userSkills?: SkillItem[];
  targetRole?: string;
  isGenerating?: boolean;
  selectedType?: string | null;
}

export function InterviewDashboard({
  onStartInterview,
  userSkills = [],
  targetRole = "Software Engineer",
  isGenerating = false,
  selectedType = null,
}: InterviewDashboardProps) {
  const cards = [
    {
      id: "Technical" as const,
      title: "Technical Interview",
      icon: Code,
      badge: "Skill-Adaptive",
      badgeColor: "bg-blue-500/10 border-blue-500/30 text-blue-400",
      description: "Questions generated from your Career Twin skills & stack.",
      details: userSkills.length > 0
        ? `Personalized for: ${userSkills.slice(0, 4).map((s) => s.name).join(", ")}`
        : "Covers data structures, system architecture & framework concepts.",
      buttonText: "Start Technical Interview",
      gradient: "from-blue-600/20 via-indigo-600/10 to-purple-600/20",
      borderGlow: "hover:border-blue-500/60 hover:shadow-[0_0_25px_rgba(37,99,235,0.25)]",
      iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30",
    },
    {
      id: "HR" as const,
      title: "HR Interview",
      icon: Users,
      badge: "Placement Focus",
      badgeColor: "bg-purple-500/10 border-purple-500/30 text-purple-400",
      description: "Common HR and placement interview questions.",
      details: "Practice responses to 'Tell me about yourself', strength/weakness, and career goals.",
      buttonText: "Start HR Interview",
      gradient: "from-purple-600/20 via-pink-600/10 to-indigo-600/20",
      borderGlow: "hover:border-purple-500/60 hover:shadow-[0_0_25px_rgba(147,51,234,0.25)]",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/30",
    },
    {
      id: "Behavioral" as const,
      title: "Behavioural Interview",
      icon: Brain,
      badge: "STAR Framework",
      badgeColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      description: "STAR methodology based behavioural questions.",
      details: "Evaluate Situation, Task, Action, and Result structure with instant AI coaching.",
      buttonText: "Start Behavioural Interview",
      gradient: "from-indigo-600/20 via-emerald-600/10 to-blue-600/20",
      borderGlow: "hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>AI Mock Interview Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Master Your Next Interview with <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">AI Real-Time Feedback</span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Select an interview track below. Generates 10 AI questions dynamically based on your profile, evaluates multi-dimensional performance, and updates your Career Twin readiness.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 backdrop-blur-md text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Target Role: <strong className="text-white">{targetRole}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Verified Skills: <strong className="text-white">{userSkills.length} active</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>Gemini AI Engine: <strong className="text-white">Active</strong></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3 Interview Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const isCurrentGenerating = isGenerating && selectedType === card.id;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`relative group rounded-3xl bg-slate-900/90 border border-slate-800/80 p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl ${card.borderGlow}`}
            >
              {/* Subtle background gradient fill on hover */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105 duration-300`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/60 text-xs text-slate-400 leading-normal">
                  {card.details}
                </div>
              </div>

              <div className="relative z-10 pt-6">
                <button
                  disabled={isGenerating}
                  onClick={() => onStartInterview(card.id)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCurrentGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating 10 AI Questions...</span>
                    </div>
                  ) : (
                    <>
                      <span>{card.buttonText}</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
