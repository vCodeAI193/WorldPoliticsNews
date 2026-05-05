'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { WatchlistItem } from '@wpn/shared-types';
import { PlusUpgradeBanner } from '@/components/ui/PlusUpgradeBanner';

export default function BeobachtungslistePage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    api.watchlist.get().then(setItems).finally(() => setLoading(false));
  }, [user, router]);

  async function handleRemove(id: string) {
    setRemovingId(id);
    await api.watchlist.remove(id).catch(() => {});
    setItems((prev) => prev.filter((i) => i.id !== id));
    setRemovingId(null);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center text-gray-500">
        Lade Beobachtungsliste...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Beobachtungsliste</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} {user?.subscriptionTier === 'free' ? '/ 5' : ''} Einträge
          </p>
        </div>
        <Link
          href="/suche"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          + Hinzufügen
        </Link>
      </div>

      {user?.subscriptionTier === 'free' && items.length >= 5 && (
        <div className="mb-6">
          <PlusUpgradeBanner />
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">Noch nichts auf der Beobachtungsliste</p>
          <Link href="/suche" className="text-blue-600 hover:underline text-sm">
            Jetzt Politiker oder Partei suchen →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
            >
              <span className="text-2xl">{item.entityType === 'party' ? '🏛️' : '👤'}</span>
              <div className="flex-1 min-w-0">
                <Link
                  href={`/${item.entityType === 'party' ? 'partei' : 'politiker'}/${item.entityId}?name=${encodeURIComponent(item.entityName)}`}
                  className="font-semibold text-gray-900 hover:text-blue-700 truncate block"
                >
                  {item.entityName}
                </Link>
                <p className="text-xs text-gray-400">
                  {item.entityType === 'party' ? 'Partei' : 'Politiker'}
                  {item.entityCountry && ` · ${item.entityCountry}`}
                  {' · Hinzugefügt am '}
                  {new Date(item.createdAt).toLocaleDateString('de-DE')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href={`/${item.entityType === 'party' ? 'partei' : 'politiker'}/${item.entityId}?name=${encodeURIComponent(item.entityName)}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Analyse
                </Link>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  {removingId === item.id ? '...' : 'Entfernen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
