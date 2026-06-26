import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { getAnalysis } from '../services/aiService';
import { searchWikidata } from '../services/wikidataService';
import { getMockAnalysis } from '../services/mockData';
import { prisma } from '../lib/prisma';
import { logger } from '../lib/logger';
import type { SearchResult } from '@wpn/shared-types';
import { RATE_LIMIT } from '../constants';

const isDemoMode = process.env.DEMO_MODE === 'true';

const analysisLimiter = rateLimit({
  windowMs: RATE_LIMIT.ANALYSIS_WINDOW_MS,
  max: RATE_LIMIT.ANALYSIS_MAX,
  message: { success: false, error: 'Zu viele Analyse-Anfragen. Bitte in einer Stunde erneut versuchen.' },
});

export function createEntityRouter(
  entityType: 'politician' | 'party',
  mockSearchData: SearchResult
) {
  const router = Router();
  const apiSegment = entityType === 'politician' ? 'politicians' : 'parties';

  router.get('/search', async (req, res) => {
    const { q, country } = req.query as { q?: string; country?: string };

    if (!q || q.trim().length < 2 || q.length > 200) {
      return res.status(400).json({ success: false, error: 'Suchbegriff muss 2–200 Zeichen lang sein' });
    }

    if (isDemoMode) {
      const filtered = mockSearchData.entities.filter((e) =>
        e.name.toLowerCase().includes(q.toLowerCase())
      );
      const entities = filtered.length ? filtered : mockSearchData.entities;
      return res.json({ success: true, data: { entities, total: entities.length } });
    }

    try {
      const results = await searchWikidata(q.trim(), entityType, country);
      res.json({ success: true, data: results });
    } catch (err) {
      logger.error({ err, q }, `${apiSegment} search failed`);
      res.status(500).json({ success: false, error: 'Suche fehlgeschlagen. Bitte erneut versuchen.' });
    }
  });

  router.get('/:id/analysis', analysisLimiter, optionalAuth, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { name, force, country } = req.query as { name?: string; force?: string; country?: string };

    if (!name?.trim() || name.length > 256) {
      return res.status(400).json({ success: false, error: 'Parameter "name" ist erforderlich (max. 256 Zeichen)' });
    }

    if (!/^[\w\s\-./äöüßÄÖÜ]+$/u.test(id) || id.length > 64) {
      return res.status(400).json({ success: false, error: 'Ungültige Entitäts-ID' });
    }

    if (isDemoMode) {
      return res.json({ success: true, data: getMockAnalysis(id, name.trim(), entityType) });
    }

    const isPlusUser = req.user?.subscriptionTier === 'plus';

    try {
      const analysis = await getAnalysis(id, name.trim(), entityType, isPlusUser, force === 'true', country);
      res.json({ success: true, data: analysis });
    } catch (err) {
      logger.error({ err, id }, `${apiSegment} analysis failed`);
      res.status(500).json({ success: false, error: 'Analyse konnte nicht erstellt werden. Bitte später versuchen.' });
    }
  });

  router.get('/:id/history', async (req, res) => {
    const { id } = req.params;
    const days = Math.min(parseInt((req.query.days as string) || '30', 10), 90);

    if (!/^[\w\-]+$/.test(id) || id.length > 64) {
      return res.status(400).json({ success: false, error: 'Ungültige Entitäts-ID' });
    }

    try {
      const history = await prisma.analysisHistory.findMany({
        where: { entityId: id, entityType },
        orderBy: { generatedAt: 'asc' },
        select: { sentiment: true, sentimentLabel: true, generatedAt: true },
      });
      res.json({ success: true, data: history });
    } catch {
      res.json({ success: true, data: [] });
    }
  });

  router.get('/rankings/:country', async (req, res) => {
    const { country } = req.params;

    if (!/^[A-Z]{2}$/.test(country)) {
      return res.status(400).json({ success: false, error: 'Ungültiger Länder-Code (2-buchstaben ISO, z.B. DE)' });
    }

    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);

    try {
      const analyses = await prisma.analysis.findMany({
        where: { entityType, entityCountry: country },
        orderBy: { sentiment: 'desc' },
        take: limit,
        select: {
          entityId: true,
          entityName: true,
          entityCountry: true,
          sentiment: true,
          sentimentLabel: true,
          generatedAt: true,
        },
      });

      res.json({ success: true, data: analyses });
    } catch (err) {
      logger.error({ err, country }, `${apiSegment} rankings failed`);
      res.status(500).json({ success: false, error: 'Rankings konnten nicht geladen werden.' });
    }
  });

  return router;
}
