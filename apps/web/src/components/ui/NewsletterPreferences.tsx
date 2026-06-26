'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

export function NewsletterPreferences() {
  const { token } = useAuthStore();
  const [subscribed, setSubscribed] = useState(true);
  const [frequency, setFrequency] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchPreferences = async () => {
      try {
        const res = await fetch('/api/newsletter/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubscribed(data.data.subscribed);
          setFrequency(data.data.frequency);
        }
      } catch (error) {
        console.error('Failed to fetch newsletter preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch('/api/newsletter/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscribed, frequency }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Laden...</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h2 className="text-sm font-bold text-gray-900 mb-4">Newsletter-Einstellungen</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="newsletter-subscribe"
            checked={subscribed}
            onChange={(e) => setSubscribed(e.target.checked)}
            className="w-4 h-4 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="newsletter-subscribe" className="ml-3 text-sm text-gray-700 cursor-pointer">
            Newsletter abonnieren
          </label>
        </div>

        {subscribed && (
          <div>
            <label className="text-sm text-gray-700 block mb-2">Häufigkeit</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Täglich</option>
              <option value="weekly">Wöchentlich</option>
              <option value="never">Nie</option>
            </select>
          </div>
        )}

        {success && (
          <p className="text-green-600 text-xs">Einstellungen gespeichert.</p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Wird gespeichert...' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}
