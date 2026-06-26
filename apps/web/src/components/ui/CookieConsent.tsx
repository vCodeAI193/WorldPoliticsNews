'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('wpn_cookies_accepted');
    if (!accepted) setShow(true);
  }, []);

  if (!show) return null;

  const handleAccept = () => {
    localStorage.setItem('wpn_cookies_accepted', 'true');
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-40">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        <p className="text-sm">
          Wir nutzen Cookies für Analytik und bessere UX.{' '}
          <a href="/datenschutz" className="underline hover:no-underline">
            Datenschutz
          </a>
        </p>
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium whitespace-nowrap"
        >
          Verstanden
        </button>
      </div>
    </div>
  );
}
