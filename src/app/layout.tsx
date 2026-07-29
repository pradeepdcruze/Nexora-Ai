import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Nexora AI - Prepare Beyond the Expected | AI Career Twin Platform",
  description:
    "Nexora AI builds an evolving digital Career Twin from your resume, quizzes, and mock interviews to provide hyper-personalized role matches, skill-gap intelligence, and interview prep.",
  keywords: [
    "AI Career Twin",
    "Mock Interviews AI",
    "Career Preparation Platform",
    "Resume Intelligence",
    "Job Fit Analytics",
    "Progress Genome",
  ],
  authors: [{ name: "Nexora AI Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30 selection:text-blue-200 min-h-screen transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
