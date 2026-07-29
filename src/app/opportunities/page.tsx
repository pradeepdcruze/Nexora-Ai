"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { RoleRecommendation, calculateRoleRecommendations } from "@/lib/careerEngine";
import { MarketRoleDemand, MarketSkillsGap, INITIAL_MARKET_ROLES_CATALOG, calculateMarketSkillsGap } from "@/lib/marketEngine";
import { calculateOpportunityMatches } from "@/lib/supabase/dataStore";
import {
  Sparkles,
  Search,
  Compass,
  TrendingUp,
  Target,
  AlertCircle,
  Building,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CareerOpportunitiesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userDataStore } = useAuth();

  const [activeTab, setActiveTab] = useState<"recommendations" | "market" | "gap" | "scanner">("recommendations");

  const [recommendations, setRecommendations] = useState<RoleRecommendation[]>([]);
  const resumeUploaded = Boolean(userDataStore?.resumes && userDataStore.resumes.length > 0);

  const [marketRoles] = useState<MarketRoleDemand[]>(INITIAL_MARKET_ROLES_CATALOG);
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const [skillsGap, setSkillsGap] = useState<MarketSkillsGap | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Always calculate recommendations — even with no resume/skills, show default role cards
    const skills = userDataStore?.skills || [];
    const resume = userDataStore?.resumes[0] || null;
    const recs = calculateRoleRecommendations(skills, resume);
    setRecommendations(recs);

    const gap = calculateMarketSkillsGap(
      skills,
      recs[0] ? recs[0].title : "Full-Stack Developer",
      recs[0] ? recs[0].matchScore : 0
    );
    setSkillsGap(gap);
  }, [userDataStore]);

  const activeMatches = calculateOpportunityMatches(
    userDataStore?.skills || [],
    userDataStore?.opportunities || []
  );

  const filteredMatches = activeMatches.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarketRoles = marketRoles.filter((item) => {
    if (remoteOnly && !item.remoteAvailable) return false;
    return true;
  });

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
                <span>Career Intelligence Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Opportunity Scanner & Market Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Personalized role recommendations, current job market telemetry, and skills gap analysis.
              </p>
            </div>

            <div className="px-4 py-2 bg-blue-500/10 rounded-2xl border border-blue-500/30 text-xs font-bold text-blue-400 shrink-0 relative z-10">
              {recommendations.length} Roles Analyzed
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-1">
            {[
              { id: "recommendations", label: "Recommended Career Roles", icon: Target },
              { id: "market", label: "Current Market Demand", icon: TrendingUp },
              { id: "gap", label: "Skills vs Market", icon: Compass },
              { id: "scanner", label: "Opportunity Scanner", icon: Search },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/20"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: RECOMMENDED CAREER ROLES */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {!resumeUploaded && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>Upload your resume to calculate high-precision career recommendations based on your experience.</span>
                  </div>
                  <Link
                    href="/resume"
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shrink-0 text-center shadow-md"
                  >
                    Upload Resume
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div
                    key={rec.roleId}
                    className="bg-slate-900 rounded-3xl p-6 border border-slate-800 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-5 shadow-2xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              rec.matchScore >= 85
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : rec.matchScore >= 70
                                ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                            }`}
                          >
                            {rec.matchLevel}
                          </span>
                          <h3 className="text-lg font-extrabold text-white mt-2">{rec.title}</h3>
                          <p className="text-xs font-semibold text-slate-400">{rec.category}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-3xl font-black text-blue-400">{rec.matchScore}%</span>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Match Score</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Matched Skills ({rec.matchedSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.matchedSkills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                              {s}
                            </span>
                          ))}
                          {rec.matchedSkills.length === 0 && (
                            <span className="text-xs text-slate-500">No direct skill matches logged yet</span>
                          )}
                        </div>
                      </div>

                      {rec.missingSkills.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Missing Skills to Unlock
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.missingSkills.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/30">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                      <Link
                        href={`/career-roles/${rec.roleId}`}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>View Role Details</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CURRENT MARKET DEMAND */}
          {activeTab === "market" && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Live Market Job Telemetry</h3>
                    <p className="text-xs text-slate-400">Verified market demand metrics from live engineering index.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="p-2 text-xs font-bold rounded-xl bg-slate-950 border border-slate-800 text-white"
                    >
                      <option value="us">United States</option>
                      <option value="in">India</option>
                      <option value="uk">United Kingdom</option>
                      <option value="ca">Canada</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remoteOnly}
                        onChange={(e) => setRemoteOnly(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Remote Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMarketRoles.map((mkt) => (
                  <div key={mkt.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            Demand: {mkt.demandLevel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Trend: {mkt.trend}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-white">{mkt.roleTitle}</h3>
                        <p className="text-xs text-slate-400">{mkt.category}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-white">{mkt.recentListingsCount.toLocaleString()}</span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Recent Openings</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Common Required Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mkt.commonRequiredSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-xs font-semibold text-white">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>Source: {mkt.source}</span>
                      <span>Experience: {mkt.typicalExperience}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS VS MARKET NEEDS */}
          {activeTab === "gap" && (
            skillsGap ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strongest Match Role</span>
                  <p className="text-lg font-extrabold text-white truncate">{skillsGap.strongestRoleTitle}</p>
                  <p className="text-xs font-black text-blue-400 mt-0.5">{skillsGap.strongestRoleMatchScore}% Match</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Possessed Skills</span>
                  <p className="text-3xl font-black text-emerald-400">{skillsGap.possessedSkills.length}</p>
                  <p className="text-[11px] text-slate-500">Verified profile skills</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Personal Readiness</span>
                  <p className="text-3xl font-black text-white">{skillsGap.personalReadinessScore}/100</p>
                  <p className="text-[11px] text-slate-500">Role readiness index</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Market Opportunity</span>
                  <p className="text-3xl font-black text-purple-400">{skillsGap.marketOpportunityScore}%</p>
                  <p className="text-[11px] text-slate-500">Open role alignment</p>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h3 className="text-base font-extrabold text-white">Most Valuable Missing Skills</h3>
                  <p className="text-xs text-slate-400">
                    Acquiring these skills will unlock the highest number of open job opportunities.
                  </p>
                </div>

                <div className="space-y-4">
                  {skillsGap.mostValuableMissingSkills.map((gap, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">{gap.skill}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/30">
                            Unlocks {gap.rolesUnlockedCount} Roles
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{gap.recommendedAction}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-blue-400">{gap.marketDemandScore}%</span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Demand Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            ) : (
              <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
                  <Compass className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-white">Computing your market gap analysis...</p>
              </div>
            )
          )}

          {/* TAB 4: OPPORTUNITY SCANNER */}
          {activeTab === "scanner" && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search open positions or companies..."
                    className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((opp) => (
                  <div key={opp.id} className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          {opp.employment_type}
                        </span>
                        <h3 className="text-base font-extrabold text-white mt-2">{opp.title}</h3>
                        <p className="text-xs font-semibold text-slate-400 flex items-center gap-2 mt-1">
                          <Building className="w-3.5 h-3.5 text-blue-400" />
                          <span>{opp.company}</span>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>{opp.location}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-2xl font-black ${opp.match_score > 0 ? "text-blue-400" : "text-slate-500"}`}>
                          {opp.match_score}%
                        </span>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Match Score</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{opp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
