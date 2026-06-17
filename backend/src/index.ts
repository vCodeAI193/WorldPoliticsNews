import 'dotenv/config';

const isDemoMode = process.env.DEMO_MODE === 'true';
const requiredEnvVars = isDemoMode
  ? ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL']
  : ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL', 'ANTHROPIC_API_KEY', 'TAVILY_API_KEY'];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`Fehlende Umgebungsvariablen: ${missingVars.join(', ')}`);
  process.exit(1);
}

import express from 'express';
import { RATE_LIMIT } from './constants';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { watchlistRouter } from './routes/watchlist';
import { webhooksRouter } from './routes/webhooks';
import { politiciansRouter } from './routes/politicians';
import { partiesRouter } from './routes/parties';
import { subscriptionsRouter } from './routes/subscriptions';
import { trendingRouter } from './routes/trending';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:19000',
    ],
    credentials: true,
  })
);

// Stripe webhooks require raw body BEFORE json middleware
app.use('/api/webhooks', express.raw({ type: 'application/json' }));
app.use(express.json());

// Global rate limit
const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT.GLOBAL_WINDOW_MS,
  max: RATE_LIMIT.GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Analysis rate limit is applied per-route inside politicians.ts and parties.ts

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/watchlist', watchlistRouter);
app.use('/api/webhooks', webhooksRouter);
app.use('/api/politicians', politiciansRouter);
app.use('/api/parties', partiesRouter);
app.use('/api/subscriptions', subscriptionsRouter);
app.use('/api/trending', trendingRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));

app.use((_req, res) => res.status(404).json({ success: false, error: 'Nicht gefunden' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Interner Serverfehler' });
});

app.listen(PORT, () => {
  console.log(`Backend läuft auf Port ${PORT}`);
});
