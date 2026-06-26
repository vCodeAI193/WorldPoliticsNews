import type { Metadata } from 'next';
import { EntityAnalysisPage } from '@/components/ui/EntityAnalysisPage';
import { createMetadata } from '@/lib/metadata';
import type { AnalysisResult } from '@wpn/shared-types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string; force?: string }>;
}

async function fetchAnalysis(id: string, name: string, force = false): Promise<AnalysisResult | null> {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const url = `${BASE}/api/politicians/${id}/analysis?name=${encodeURIComponent(name)}${force ? '&force=true' : ''}`;
    const res = await fetch(url, force ? { cache: 'no-store' } : { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

async function fetchHistory(id: string) {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(`${BASE}/api/politicians/${id}/history`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.data : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const { name } = await searchParams;
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  try {
    const res = await fetch(`${BASE}/api/politicians/${id}/analysis?name=${encodeURIComponent(name || id)}`);
    if (res.ok) {
      const data = await res.json();
      const analysis = data.data;
      return createMetadata(
        `${name} - Medienanalyse | WorldPoliticsNews`,
        analysis.summary.slice(0, 160),
        { url: `/politiker/${id}` }
      );
    }
  } catch {}

  return createMetadata(`${name} - WorldPoliticsNews`, 'Medienanalyse zu diesem Politiker', { url: `/politiker/${id}` });
}

export default async function PoliticianPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { name, force } = await searchParams;
  const entityName = name || id;

  const [analysis, historyData] = await Promise.all([
    fetchAnalysis(id, entityName, force === 'true'),
    fetchHistory(id),
  ]);

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
    <EntityAnalysisPage
      id={id}
      entityName={entityName}
      analysis={analysis}
      entityType="politician"
      adSlot="3456789012"
      historyData={historyData}
      forceHref={`/politiker/${id}?name=${encodeURIComponent(entityName)}&force=true`}
    />
  );
}
