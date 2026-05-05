'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function KontoInner() {
  const { user, setAuth, clearAuth, refreshToken, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    // Refresh user data on mount (detects subscription changes)
    api.users.me().then((freshUser) => {
      if (freshUser && token && refreshToken) {
        setAuth(freshUser, token, refreshToken);
      }
    }).catch(() => {});
  }, []);

  async function handlePortal() {
    setLoading(true);
    try {
      const { url } = await api.subscriptions.portal();
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  }

  async function handleLogout() {
    if (refreshToken) await api.auth.logout(refreshToken).catch(() => {});
    clearAuth();
    router.push('/');
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mein Konto</h1>

      {upgraded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800 text-sm font-medium">
          🎉 Du hast erfolgreich auf Plus upgraded! Viel Spaß mit werbefreiem Zugang.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
        <div className="p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">E-Mail</label>
          <p className="text-gray-900 mt-1">{user.email}</p>
        </div>

        <div className="p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Abonnement</label>
          <div className="flex items-center justify-between mt-1">
            <span
              className={`font-semibold ${user.subscriptionTier === 'plus' ? 'text-blue-700' : 'text-gray-600'}`}
            >
              {user.subscriptionTier === 'plus' ? '⭐ WorldPoliticsNews Plus' : 'Kostenlos'}
            </span>
            {user.subscriptionTier === 'plus' ? (
              <button
                onClick={handlePortal}
                disabled={loading}
                className="text-sm text-gray-500 hover:text-gray-900 underline disabled:opacity-50"
              >
                {loading ? '...' : 'Abo verwalten'}
              </button>
            ) : (
              <a href="/preise" className="text-sm text-blue-600 font-semibold hover:underline">
                Auf Plus upgraden →
              </a>
            )}
          </div>
        </div>

        <div className="p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Registriert seit
          </label>
          <p className="text-gray-900 mt-1">
            {new Date(user.createdAt).toLocaleDateString('de-DE', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="mt-6 w-full py-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
      >
        Abmelden
      </button>
    </div>
  );
}

export default function KontoPage() {
  return (
    <Suspense>
      <KontoInner />
    </Suspense>
  );
}
