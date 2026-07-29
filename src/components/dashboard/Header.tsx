"use client";

import React, { memo } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Menu, Search, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/context/ThemeContext";

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = memo(function Header({ onOpenMobileMenu }) {
  const { user } = useAuth();

  const activeName = user?.full_name || "Account";
  const activeAvatar =
    user?.avatar_url ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeName)}`;
  const activeHeadline = user?.headline || "Member Profile";

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden sm:block w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search skills, roles, mock interviews..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <Link
          href="/settings"
          prefetch={true}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all group"
        >
          <img
            src={activeAvatar}
            alt={activeName}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
          />
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
              {activeName}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
              {activeHeadline}
            </p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
        </Link>
      </div>
    </header>
  );
});
