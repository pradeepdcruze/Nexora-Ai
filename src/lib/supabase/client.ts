import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { createEmptyUserData, getLocalUserData } from "./dataStore";

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

interface RegisteredAccount {
  id: string;
  email: string;
  password: string;
  profile: UserProfile;
}

function getAccountRegistry(): Map<string, RegisteredAccount> {
  if (typeof window === "undefined") return new Map();
  try {
    const raw = localStorage.getItem("nexora_user_accounts_v1");
    if (!raw) return new Map();
    const arr: RegisteredAccount[] = JSON.parse(raw);
    const map = new Map<string, RegisteredAccount>();
    arr.forEach((acc) => map.set(acc.email.toLowerCase(), acc));
    return map;
  } catch {
    return new Map();
  }
}

function saveAccountToRegistry(acc: RegisteredAccount) {
  if (typeof window === "undefined") return;
  const map = getAccountRegistry();
  map.set(acc.email.toLowerCase(), acc);
  const arr = Array.from(map.values());
  localStorage.setItem("nexora_user_accounts_v1", JSON.stringify(arr));
}

// Auth helper service wrapper strictly bound to active user sessions
export const authService = {
  getCachedUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem("nexora_active_user_session");
    if (cached) {
      try {
        return JSON.parse(cached) as UserProfile;
      } catch {
        return null;
      }
    }
    return null;
  },

  async signUp(email: string, password: string, fullName: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        console.error("Supabase Auth SignUp Error:", error);
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already in use") || msg.includes("user_already_exists")) {
          throw new Error("An account with this email address already exists. Please log in with your password.");
        }
        if (msg.includes("rate limit")) {
          throw new Error("Too many signup requests. Please try logging in or wait a few minutes.");
        }
        throw new Error(error.message);
      }

      if (data.user) {
        const userProfile: UserProfile = {
          id: data.user.id,
          full_name: fullName,
          email: cleanEmail,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "Location not specified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            email: cleanEmail,
            avatar_url: userProfile.avatar_url,
            headline: userProfile.headline,
            career_goal: userProfile.career_goal,
            target_roles: userProfile.target_roles,
            location: userProfile.location,
            updated_at: new Date().toISOString(),
          });
        } catch (profileError: any) {
          console.warn("Profile table insert warning:", profileError?.message);
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
        }
      }

      return data;
    } else {
      const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
      const emptyStore = createEmptyUserData(userId, cleanEmail, fullName);
      const userProfile = emptyStore.profile;

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
      }
      return { user: userProfile, session: { token: `demo_token_${userId}` } };
    }
  },

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        console.error("Supabase Auth SignIn Error:", error);
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login") || msg.includes("user not found") || msg.includes("invalid_credentials") || msg.includes("invalid credentials")) {
          throw new Error("Incorrect email or password. Please try again.");
        }
        if (msg.includes("email not confirmed")) {
          throw new Error("Email confirmation is required by your authentication provider. Please check your inbox.");
        }
        if (msg.includes("rate limit")) {
          throw new Error("Too many login attempts. Please wait a moment and try again.");
        }
        throw new Error(error.message || "Incorrect email or password.");
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const existingStore = getLocalUserData(data.user.id, cleanEmail, data.user.user_metadata?.full_name);
        const userProfile: UserProfile = profile || existingStore.profile || {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          email: cleanEmail,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "Location not specified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
        }
      }

      return data;
    } else {
      const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
      const userStore = getLocalUserData(userId, cleanEmail, cleanEmail.split("@")[0]);
      const activeProfile = userStore.profile;

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
      }
      return { user: activeProfile, session: { token: `demo_token_${userId}` } };
    }
  },

  async signInWithGoogle() {
    if (isSupabaseConfigured && supabase) {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        console.error("Supabase Google OAuth Error:", error);
        const msg = error.message.toLowerCase();
        if (msg.includes("provider is not enabled") || msg.includes("validation_failed") || msg.includes("unsupported provider")) {
          throw new Error("Google sign-in is not enabled in your Supabase project settings. Please log in with your email and password.");
        }
        throw new Error(error.message || "Failed to authenticate with Google.");
      }

      return data;
    } else {
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("nexora_active_user_session");
          }
          return null;
        }

        const userEmail = session.user.email || "";
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .or(`id.eq.${session.user.id},email.eq.${userEmail}`)
          .maybeSingle();

        const activeProfile: UserProfile = profile || {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Nexora Member",
          email: session.user.email || "",
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || "User")}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "Location not specified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Make sure profile exists in Supabase DB
        if (!profile) {
          try {
            await supabase.from("profiles").upsert({
              id: activeProfile.id,
              full_name: activeProfile.full_name,
              email: activeProfile.email,
              avatar_url: activeProfile.avatar_url,
              headline: activeProfile.headline,
              career_goal: activeProfile.career_goal,
              target_roles: activeProfile.target_roles,
              location: activeProfile.location,
              updated_at: activeProfile.updated_at,
            });
          } catch (e) {
            console.warn("Profile upsert warning:", e);
          }
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
        }

        return activeProfile;
      } catch (err) {
        console.warn("Supabase session check error:", err);
        return null;
      }
    }

    return this.getCachedUser();
  },
};
