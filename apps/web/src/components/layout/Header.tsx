'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, clearAuth, refreshToken } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    if (refreshToken) await api.auth.logout(refreshToken).catch(() => {});
    clearAuth();
    router.push('/');
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700 hover:text-blue-800">
          <span className="text-2xl">🌍</span>
          <span>WorldPoliticsNews</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/suche" className="text-gray-600 hover:text-blue-700 font-medium">
            Suche
          </Link>
          {user && (
            <Link href="/beobachtungsliste" className="text-gray-600 hover:text-blue-700 font-medium">
              Beobachtungsliste
            </Link>
          )}
          <Link href="/preise" className="text-gray-600 hover:text-blue-700 font-medium">
            Plus
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.subscriptionTier === 'plus' && (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  Plus
                </span>
              )}
              <Link href="/konto" className="text-sm text-gray-600 hover:text-gray-900">
                {user.email.split('@')[0]}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Abmelden
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Anmelden
              </Link>
              <Link
                href="/auth/registrieren"
                className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
