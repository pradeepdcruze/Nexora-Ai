"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-slate-border/80 shadow-soft py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-secondary">
          <Link href="#features" className="hover:text-brand-600 transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-brand-600 transition-colors">
            How It Works
          </Link>
          <Link href="#career-twin" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
            <span>Career Twin</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200">
              Core
            </span>
          </Link>
          <Link href="#pricing" className="hover:text-brand-600 transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-dark-text hover:text-brand-600 transition-colors px-3 py-2"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-800 hover:from-brand-700 hover:to-brand-900 px-5 py-2.5 rounded-full shadow-md shadow-brand-600/25 transition-all duration-200 hover:shadow-lg hover:shadow-brand-600/35 hover:-translate-y-0.5 flex items-center gap-2 group"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-secondary hover:text-dark-text hover:bg-surface transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-border px-4 pt-4 pb-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 font-medium text-slate-secondary">
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface hover:text-brand-600"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface hover:text-brand-600"
            >
              How It Works
            </Link>
            <Link
              href="#career-twin"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface hover:text-brand-600 flex items-center justify-between"
            >
              <span>Career Twin</span>
              <span className="text-[10px] font-bold uppercase bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                AI Powered
              </span>
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-surface hover:text-brand-600"
            >
              Pricing
            </Link>
          </nav>
          <div className="pt-3 border-t border-slate-border flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center font-semibold text-dark-text py-2.5 rounded-lg border border-slate-border hover:bg-surface"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center font-semibold text-white bg-brand-600 hover:bg-brand-700 py-2.5 rounded-lg shadow-md shadow-brand-600/20"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
