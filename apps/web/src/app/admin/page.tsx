'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AdminStats {
  totalUsers: number;
  totalAnalyses: number;
  analysesToday: number;
  blockedCount?: number;
}

interface AdminEntity {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  entityCountry?: string;
  sentiment: number;
  sentimentLabel: string;
}

interface BlockedEntity {
  id: string;
  entityId: string;
  entityName: string;
  entityType: string;
  reason: string;
  blockedAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [entities, setEntities] = useState<AdminEntity[]>([]);
  const [blocked, setBlocked] = useState<BlockedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats
        const statsRes = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!statsRes.ok) {
          if (statsRes.status === 403) {
            router.push('/');
            return;
          }
          throw new Error('Failed to fetch stats');
        }

        const statsData = await statsRes.json();
        setStats(statsData.data);

        // Fetch entities
        const entitiesRes = await fetch('/api/admin/entities', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (entitiesRes.ok) {
          const entitiesData = await entitiesRes.json();
          setEntities(entitiesData.data || []);
        }

        // Fetch blocked entities
        const blockedRes = await fetch('/api/admin/blocked', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (blockedRes.ok) {
          const blockedData = await blockedRes.json();
          setBlocked(blockedData.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-gray-600">Lädt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Fehler: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin-Dashboard</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium mb-2">Nutzer gesamt</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalUsers.toLocaleString('de-DE')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium mb-2">Analysen</p>
            <p className="text-4xl font-bold text-gray-900">{stats.totalAnalyses.toLocaleString('de-DE')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium mb-2">Heute</p>
            <p className="text-4xl font-bold text-gray-900">{stats.analysesToday.toLocaleString('de-DE')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium mb-2">Blockiert</p>
            <p className="text-4xl font-bold text-red-600">{(stats.blockedCount || 0).toLocaleString('de-DE')}</p>
          </div>
        </div>
      )}

      {/* Recent Entities */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Aktuelle Analysen</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Typ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Land</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sentiment</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Label</th>
              </tr>
            </thead>
            <tbody>
              {entities.length > 0 ? (
                entities.map((entity) => (
                  <tr key={entity.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{entity.entityName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entity.entityType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entity.entityCountry || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">{entity.sentiment.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entity.sentimentLabel === 'positive'
                          ? 'bg-green-100 text-green-800'
                          : entity.sentimentLabel === 'negative'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {entity.sentimentLabel}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                    Keine Analysen verfügbar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked Entities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Blockierte Entitäten</h2>
        </div>
        <div className="overflow-x-auto">
          {blocked.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Typ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Grund</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Blockiert am</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {blocked.map((entity) => (
                  <tr key={entity.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{entity.entityName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entity.entityType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entity.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(entity.blockedAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => {
                          // TODO: Implement unblock functionality
                          console.log('Unblock:', entity.id);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Entsperren
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-8 text-center text-gray-600">
              Keine blockierten Entitäten
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
