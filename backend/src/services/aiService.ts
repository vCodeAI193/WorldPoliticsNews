import Anthropic from '@anthropic-ai/sdk';
import NodeCache from 'node-cache';
import { prisma } from '../lib/prisma';
import type { Prisma } from '@prisma/client';
import { toSentimentLabel, type AnalysisResult, type ArticleSnippet, type SentimentLabel } from '@wpn/shared-types';
import { CACHE_TTL } from '../constants';
import { logger } from '../lib/logger';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const memCache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

const TTL_FREE_MS = CACHE_TTL.FREE_MS;
const TTL_PLUS_MS = CACHE_TTL.PLUS_MS;

const TRUSTED_SOURCES = [
  'reuters.com', 'bbc.com', 'bbc.co.uk', 'theguardian.com', 'apnews.com',
  'spiegel.de', 'faz.net', 'zeit.de', 'sueddeutsche.de', 'tagesschau.de',
  'welt.de', 'politico.eu', 'dw.com', 'handelsblatt.com', 'stern.de',
];

export async function getAnalysis(
  entityId: string,
  entityName: string,
  entityType: 'politician' | 'party',
  isPlusUser: boolean,
  force = false,
  entityCountry?: string
): Promise<AnalysisResult> {
  const cacheKey = `${entityType}:${entityId}`;

  if (!force) {
    // L1: in-memory cache
    const memHit = memCache.get<AnalysisResult>(cacheKey);
    if (memHit) return { ...memHit, cached: true };

    // L2: database cache
    const dbRow = await prisma.analysis.findUnique({
      where: { entityId_entityType: { entityId, entityType } },
    });

    if (dbRow && dbRow.expiresAt > new Date()) {
      const result = rowToResult(dbRow, true);
      memCache.set(cacheKey, result);
      return result;
    }
  }

  // Cache miss: fetch fresh analysis
  const articles = await fetchArticles(entityName, entityType);
  const analysis = await analyzeWithClaude(entityName, entityType, articles);

  const ttl = isPlusUser ? TTL_PLUS_MS : TTL_FREE_MS;
  const expiresAt = new Date(Date.now() + ttl);

  const analysisData = {
    summary: analysis.summary,
    sentiment: analysis.sentiment,
    sentimentLabel: analysis.sentimentLabel,
    articles: analysis.articles as unknown as Prisma.InputJsonValue,
    keywords: analysis.keywords as unknown as Prisma.InputJsonValue,
  };

  const saved = await prisma.analysis.upsert({
    where: { entityId_entityType: { entityId, entityType } },
    create: { entityType, entityId, entityName, entityCountry, expiresAt, ...analysisData },
    update: { entityName, entityCountry, expiresAt, generatedAt: new Date(), ...analysisData },
  });

  const result = rowToResult(saved, false);
  memCache.set(cacheKey, result, Math.floor(ttl / 1000));

  // Save to history for trending chart
  prisma.analysisHistory.create({
    data: {
      entityType,
      entityId,
      entityName,
      entityCountry,
      sentiment: analysis.sentiment,
      sentimentLabel: analysis.sentimentLabel,
    },
  }).catch((err) => logger.warn({ err }, 'Failed to save analysis history'));

  return result;
}

async function fetchArticles(
  entityName: string,
  entityType: 'politician' | 'party'
): Promise<ArticleSnippet[]> {
  const typeLabel = entityType === 'party' ? 'Partei' : 'Politiker';
  const queries = [
    `${entityName} Kritik Bewertung Skandal 2025`,
    `${entityName} criticism review news 2025`,
    `${entityName} ${typeLabel} Analyse Meinung`,
  ];

  const seen = new Set<string>();
  const results: ArticleSnippet[] = [];

  await Promise.allSettled(
    queries.map(async (query) => {
      try {
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query,
            search_depth: 'advanced',
            max_results: 5,
            include_domains: TRUSTED_SOURCES,
          }),
          signal: AbortSignal.timeout(15000),
        });

        const data = (await response.json()) as {
          results: Array<{ title: string; url: string; content: string; published_date?: string }>;
        };

        for (const r of data.results || []) {
          if (seen.has(r.url)) continue;
          seen.add(r.url);
          results.push({
            title: r.title,
            url: r.url,
            source: new URL(r.url).hostname.replace('www.', ''),
            date: r.published_date || new Date().toISOString().slice(0, 10),
            snippet: r.content.slice(0, 600),
            sentiment: 0,
          });
        }
      } catch (err) {
        logger.warn({ err }, `Tavily-Suche fehlgeschlagen für "${query}"`);
      }
    })
  );

  return results.slice(0, 12);
}

