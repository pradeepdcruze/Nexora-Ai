"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserProfile, CareerTwinSummary } from "@/types";
import { authService } from "@/lib/supabase/client";
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
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userDataStore: null,
  careerTwinSummary: null,
  loading: true,
  refreshUserData: () => {},
  updateUserProfile: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userDataStore, setUserDataStore] = useState<UserDataStore | null>(null);
  const [careerTwinSummary, setCareerTwinSummary] = useState<CareerTwinSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
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
  }, [loadUserData]);

  const refreshUserData = useCallback(() => {
    if (user) {
      const store = getLocalUserData(user.id, user.email, user.full_name);
      setUserDataStore(store);
      const summary = calculateCareerTwinSummary(store);
      setCareerTwinSummary(summary);
    }
  }, [user]);

  const updateUserProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      if (!user || !userDataStore) return;
      const updatedProfile: UserProfile = {
        ...userDataStore.profile,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      const updatedStore: UserDataStore = {
        ...userDataStore,
        profile: updatedProfile,
      };

      saveLocalUserData(user.id, updatedStore);
      setUser(updatedProfile);
      setUserDataStore(updatedStore);
      setCareerTwinSummary(calculateCareerTwinSummary(updatedStore));
    },
    [user, userDataStore]
  );

  const logout = useCallback(async () => {
    const currentId = user?.id;
    await authService.signOut();
    clearUserDataSession(currentId);
    setUser(null);
    setUserDataStore(null);
    setCareerTwinSummary(null);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userDataStore,
        careerTwinSummary,
        loading,
        refreshUserData,
        updateUserProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
