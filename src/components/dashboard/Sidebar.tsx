"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  UserCheck,
  FileText,
  Video,
  Compass,
  TrendingUp,
  Settings,
  LogOut,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "AI Career Twin", href: "/career-twin", icon: UserCheck },
    { label: "Resume Intelligence", href: "/resume", icon: FileText },
    { label: "AI Mock Interviews", href: "/interviews", icon: Video },
    { label: "Career Opportunities", href: "/opportunities", icon: Compass },
    { label: "Progress Genome", href: "/progress", icon: TrendingUp },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-dark-text/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Logo size="md" />
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-secondary hover:text-dark-text"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-brand-50 text-brand-600 border border-brand-200/60 shadow-xs"
                      : "text-slate-secondary hover:text-dark-text hover:bg-surface"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-brand-600" : "text-slate-secondary"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-border">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-secondary hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
