"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { authService, mapAuthError } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { refreshUserData } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const passwordLengthValid = password.length >= 6;
  const passwordHasNumber = /\d/.test(password);

  const isSubmittingRef = React.useRef(false);

  // Guarantee fields start empty on mount
  useEffect(() => {
    setFullName("");
    setEmail("");
    setPassword("");
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingRef.current || loading) return;

    setErrorMsg("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg("Please enter a valid email address with a complete domain (e.g. user@example.com).");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setLoading(true);
      await authService.signUp(trimmedEmail, password, trimmedName);
      await refreshUserData();
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("Signup error:", err);
      const msg = typeof err === "string" ? err : err?.message || mapAuthError(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Glow Background Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 backdrop-blur-xl relative z-10">
        <div className="text-center space-y-3">
          <Logo size="lg" className="justify-center" />
          <h3 className="text-2xl font-extrabold text-white tracking-tight pt-2">Create Your AI Career Twin</h3>
          <p className="text-xs text-slate-400">
            Join Nexora AI to unlock skill intelligence and mock interview readiness.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            {errorMsg.includes("already exists") && (
              <Link href="/auth/login" className="font-bold underline text-blue-400 hover:text-blue-300 shrink-0 text-xs">
                Log In
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4" autoComplete="off">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                autoComplete="off"
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                autoComplete="new-password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-3 text-xs rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password strength indicators */}
            {password && (
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span className={`flex items-center gap-1 ${passwordLengthValid ? "text-emerald-400" : "text-slate-500"}`}>
                  <CheckCircle2 className="w-3 h-3" /> 6+ chars
                </span>
                <span className={`flex items-center gap-1 ${passwordHasNumber ? "text-emerald-400" : "text-slate-500"}`}>
                  <CheckCircle2 className="w-3 h-3" /> Includes number
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating Career Twin...</span>
              </div>
            ) : (
              <>
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-bold text-blue-400 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
