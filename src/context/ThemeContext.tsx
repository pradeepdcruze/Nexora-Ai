"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Sun, Moon, Laptop } from "lucide-react";

export type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  const applyTheme = useCallback((targetTheme: Theme) => {
    let effective: "dark" | "light" = "dark";

    if (targetTheme === "system") {
      effective = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    } else {
      effective = targetTheme;
    }

    setResolvedTheme(effective);
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(effective);
    root.setAttribute("data-theme", effective);
  }, []);

  useEffect(() => {
    // Initial theme resolution
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("nexora-theme") as Theme | null;
      const initial: Theme = savedTheme && ["dark", "light", "system"].includes(savedTheme) ? savedTheme : "dark";
      setThemeState(initial);
      applyTheme(initial);
    }
  }, [applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      if (typeof window !== "undefined") {
        localStorage.setItem("nexora-theme", newTheme);
      }
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    const nextTheme: Theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
};

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-200 flex items-center justify-center ${
        resolvedTheme === "dark"
          ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-800 hover:border-slate-700"
          : "bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600 hover:bg-slate-200 hover:border-slate-300"
      } ${className}`}
      aria-label="Toggle Theme"
      title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12 text-indigo-600" />
      )}
    </button>
  );
};
