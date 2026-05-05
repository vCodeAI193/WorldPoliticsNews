'use client';

import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const PLUS_FEATURES = [
  '✅ Keine Werbung',
  '✅ Unbegrenzte Beobachtungsliste',
  '✅ Schnellere Aktualisierungen (30 Min.)',
  '✅ Alle globalen Politiker & Parteien',
  '✅ Früher Zugang zu neuen Features',
];

const FREE_FEATURES = [
  '✅ Bis zu 5 Einträge in der Beobachtungsliste',
  '✅ Alle globalen Politiker & Parteien',
  '✅ KI-Analyse mit 60-Min.-Cache',
  '❌ Werbung wird angezeigt',
  '❌ Eingeschränkte Beobachtungsliste',
];

export default function PreisePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!user) {
      router.push('/auth/registrieren');
      return;
    }
    if (user.subscriptionTier === 'plus') {
      const { url } = await api.subscriptions.portal();
      window.location.href = url;
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
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Einfache Preise</h1>
        <p className="text-gray-600 text-lg">Kostenlos starten – upgraden wenn du mehr willst.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Kostenlos</h2>
          <div className="text-3xl font-extrabold text-gray-900 mb-6">
            0 € <span className="text-sm font-normal text-gray-400">/ Monat</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="text-sm text-gray-700">{f}</li>
            ))}
          </ul>
          <button
            className="w-full py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 transition-colors"
            onClick={() => router.push('/')}
          >
            Kostenlos nutzen
          </button>
        </div>

        {/* Plus */}
        <div className="bg-blue-700 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-white text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
            Empfohlen
          </div>
          <h2 className="text-xl font-bold mb-1">Plus</h2>
          <div className="text-3xl font-extrabold mb-6">
            3,99 € <span className="text-sm font-normal text-blue-300">/ Monat</span>
          </div>
          <ul className="space-y-3 mb-8">
            {PLUS_FEATURES.map((f) => (
              <li key={f} className="text-sm text-blue-100">{f}</li>
            ))}
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-70"
          >
            {loading
              ? '...'
              : user?.subscriptionTier === 'plus'
              ? 'Abo verwalten'
              : 'Jetzt upgraden'}
          </button>
        </div>
      </div>
    </div>
  );
}
