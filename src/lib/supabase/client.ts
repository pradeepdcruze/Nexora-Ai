import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { createEmptyUserData } from "./dataStore";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("YOUR_SUPABASE_URL")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth helper service wrapper strictly bound to active user sessions
export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
        });

        if (profileError) console.warn("Profile table insert warning:", profileError.message);
      }

      return data;
    } else {
      await new Promise((res) => setTimeout(res, 400));
      const userId = `usr_${Date.now()}`;
      const emptyUser = createEmptyUserData(userId, email, fullName).profile;

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(emptyUser));
      }
      return { user: emptyUser, session: { token: `demo_token_${userId}` } };
    }
  },

  async signIn(email: string, password: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      return data;
    } else {
      await new Promise((res) => setTimeout(res, 400));
      const userId = `usr_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const name = email.split("@")[0].replace(".", " ");
      const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
      const emptyUser = createEmptyUserData(userId, email, formattedName).profile;

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(emptyUser));
      }
      return { user: emptyUser, session: { token: `demo_token_${userId}` } };
    }
  },

  async signInWithGoogle() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw new Error(error.message);
      return data;
    } else {
      await new Promise((res) => setTimeout(res, 300));
      const userId = `usr_google_${Date.now()}`;
      const googleUser = createEmptyUserData(userId, "google.user@example.com", "Google Member").profile;

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(googleUser));
        window.location.href = "/dashboard";
      }
    }
  },

  async signOut() {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexora_active_user_session");
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      return profile || {
        id: session.user.id,
        full_name: session.user.user_metadata?.full_name || "Nexora Member",
        email: session.user.email || "",
        avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || "User")}`,
        headline: "Early Career Professional",
        career_goal: "Update target roles in Settings",
        target_roles: ["Software Engineer"],
        location: "Location not specified",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    } else {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("nexora_active_user_session");
        if (cached) {
          try {
            return JSON.parse(cached) as UserProfile;
          } catch {
            return null;
          }
        }
      }
      return null;
    }
  },
};
