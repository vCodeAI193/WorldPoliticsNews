'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ComparisonItem {
  id: string;
  entityIds: string[];
  entityNames: string[];
  entityTypes: string[];
  title?: string;
  createdAt: string;
}

export default function ComparisonsPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [comparisons, setComparisons] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }

    fetchComparisons();
  }, [user, token, router]);

  const fetchComparisons = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/comparisons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setComparisons(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch comparisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Vergleich löschen?')) return;

    try {
      setDeleting(id);
      const res = await fetch(`/api/comparisons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setComparisons((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete comparison:', error);
    } finally {
      setDeleting(null);
    }
  };

  const buildComparisonUrl = (comparison: ComparisonItem) => {
    const params = new URLSearchParams();
    comparison.entityIds.forEach((id, i) => {
      params.append(`entity${i + 1}`, id);
      params.append(`type${i + 1}`, comparison.entityTypes[i]);
    });
    return `/vergleich?${params.toString()}`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Meine Vergleiche</h1>

      {comparisons.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Keine Vergleiche gespeichert</p>
          <Link
            href="/suche"
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Vergleich erstellen
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {comparisons.map((comparison) => (
            <div key={comparison.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {comparison.title || comparison.entityNames.join(' vs. ')}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {comparison.entityNames.map((name, i) => (
                      <span key={i} className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(comparison.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    href={buildComparisonUrl(comparison)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Öffnen
                  </Link>
                  <button
                    onClick={() => handleDelete(comparison.id)}
                    disabled={deleting === comparison.id}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting === comparison.id ? 'Löschen...' : 'Löschen'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
