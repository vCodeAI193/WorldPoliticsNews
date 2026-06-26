'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export function NotificationBell() {
  const { user, token } = useAuthStore();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.data?.unread || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [user, token]);

  if (!user) return null;

  return (
    <Link
      href="/benachrichtigungen"
      className="relative w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      title="Benachrichtigungen"
    >
      🔔
      {count > 0 && (
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
