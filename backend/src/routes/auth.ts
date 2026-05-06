import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { TOKEN_TTL } from '../constants';

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

function signAccessToken(userId: string, email: string, tier: string) {
  return jwt.sign({ sub: userId, email, tier }, process.env.JWT_SECRET!, { expiresIn: TOKEN_TTL.ACCESS });
}

function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: TOKEN_TTL.REFRESH });
}

authRouter.post('/register', async (req, res) => {
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Ungültige E-Mail oder Passwort (min. 8 Zeichen)' });
  }
  const { email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ success: false, error: 'E-Mail bereits registriert' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const token = signAccessToken(user.id, user.email, user.subscriptionTier);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL.REFRESH_MS),
    },
  });

  res.status(201).json({
    success: true,
    data: {
      token,
      refreshToken,
      user: { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier, createdAt: user.createdAt },
    },
  });
});

authRouter.post('/login', async (req, res) => {
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Ungültige Eingabe' });
  }
  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, error: 'Ungültige Zugangsdaten' });
  }

  const token = signAccessToken(user.id, user.email, user.subscriptionTier);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL.REFRESH_MS),
    },
  });

  res.json({
    success: true,
    data: {
      token,
      refreshToken,
      user: { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier, createdAt: user.createdAt },
    },
  });
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ success: false, error: 'Kein Refresh-Token angegeben' });
  }

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { sub: string };
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ success: false, error: 'Refresh-Token abgelaufen oder ungültig' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Benutzer nicht gefunden' });
    }

    const newToken = signAccessToken(user.id, user.email, user.subscriptionTier);
    res.json({ success: true, data: { token: newToken } });
  } catch {
    res.status(401).json({ success: false, error: 'Ungültiger Refresh-Token' });
  }
});

authRouter.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  res.json({ success: true, data: null });
});
