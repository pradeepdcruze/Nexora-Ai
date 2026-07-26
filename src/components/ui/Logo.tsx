import React from "react";
import Link from "next/link";
import { Zap, Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", withLink = true, className = "" }) => {
  const badgeSize = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-11 h-11 text-lg",
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 font-extrabold tracking-tight ${className}`}>
      <div className={`${badgeSize} rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white flex items-center justify-center shadow-md shadow-brand-600/20 ring-2 ring-brand-100 relative overflow-hidden group`}>
        <Zap className="w-5 h-5 text-white fill-white transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-accent rounded-full animate-pulse" />
      </div>
      <span className={`${textSize} text-dark-text font-extrabold font-sans`}>
        Nexora <span className="text-brand-600 font-black">AI</span>
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
