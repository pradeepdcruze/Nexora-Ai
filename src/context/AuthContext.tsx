"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { UserProfile, CareerTwinSummary } from "@/types";
import { authService, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  getLocalUserData,
  saveLocalUserData,
  calculateCareerTwinSummary,
  clearUserDataSession,
  UserDataStore,
} from "@/lib/supabase/dataStore";

interface AuthContextType {
  user: UserProfile | null;
  userDataStore: UserDataStore | null;
  careerTwinSummary: CareerTwinSummary | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDataStore: null,
  careerTwinSummary: null,
  loading: true,
  refreshUserData: async () => {},
  updateUserProfile: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initial state resolution from local session cache
  const [user, setUser] = useState<UserProfile | null>(() => {
    return authService.getCachedUser();
  });

  const [userDataStore, setUserDataStore] = useState<UserDataStore | null>(() => {
    const cached = authService.getCachedUser();
    return cached ? getLocalUserData(cached.id, cached.email, cached.full_name) : null;
  });

  const [careerTwinSummary, setCareerTwinSummary] = useState<CareerTwinSummary | null>(() => {
    const cached = authService.getCachedUser();
    if (!cached) return null;
    const store = getLocalUserData(cached.id, cached.email, cached.full_name);
    return calculateCareerTwinSummary(store);
  });

  const [loading, setLoading] = useState<boolean>(!user);

  const loadUserData = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const store = getLocalUserData(currentUser.id, currentUser.email, currentUser.full_name);
        setUserDataStore(store);
        const summary = calculateCareerTwinSummary(store);
        setCareerTwinSummary(summary);
      } else {
        setUser(null);
        setUserDataStore(null);
        setCareerTwinSummary(null);
      }
    } catch (err) {
      console.error("Error loading auth user context:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
          loadUserData();
        } else if (event === "SIGNED_OUT" || !session) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("nexora_active_user_session");
          }
          setUser(null);
          setUserDataStore(null);
          setCareerTwinSummary(null);
          setLoading(false);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [loadUserData]);

  const refreshUserData = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const store = getLocalUserData(currentUser.id, currentUser.email, currentUser.full_name);
        store.profile = {
          ...store.profile,
          ...currentUser,
        };
        setUserDataStore(store);
        const summary = calculateCareerTwinSummary(store);
        setCareerTwinSummary(summary);
      }
    } catch (err) {
      console.error("Error refreshing user data:", err);
    }
  }, []);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const activeUser = user || authService.getCachedUser();
      if (!activeUser) return;

      const currentStore = userDataStore || getLocalUserData(activeUser.id, activeUser.email, activeUser.full_name);
      const updatedProfile: UserProfile = {
        ...currentStore.profile,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const updatedStore: UserDataStore = {
        ...currentStore,
        profile: updatedProfile,
      };

      // 1. Save to Supabase DB if configured
      if (isSupabaseConfigured && supabase) {
        const payload: Record<string, any> = {
          id: activeUser.id,
          full_name: updatedProfile.full_name,
          email: updatedProfile.email,
          avatar_url: updatedProfile.avatar_url,
          headline: updatedProfile.headline,
          career_goal: updatedProfile.career_goal,
          target_roles: updatedProfile.target_roles,
          location: updatedProfile.location,
          updated_at: updatedProfile.updated_at,
        };

        if (updatedProfile.bio !== undefined) payload.bio = updatedProfile.bio;
        if (updatedProfile.phone !== undefined) payload.phone = updatedProfile.phone;
        if (updatedProfile.education !== undefined) payload.education = updatedProfile.education;
        if (updatedProfile.social_links !== undefined) payload.social_links = updatedProfile.social_links;
        if (updatedProfile.theme !== undefined) payload.theme = updatedProfile.theme;

        const { error: dbErr } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

        if (dbErr) {
          console.warn("Full profiles upsert warning, retrying with core columns:", dbErr.message);
          const corePayload = {
            id: activeUser.id,
            full_name: updatedProfile.full_name,
            email: updatedProfile.email,
            avatar_url: updatedProfile.avatar_url,
            headline: updatedProfile.headline,
            career_goal: updatedProfile.career_goal,
            target_roles: updatedProfile.target_roles,
            location: updatedProfile.location,
            updated_at: updatedProfile.updated_at,
          };
          const { error: coreErr } = await supabase.from("profiles").upsert(corePayload, { onConflict: "id" });
          if (coreErr) {
            console.warn("Core profiles upsert warning:", coreErr.message);
          }
        }
      }

      // 2. Save locally
      saveLocalUserData(activeUser.id, updatedStore);
      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(updatedProfile));
        if (updatedProfile.theme) {
          localStorage.setItem("nexora-theme", updatedProfile.theme);
        }
      }

      // 3. Update active React state
      setUser(updatedProfile);
      setUserDataStore(updatedStore);
      setCareerTwinSummary(calculateCareerTwinSummary(updatedStore));
    },
    [user, userDataStore]
  );

  const logout = useCallback(async () => {
    const currentId = user?.id || authService.getCachedUser()?.id;
    await authService.signOut();
    clearUserDataSession(currentId);
    setUser(null);
    setUserDataStore(null);
    setCareerTwinSummary(null);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      userDataStore,
      careerTwinSummary,
      loading,
      refreshUserData,
      updateUserProfile,
      logout,
    }),
    [user, userDataStore, careerTwinSummary, loading, refreshUserData, updateUserProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
