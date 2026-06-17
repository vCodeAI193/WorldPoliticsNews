import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const trendingRouter = Router();

trendingRouter.get('/', async (_req, res) => {
  try {
    const entities = await prisma.analysis.findMany({
      orderBy: { generatedAt: 'desc' },
      take: 8,
      select: {
        entityId: true,
        entityName: true,
        entityType: true,
        sentiment: true,
        sentimentLabel: true,
        generatedAt: true,
      },
    });

    res.json({ success: true, data: entities });
  } catch (err) {
    console.error('Trending-Fehler:', err);
    res.status(500).json({ success: false, error: 'Trending-Daten konnten nicht geladen werden.' });
  }
});
