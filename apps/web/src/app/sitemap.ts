import type { MetadataRoute } from 'next';

const STATIC_ROUTES = [
  '',
  '/suche',
  '/preise',
  '/beobachtungsliste',
  '/datenschutz',
  '/nutzungsbedingungen',
];

const FEATURED_ENTITIES = [
  { type: 'politiker', id: 'Q567' },
  { type: 'politiker', id: 'Q3052772' },
  { type: 'politiker', id: 'Q22686' },
  { type: 'politiker', id: 'Q61053' },
  { type: 'partei', id: 'Q49762' },
  { type: 'partei', id: 'Q49750' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://worldpoliticsnews.de';
  const now = new Date().toISOString();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.7,
  }));

  const entityEntries: MetadataRoute.Sitemap = FEATURED_ENTITIES.map(({ type, id }) => ({
    url: `${base}/${type}/${id}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiBase}/api/trending`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      const trending: Array<{ entityId: string; entityType: string }> = data.success ? data.data : [];
      dynamicEntries = trending.map(({ entityId, entityType }) => ({
        url: `${base}/${entityType === 'party' ? 'partei' : 'politiker'}/${entityId}`,
        lastModified: now,
        changeFrequency: 'hourly' as const,
        priority: 0.8,
      }));
    }
  } catch {}

  return [...staticEntries, ...entityEntries, ...dynamicEntries];
}
