import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Twitter, Linkedin, Github, Youtube, ArrowRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-slate-border pt-16 pb-12 text-slate-secondary text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-border">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" />
            <p className="text-slate-secondary text-sm max-w-sm leading-relaxed">
              Nexora AI empowers students, graduates, and ambitious professionals to prepare beyond the expected using adaptive AI Career Twins.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-slate-border flex items-center justify-center text-slate-secondary hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-slate-border flex items-center justify-center text-slate-secondary hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-slate-border flex items-center justify-center text-slate-secondary hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white border border-slate-border flex items-center justify-center text-slate-secondary hover:text-brand-600 hover:border-brand-300 transition-all shadow-sm">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-dark-text tracking-wide uppercase text-xs mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="#career-twin" className="hover:text-brand-600 transition-colors">Career Twin</Link></li>
              <li><Link href="#mock-interviews" className="hover:text-brand-600 transition-colors">AI Mock Interviews</Link></li>
              <li><Link href="#opportunity-scanner" className="hover:text-brand-600 transition-colors">Opportunity Scanner</Link></li>
              <li><Link href="#progress-genome" className="hover:text-brand-600 transition-colors">Progress Genome</Link></li>
              <li><Link href="/resume" className="hover:text-brand-600 transition-colors">Resume Intelligence</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-dark-text tracking-wide uppercase text-xs mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-brand-600 transition-colors">Career Blog</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Interview Playbook</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Skill Gap Benchmark</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">University Partners</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">API & Integrations</a></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-semibold text-dark-text tracking-wide uppercase text-xs mb-4">Company & Legal</h4>
            <ul className="space-y-2.5">
              <li><a href="#" className="hover:text-brand-600 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand-600 transition-colors">Security & Trust</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-secondary">
          <p>© {new Date().getFullYear()} Nexora AI Platform Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand-600">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600">Terms of Service</a>
            <a href="#" className="hover:text-brand-600">Cookie Preferences</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
