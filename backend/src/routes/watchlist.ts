import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const watchlistRouter = Router();

const FREE_WATCHLIST_LIMIT = 5;

const addItemSchema = z.object({
  entityType: z.enum(['politician', 'party']),
  entityId: z.string().min(1).max(64).regex(/^[\w\-]+$/),
  entityName: z.string().min(1).max(256),
  entityCountry: z.string().max(64).optional(),
});

watchlistRouter.get('/', requireAuth, async (req: AuthRequest, res) => {
  const items = await prisma.watchlistItem.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: items });
});

watchlistRouter.post('/', requireAuth, async (req: AuthRequest, res) => {
  const result = addItemSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Ungültige Eingabe' });
  }

  const isPlusUser = req.user!.subscriptionTier === 'plus';

  if (!isPlusUser) {
    const count = await prisma.watchlistItem.count({ where: { userId: req.user!.id } });
    if (count >= FREE_WATCHLIST_LIMIT) {
      return res.status(403).json({
        success: false,
        error: `Beobachtungsliste voll (max. ${FREE_WATCHLIST_LIMIT}). Upgrade auf Plus für unbegrenzte Einträge.`,
        code: 'WATCHLIST_LIMIT',
      });
    }
  }

  try {
    const item = await prisma.watchlistItem.create({
      data: { userId: req.user!.id, ...result.data },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'Bereits auf der Beobachtungsliste' });
    }
    throw err;
  }
});

watchlistRouter.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  const deleted = await prisma.watchlistItem.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ success: false, error: 'Eintrag nicht gefunden' });
  }

  res.json({ success: true, data: null });
});
