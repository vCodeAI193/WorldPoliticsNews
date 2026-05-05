'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { WatchlistItem } from '@wpn/shared-types';

interface Props {
  entityId: string;
  entityName: string;
  entityType: 'politician' | 'party';
  entityCountry?: string;
}

export function WatchlistButton({ entityId, entityName, entityType, entityCountry }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();
  const [watchlistItemId, setWatchlistItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    api.watchlist.get().then((items: WatchlistItem[]) => {
      const found = items.find((i) => i.entityId === entityId);
      if (found) setWatchlistItemId(found.id);
    }).catch(() => {});
  }, [user, entityId]);

  async function toggle() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (watchlistItemId) {
        await api.watchlist.remove(watchlistItemId);
        setWatchlistItemId(null);
      } else {
        const item = await api.watchlist.add({ entityId, entityName, entityType, entityCountry });
        setWatchlistItemId(item.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isWatching = Boolean(watchlistItemId);

  return (
    <div>
      <button
        onClick={toggle}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
          isWatching
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <span>{isWatching ? '★' : '☆'}</span>
        <span>{isWatching ? 'Beobachtet' : 'Beobachten'}</span>
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
