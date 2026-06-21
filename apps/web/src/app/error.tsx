'use client';

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">⚠️</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Ein Fehler ist aufgetreten</h1>
      <p className="text-gray-500 mb-2 max-w-sm">
        Bitte versuche es erneut. Falls das Problem weiterhin besteht, wende dich an uns.
      </p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-6 font-mono">Fehler-ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Erneut versuchen
      </button>
    </div>
  );
}
