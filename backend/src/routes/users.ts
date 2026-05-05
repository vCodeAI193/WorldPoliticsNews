import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, subscriptionTier: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'Benutzer nicht gefunden' });
  }

  res.json({ success: true, data: user });
});
