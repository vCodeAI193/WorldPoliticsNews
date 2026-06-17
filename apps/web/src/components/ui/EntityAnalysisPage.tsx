import { SentimentGauge } from './SentimentGauge';
import { ArticleCard } from './ArticleCard';
import { AdBanner } from './AdBanner';
import { WatchlistButton } from './WatchlistButton';
import { PlusUpgradeBanner } from './PlusUpgradeBanner';
import { ShareButtons } from './ShareButtons';
import type { AnalysisResult } from '@wpn/shared-types';

interface Props {
  id: string;
  entityName: string;
  analysis: AnalysisResult;
  entityType: 'politician' | 'party';
  adSlot: string;
}

const ENTITY_META: Record<'politician' | 'party', { emoji: string; label: string }> = {
  politician: { emoji: '👤', label: 'Politiker' },
  party:      { emoji: '🏛️', label: 'Partei' },
};

export function EntityAnalysisPage({ id, entityName, analysis, entityType, adSlot }: Props) {
  const { emoji, label } = ENTITY_META[entityType];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            <span className="text-sm text-blue-600 font-medium">{label}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{analysis.entityName}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Analyse vom{' '}
            {new Date(analysis.generatedAt).toLocaleDateString('de-DE', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
            {analysis.cached && (
              <span className="ml-2 bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded">Cache</span>
            )}
          </p>
        </div>
        <WatchlistButton entityId={id} entityName={analysis.entityName} entityType={entityType} />
      </div>

      <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Gesamtbewertung</h2>
        <SentimentGauge score={analysis.sentiment} label={analysis.sentimentLabel} size="lg" />
        <p className="mt-5 text-gray-700 leading-relaxed">{analysis.summary}</p>
        <div className="mt-5 pt-4 border-t border-gray-100">
          <ShareButtons entityName={analysis.entityName} sentimentLabel={analysis.sentimentLabel} />
        </div>
      </section>

      <AdBanner slot={adSlot} />
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
