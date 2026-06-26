import Link from 'next/link';
import { SearchBar } from '@/components/ui/SearchBar';
import type { Entity } from '@wpn/shared-types';

interface Props {
  searchParams: Promise<{ q?: string; country?: string }>;
}

async function searchEntities(q: string, country?: string) {
  const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const countryParam = country ? `&country=${encodeURIComponent(country)}` : '';

  const [politiciansRes, partiesRes] = await Promise.allSettled([
    fetch(`${BASE}/api/politicians/search?q=${encodeURIComponent(q)}${countryParam}`, { next: { revalidate: 3600 } }),
    fetch(`${BASE}/api/parties/search?q=${encodeURIComponent(q)}${countryParam}`, { next: { revalidate: 3600 } }),
  ]);

  const politicians =
    politiciansRes.status === 'fulfilled' && politiciansRes.value.ok
      ? ((await politiciansRes.value.json()).data?.entities || [])
      : [];

  const parties =
    partiesRes.status === 'fulfilled' && partiesRes.value.ok
      ? ((await partiesRes.value.json()).data?.entities || [])
      : [];

  return { politicians, parties };
}

export default async function SuchePage({ searchParams }: Props) {
  const { q, country } = await searchParams;

  if (!q || q.trim().length < 2) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Politiker & Parteien suchen</h1>
        <SearchBar defaultCountry={country} />
      </div>
    );
  }

  const { politicians, parties } = await searchEntities(q, country);
  const total = politicians.length + parties.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <SearchBar defaultValue={q} defaultCountry={country} />
      </div>

      <p className="text-sm text-gray-500 mb-6">
        {total} Ergebnisse für „{q}"
      </p>

      {politicians.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Politiker</h2>
          <div className="space-y-2">
            {politicians.map((e: Entity) => (
              <Link
                key={e.id}
                href={`/politiker/${e.id}?name=${encodeURIComponent(e.name)}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-semibold text-gray-900">{e.name}</p>
                  {e.description && <p className="text-sm text-gray-500 line-clamp-1">{e.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {parties.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Parteien</h2>
          <div className="space-y-2">
            {parties.map((e: Entity) => (
              <Link
                key={e.id}
                href={`/partei/${e.id}?name=${encodeURIComponent(e.name)}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-400 hover:shadow-sm transition-all"
              >
                <span className="text-2xl">🏛️</span>
                <div>
                  <p className="font-semibold text-gray-900">{e.name}</p>
                  {e.description && <p className="text-sm text-gray-500 line-clamp-1">{e.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {total === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Keine Ergebnisse gefunden</p>
          <p className="text-sm">Versuche einen anderen Suchbegriff oder prüfe die Schreibweise.</p>
        </div>
      )}
    </div>
  );
}
