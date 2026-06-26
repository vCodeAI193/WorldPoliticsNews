import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';

const isDemoMode = process.env.DEMO_MODE === 'true';
const requiredEnvVars = isDemoMode
  ? ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL']
  : ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL', 'ANTHROPIC_API_KEY', 'TAVILY_API_KEY'];

const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingVars.length > 0) {
  console.error(`Fehlende Umgebungsvariablen: ${missingVars.join(', ')}`);
  process.exit(1);
}

if ((process.env.JWT_SECRET?.length ?? 0) < 32 || (process.env.JWT_REFRESH_SECRET?.length ?? 0) < 32) {
  console.error('JWT_SECRET und JWT_REFRESH_SECRET müssen mindestens 32 Zeichen lang sein');
  process.exit(1);
}

import express from 'express';
import { RATE_LIMIT } from './constants';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { watchlistRouter } from './routes/watchlist';
import { webhooksRouter } from './routes/webhooks';
import { politiciansRouter } from './routes/politicians';
import { partiesRouter } from './routes/parties';
import { subscriptionsRouter } from './routes/subscriptions';
import { trendingRouter } from './routes/trending';
import { historyRouter } from './routes/history';
import { notificationsRouter } from './routes/notifications';
import { newsletterRouter } from './routes/newsletter';
import { comparisonsRouter } from './routes/comparisons';
import { adminRouter } from './routes/admin';
import swaggerUi from 'swagger-ui-express';

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
app.use(express.json({ limit: '10kb' }));

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
app.use('/api/history', historyRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/comparisons', comparisonsRouter);
app.use('/api/admin', adminRouter);

// Load OpenAPI schema
let openApiSchema: Record<string, any> = {};
try {
  const openApiPath = path.join(__dirname, 'openapi.json');
  const openApiContent = fs.readFileSync(openApiPath, 'utf-8');
  openApiSchema = JSON.parse(openApiContent);
} catch (error) {
  logger.warn({ error }, 'Failed to load OpenAPI schema');
}

// Swagger UI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSchema));
app.get('/api/openapi.json', (_req, res) => res.json(openApiSchema));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, timestamp: new Date().toISOString(), db: 'ok', demo: isDemoMode });
  } catch {
    res.status(503).json({ ok: false, timestamp: new Date().toISOString(), db: 'error', demo: isDemoMode });
  }
});

app.use((_req, res) => res.status(404).json({ success: false, error: 'Nicht gefunden' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ success: false, error: 'Interner Serverfehler' });
});

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Backend started');
});
