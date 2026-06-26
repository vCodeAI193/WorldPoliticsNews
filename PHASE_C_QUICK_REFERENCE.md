# Phase C – Quick Reference Guide

## File Locations

### SEO & Metadata
- **Helper:** `/apps/web/src/lib/seo.ts` (new)
- **Existing:** `/apps/web/src/lib/metadata.ts`
- **Usage in:** All page routes via `generateMetadata()`

### Admin Panel
- **Backend Routes:** `/backend/src/routes/admin.ts` (new)
- **Frontend UI:** `/apps/web/src/app/admin/page.tsx` (new)
- **Database Schema:** `/backend/prisma/schema.prisma` (updated)
- **Access:** http://localhost:3000/admin

### API Documentation
- **OpenAPI Spec:** `/backend/src/openapi.json` (new)
- **Endpoint:** `GET /api/docs`
- **JSON Format:** OpenAPI 3.0.0

### Error Tracking
- **Init Module:** `/apps/web/src/lib/sentry.ts` (new)
- **Provider:** `/apps/web/src/components/SentryProvider.tsx` (new)
- **Config:** `/apps/web/src/app/layout.tsx` (updated)

---

## Key Functions

### SEO
```typescript
import { getMetadata } from '@/lib/seo';

export async function generateMetadata({ params, searchParams }) {
  return getMetadata(
    'Page Title',
    'Page description for search engines',
    { url: '/path', image: '/image.png' }
  );
}
```

### Admin Routes
```bash
# Get stats
GET /api/admin/stats
Authorization: Bearer {token}

# Get entities
GET /api/admin/entities
Authorization: Bearer {token}

# Block entity
POST /api/admin/entities/{id}/block
Authorization: Bearer {token}
Content-Type: application/json
{"reason": "...", "entityType": "politician"}

# Unblock entity
DELETE /api/admin/entities/{id}/block
Authorization: Bearer {token}
Content-Type: application/json
{"entityType": "politician"}

# Get blocked list
GET /api/admin/blocked
Authorization: Bearer {token}

# Get error logs
GET /api/admin/errors
Authorization: Bearer {token}
```

### Sentry Error Tracking
```typescript
import { captureException, captureMessage } from '@/lib/sentry';

// Capture exception
try {
  await fetchData();
} catch (error) {
  captureException(error as Error, { context: 'data' });
}

// Capture message
captureMessage('User action completed', 'info', { userId: '123' });
```

---

## Environment Variables

### Required for Admin Panel
- None (uses existing auth)

### Optional for Error Tracking
```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@yyyy.ingest.sentry.io/zzzzz
```

### Optional for API Documentation
- None (endpoints always enabled)

---

## Database Migrations

### Add Admin Model
```bash
npx prisma migrate dev --name add_admin_model
```

### Create Admin User
```sql
INSERT INTO "Admin" (id, "userId", role, "createdAt")
VALUES ('cuid_value', 'user_id', 'admin', NOW());
```

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/admin/stats` | JWT | Get platform statistics |
| GET | `/api/admin/entities` | JWT | List recent analyses |
| GET | `/api/admin/blocked` | JWT | List blocked entities |
| POST | `/api/admin/entities/:id/block` | JWT | Block an entity |
| DELETE | `/api/admin/entities/:id/block` | JWT | Unblock an entity |
| GET | `/api/admin/errors` | JWT | Get recent errors |
| GET | `/api/docs` | None | Get OpenAPI spec |

---

## Testing Checklist

- [ ] Visit `/admin` and verify access control
- [ ] Test stats load correctly
- [ ] Test blocking/unblocking entities
- [ ] Verify OpenAPI spec at `/api/docs`
- [ ] Test Sentry error capture in console
- [ ] Check SEO tags in page source

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Admin 403 Forbidden | Create Admin profile in database for user |
| Stats not loading | Check JWT token valid, API URL correct |
| Sentry not capturing | Verify DSN in .env.local, check browser console |
| SEO tags missing | Ensure page has `generateMetadata()` export |
| OpenAPI 404 | Check backend running, `/api/docs` endpoint exists |

---

## Architecture Diagram

```
Frontend (/admin)
    ↓
Auth Middleware (JWT check)
    ↓
Admin Check (Query Admin in DB)
    ↓
Admin Routes
    ├─ GET /stats → Count queries
    ├─ GET /entities → Recent analyses
    ├─ GET /blocked → Blocked entity list
    ├─ POST /block → Mark blocked_entity
    └─ DELETE /block → Delete blocked_entity

Sentry Provider
    ↓
Error Capture
    ├─ Auto exceptions
    ├─ Manual captureException()
    └─ captureMessage()
    ↓
Sentry Cloud (sentry.io)
```

---

**Ready to deploy!** See `PHASE_C_IMPLEMENTATION.md` for detailed docs.
