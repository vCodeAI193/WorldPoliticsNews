import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { getAnalysis } from '../services/aiService';
import { searchWikidata } from '../services/wikidataService';

export const politiciansRouter = Router();

const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Zu viele Analyse-Anfragen. Bitte in einer Stunde erneut versuchen.' },
});

politiciansRouter.get('/search', async (req, res) => {
  const { q, country } = req.query as { q?: string; country?: string };

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Suchbegriff muss mindestens 2 Zeichen lang sein' });
  }

  try {
    const results = await searchWikidata(q.trim(), 'politician', country);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Politiker-Suche fehlgeschlagen:', err);
    res.status(500).json({ success: false, error: 'Suche fehlgeschlagen. Bitte erneut versuchen.' });
  }
});

politiciansRouter.get('/:id/analysis', analysisLimiter, optionalAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name } = req.query as { name?: string };

  if (!name?.trim()) {
    return res.status(400).json({ success: false, error: 'Parameter "name" ist erforderlich' });
  }

  const isPlusUser = req.user?.subscriptionTier === 'plus';

  try {
    const analysis = await getAnalysis(id, name.trim(), 'politician', isPlusUser);
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error(`Analyse-Fehler für Politiker ${id}:`, err);
    res.status(500).json({ success: false, error: 'Analyse konnte nicht erstellt werden. Bitte später versuchen.' });
  }
});
