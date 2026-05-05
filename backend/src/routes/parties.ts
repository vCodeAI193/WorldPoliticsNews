import { Router } from 'express';
import { optionalAuth, AuthRequest } from '../middleware/auth';
import { getAnalysis } from '../services/aiService';
import { searchWikidata } from '../services/wikidataService';

export const partiesRouter = Router();

partiesRouter.get('/search', async (req, res) => {
  const { q, country } = req.query as { q?: string; country?: string };

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Suchbegriff muss mindestens 2 Zeichen lang sein' });
  }

  try {
    const results = await searchWikidata(q.trim(), 'party', country);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Parteien-Suche fehlgeschlagen:', err);
    res.status(500).json({ success: false, error: 'Suche fehlgeschlagen. Bitte erneut versuchen.' });
  }
});

partiesRouter.get('/:id/analysis', optionalAuth, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { name } = req.query as { name?: string };

  if (!name?.trim()) {
    return res.status(400).json({ success: false, error: 'Parameter "name" ist erforderlich' });
  }

  const isPlusUser = req.user?.subscriptionTier === 'plus';

  try {
    const analysis = await getAnalysis(id, name.trim(), 'party', isPlusUser);
    res.json({ success: true, data: analysis });
  } catch (err) {
    console.error(`Analyse-Fehler für Partei ${id}:`, err);
    res.status(500).json({ success: false, error: 'Analyse konnte nicht erstellt werden. Bitte später versuchen.' });
  }
});
