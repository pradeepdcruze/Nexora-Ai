"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { useAuth } from "@/context/AuthContext";
import { RoleRecommendation, calculateRoleRecommendations } from "@/lib/careerEngine";
import { MarketRoleDemand, MarketSkillsGap, INITIAL_MARKET_ROLES_CATALOG, calculateMarketSkillsGap } from "@/lib/marketEngine";
import { calculateOpportunityMatches } from "@/lib/supabase/dataStore";
import { OpportunityItem } from "@/types";
import {
  Sparkles,
  Search,
  Compass,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Building,
  MapPin,
  ChevronRight,
  Flame,
  Globe,
  ArrowRight,
} from "lucide-react";

export default function CareerOpportunitiesPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { userDataStore } = useAuth();

  const [activeTab, setActiveTab] = useState<"recommendations" | "market" | "gap" | "scanner">("recommendations");

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RoleRecommendation[]>([]);
  const resumeUploaded = Boolean(userDataStore?.resumes && userDataStore.resumes.length > 0);

  // Market demand state
  const [marketRoles, setMarketRoles] = useState<MarketRoleDemand[]>(INITIAL_MARKET_ROLES_CATALOG);
  const [selectedCountry, setSelectedCountry] = useState("us");
  const [remoteOnly, setRemoteOnly] = useState(false);

  // Skills Gap state
  const [skillsGap, setSkillsGap] = useState<MarketSkillsGap | null>(null);

  // Scanner state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (userDataStore) {
      const resume = userDataStore.resumes[0] || null;
      const recs = calculateRoleRecommendations(userDataStore.skills, resume);
      setRecommendations(recs);

      const gap = calculateMarketSkillsGap(
        userDataStore.skills,
        recs[0] ? recs[0].title : "Full-Stack Developer",
        recs[0] ? recs[0].matchScore : 0
      );
      setSkillsGap(gap);
    }
  }, [userDataStore]);

  const activeMatches = userDataStore
    ? calculateOpportunityMatches(userDataStore.skills, userDataStore.opportunities)
    : [];

  const filteredMatches = activeMatches.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMarketRoles = marketRoles.filter((item) => {
    if (remoteOnly && !item.remoteAvailable) return false;
    return true;
  });

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
                <span>Career Intelligence Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-text tracking-tight">
                Career Opportunities
              </h1>
              <p className="text-xs sm:text-sm text-slate-secondary">
                Personalized role recommendations, current job market telemetry, and skills gap analysis.
              </p>
            </div>

            <div className="px-4 py-2 bg-brand-50 rounded-2xl border border-brand-200 text-xs font-bold text-brand-700 shrink-0">
              {recommendations.length} Roles Analyzed
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-border pb-1">
            <button
              onClick={() => setActiveTab("recommendations")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "recommendations"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-secondary hover:text-dark-text border border-slate-border"
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Recommended Career Roles</span>
            </button>

            <button
              onClick={() => setActiveTab("market")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "market"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-secondary hover:text-dark-text border border-slate-border"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Current Market Demand</span>
            </button>

            <button
              onClick={() => setActiveTab("gap")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "gap"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-secondary hover:text-dark-text border border-slate-border"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Skills vs Market</span>
            </button>

            <button
              onClick={() => setActiveTab("scanner")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "scanner"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-white text-slate-secondary hover:text-dark-text border border-slate-border"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Opportunity Scanner</span>
            </button>
          </div>

          {/* TAB 1: RECOMMENDED CAREER ROLES */}
          {activeTab === "recommendations" && (
            <div className="space-y-6">
              {!resumeUploaded && (
                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>Upload your resume to calculate high-precision career recommendations based on your experience.</span>
                  </div>
                  <Link
                    href="/resume"
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs shrink-0 text-center"
                  >
                    Upload Resume
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <div
                    key={rec.roleId}
                    className="bg-white rounded-3xl p-6 border border-slate-border hover:border-brand-300 transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                              rec.matchScore >= 85
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : rec.matchScore >= 70
                                ? "bg-brand-50 border-brand-200 text-brand-700"
                                : "bg-amber-50 border-amber-200 text-amber-800"
                            }`}
                          >
                            {rec.matchLevel}
                          </span>
                          <h3 className="text-lg font-extrabold text-dark-text mt-2">{rec.title}</h3>
                          <p className="text-xs font-semibold text-slate-secondary">{rec.category}</p>
                        </div>

                        <div className="text-right">
                          <span className="text-3xl font-black text-brand-600">{rec.matchScore}%</span>
                          <p className="text-[10px] font-bold text-slate-secondary uppercase">Match Score</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-secondary uppercase tracking-wider block">
                          Matched Skills ({rec.matchedSkills.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.matchedSkills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                              {s}
                            </span>
                          ))}
                          {rec.matchedSkills.length === 0 && (
                            <span className="text-xs text-slate-secondary">No direct skill matches logged yet</span>
                          )}
                        </div>
                      </div>

                      {rec.missingSkills.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold text-slate-secondary uppercase tracking-wider block">
                            Missing Skills to Unlock
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.missingSkills.slice(0, 3).map((s, idx) => (
                              <span key={idx} className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-border flex items-center justify-between gap-3">
                      <Link
                        href={`/career-roles/${rec.roleId}`}
                        className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs text-center shadow-xs transition-all flex items-center justify-center gap-1.5"
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
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-dark-text">Live Market Job Telemetry</h3>
                    <p className="text-xs text-slate-secondary">Verified market demand metrics from live jobs index.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="p-2 text-xs font-bold rounded-xl bg-surface border border-slate-border text-dark-text"
                    >
                      <option value="us">United States</option>
                      <option value="in">India</option>
                      <option value="uk">United Kingdom</option>
                      <option value="ca">Canada</option>
                    </select>

                    <label className="flex items-center gap-2 text-xs font-bold text-slate-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remoteOnly}
                        onChange={(e) => setRemoteOnly(e.target.checked)}
                        className="rounded text-brand-600 focus:ring-brand-500"
                      />
                      <span>Remote Only</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMarketRoles.map((mkt) => (
                  <div key={mkt.id} className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-brand-50 text-brand-700 border border-brand-200">
                            Demand: {mkt.demandLevel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Trend: {mkt.trend}
                          </span>
                        </div>
                        <h3 className="text-lg font-extrabold text-dark-text">{mkt.roleTitle}</h3>
                        <p className="text-xs text-slate-secondary">{mkt.category}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-black text-dark-text">{mkt.recentListingsCount.toLocaleString()}</span>
                        <p className="text-[10px] font-bold text-slate-secondary uppercase">Recent Openings</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-secondary uppercase tracking-wider block">
                        Common Required Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {mkt.commonRequiredSkills.map((s, i) => (
                          <span key={i} className="px-2.5 py-0.5 rounded-full bg-surface border border-slate-border text-xs font-semibold text-dark-text">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-border flex items-center justify-between text-[11px] text-slate-secondary font-medium">
                      <span>Source: {mkt.source}</span>
                      <span>Experience: {mkt.typicalExperience}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS VS MARKET NEEDS */}
          {activeTab === "gap" && skillsGap && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
                  <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Strongest Match Role</span>
                  <p className="text-lg font-extrabold text-dark-text mt-1 truncate">{skillsGap.strongestRoleTitle}</p>
                  <p className="text-xs font-black text-brand-600 mt-0.5">{skillsGap.strongestRoleMatchScore}% Match</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
                  <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Possessed Skills</span>
                  <p className="text-3xl font-black text-emerald-600 mt-1">{skillsGap.possessedSkills.length}</p>
                  <p className="text-[11px] text-slate-secondary">Verified profile skills</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
                  <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Personal Readiness</span>
                  <p className="text-3xl font-black text-dark-text mt-1">{skillsGap.personalReadinessScore}/100</p>
                  <p className="text-[11px] text-slate-secondary">Role readiness index</p>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-border shadow-xs">
                  <span className="text-[10px] font-bold text-slate-secondary uppercase tracking-wider">Market Opportunity</span>
                  <p className="text-3xl font-black text-brand-600 mt-1">{skillsGap.marketOpportunityScore}%</p>
                  <p className="text-[11px] text-slate-secondary">Open role alignment</p>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-border shadow-xs space-y-6">
                <div className="pb-4 border-b border-slate-border">
                  <h3 className="text-base font-extrabold text-dark-text">Most Valuable Missing Skills</h3>
                  <p className="text-xs text-slate-secondary">
                    Acquiring these skills will unlock the highest number of open job opportunities.
                  </p>
                </div>

                <div className="space-y-4">
                  {skillsGap.mostValuableMissingSkills.map((gap, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-surface border border-slate-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-dark-text">{gap.skill}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
                            Unlocks {gap.rolesUnlockedCount} Roles
                          </span>
                        </div>
                        <p className="text-xs text-slate-secondary">{gap.recommendedAction}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-brand-600">{gap.marketDemandScore}%</span>
                        <p className="text-[10px] font-bold text-slate-secondary uppercase">Demand Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OPPORTUNITY SCANNER */}
          {activeTab === "scanner" && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-secondary" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search open positions or companies..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-surface border border-slate-border text-dark-text focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((opp) => (
                  <div key={opp.id} className="bg-white rounded-3xl p-6 border border-slate-border shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                          {opp.employment_type}
                        </span>
                        <h3 className="text-base font-extrabold text-dark-text mt-2">{opp.title}</h3>
                        <p className="text-xs font-semibold text-slate-secondary flex items-center gap-2 mt-1">
                          <Building className="w-3.5 h-3.5 text-brand-600" />
                          <span>{opp.company}</span>
                          <span>•</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{opp.location}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className={`text-2xl font-black ${opp.match_score > 0 ? "text-brand-600" : "text-slate-400"}`}>
                          {opp.match_score}%
                        </span>
                        <p className="text-[10px] font-bold text-slate-secondary uppercase">Match Score</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-secondary line-clamp-2">{opp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
