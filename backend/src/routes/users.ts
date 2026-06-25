import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

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

usersRouter.put('/me/password', requireAuth, async (req: AuthRequest, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Aktuelles und neues Passwort erforderlich' });
  }

  if (newPassword.length < 8 || newPassword.length > 128 || currentPassword.length > 128) {
    return res.status(400).json({ success: false, error: 'Passwort muss 8–128 Zeichen lang sein' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ success: false, error: 'Benutzer nicht gefunden' });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Aktuelles Passwort ist falsch' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  res.json({ success: true, data: null });
});

usersRouter.delete('/me', requireAuth, async (req: AuthRequest, res) => {
  const { password } = req.body as { password?: string };

  if (!password || password.length > 128) {
    return res.status(400).json({ success: false, error: 'Passwort zur Bestätigung erforderlich (max. 128 Zeichen)' });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ success: false, error: 'Benutzer nicht gefunden' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ success: false, error: 'Passwort ist falsch' });
  }

  // Cascade deletes watchlist and refresh tokens automatically
  await prisma.user.delete({ where: { id: user.id } });

  res.json({ success: true, data: null });
});

