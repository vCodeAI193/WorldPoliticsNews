'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'new_analysis' | 'sentiment_change';
  entityName: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) {
      router.push('/auth/login');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user, token, router]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center text-gray-500">Laden...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Benachrichtigungen</h1>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>Keine Benachrichtigungen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.link}
              className={`block p-4 rounded-lg border transition-shadow hover:shadow-md ${
                n.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{n.entityName}</p>
                    {!n.read && <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                </div>
                <span className="text-xs text-gray-400 ml-4">
                  {new Date(n.createdAt).toLocaleDateString('de-DE')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
