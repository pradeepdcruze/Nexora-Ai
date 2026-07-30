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
      // 1. First test if user already exists with password
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (loginData?.user && !loginError) {
        // User already exists and password matched -> log in seamlessly!
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", loginData.user.id)
          .maybeSingle();

        const userProfile: UserProfile = profile || {
          id: loginData.user.id,
          full_name: fullName || loginData.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          email: cleanEmail,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || cleanEmail)}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "Location not specified",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
          saveAccountToRegistry({ id: loginData.user.id, email: cleanEmail, password, profile: userProfile });
        }
        return loginData;
      }

      if (loginError && !loginError.message.toLowerCase().includes("invalid login") && !loginError.message.toLowerCase().includes("user not found")) {
        if (loginError.message.toLowerCase().includes("rate limit")) {
          throw new Error("An account with this email already exists. Please log in with your password.");
        }
      }

      // 2. User does not exist or password didn't match -> attempt signup
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already in use") || msg.includes("user_already_exists")) {
          throw new Error("An account with this email address already exists. Please log in with your password.");
        }
        if (msg.includes("rate limit")) {
          throw new Error("An account with this email address already exists. Please log in with your password.");
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

        const { error: profileError } = await supabase.from("profiles").upsert({
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

        if (profileError) console.warn("Profile table insert warning:", profileError.message);

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
          saveAccountToRegistry({ id: data.user.id, email: cleanEmail, password, profile: userProfile });
        }
      }

      return data;
    } else {
      const registry = getAccountRegistry();
      const existingAccount = registry.get(cleanEmail);

      if (existingAccount) {
        if (existingAccount.password === password) {
          if (typeof window !== "undefined") {
            localStorage.setItem("nexora_active_user_session", JSON.stringify(existingAccount.profile));
          }
          return { user: existingAccount.profile, session: { token: `demo_token_${existingAccount.id}` } };
        } else {
          throw new Error("An account with this email address already exists. Please log in with your password.");
        }
      }

      const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
      const emptyStore = createEmptyUserData(userId, cleanEmail, fullName);
      const userProfile = emptyStore.profile;

      if (typeof window !== "undefined") {
        saveAccountToRegistry({ id: userId, email: cleanEmail, password, profile: userProfile });
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
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login") || msg.includes("user not found") || msg.includes("invalid_credentials")) {
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", cleanEmail)
            .maybeSingle();

          if (!existingProfile) {
            throw new Error("Account not found. Please create an account first.");
          }
          throw new Error("Incorrect password. Please try again.");
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
          saveAccountToRegistry({ id: data.user.id, email: cleanEmail, password, profile: userProfile });
        }
      }

      return data;
    } else {
      const registry = getAccountRegistry();
      const existingAccount = registry.get(cleanEmail);

      if (!existingAccount) {
        throw new Error("Account not found. Please create an account first.");
      }

      if (existingAccount.password !== password) {
        throw new Error("Incorrect password. Please try again.");
      }

      const userStore = getLocalUserData(existingAccount.id, cleanEmail, existingAccount.profile.full_name);
      const activeProfile = userStore.profile || existingAccount.profile;

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
      }
      return { user: activeProfile, session: { token: `demo_token_${existingAccount.id}` } };
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
      if (error) throw new Error(error.message);
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

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
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
