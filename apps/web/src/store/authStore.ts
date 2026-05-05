'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserPublic } from '@wpn/shared-types';

interface AuthState {
  user: UserPublic | null;
  token: string | null;
  refreshToken: string | null;
  setAuth: (user: UserPublic, token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  isPlus: () => boolean;
}

const safeLocalStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(name, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      setAuth: (user, token, refreshToken) => set({ user, token, refreshToken }),
      setToken: (token) => set({ token }),
      clearAuth: () => set({ user: null, token: null, refreshToken: null }),
      isPlus: () => get().user?.subscriptionTier === 'plus',
    }),
    {
      name: 'wpn-auth',
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
