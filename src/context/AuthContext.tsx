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
  refreshUserData: () => void;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDataStore: null,
  careerTwinSummary: null,
  loading: true,
  refreshUserData: () => {},
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

  const refreshUserData = useCallback(() => {
    const activeUser = user || authService.getCachedUser();
    if (activeUser) {
      const store = getLocalUserData(activeUser.id, activeUser.email, activeUser.full_name);
      setUserDataStore(store);
      const summary = calculateCareerTwinSummary(store);
      setCareerTwinSummary(summary);
      if (!user) setUser(activeUser);
    }
  }, [user]);

  const updateUserProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      const activeUser = user || authService.getCachedUser();
      if (!activeUser || !userDataStore) return;

      const updatedProfile: UserProfile = {
        ...userDataStore.profile,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const updatedStore: UserDataStore = {
        ...userDataStore,
        profile: updatedProfile,
      };

      // 1. Save to Supabase if configured
      if (isSupabaseConfigured && supabase) {
        const { error: dbErr } = await supabase.from("profiles").upsert({
          id: activeUser.id,
          full_name: updatedProfile.full_name,
          email: updatedProfile.email,
          avatar_url: updatedProfile.avatar_url,
          headline: updatedProfile.headline,
          bio: updatedProfile.bio,
          phone: updatedProfile.phone,
          career_goal: updatedProfile.career_goal,
          target_roles: updatedProfile.target_roles,
          location: updatedProfile.location,
          education: updatedProfile.education,
          social_links: updatedProfile.social_links,
          theme: updatedProfile.theme,
          skills: updatedProfile.skills,
          updated_at: updatedProfile.updated_at,
        });

        if (dbErr) {
          console.error("Failed to sync profile update to Supabase DB:", dbErr);
          throw new Error(dbErr.message || "Unable to save profile changes to database.");
        }
      }

      // 2. Save locally
      saveLocalUserData(activeUser.id, updatedStore);
      if (typeof window !== "undefined") {
        localStorage.setItem("nexora_active_user_session", JSON.stringify(updatedProfile));
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
