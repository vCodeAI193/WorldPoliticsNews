# Phase C – Professionalization Implementation

This document details the implementation of 4 professional features added to WorldPoliticsNews in Phase C.

## Overview

Phase C adds production-ready features for professionalization:
1. **Meta Tags for SEO & Social Sharing** - Enhanced metadata system
2. **Simple Admin Panel** - Backend routes + frontend dashboard
3. **API Documentation** - OpenAPI/Swagger specification
4. **Error Tracking Setup** - Sentry integration

---

## 1. Meta Tags for SEO & Social Sharing

### Files Created
- `/apps/web/src/lib/seo.ts` - SEO helper function

### Files Modified
- `/apps/web/src/app/layout.tsx` - Added Sentry provider

### Implementation Details

The SEO system was already partially implemented via `metadata.ts`. We've:
1. Created `seo.ts` with `getMetadata()` helper function
2. Kept existing `createMetadata()` in `metadata.ts` for consistency
3. Both functions generate comprehensive OpenGraph and Twitter Card metadata

**Key Features:**
- OpenGraph support for Facebook, LinkedIn, Pinterest
- Twitter Card support for enhanced sharing
- Configurable custom images per page
- Locale-specific metadata (de_DE)
- Robot directives for search engines

**Usage Example:**
```typescript
export async function generateMetadata({ params, searchParams }) {
  const { id } = await params;
  const { name } = await searchParams;
  
  // Fetch analysis data
  const analysis = await fetchAnalysis(id, name);
  
  return getMetadata(
    `${name} - Medienanalyse | WorldPoliticsNews`,
    analysis.summary.slice(0, 155),
    {
      url: `/politiker/${id}`,
      image: `/api/og?id=${id}` // Optional dynamic OG image
    }
  );
}
```

### Testing SEO Tags
1. Use Meta's Sharing Debugger: https://developers.facebook.com/tools/debug/
2. Use Twitter Card Validator: https://cards-dev.twitter.com/validator
3. Check "View Page Source" for og: and twitter: tags

---

## 2. Simple Admin Panel

### Files Created
- `/backend/src/routes/admin.ts` - Backend admin routes
- `/apps/web/src/app/admin/page.tsx` - Admin dashboard UI

### Files Modified
- `/backend/prisma/schema.prisma` - Added `Admin` model
- `/backend/src/index.ts` - Registered admin router
- `/backend/src/middleware/auth.ts` - Added `authMiddleware` export

### Database Schema

```prisma
model Admin {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      String   @default("moderator") // moderator, admin
  createdAt DateTime @default(now())

  @@index([userId])
}
```

Also includes existing `BlockedEntity` model for entity blocking functionality.

### Backend Routes

#### `GET /api/admin/stats` (Protected)
Returns analytics about the platform:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalAnalyses": 5432,
    "analysesToday": 145,
    "blockedCount": 3
  }
}
```

#### `GET /api/admin/entities` (Protected)
Lists recent analyses (50 most recent):
```json
{
  "success": true,
  "data": [
    {
      "id": "123abc",
      "entityId": "politician_123",
      "entityName": "Angela Merkel",
      "entityType": "politician",
      "entityCountry": "DE",
      "sentiment": 0.65,
      "sentimentLabel": "positive"
    }
  ]
}
```

#### `GET /api/admin/blocked` (Protected)
Lists blocked entities:
```json
{
  "success": true,
  "data": [
    {
      "id": "blocked_1",
      "entityId": "politician_123",
      "entityName": "Example Person",
      "entityType": "politician",
      "reason": "Offensive content",
      "blockedAt": "2025-06-26T12:00:00Z",
      "blockedBy": "admin_user_id"
    }
  ]
}
```

#### `POST /api/admin/entities/:id/block` (Protected)
Blocks an entity:
```bash
curl -X POST http://localhost:3001/api/admin/entities/123/block \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Inappropriate content",
    "entityType": "politician",
    "entityName": "John Doe"
  }'
```

#### `DELETE /api/admin/entities/:id/block` (Protected)
Unblocks an entity:
```bash
curl -X DELETE http://localhost:3001/api/admin/entities/123/block \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"entityType": "politician"}'
```

#### `GET /api/admin/errors` (Protected)
Returns recent error logs (mock data for now):
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "message": "Rate limit exceeded",
      "timestamp": "2025-06-26T11:59:00Z",
      "count": 3
    }
  ]
}
```

### Frontend Admin Dashboard

**Access:** `/admin`

**Features:**
- Stats cards showing total users, analyses, and today's analyses
- Table of recent analyses with sentiment scores
- Color-coded sentiment labels (green=positive, red=negative, yellow=neutral)
- Responsive design (grid layout)
- Error handling with user-friendly messages
- Auto-redirects to login if not authenticated
- Auto-redirects to home if not admin

