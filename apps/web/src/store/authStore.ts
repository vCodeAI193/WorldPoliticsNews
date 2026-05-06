'use client';

import { create } from 'zustand';
import type { UserPublic } from '@wpn/shared-types';

const STORAGE_KEY = 'wpn-auth';

interface AuthState {
  user: UserPublic | null;
  token: string | null;
  refreshToken: string | null;
  _hydrated: boolean;
  setAuth: (user: UserPublic, token: string, refreshToken: string) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
  isPlus: () => boolean;
  hydrate: () => void;
}

function readStorage(): { user: UserPublic | null; token: string | null; refreshToken: string | null } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { user: null, token: null, refreshToken: null };
  } catch {
    return { user: null, token: null, refreshToken: null };
  }
}

function writeStorage(user: UserPublic | null, token: string | null, refreshToken: string | null) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token, refreshToken }));
  } catch {}
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    const saved = readStorage();
    set({ ...saved, _hydrated: true });
  },

  setAuth: (user, token, refreshToken) => {
    set({ user, token, refreshToken });
    writeStorage(user, token, refreshToken);
  },

  setToken: (token) => {
    set({ token });
    const { user, refreshToken } = get();
    writeStorage(user, token, refreshToken);
  },

  clearAuth: () => {
    set({ user: null, token: null, refreshToken: null });
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  },

  isPlus: () => get().user?.subscriptionTier === 'plus',
}));
