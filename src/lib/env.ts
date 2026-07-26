export interface EnvironmentCapabilities {
  hasAiKey: boolean;
  aiProvider: "openai" | "gemini" | "anthropic" | "none";
  hasSupabase: boolean;
  missingVars: string[];
}

export function validateEnvironment(): EnvironmentCapabilities {
  const missingVars: string[] = [];

  const openaiKey = process.env.OPENAI_API_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  let aiProvider: EnvironmentCapabilities["aiProvider"] = "none";
  let hasAiKey = false;

  if (openaiKey && !openaiKey.includes("YOUR_")) {
    aiProvider = "openai";
    hasAiKey = true;
  } else if (geminiKey && !geminiKey.includes("YOUR_")) {
    aiProvider = "gemini";
    hasAiKey = true;
  } else if (anthropicKey && !anthropicKey.includes("YOUR_")) {
    aiProvider = "anthropic";
    hasAiKey = true;
  } else {
    missingVars.push("OPENAI_API_KEY / GEMINI_API_KEY / ANTHROPIC_API_KEY");
  }

  const hasSupabase = Boolean(
    supabaseUrl &&
      supabaseKey &&
      !supabaseUrl.includes("YOUR_")
  );

  if (!hasSupabase) {
    missingVars.push("NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return {
    hasAiKey,
    aiProvider,
    hasSupabase,
    missingVars,
  };
}