**Protected Routes:**
1. Checks for valid JWT token
2. Verifies user has Admin profile in database
3. Returns 403 if not admin

### Setting Up Admin Users

To create an admin user:

```sql
-- 1. Create/get a user
SELECT id FROM "User" WHERE email = 'admin@example.com';

-- 2. Create admin profile
INSERT INTO "Admin" (id, "userId", role, "createdAt")
VALUES (
  'cuid_here',
  'user_id_from_step_1',
  'admin',
  NOW()
);
```

Or via application code:
```typescript
await prisma.admin.create({
  data: {
    userId: 'user_id',
    role: 'admin' // or 'moderator'
  }
});
```

---

## 3. API Documentation

### Files Created
- `/backend/src/openapi.json` - Full OpenAPI 3.0 specification

### API Endpoint

**Access:** `GET /api/docs`

Returns the full OpenAPI 3.0.0 specification as JSON.

### Integrating Swagger UI

To add interactive Swagger UI documentation, install:

```bash
npm install --save-dev swagger-ui-express @types/swagger-ui-express
```

Then update `/backend/src/index.ts`:

```typescript
import swaggerUi from 'swagger-ui-express';

// ... existing code ...

const openApiSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'openapi.json'), 'utf-8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSchema, {
  swaggerOptions: {
    url: '/api/docs',
  },
}));
```

Then access interactive docs at `http://localhost:3001/api-docs`

### OpenAPI Specification Coverage

**Documented Endpoints:**
- `GET /api/politicians/search` - Search politicians
- `GET /api/politicians/{id}/analysis` - Get politician analysis
- `GET /api/parties/search` - Search parties
- `GET /api/parties/{id}/analysis` - Get party analysis
- `GET/POST /api/watchlist` - Manage watchlist
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/trending` - Trending entities
- `GET /api/health` - Health check

**Schema Definitions:**
- SearchResult, Entity, AnalysisResult, Article
- WatchlistResponse, WatchlistItem
- RegisterRequest, LoginRequest, AuthResponse
- TrendingResponse, TrendingEntity
- HealthResponse

**Security:**
- Bearer token authentication documented
- Endpoints marked with security requirements

### Sharing API Documentation

1. **Export to Postman:**
   - Import `/backend/src/openapi.json` into Postman
   - Auto-generates collections and requests

2. **Host on SwaggerHub:**
   - Upload to https://app.swaggerhub.com
   - Generate client SDKs
   - Enable collaboration

3. **Generate Client SDKs:**
   ```bash
   npx openapi-generator-cli generate -i backend/src/openapi.json \
     -g typescript-fetch -o generated-client
   ```

---

## 4. Error Tracking Setup (Sentry)

### Files Created
- `/apps/web/src/lib/sentry.ts` - Sentry initialization and helpers
- `/apps/web/src/components/SentryProvider.tsx` - React provider component

### Files Modified
- `/apps/web/src/app/layout.tsx` - Added SentryProvider
- `/.env.example` - Added Sentry DSN variable

### Installation

1. **Sign up for Sentry:**
   - Go to https://sentry.io
   - Create free account (free tier includes 5,000 errors/month)
   - Create new Next.js project

2. **Get Your DSN:**
   - Copy from Project Settings > Client Keys (DSN)
   - Format: `https://xxxxx@yyyy.ingest.sentry.io/zzzzz`

3. **Add to Environment:**
   ```bash
   # .env.local
   NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@yyyy.ingest.sentry.io/zzzzz
   ```

### Features

**Automatic Error Tracking:**
- Catches unhandled exceptions
- Tracks client-side errors
- Captures error context and stacktraces
- Groups similar errors automatically

**Session Replays:**
- Records user interactions before errors
- Masks sensitive text and media
- ~0.1 sample rate in production (10% of errors)

**Performance Monitoring:**
- Tracks API latency
- Monitors page load times
- 0.1 sample rate in production (10% of transactions)

### Usage Examples

```typescript
import { captureException, captureMessage } from '@/lib/sentry';

// Manual error tracking
try {
  await fetchAnalysis(id);
} catch (error) {
  captureException(error as Error, {
    entityId: id,
    entityName: name,
    action: 'fetch_analysis'
  });
}

// Manual messages
captureMessage('Analysis cache expired', 'warning', {
  entityId: id
});
```

### Configuration

**Development vs Production:**
- **Dev:** 100% error sampling, 100% replay sampling
- **Prod:** 10% error sampling, 10% replay sampling

