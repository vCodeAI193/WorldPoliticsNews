import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';

const FEATURED = [
  { name: 'Friedrich Merz', id: 'Q567', type: 'politician', country: 'DE' },
  { name: 'Emmanuel Macron', id: 'Q3052772', type: 'politician', country: 'FR' },
  { name: 'Olaf Scholz', id: 'Q61053', type: 'politician', country: 'DE' },
  { name: 'Donald Trump', id: 'Q22686', type: 'politician', country: 'US' },
  { name: 'CDU', id: 'Q49762', type: 'party', country: 'DE' },
  { name: 'SPD', id: 'Q49750', type: 'party', country: 'DE' },
];

const SENTIMENT_COLORS: Record<string, string> = {
  'sehr positiv': 'text-green-700 bg-green-50',
  'positiv': 'text-green-600 bg-green-50',
  'neutral': 'text-gray-600 bg-gray-100',
  'negativ': 'text-orange-600 bg-orange-50',
  'sehr negativ': 'text-red-600 bg-red-50',
};

async function fetchTrending() {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${BASE}/api/trending`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const trending = await fetchTrending();
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Politische Analyse,<br />powered by KI
          </h1>
          <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
            Finde automatisch alle Kritiken und Bewertungen von Nachrichtenseiten zu jedem Politiker
            oder jeder Partei weltweit.
          </p>
          <div className="flex justify-center">
            <SearchBar placeholder="z.B. Friedrich Merz, CDU, Macron..." />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-gray-900">Wie es funktioniert</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔍',
              title: 'Automatische Suche',
              desc: 'Die KI durchsucht selbstständig globale Nachrichtenquellen nach aktuellen Berichten.',
            },
            {
              icon: '🤖',
              title: 'KI-Analyse',
              desc: 'Claude AI wertet Artikel aus, erkennt Kritikpunkte und erstellt eine ausgewogene Bewertung.',
            },
            {
              icon: '📊',
              title: 'Klares Ergebnis',
              desc: 'Ein Sentiment-Score und eine Zusammenfassung geben dir schnell einen Überblick.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending – dynamic from DB */}
      {trending.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Zuletzt analysiert</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {trending.map((entity: { entityId: string; entityName: string; entityType: string; sentiment: number; sentimentLabel: string }) => (
              <Link
                key={entity.entityId}
                href={`/${entity.entityType === 'party' ? 'partei' : 'politiker'}/${entity.entityId}?name=${encodeURIComponent(entity.entityName)}`}
                className="bg-white rounded-xl border border-gray-200 p-3 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <p className="font-semibold text-gray-900 text-sm truncate">{entity.entityName}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${SENTIMENT_COLORS[entity.sentimentLabel] || 'text-gray-500 bg-gray-100'}`}>
                  {entity.sentimentLabel}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured entities */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Beliebte Suchen</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FEATURED.map((entity) => (
            <Link
              key={entity.id}
              href={`/${entity.type === 'party' ? 'partei' : 'politiker'}/${entity.id}?name=${encodeURIComponent(entity.name)}`}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3"
            >
              <span className="text-2xl">{entity.type === 'party' ? '🏛️' : '👤'}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{entity.name}</p>
                <p className="text-xs text-gray-400">
                  {entity.type === 'party' ? 'Partei' : 'Politiker'} · {entity.country}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-50 py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Jetzt Plus testen</h2>
          <p className="text-gray-600 mb-6">
            Werbefrei, unbegrenzte Beobachtungsliste und schnellere Aktualisierungen.
          </p>
          <Link
            href="/preise"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow"
          >
            Alle Preise ansehen
          </Link>
        </div>
      </section>
    </div>
  );
}
