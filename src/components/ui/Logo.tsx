import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  withLink?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", withLink = true, className = "" }) => {
  const badgeSize = {
    sm: "w-7 h-7 min-w-[28px] min-h-[28px]",
    md: "w-9 h-9 min-w-[36px] min-h-[36px]",
    lg: "w-11 h-11 min-w-[44px] min-h-[44px]",
  }[size];

  const svgPixelSize = {
    sm: 18,
    md: 22,
    lg: 26,
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight shrink-0 ${className}`}>
      <div className={`${badgeSize} rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30 relative overflow-hidden group shrink-0 p-1`}>
        <svg
          width={svgPixelSize}
          height={svgPixelSize}
          viewBox="0 0 32 32"
          className="text-white fill-current transition-transform duration-300 group-hover:scale-105 drop-shadow-sm shrink-0"
          style={{ width: `${svgPixelSize}px`, height: `${svgPixelSize}px`, minWidth: `${svgPixelSize}px`, minHeight: `${svgPixelSize}px` }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M18 0.5 L7.5 16.5 H15 L14 31.5 L24.5 15.5 H17 Z" />
        </svg>
      </div>
      <span className={`${textSize} text-white font-extrabold font-sans shrink-0`}>
        Nexora <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-black">AI</span>
      </span>
    </div>
  );

  if (withLink) {
    return (
      <Link href="/" className="inline-flex items-center shrink-0 hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