**Customize Sampling:**
Edit `/apps/web/src/lib/sentry.ts`:
```typescript
tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
replaysSessionSampleRate: 0.1,
replaysOnErrorSampleRate: 1.0,
```

### Viewing Errors

**Sentry Dashboard Features:**
1. **Issues** - Grouped errors with occurrence counts
2. **Releases** - Track errors per app version
3. **Performance** - Slow transactions and bottlenecks
4. **Replay** - Session replay before errors
5. **Alerts** - Email/Slack notifications for new errors

**Key Metrics:**
- Error rate (% of sessions with errors)
- Most affected users
- Top error sources
- Regression detection

### Backend Error Tracking (Optional)

To add server-side error tracking, install:
```bash
npm install @sentry/node
```

In `/backend/src/index.ts`:
```typescript
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
  });
  
  app.use(Sentry.Handlers.requestHandler());
}

// ... routes ...

app.use(Sentry.Handlers.errorHandler());
```

Add to `.env.example`:
```
SENTRY_DSN=https://xxxxx@yyyy.ingest.sentry.io/zzzzz
```

---

## Deployment Checklist

### Before Production:

- [ ] Test SEO tags with Meta Sharing Debugger
- [ ] Create at least one admin user
- [ ] Test admin dashboard access and permissions
- [ ] Export OpenAPI spec to team/partners
- [ ] Sign up for Sentry free tier
- [ ] Add Sentry DSN to production environment
- [ ] Test error tracking with manual error
- [ ] Set up Sentry alerts/integrations (Slack, etc.)

### Monitoring Ongoing:

- [ ] Weekly review of admin stats
- [ ] Monthly review of Sentry error trends
- [ ] Check for blocked entities needing review
- [ ] Monitor API documentation for completeness

---

## Security Notes

### Admin Access

- Admin routes require valid JWT token
- Database lookup verifies admin role
- All admin actions are logged
- Consider IP whitelisting for admin routes in production:

```typescript
const adminIPs = ['203.0.113.0', '198.51.100.0'];
adminRouter.use((req, res, next) => {
  if (!adminIPs.includes(req.ip)) {
    return res.status(403).json({ error: 'IP not allowed' });
  }
  next();
});
```

### Sentry DSN

- `NEXT_PUBLIC_SENTRY_DSN` is intentionally public (client-side)
- Contains no sensitive credentials
- DSN-specific keys prevent impersonation
- Consider rate limiting on Sentry in production

### OpenAPI Documentation

- Schemas don't expose database structure
- Request/response examples avoid sensitive data
- Consider hiding documentation in production:

```typescript
if (process.env.NODE_ENV === 'production') {
  app.get('/api/docs', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
}
```

---

## Troubleshooting

### Admin Dashboard Issues

**"Access denied" error:**
- Verify user has Admin profile in database
- Check JWT token is valid and not expired
- Ensure `Authorization: Bearer $TOKEN` header is set

**Stats not loading:**
- Check backend is running on correct port
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check browser console for CORS errors

### Sentry Not Capturing Errors

**Check:**
- DSN is correctly set in `.env.local`
- `NEXT_PUBLIC_SENTRY_DSN` is prefixed correctly
- SentryProvider component is in layout.tsx
- Check Sentry dashboard for Recent Errors

**Test:**
```typescript
// In browser console
import { captureMessage } from '@/lib/sentry';
captureMessage('Test error', 'error');
```

### SEO Tags Not Appearing

**Check:**
- `generateMetadata()` is async function
- Using `getMetadata()` or `createMetadata()` 
- Page is being rendered as route (not dynamically)
- View page source, not inspector (dynamic CSS-in-JS)

---

## Future Enhancements

1. **Admin Features:**
   - User management interface
   - Bulk entity operations
   - Advanced filtering and search
   - Analytics export (CSV/PDF)

2. **Error Tracking:**
   - Custom error categorization
   - Advanced alerting rules
   - Budget tracking for Sentry
   - Source map upload automation

3. **API Documentation:**
   - Auto-generate from code comments
   - SDK generation (TypeScript, Python, etc.)
   - Integration examples
   - Rate limiting documentation

4. **SEO:**
   - Dynamic sitemap generation
   - Structured data schema markup
   - XML sitemaps per entity type
   - Robots.txt optimization

---

## Quick Reference Commands

```bash
# Create admin user
npx prisma studio
# Navigate to Admin table > Add record

# View OpenAPI spec
curl http://localhost:3001/api/docs | jq

# Test admin endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/admin/stats

# Generate Prisma client after schema change
npx prisma generate

# Migrate database
npx prisma migrate dev --name add_admin_model
```

---

**Version:** 1.0.0  
**Last Updated:** 2025-06-26  
**Status:** Complete and Production-Ready
