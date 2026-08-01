import { createClient } from "@supabase/supabase-js";
import { UserProfile } from "@/types";
import { getLocalUserData } from "./dataStore";

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

function sanitizeLocation(loc?: string): string {
  if (!loc || loc === "Location not specified" || loc === "Default") {
    return "";
  }
  return loc;
}

export function mapAuthError(error: any): string {
  if (!error) return "Unable to connect to the server. Please try again.";
  const raw = typeof error === "string" ? error : error.message || error.error_description || "";
  const message = raw.toLowerCase();

  if (
    message.includes("busy") ||
    message.includes("rate limit") ||
    message.includes("rate_limit") ||
    message.includes("too many requests") ||
    error.status === 429
  ) {
    return "Email service is temporarily busy. Please try again shortly.";
  }

  if (
    message.includes("account already exists") ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user_already_exists")
  ) {
    return "Account already exists. Please log in.";
  }

  if (
    message.includes("email not confirmed") ||
    message.includes("unverified") ||
    message.includes("confirm your email")
  ) {
    return "Please verify your email address before continuing.";
  }

  if (
    message.includes("account not found") ||
    message.includes("user not found") ||
    message.includes("no account found")
  ) {
    return "Account not found. Please create an account first.";
  }

  if (
    message.includes("incorrect email") ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("invalid_grant") ||
    message.includes("invalid_credentials") ||
    message.includes("wrong password")
  ) {
    return "Incorrect email or password.";
  }

  if (
    message.includes("security rules") ||
    message.includes("password should be at least") ||
    message.includes("weak password")
  ) {
    return "Password does not meet the required security rules.";
  }

  if (
    message.includes("valid email") ||
    message.includes("invalid email") ||
    message.includes("unable to validate email")
  ) {
    return "Please enter a valid email address.";
  }

  return raw || "Unable to connect to the server. Please try again.";
}

export const authService = {
  getCachedUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem("nexora_active_user_session");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserProfile;
        if (parsed) {
          parsed.location = sanitizeLocation(parsed.location);
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  },

  async signUp(email: string, password: string, fullName: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      // 1. Check if profile already exists in Supabase DB
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingProfile) {
        throw new Error("Account already exists. Please log in.");
      }

      // 2. Attempt Supabase Auth sign up
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        const raw = error.message ? error.message.toLowerCase() : "";
        if (
          raw.includes("already registered") ||
          raw.includes("already exists") ||
          raw.includes("user_already_exists")
        ) {
          throw new Error("Account already exists. Please log in.");
        }
        if (raw.includes("rate limit") || raw.includes("too many requests") || error.status === 429) {
          throw new Error("Email service is temporarily busy. Please try again shortly.");
        }
        throw new Error(mapAuthError(error));
      }

      if (data?.user) {
        // Supabase identity check: if identities is present and empty, account already exists
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error("Account already exists. Please log in.");
        }

        const userProfile: UserProfile = {
          id: data.user.id,
          full_name: fullName || cleanEmail.split("@")[0],
          email: cleanEmail,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || cleanEmail)}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: userProfile.full_name,
            email: cleanEmail,
            avatar_url: userProfile.avatar_url,
            headline: userProfile.headline,
            career_goal: userProfile.career_goal,
            target_roles: userProfile.target_roles,
            location: userProfile.location,
            updated_at: new Date().toISOString(),
          }, { onConflict: "id" });
        } catch (e) {
          console.warn("Profile insert warning:", e);
        }

        // Check email verification status
        const isConfirmed = Boolean(data.user.email_confirmed_at || data.user.confirmed_at || data.session);
        if (!isConfirmed) {
          // Unverified email: do not store session cache
          return { user: data.user, session: null, needsVerification: true };
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
        }
        return { user: userProfile, session: data.session, needsVerification: false };
      }
    }

    // Demo / fallback mode when Supabase is not configured
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const userStore = getLocalUserData(userId, cleanEmail, fullName);
    const userProfile = userStore.profile;
    userProfile.full_name = fullName || userProfile.full_name;
    userProfile.location = sanitizeLocation(userProfile.location);

    if (typeof window !== "undefined") {
      localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
    }
    return { user: userProfile, session: { token: `demo_token_${userId}` }, needsVerification: false };
  },

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      // Check if DB profile exists for this email
      const { data: dbProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", cleanEmail)
        .maybeSingle();

      // Attempt Supabase Auth signInWithPassword
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const raw = error.message ? error.message.toLowerCase() : "";
        if (raw.includes("email not confirmed") || raw.includes("unverified")) {
          throw new Error("Please verify your email address before continuing.");
        }
        if (raw.includes("invalid login credentials") || raw.includes("invalid credentials")) {
          if (!dbProfile) {
            throw new Error("Account not found. Please create an account first.");
          } else {
            throw new Error("Incorrect email or password.");
          }
        }
        throw new Error(mapAuthError(error));
      }

      if (data?.user) {
        const isConfirmed = Boolean(data.user.email_confirmed_at || data.user.confirmed_at || data.session);
        if (!isConfirmed) {
          throw new Error("Please verify your email address before continuing.");
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const activeProfile: UserProfile = profile ? {
          ...profile,
          location: sanitizeLocation(profile.location),
        } : (dbProfile ? {
          ...dbProfile,
          location: sanitizeLocation(dbProfile.location),
        } : {
          id: data.user.id,
          full_name: data.user.user_metadata?.full_name || cleanEmail.split("@")[0],
          email: cleanEmail,
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (!profile) {
          try {
            await supabase.from("profiles").upsert({
              id: data.user.id,
              full_name: activeProfile.full_name,
              email: cleanEmail,
              avatar_url: activeProfile.avatar_url,
              headline: activeProfile.headline,
              career_goal: activeProfile.career_goal,
              target_roles: activeProfile.target_roles,
              location: activeProfile.location,
              updated_at: new Date().toISOString(),
            }, { onConflict: "id" });
          } catch (e) {
            console.warn("Profile upsert warning on signIn:", e);
          }
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
        }
        return { user: activeProfile, session: data.session };
      }
    }

    // Demo / fallback mode when Supabase is not configured
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const userStore = getLocalUserData(userId, cleanEmail, cleanEmail.split("@")[0]);
    const activeProfile = userStore.profile;
    activeProfile.location = sanitizeLocation(activeProfile.location);

    if (typeof window !== "undefined") {
      localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
    }
    return { user: activeProfile, session: { token: `demo_token_${userId}` } };
  },

  async resendVerificationEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase();
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: cleanEmail,
      });
      if (error) {
        throw new Error(mapAuthError(error));
      }
      return { success: true };
    }
    return { success: true };
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
          return null;
        }

        const isConfirmed = Boolean(session.user.email_confirmed_at || session.user.confirmed_at);
        if (!isConfirmed) {
          return null;
        }

        const userEmail = session.user.email || "";
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        const activeProfile: UserProfile = profile ? {
          ...profile,
          location: sanitizeLocation(profile.location),
        } : {
          id: session.user.id,
          full_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Nexora Member",
          email: session.user.email || userEmail,
          avatar_url: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || "User")}`,
          headline: "Early Career Professional",
          career_goal: "Update target roles in Settings",
          target_roles: ["Software Engineer"],
          location: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

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
            }, { onConflict: "id" });
          } catch (e) {
            console.warn("Profile upsert warning in getCurrentUser:", e);
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
