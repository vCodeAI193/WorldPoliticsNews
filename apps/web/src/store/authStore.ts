'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
