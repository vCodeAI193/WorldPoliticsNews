import type { Entity, SearchResult } from '@wpn/shared-types';

const WIKIDATA_SEARCH = 'https://www.wikidata.org/w/api.php';
const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'WorldPoliticsNews/1.0 (contact@worldpoliticsnews.de)';

export async function searchWikidata(
  query: string,
  type: 'politician' | 'party',
  country?: string
): Promise<SearchResult> {
  const params = new URLSearchParams({
    action: 'wbsearchentities',
    search: query,
    language: 'de',
    uselang: 'de',
    type: 'item',
    limit: '10',
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${WIKIDATA_SEARCH}?${params}`, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new Error(`Wikidata-Suche fehlgeschlagen: ${response.status}`);
  }

  const data = (await response.json()) as {
    search: Array<{ id: string; label: string; description?: string }>;
  };

  const entities: Entity[] = data.search.map((item) => ({
    id: item.id,
    name: item.label,
    type,
    country: country || 'unknown',
    description: item.description,
  }));

  return { entities, total: entities.length };
}

export async function getEntityDetails(wikidataId: string): Promise<Partial<Entity> | null> {
  const sparql = `
    SELECT ?label ?countryCode ?image WHERE {
      wd:${wikidataId} rdfs:label ?label .
      FILTER(LANG(?label) = "de" || LANG(?label) = "en")
      OPTIONAL { wd:${wikidataId} wdt:P27/wdt:P297 ?countryCode }
      OPTIONAL { wd:${wikidataId} wdt:P18 ?image }
    } LIMIT 1
  `;

  try {
    const url = `${WIKIDATA_SPARQL}?query=${encodeURIComponent(sparql)}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/sparql-results+json' },
      signal: AbortSignal.timeout(8000),
    });

    const json = (await res.json()) as { results: { bindings: any[] } };
    const b = json.results.bindings[0];
    if (!b) return null;

    return {
      id: wikidataId,
      name: b.label?.value,
      country: b.countryCode?.value || 'unknown',
      imageUrl: b.image?.value?.replace('http://', 'https://'),
    };
  } catch {
    return null;
  }
}
