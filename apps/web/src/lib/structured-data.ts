export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'WorldPoliticsNews',
    url: 'https://worldpoliticsnews.com',
    description: 'KI-gestützte Medienanalyse zu Politikern weltweit',
    sameAs: [
      'https://twitter.com/worldpoliticsnews',
    ],
  };
}

export function getSearchResultSchema(entity: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: `${entity.name} - Medienanalyse`,
    description: entity.summary,
    datePublished: entity.generatedAt,
  };
}
