import { SentimentGauge } from '@/components/ui/SentimentGauge';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { AdBanner } from '@/components/ui/AdBanner';
import { WatchlistButton } from '@/components/ui/WatchlistButton';
import { PlusUpgradeBanner } from '@/components/ui/PlusUpgradeBanner';
import type { AnalysisResult } from '@wpn/shared-types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}

async function fetchAnalysis(id: string, name: string): Promise<AnalysisResult | null> {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(
      `${BASE}/api/parties/${id}/analysis?name=${encodeURIComponent(name)}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function PartyPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { name } = await searchParams;
  const entityName = name || id;

  const analysis = await fetchAnalysis(id, entityName);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{entityName}</h1>
        <p className="text-red-600 mb-4">Analyse konnte nicht geladen werden. Bitte später erneut versuchen.</p>
        <a href="/" className="text-blue-600 hover:underline">Zurück zur Startseite</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏛️</span>
            <span className="text-sm text-blue-600 font-medium">Partei</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{analysis.entityName}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Analyse vom {new Date(analysis.generatedAt).toLocaleDateString('de-DE', {
              day: '2-digit', month: 'long', year: 'numeric'
            })}
            {analysis.cached && (
              <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">Cache</span>
            )}
          </p>
        </div>
        <WatchlistButton entityId={id} entityName={analysis.entityName} entityType="party" />
      </div>

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Gesamtbewertung</h2>
        <SentimentGauge score={analysis.sentiment} label={analysis.sentimentLabel} size="lg" />
        <p className="mt-5 text-gray-700 leading-relaxed">{analysis.summary}</p>
      </section>

      <AdBanner slot="3456789013" />
      <PlusUpgradeBanner />

      {analysis.keywords.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Hauptthemen & Kritikpunkte</h2>
          <div className="flex flex-wrap gap-2">
            {analysis.keywords.map((kw) => (
              <span key={kw} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {kw}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Analysierte Artikel ({analysis.articles.length})
        </h2>
        <div className="space-y-3">
          {analysis.articles.map((article, i) => (
            <ArticleCard key={article.url} article={article} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