async function analyzeWithClaude(
  entityName: string,
  entityType: 'politician' | 'party',
  articles: ArticleSnippet[]
): Promise<{
  summary: string;
  sentiment: number;
  sentimentLabel: SentimentLabel;
  articles: ArticleSnippet[];
  keywords: string[];
}> {
  const typeLabel = entityType === 'party' ? 'die Partei' : 'den Politiker';

  if (articles.length === 0) {
    return {
      summary: `Für ${entityName} wurden keine aktuellen Nachrichtenartikel gefunden. Bitte später erneut versuchen.`,
      sentiment: 0,
      sentimentLabel: 'neutral',
      articles: [],
      keywords: [],
    };
  }

  const articlesText = articles
    .map((a, i) => `[${i + 1}] ${a.title} (${a.source}, ${a.date})\n${a.snippet}`)
    .join('\n\n---\n\n');

  const systemPrompt = `Du bist ein objektiver politischer Analyst. Analysiere Nachrichten über Politiker und Parteien sachlich und ausgewogen. Antworte IMMER als valides JSON ohne Markdown-Codeblöcke oder Erklärungen.`;

  const userPrompt = `Analysiere die folgenden Nachrichtenartikel über ${typeLabel} "${entityName}".

ARTIKEL:
${articlesText}

Erstelle eine JSON-Antwort mit dieser exakten Struktur:
{
  "summary": "Gesamtbewertung auf Deutsch (2-4 Sätze, sachlich und ausgewogen)",
  "overallSentiment": 0.0,
  "keywords": ["Stichwort1", "Stichwort2"],
  "articleSentiments": [0.0, 0.0]
}

Regeln:
- overallSentiment: Dezimalzahl von -1.0 (sehr negativ) bis +1.0 (sehr positiv)
- articleSentiments: Array mit einem Sentiment-Wert pro Artikel (gleiche Reihenfolge, ${articles.length} Werte)
- keywords: bis zu 8 Hauptthemen und Kritikpunkte auf Deutsch
- summary: Sachliche, ausgewogene Zusammenfassung der öffentlichen Wahrnehmung`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unerwartete Claude-Antwort');

  const clean = content.text.replace(/```json\n?|```\n?/g, '').trim();
  let parsed: { summary: string; overallSentiment: number; keywords: string[]; articleSentiments: number[] };

  try {
    parsed = JSON.parse(clean);
  } catch {
    throw new Error(`Claude hat kein valides JSON zurückgegeben: ${clean.slice(0, 200)}`);
  }

  const sentiment = Math.max(-1, Math.min(1, parsed.overallSentiment || 0));

  const articlesWithSentiment = articles.map((a, i) => ({
    ...a,
    sentiment: parsed.articleSentiments?.[i] ?? sentiment,
  }));

  return {
    summary: parsed.summary,
    sentiment,
    sentimentLabel: toSentimentLabel(sentiment),
    articles: articlesWithSentiment,
    keywords: (parsed.keywords || []).slice(0, 8),
  };
}


function rowToResult(row: any, cached: boolean): AnalysisResult {
  return {
    entityId: row.entityId,
    entityName: row.entityName,
    entityType: row.entityType as 'politician' | 'party',
    summary: row.summary,
    sentiment: row.sentiment,
    sentimentLabel: row.sentimentLabel as SentimentLabel,
    articles: row.articles as ArticleSnippet[],
    keywords: row.keywords as string[],
    generatedAt: row.generatedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    cached,
  };
}
