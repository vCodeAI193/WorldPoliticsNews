import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { rateLimit } from 'express-rate-limit';
import { prisma } from '../lib/prisma';
import { TOKEN_TTL, RATE_LIMIT } from '../constants';
import { logger } from '../lib/logger';

// Helper function to generate a random token
function generateRandomToken(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).padEnd(length, '0');
}

export const authRouter = Router();

// Pre-hashed dummy used to run bcrypt.compare even when a user is not found,
// preventing timing-based user enumeration on the login endpoint.
const DUMMY_HASH = bcrypt.hashSync('_timing_nonce_', 10);

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

const loginLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_LOGIN_WINDOW_MS,
  max: RATE_LIMIT.AUTH_LOGIN_MAX,
  message: { success: false, error: 'Zu viele Anmeldeversuche. Bitte in 15 Minuten erneut versuchen.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_REGISTER_WINDOW_MS,
  max: RATE_LIMIT.AUTH_REGISTER_MAX,
  message: { success: false, error: 'Zu viele Registrierungen von dieser IP. Bitte später erneut versuchen.' },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post('/register', registerLimiter, async (req, res) => {
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
  const verificationToken = generateRandomToken(6);
  const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      verificationToken,
      verificationTokenExpiresAt,
    },
  });

  // Log email verification (mock implementation)
  logger.info({ userId: user.id, email: user.email, verificationToken }, 'Email verification sent');
  console.log(`📧 Verification email would be sent to ${email} with token: ${verificationToken}`);

  const token = signAccessToken(user.id, user.email, user.subscriptionTier);
  const refreshToken = signRefreshToken(user.id);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL.REFRESH_MS),
    },
  });

  logger.info({ userId: user.id }, 'User registered');
  res.status(201).json({
    success: true,
    data: {
      token,
      refreshToken,
      user: { id: user.id, email: user.email, subscriptionTier: user.subscriptionTier, createdAt: user.createdAt },
    },
    message: 'Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.',
  });
});

authRouter.post('/login', loginLimiter, async (req, res) => {
  const result = credentialsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ success: false, error: 'Ungültige Eingabe' });
  }
  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const passwordValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !passwordValid) {
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

  logger.info({ userId: user.id }, 'User logged in');
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

// Email verification endpoint
authRouter.post('/verify-email', async (req, res) => {
  const { token } = req.body;

  if (!token || typeof token !== 'string' || token.length !== 6) {
    return res.status(400).json({ success: false, error: 'Ungültiger Verifikations-Code' });
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Verifikations-Code ungültig oder abgelaufen' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpiresAt: null,
    },
  });

  logger.info({ userId: user.id }, 'Email verified');
  res.json({ success: true, message: 'E-Mail erfolgreich bestätigt' });
});

// Forgot password endpoint
authRouter.post('/forgot-password', registerLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ success: false, error: 'E-Mail ist erforderlich' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // Return success even if user doesn't exist (security best practice)
    return res.json({ success: true, message: 'Wenn die E-Mail existiert, erhalten Sie einen Reset-Link' });
  }

  const resetToken = generateRandomToken(32);
  const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiresAt,
    },
  });

  // Log password reset email (mock implementation)
  logger.info({ userId: user.id, email }, 'Password reset email sent');
  console.log(`📧 Password reset email would be sent to ${email} with token: ${resetToken}`);

  res.json({ success: true, message: 'Wenn die E-Mail existiert, erhalten Sie einen Reset-Link' });
});

// Reset password endpoint
authRouter.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ success: false, error: 'Token und Passwort sind erforderlich' });
  }

  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ success: false, error: 'Passwort muss 8–72 Zeichen lang sein' });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiresAt: { gt: new Date() },
    },
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Reset-Token ungültig oder abgelaufen' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null,
    },
  });

  logger.info({ userId: user.id }, 'Password reset');
  res.json({ success: true, message: 'Passwort erfolgreich zurückgesetzt' });
});
