import { create } from 'zustand';
import type { UserPublic } from '@wpn/shared-types';

interface AuthState {
  user: UserPublic | null;
  isLoading: boolean;
  setUser: (user: UserPublic | null) => void;
  setLoading: (v: boolean) => void;
  isPlus: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  isPlus: () => get().user?.subscriptionTier === 'plus',
}));
