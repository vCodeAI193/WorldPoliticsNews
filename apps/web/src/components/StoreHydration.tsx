'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function StoreHydration() {
  const hydrate = useAuthStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
