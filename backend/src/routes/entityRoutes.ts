import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { getAnalysis } from '../services/aiService';
import { searchWikidata } from '../services/wikidataService';
import { getMockAnalysis } from '../services/mockData';
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

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Suchbegriff muss mindestens 2 Zeichen lang sein' });
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
      console.error(`${apiSegment}-Suche fehlgeschlagen:`, err);
      res.status(500).json({ success: false, error: 'Suche fehlgeschlagen. Bitte erneut versuchen.' });
    }
  });

  router.get('/:id/analysis', analysisLimiter, optionalAuth, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { name } = req.query as { name?: string };

    if (!name?.trim()) {
      return res.status(400).json({ success: false, error: 'Parameter "name" ist erforderlich' });
    }

    if (isDemoMode) {
      return res.json({ success: true, data: getMockAnalysis(id, name.trim(), entityType) });
    }

    const isPlusUser = req.user?.subscriptionTier === 'plus';

    try {
      const analysis = await getAnalysis(id, name.trim(), entityType, isPlusUser);
      res.json({ success: true, data: analysis });
    } catch (err) {
      console.error(`Analyse-Fehler für ${apiSegment} ${id}:`, err);
      res.status(500).json({ success: false, error: 'Analyse konnte nicht erstellt werden. Bitte später versuchen.' });
    }
  });

  return router;
}
