import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 – Seite nicht gefunden | WorldPoliticsNews',
};

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-blue-600 mb-4">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Seite nicht gefunden</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Diese Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Zurück zur Startseite
      </Link>
    </div>
  );
}
