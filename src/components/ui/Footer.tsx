import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Twitter, Linkedin, Github, Youtube } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Nexora AI empowers students, graduates, and ambitious professionals to prepare beyond the expected using adaptive AI Career Twins.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all shadow-md">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all shadow-md">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all shadow-md">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-blue-500/50 transition-all shadow-md">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white tracking-wide uppercase text-xs mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="#career-twin" className="hover:text-blue-400 transition-colors">Career Twin</Link></li>
              <li><Link href="/interviews" className="hover:text-blue-400 transition-colors">AI Mock Interviews</Link></li>
              <li><Link href="/opportunities" className="hover:text-blue-400 transition-colors">Opportunity Scanner</Link></li>
              <li><Link href="/progress" className="hover:text-blue-400 transition-colors">Progress Genome</Link></li>
              <li><Link href="/resume" className="hover:text-blue-400 transition-colors">Resume Intelligence</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white tracking-wide uppercase text-xs mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Career Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Interview Playbook</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Skill Gap Benchmark</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">University Partners</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API & Integrations</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-semibold text-white tracking-wide uppercase text-xs mb-4">Company & Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Security & Trust</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Nexora AI Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-blue-400">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400">Terms of Service</a>
            <a href="#" className="hover:text-blue-400">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
