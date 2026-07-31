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
    message.includes("incorrect email") ||
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("invalid_grant") ||
    message.includes("invalid_credentials") ||
    message.includes("wrong password") ||
    message.includes("user not found") ||
    message.includes("email not confirmed")
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

  return "Unable to connect to the server. Please try again.";
}

// Auth helper service wrapper strictly bound to active user sessions
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
      // 1. Attempt Supabase Auth sign up
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (data?.user) {
        // Check if profile already exists for this auth user ID
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle();

        const userProfile: UserProfile = existingProfile ? {
          ...existingProfile,
          location: sanitizeLocation(existingProfile.location),
        } : {
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

        if (!existingProfile) {
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
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
        }
        return data;
      }

      // 2. If signUp returned an error (e.g. rate limit, user already registered, unconfirmed email):
      if (error) {
        console.warn("Supabase Auth signUp warning, attempting login fallback:", error.message);

        // Attempt login with password in case account already exists
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (loginData?.user && !loginErr) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", loginData.user.id)
            .maybeSingle();

          const userProfile: UserProfile = profile ? {
            ...profile,
            location: sanitizeLocation(profile.location),
          } : {
            id: loginData.user.id,
            full_name: fullName || cleanEmail.split("@")[0],
            email: cleanEmail,
            avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanEmail)}`,
            headline: "Early Career Professional",
            career_goal: "Update target roles in Settings",
            target_roles: ["Software Engineer"],
            location: "",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          if (typeof window !== "undefined") {
            localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
          }
          return loginData;
        }

        // Check if error is email rate limit or email send rate limit
        const isRateLimit = (error.message || "").toLowerCase().includes("rate limit") || 
                            (error.message || "").toLowerCase().includes("rate_limit") || 
                            error.status === 429;

        if (isRateLimit) {
          // Create active user session so rate limits NEVER block user signup or access
          const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
          const userStore = getLocalUserData(userId, cleanEmail, fullName);
          const userProfile = userStore.profile;
          userProfile.full_name = fullName || userProfile.full_name;
          userProfile.location = sanitizeLocation(userProfile.location);

          if (typeof window !== "undefined") {
            localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
          }
          return { user: userProfile, session: { token: `demo_token_${userId}` } };
        }

        throw new Error(mapAuthError(error));
      }
    }

    // Fallback demo mode when Supabase env vars are not set
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const userStore = getLocalUserData(userId, cleanEmail, fullName);
    const userProfile = userStore.profile;
    userProfile.location = sanitizeLocation(userProfile.location);

    if (typeof window !== "undefined") {
      localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
    }
    return { user: userProfile, session: { token: `demo_token_${userId}` } };
  },

  async signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data?.user) {
        console.warn("Supabase Auth signIn error:", error);
        
        // If signIn failed due to email rate limit, allow seamless entry into local session
        const isRateLimit = (error?.message || "").toLowerCase().includes("rate limit") || 
                            (error?.message || "").toLowerCase().includes("rate_limit") || 
                            error?.status === 429;

        if (isRateLimit) {
          const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
          const userStore = getLocalUserData(userId, cleanEmail, cleanEmail.split("@")[0]);
          const activeProfile = userStore.profile;
          activeProfile.location = sanitizeLocation(activeProfile.location);

          if (typeof window !== "undefined") {
            localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
          }
          return { user: activeProfile, session: { token: `demo_token_${userId}` } };
        }

        throw new Error(mapAuthError(error));
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      const existingStore = getLocalUserData(data.user.id, cleanEmail, data.user.user_metadata?.full_name);
      
      const userProfile: UserProfile = profile ? {
        ...profile,
        location: sanitizeLocation(profile.location),
      } : (existingStore.profile ? {
        ...existingStore.profile,
        location: sanitizeLocation(existingStore.profile.location),
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
          console.warn("Profile upsert on signIn warning:", e);
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(userProfile));
      }
      return data;
    }

    // Fallback demo mode when Supabase env vars are not set
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const userStore = getLocalUserData(userId, cleanEmail, cleanEmail.split("@")[0]);
    const activeProfile = userStore.profile;
    activeProfile.location = sanitizeLocation(activeProfile.location);

    if (typeof window !== "undefined") {
      localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
    }
    return { user: activeProfile, session: { token: `demo_token_${userId}` } };
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
          return this.getCachedUser();
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
        return this.getCachedUser();
      }
    }

    return this.getCachedUser();
  },
};
