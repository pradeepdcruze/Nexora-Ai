"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Menu, Bell, Search, Sparkles, ChevronDown } from "lucide-react";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const activeName = user?.full_name || "Account";
  const activeAvatar =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeName)}`;
  const activeHeadline = user?.headline || "Member Profile";

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-border px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-secondary hover:text-dark-text hover:bg-surface transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-secondary" />
          <input
            type="text"
            placeholder="Search skills, roles, mock interviews..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-surface border border-slate-border text-dark-text placeholder:text-slate-secondary focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/interviews"
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 rounded-xl shadow-xs transition-all shadow-brand-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mock Interview</span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-xl text-slate-secondary hover:text-dark-text hover:bg-surface border border-slate-border transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-border p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-border mb-3">
                <h4 className="text-xs font-bold text-dark-text uppercase tracking-wider">Notifications</h4>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">0 Unread</span>
              </div>
              <div className="text-center py-4 space-y-1">
                <p className="text-xs font-bold text-dark-text">All caught up!</p>
                <p className="text-[11px] text-slate-secondary">Complete your first mock interview to get AI alerts.</p>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/settings"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-surface border border-slate-border hover:border-brand-300 transition-all group"
        >
          <img
            src={activeAvatar}
            alt={activeName}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-brand-200"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-dark-text leading-tight group-hover:text-brand-600 transition-colors">
              {activeName}
            </p>
            <p className="text-[10px] text-slate-secondary leading-tight truncate max-w-[120px]">
              {activeHeadline}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-secondary group-hover:text-brand-600 transition-colors" />
        </Link>
      </div>
    </header>
  );
};
