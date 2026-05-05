import type { AnalysisResult, SearchResult } from '@wpn/shared-types';

export const MOCK_SEARCH_POLITICIANS: SearchResult = {
  total: 6,
  entities: [
    { id: 'Q567', name: 'Friedrich Merz', type: 'politician', country: 'DE', description: 'Deutscher Politiker, CDU-Vorsitzender' },
    { id: 'Q61053', name: 'Olaf Scholz', type: 'politician', country: 'DE', description: 'Bundeskanzler der Bundesrepublik Deutschland' },
    { id: 'Q3052772', name: 'Emmanuel Macron', type: 'politician', country: 'FR', description: 'Französischer Staatspräsident' },
    { id: 'Q22686', name: 'Donald Trump', type: 'politician', country: 'US', description: 'US-amerikanischer Politiker, 45. und 47. Präsident' },
    { id: 'Q76', name: 'Barack Obama', type: 'politician', country: 'US', description: '44. Präsident der Vereinigten Staaten' },
    { id: 'Q15823289', name: 'Robert Habeck', type: 'politician', country: 'DE', description: 'Bundeswirtschaftsminister, Grünen-Vorsitzender' },
  ],
};

export const MOCK_SEARCH_PARTIES: SearchResult = {
  total: 5,
  entities: [
    { id: 'Q49762', name: 'CDU', type: 'party', country: 'DE', description: 'Christlich Demokratische Union Deutschlands' },
    { id: 'Q49750', name: 'SPD', type: 'party', country: 'DE', description: 'Sozialdemokratische Partei Deutschlands' },
    { id: 'Q49764', name: 'Bündnis 90/Die Grünen', type: 'party', country: 'DE', description: 'Deutsche Grünenpartei' },
    { id: 'Q49766', name: 'FDP', type: 'party', country: 'DE', description: 'Freie Demokratische Partei' },
    { id: 'Q4891820', name: 'AfD', type: 'party', country: 'DE', description: 'Alternative für Deutschland' },
  ],
};

export function getMockAnalysis(entityId: string, entityName: string, entityType: 'politician' | 'party'): AnalysisResult {
  const now = new Date();
  const expires = new Date(now.getTime() + 60 * 60 * 1000);

  return {
    entityId,
    entityName,
    entityType,
    summary: `${entityName} steht aktuell im Fokus medialer Berichterstattung. Kritiker bemängeln die Kommunikationsstrategie und innenpolitische Positionierung. Befürworter heben hingegen wirtschaftspolitische Kompetenz und internationale Glaubwürdigkeit hervor. Die öffentliche Wahrnehmung ist gespalten, mit leicht negativer Tendenz in linksliberalen und leicht positiver Tendenz in konservativen Medien.`,
    sentiment: -0.18,
    sentimentLabel: 'negativ',
    keywords: ['Wirtschaftspolitik', 'Haushaltskrise', 'Koalitionsstreit', 'Außenpolitik', 'Migrationspolitik', 'Umfragewerte', 'Parteiführung'],
    articles: [
      {
        title: `${entityName}: Kritik an innenpolitischem Kurs wächst`,
        url: 'https://beispiel.de/artikel-1',
        source: 'spiegel.de',
        date: now.toISOString().slice(0, 10),
        snippet: `Die Kritik an ${entityName} nimmt zu. Oppositionsführer fordern einen klaren Kurswechsel in der Wirtschaftspolitik. Umfragen zeigen einen Rückgang der Zustimmungswerte um drei Prozentpunkte.`,
        sentiment: -0.4,
      },
      {
        title: `${entityName} verteidigt Haushaltspläne im Bundestag`,
        url: 'https://beispiel.de/artikel-2',
        source: 'faz.net',
        date: now.toISOString().slice(0, 10),
        snippet: `In einer leidenschaftlichen Rede im Bundestag verteidigte ${entityName} die umstrittenen Haushaltspläne. Die Reaktionen aus den Reihen der Koalitionspartner fielen gemischt aus.`,
        sentiment: -0.1,
      },
      {
        title: `Internationale Anerkennung für ${entityName}s Außenpolitik`,
        url: 'https://beispiel.de/artikel-3',
        source: 'zeit.de',
        date: now.toISOString().slice(0, 10),
        snippet: `Beim EU-Gipfel erhielt ${entityName} Lob von Partnern für den konstruktiven Beitrag zur europäischen Migrationspolitik. Experten sehen die deutsche Verhandlungsposition gestärkt.`,
        sentiment: 0.35,
      },
      {
        title: `${entityName}: Umfragewerte auf Jahrestief`,
        url: 'https://beispiel.de/artikel-4',
        source: 'tagesschau.de',
        date: now.toISOString().slice(0, 10),
        snippet: `Aktuelle Umfragedaten zeigen: Die Beliebtheitswerte von ${entityName} haben den niedrigsten Stand seit zwei Jahren erreicht. Als Hauptgrund nennen Befragte die Unzufriedenheit mit der Wirtschaftslage.`,
        sentiment: -0.55,
      },
      {
        title: `Experten loben ${entityName}s Klimastrategie`,
        url: 'https://beispiel.de/artikel-5',
        source: 'sueddeutsche.de',
        date: now.toISOString().slice(0, 10),
        snippet: `Führende Klimawissenschaftler haben die neue Klimastrategie positiv bewertet. ${entityName} setzt damit ein wichtiges Signal für die internationale Klimapolitik.`,
        sentiment: 0.5,
      },
    ],
    generatedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    cached: false,
  };
}
