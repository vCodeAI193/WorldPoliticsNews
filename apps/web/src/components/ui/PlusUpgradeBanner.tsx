'use client';

import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useState } from 'react';

export function PlusUpgradeBanner() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  if (user?.subscriptionTier === 'plus') return null;

  async function handleUpgrade() {
    if (!user) {
      window.location.href = '/auth/registrieren';
      return;
    }
    setLoading(true);
    try {
      const { url } = await api.subscriptions.createCheckout();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-4 text-white flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold text-sm">WorldPoliticsNews Plus</p>
        <p className="text-xs text-blue-200">Werbefrei · Unbegrenzte Beobachtungsliste · Schnellere Updates</p>
      </div>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-semibold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-70"
      >
        {loading ? '...' : 'Jetzt upgraden'}
      </button>
    </div>
  );
}
