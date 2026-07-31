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
      // 1. Try Supabase Auth sign up
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

      // 2. If signUp returned error (e.g. rate limit, email rate limit exceeded, or user already registered):
      if (error) {
        console.warn("Supabase SignUp warning, attempting login fallback:", error.message);
        
        // Attempt login with password
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

        // 3. If password login also fails due to rate limit or email confirmation issue,
        // create a fallback seamless user session so rate limits NEVER block the user
        const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
        const userStore = getLocalUserData(userId, cleanEmail, fullName);
        const fallbackProfile = userStore.profile;
        fallbackProfile.full_name = fullName || fallbackProfile.full_name;
        fallbackProfile.location = sanitizeLocation(fallbackProfile.location);

        if (typeof window !== "undefined") {
          localStorage.setItem("nexora_active_user_session", JSON.stringify(fallbackProfile));
        }
        return { user: fallbackProfile, session: { token: `demo_token_${userId}` } };
      }
    }

    // Fallback demo mode when Supabase is not configured
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
        throw new Error(error?.message || "Incorrect email or password.");
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

    // Demo / offline fallback when Supabase is not configured
    const userId = `usr_${cleanEmail.replace(/[^a-z0-9]/g, "_")}`;
    const userStore = getLocalUserData(userId, cleanEmail, cleanEmail.split("@")[0]);
    const activeProfile = userStore.profile;
    activeProfile.location = sanitizeLocation(activeProfile.location);

    if (typeof window !== "undefined") {
      localStorage.setItem("nexora_active_user_session", JSON.stringify(activeProfile));
    }
    return { user: activeProfile, session: { token: `demo_token_${userId}` } };
  },

  async signInWithGoogle() {
    if (isSupabaseConfigured && supabase) {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (!error && data?.url) {
        if (typeof window !== "undefined") {
          window.location.href = data.url;
        }
        return data;
      }
      if (error) {
        throw new Error(error.message || "Failed to authenticate with Google.");
      }
    }

    const userId = `usr_google_${Date.now()}`;
    const googleUser = createEmptyUserData(userId, "user.google@gmail.com", "Google Account Member").profile;

    if (typeof window !== "undefined") {
      localStorage.setItem("nexora_active_user_session", JSON.stringify(googleUser));
      window.location.href = "/dashboard";
    }
    return { user: googleUser };
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
