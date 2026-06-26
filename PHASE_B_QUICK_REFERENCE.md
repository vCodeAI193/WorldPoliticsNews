# Phase B – Quick Reference Guide

## What Was Implemented

### 1. Notification Dashboard ✓
- Bell icon in header showing unread count
- Dedicated notifications page at `/benachrichtigungen`
- Mark notifications as read/delete
- Real-time sync with 60-second refresh

**Files:**
- `apps/web/src/components/ui/NotificationBell.tsx`
- `apps/web/src/app/benachrichtigungen/page.tsx`
- `backend/src/routes/notifications.ts`
- `backend/src/services/notificationService.ts`

### 2. Newsletter Setup ✓
- Subscribe/unsubscribe toggle
- Frequency selection (daily, weekly, never)
- Integrated into account page
- Persisted preferences in database

**Files:**
- `apps/web/src/components/ui/NewsletterPreferences.tsx`
- `backend/src/routes/newsletter.ts`
- `backend/src/services/newsletterService.ts`

### 3. Sentiment Change Alerts ✓
- Service functions created for auto-notification
- Ready for integration with analysis update endpoints
- Tracks sentiment deltas and notifies watchers

**Files:**
- `backend/src/services/notificationService.ts` (see `createSentimentChangeNotification`)

### 4. Comparison History ✓
- Save comparisons for later viewing
- View all saved comparisons
- Quick-load from history
- Delete individual comparisons
- Optional custom titles

**Files:**
- `apps/web/src/app/meine-vergleiche/page.tsx`
- `backend/src/routes/comparisons.ts`
- `backend/src/services/comparisonService.ts`

## Database Changes

**New Tables:**
- `Notification` - User notifications with read status
- `NewsletterSubscription` - User newsletter preferences
- `NewsletterIssue` - Sent newsletter records
- `ComparisonHistory` - User's saved comparisons

**Updated Tables:**
- `User` - Added relations to new tables

**Migration:**
- `backend/prisma/migrations/20260626_add_user_retention_features/migration.sql`

## API Endpoints Added

### Notifications
```
GET    /api/notifications          - Get user's notifications
PATCH  /api/notifications/:id/read - Mark as read
DELETE /api/notifications/:id      - Delete notification
```

### Newsletter
```
GET    /api/newsletter/preferences - Get subscription settings
PUT    /api/newsletter/preferences - Update subscription settings
```

### Comparisons
```
GET    /api/comparisons      - List user's comparisons
POST   /api/comparisons      - Save new comparison
DELETE /api/comparisons/:id  - Delete comparison
```

## Frontend Changes

### Header (`apps/web/src/components/layout/Header.tsx`)
- Added NotificationBell component
- Added "Meine Vergleiche" navigation link

### Account Page (`apps/web/src/app/konto/page.tsx`)
- Added NewsletterPreferences component

## How to Test

### 1. Test Notifications
```bash
# Create a test notification manually
curl -X POST http://localhost:3001/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "sentiment_change",
    "entityId": "test-entity",
    "entityName": "Test Entity",
    "message": "Test message",
    "link": "/politiker/test-entity"
  }'

# View notifications
curl http://localhost:3001/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Newsletter Preferences
```bash
# Get preferences
curl http://localhost:3001/api/newsletter/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update preferences
curl -X PUT http://localhost:3001/api/newsletter/preferences \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscribed": true, "frequency": "daily"}'
```

### 3. Test Comparison History
```bash
# Save a comparison
curl -X POST http://localhost:3001/api/comparisons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entityIds": ["entity1", "entity2"],
    "entityNames": ["Entity 1", "Entity 2"],
    "entityTypes": ["politician", "politician"],
    "title": "My Comparison"
  }'

# List comparisons
curl http://localhost:3001/api/comparisons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

### Immediate (Before Launch)
1. **Add Cron Jobs**
   - Daily newsletter task
   - Weekly newsletter task
   - Old notification cleanup

2. **Integration Hooks**
   - Hook sentiment change detection into analysis endpoints
   - Hook comparison save into comparison view endpoint
   - Hook watchlist notifications into new analysis

3. **Email Templates**
   - Create newsletter template
   - Create notification digest template

### Short Term (Week 1-2)
1. Test all endpoints with real data
2. Set up email service (Resend, SendGrid, etc.)
3. Deploy migrations to production
4. Implement cron tasks
5. Monitor user adoption

### Medium Term (Week 2-4)
1. Add notification filters and preferences
2. Implement notification digest mode
3. Add analytics tracking
4. User retention metrics dashboard

## Database Migration Commands

```bash
# Generate migrations from schema changes
npm run prisma:migrate:dev

# Apply migrations to production
npm run prisma:migrate:deploy

# Reset database (DEV ONLY)
npm run prisma:reset

# View database
npm run prisma:studio
```

## Troubleshooting

**Notifications not showing:**
- Check token is valid
- Verify userId in database
- Check notification index creation

**Newsletter preferences not saving:**
- Verify PUT method
- Check Content-Type header
- Review error response

**Comparisons not persisting:**
- Verify entityIds/Names/Types array lengths match
- Check userId is correct
- Review cascade delete rules

## Performance Notes

- Notification queries are indexed on `(userId, read)` and `(userId, createdAt)`
- Newsletter subscriber queries use indexes on `frequency` and `subscribed`
- Comparison queries are indexed on `(userId, createdAt)`
- Keep notification retention at 30 days max (cleanup task needed)
- Consider batch operations for newsletter sending

## Security Notes

- All endpoints require valid JWT token
- Users can only access their own data
- Input validated with Zod schemas
- Proper cascade delete on user deletion
- Rate limiting applies to all endpoints
