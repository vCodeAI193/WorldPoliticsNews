import { EntityAnalysisPage } from '@/components/ui/EntityAnalysisPage';
import type { AnalysisResult } from '@wpn/shared-types';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ name?: string }>;
}

async function fetchAnalysis(id: string, name: string): Promise<AnalysisResult | null> {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  try {
    const res = await fetch(
      `${BASE}/api/politicians/${id}/analysis?name=${encodeURIComponent(name)}`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export default async function PoliticianPage({ params, searchParams }: Props) {
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
    <EntityAnalysisPage
      id={id}
      entityName={entityName}
      analysis={analysis}
      entityType="politician"
      adSlot="3456789012"
    />
  );
}
