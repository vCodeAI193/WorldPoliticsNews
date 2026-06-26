'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { NewsletterPreferences } from '@/components/ui/NewsletterPreferences';

function KontoInner() {
  const { user, setAuth, clearAuth, refreshToken, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get('upgraded');

  const [portalLoading, setPortalLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    api.users.me().then((freshUser) => {
      if (freshUser && token && refreshToken) setAuth(freshUser, token, refreshToken);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const { url } = await api.subscriptions.portal();
      window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  }

  async function handleLogout() {
    if (refreshToken) await api.auth.logout(refreshToken).catch(() => {});
    clearAuth();
    router.push('/');
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError('');
    setPwSuccess(false);
    if (pwForm.next !== pwForm.confirm) {
      setPwError('Neue Passwörter stimmen nicht überein.');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('Neues Passwort muss mindestens 8 Zeichen haben.');
      return;
    }
    setPwLoading(true);
    try {
      await api.users.changePassword(pwForm.current, pwForm.next);
      setPwSuccess(true);
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err: any) {
      setPwError(err.message || 'Fehler beim Ändern des Passworts.');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError('');
    setDeleteLoading(true);
    try {
      await api.users.deleteAccount(deletePassword);
      clearAuth();
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Fehler beim Löschen des Kontos.');
      setDeleteLoading(false);
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mein Konto</h1>

      {upgraded && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800 text-sm font-medium">
          Erfolgreich auf Plus upgraded! Viel Spaß mit werbefreiem Zugang.
        </div>
      )}

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 mb-6">
        <div className="p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">E-Mail</label>
          <p className="text-gray-900 mt-1">{user.email}</p>
        </div>
        <div className="p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Abonnement</label>
          <div className="flex items-center justify-between mt-1">
            <span className={`font-semibold ${user.subscriptionTier === 'plus' ? 'text-blue-700' : 'text-gray-600'}`}>
              {user.subscriptionTier === 'plus' ? '⭐ WorldPoliticsNews Plus' : 'Kostenlos'}
            </span>
            {user.subscriptionTier === 'plus' ? (
              <button onClick={handlePortal} disabled={portalLoading} className="text-sm text-gray-500 hover:text-gray-900 underline disabled:opacity-50">
                {portalLoading ? '...' : 'Abo verwalten'}
              </button>
            ) : (
              <a href="/preise" className="text-sm text-blue-600 font-semibold hover:underline">Auf Plus upgraden →</a>
            )}
          </div>
        </div>
        <div className="p-5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Registriert seit</label>
          <p className="text-gray-900 mt-1">
            {new Date(user.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Newsletter Preferences */}
      <div className="mb-6">
        <NewsletterPreferences />
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-6">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Passwort ändern</h2>
        <form onSubmit={handleChangePassword} className="space-y-3">
          <input
            type="password"
            placeholder="Aktuelles Passwort"
            value={pwForm.current}
            onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Neues Passwort (min. 8 Zeichen)"
            value={pwForm.next}
            onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Neues Passwort bestätigen"
            value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {pwError && <p className="text-red-600 text-xs">{pwError}</p>}
          {pwSuccess && <p className="text-green-600 text-xs">Passwort erfolgreich geändert.</p>}
          <button
            type="submit"
            disabled={pwLoading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {pwLoading ? 'Wird geändert...' : 'Passwort ändern'}
          </button>
        </form>
      </div>

      <button
        onClick={handleLogout}
        className="w-full py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-medium text-sm transition-colors mb-6"
      >
        Abmelden
      </button>

      {/* Delete Account */}
      <div className="border border-red-100 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-red-700 mb-2">Konto löschen</h2>
        <p className="text-xs text-gray-500 mb-3">
          Löscht dein Konto und alle Daten unwiderruflich.
        </p>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="text-sm text-red-600 hover:underline"
          >
            Konto löschen →
          </button>
        ) : (
          <form onSubmit={handleDeleteAccount} className="space-y-3">
            <input
              type="password"
              placeholder="Passwort zur Bestätigung"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              required
              className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
            {deleteError && <p className="text-red-600 text-xs">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={deleteLoading}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                {deleteLoading ? '...' : 'Endgültig löschen'}
              </button>
            </div>
          </form>
        )}
      </div>
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
