import Link from 'next/link';
import { SentimentGauge } from '@/components/ui/SentimentGauge';
import { createMetadata } from '@/lib/metadata';
import type { SentimentLabel } from '@wpn/shared-types';

export const metadata = createMetadata(
  'Deutschland Rankings - WorldPoliticsNews',
  'Top und Flop bewertete Politiker und Parteien in Deutschland nach Medientenor.',
  { url: '/deutschland' }
);

interface RankingEntity {
  entityId: string;
  entityName: string;
  entityCountry: string | null;
  sentiment: number;
  sentimentLabel: SentimentLabel;
  generatedAt: string;
}

interface RankingsResponse {
  success: boolean;
  data: RankingEntity[];
}

async function fetchRankings(type: 'politician' | 'party', limit = 20): Promise<RankingEntity[]> {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${BASE}/api/${type === 'politician' ? 'politicians' : 'parties'}/rankings/DE?limit=${limit}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data: RankingsResponse = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export default async function DeutschlandPage() {
  const [politicians, parties] = await Promise.all([
    fetchRankings('politician', 30),
    fetchRankings('party', 20),
  ]);

  const topPoliticians = politicians.slice(0, 10);
  const worstPoliticians = politicians.slice(-10).reverse();
  const topParties = parties.slice(0, 10);
  const worstParties = parties.slice(-10).reverse();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Deutschland-Rankings</h1>
        <p className="text-gray-600 text-lg">
          Schau hier, welche Politiker und Parteien die besten und schlechtesten Medientenor in Deutschland haben.
        </p>
      </div>

      {/* Politicians Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Politiker</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Politicians */}
          <div>
            <h3 className="text-lg font-bold text-green-700 mb-4">🌟 Best bewertet</h3>
            <div className="space-y-3">
              {topPoliticians.length > 0 ? (
                topPoliticians.map((p, i) => (
                  <Link
                    key={p.entityId}
                    href={`/politiker/${p.entityId}?name=${encodeURIComponent(p.entityName)}`}
                    className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-sm text-gray-400 font-medium">#{i + 1}</span>
                        <h4 className="font-semibold text-gray-900 mt-1">{p.entityName}</h4>
                      </div>
                      <SentimentGauge score={p.sentiment} label={p.sentimentLabel} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(p.generatedAt).toLocaleDateString('de-DE')}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 italic py-8 text-center">Noch keine Analysen verfügbar</p>
              )}
            </div>
          </div>

          {/* Worst Politicians */}
          <div>
            <h3 className="text-lg font-bold text-red-700 mb-4">📉 Am schlechtesten bewertet</h3>
            <div className="space-y-3">
              {worstPoliticians.length > 0 ? (
                worstPoliticians.map((p, i) => (
                  <Link
                    key={p.entityId}
                    href={`/politiker/${p.entityId}?name=${encodeURIComponent(p.entityName)}`}
                    className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-sm text-gray-400 font-medium">#{i + 1}</span>
                        <h4 className="font-semibold text-gray-900 mt-1">{p.entityName}</h4>
                      </div>
                      <SentimentGauge score={p.sentiment} label={p.sentimentLabel} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(p.generatedAt).toLocaleDateString('de-DE')}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 italic py-8 text-center">Noch keine Analysen verfügbar</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Parties Section */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🏛️ Parteien</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Parties */}
          <div>
            <h3 className="text-lg font-bold text-green-700 mb-4">🌟 Best bewertet</h3>
            <div className="space-y-3">
              {topParties.length > 0 ? (
                topParties.map((p, i) => (
                  <Link
                    key={p.entityId}
                    href={`/partei/${p.entityId}?name=${encodeURIComponent(p.entityName)}`}
                    className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-sm text-gray-400 font-medium">#{i + 1}</span>
                        <h4 className="font-semibold text-gray-900 mt-1">{p.entityName}</h4>
                      </div>
                      <SentimentGauge score={p.sentiment} label={p.sentimentLabel} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(p.generatedAt).toLocaleDateString('de-DE')}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 italic py-8 text-center">Noch keine Analysen verfügbar</p>
              )}
            </div>
          </div>

          {/* Worst Parties */}
          <div>
            <h3 className="text-lg font-bold text-red-700 mb-4">📉 Am schlechtesten bewertet</h3>
            <div className="space-y-3">
              {worstParties.length > 0 ? (
                worstParties.map((p, i) => (
                  <Link
                    key={p.entityId}
                    href={`/partei/${p.entityId}?name=${encodeURIComponent(p.entityName)}`}
                    className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-sm text-gray-400 font-medium">#{i + 1}</span>
                        <h4 className="font-semibold text-gray-900 mt-1">{p.entityName}</h4>
                      </div>
                      <SentimentGauge score={p.sentiment} label={p.sentimentLabel} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(p.generatedAt).toLocaleDateString('de-DE')}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 italic py-8 text-center">Noch keine Analysen verfügbar</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Hint */}
      <section className="mt-12 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>💡 Hinweis:</strong> Diese Rankings basieren auf KI-Analysen von Nachrichtenquellen. Die Sentiment-Werte
          spiegeln den Medientenor wider, nicht die Realität. Je negativer der Wert, desto kritischer ist die
          Berichterstattung.
        </p>
      </section>
    </div>
  );
}
