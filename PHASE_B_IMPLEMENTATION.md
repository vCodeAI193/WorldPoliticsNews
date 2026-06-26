# Phase B – User Retention Implementation

This document outlines the implementation of Phase B features for WorldPoliticsNews, which focuses on retaining users and increasing engagement through notifications, newsletters, and comparison history.

## Features Implemented

### 1. Notification Dashboard

**Components:**
- `/apps/web/src/components/ui/NotificationBell.tsx` - Bell icon with unread count badge
- `/apps/web/src/app/benachrichtigungen/page.tsx` - Full notifications page

**Backend:**
- `backend/src/routes/notifications.ts` - API endpoints for notifications
- `backend/src/services/notificationService.ts` - Notification creation and management logic

**Database Models:**
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // 'new_analysis', 'sentiment_change'
  entityId  String
  entityName String
  message   String
  link      String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}
```

**API Endpoints:**
- `GET /api/notifications` - Get user's notifications with unread count (auth required)
- `PATCH /api/notifications/:id/read` - Mark notification as read (auth required)
- `DELETE /api/notifications/:id` - Delete notification (auth required)

**Features:**
- Real-time notification bell in header with unread count
- Notifications page showing all notifications
- Auto-refresh every 60 seconds
- Visual distinction between read and unread
- Quick links to view related entities

### 2. Newsletter Setup

**Components:**
- `/apps/web/src/components/ui/NewsletterPreferences.tsx` - Newsletter preference editor
- Integrated into `/apps/web/src/app/konto/page.tsx` (Account page)

**Backend:**
- `backend/src/routes/newsletter.ts` - API endpoints for newsletter management
- `backend/src/services/newsletterService.ts` - Newsletter logic (send, fetch subscribers, etc.)

**Database Models:**
```prisma
model NewsletterSubscription {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscribed Boolean  @default(true)
  frequency String   @default("weekly") // weekly, daily, never
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model NewsletterIssue {
  id         String   @id @default(cuid())
  sentAt     DateTime?
  topEntities Json     // array of {entityId, entityName, sentiment}
  createdAt  DateTime @default(now())

  @@index([sentAt])
}
```

**API Endpoints:**
- `GET /api/newsletter/preferences` - Get user's newsletter settings (auth required)
- `PUT /api/newsletter/preferences` - Update newsletter settings (auth required)

**Features:**
- Subscribe/unsubscribe toggle
- Frequency selection: daily, weekly, never
- Auto-creates default subscription for new users
- Newsletter sending is handled via scheduled Cron jobs (document below)

**Cron Job Implementation (TODO):**
```bash
# Daily task (run at 6 AM)
# backend/src/tasks/sendDailyNewsletter.ts
- Fetch all daily subscribers
- Get top 10 entities (mix of positive and negative sentiment)
- Send email to each subscriber
- Record sent issue

# Weekly task (run every Monday at 6 AM)
# backend/src/tasks/sendWeeklyNewsletter.ts
- Fetch all weekly subscribers
- Get top 15 entities from past week
- Send email to each subscriber
- Record sent issue
```

### 3. Sentiment Change Alerts

**Auto-Generation Logic:**
When a sentiment analysis is updated and the change exceeds a threshold (e.g., 15%), a notification is automatically created for all users watching that entity.

**Integration Points:**
- Hook into `/api/politicians/:id/refresh` and `/api/parties/:id/refresh` endpoints
- When `oldSentiment` vs `newSentiment` differs by >15%, create notifications

**Service Function:**
```typescript
createSentimentChangeNotification(
  userId: string,
  entityId: string,
  entityName: string,
  entityType: string,
  oldSentiment: number,
  newSentiment: number
)
```

**Notification Message Example:**
- "Stimmung verbessert sich um 18.5% (0.42 → 0.61)"
- "Stimmung verschlechtert sich um 22.3% (0.68 → 0.46)"

### 4. Comparison History

**Components:**
- `/apps/web/src/app/meine-vergleiche/page.tsx` - Comparison history page

**Backend:**
- `backend/src/routes/comparisons.ts` - API endpoints for comparison management
- `backend/src/services/comparisonService.ts` - Comparison history logic

**Database Model:**
```prisma
model ComparisonHistory {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  entityIds   Json     // array of 2-4 entity IDs
  entityNames Json     // array of names
  entityTypes Json     // array of types
  title       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, createdAt])
}
```

**API Endpoints:**
- `GET /api/comparisons` - Get user's saved comparisons (auth required)
- `POST /api/comparisons` - Save new comparison (auth required)
- `DELETE /api/comparisons/:id` - Delete comparison (auth required)

**Features:**
- Automatically save comparisons when users view them
- Quick load button to open comparison
- Delete individual comparisons
- Shows comparison date
- Displays all compared entities
- Optional custom title

## Integration Points

### 1. Header Updates
- NotificationBell component added to Header
- "Meine Vergleiche" link added to navigation

### 2. Account Page Updates
- NewsletterPreferences component added to account settings

### 3. Database Migrations
- `backend/prisma/migrations/20260626_add_user_retention_features/migration.sql`
- Creates Notification, NewsletterSubscription, NewsletterIssue, and ComparisonHistory tables
- Creates appropriate indexes for performance

### 4. Backend Routes Registration
- All new routes registered in `backend/src/index.ts`

## Next Steps / Todo

### High Priority
1. **Implement Cron Jobs for Newsletter Sending**
   - Set up daily newsletter task
   - Set up weekly newsletter task
   - Email template creation
   - Email service integration

2. **Integrate Sentiment Change Notifications**
   - Hook into analysis update endpoints
   - Compare old vs new sentiment
   - Create notifications for watchers (fetch from watchlist)
   - Set sentiment change threshold

3. **Auto-save Comparison History**
   - Hook into comparison view endpoint (if exists)
   - Auto-save when users compare 2-4 entities
   - Prevent duplicates

### Medium Priority
1. **Email Templates**
   - Newsletter template (HTML/text)
   - Notification digest template
   - Email styling and branding

2. **Testing**
   - Unit tests for notification service
   - Integration tests for API endpoints
   - E2E tests for UI flows

3. **Notifications Management**
   - Add "Mark all as read" feature
   - Add notification filters (by type, date)
   - Add notification count to page title

### Lower Priority
1. **Analytics**
   - Track notification open rates
   - Track newsletter subscription metrics
   - Track comparison usage
   - User retention metrics

2. **Advanced Features**
   - Notification preferences per entity type
   - Custom notification frequency per entity
   - Comparison sharing/export
   - Comparison templates

## Testing Checklist

- [ ] Create notification manually via API
- [ ] View notification bell shows correct count
- [ ] Click notification bell navigates to notifications page
- [ ] Mark notification as read
- [ ] Delete notification
- [ ] Save newsletter preferences
- [ ] Create comparison via API
- [ ] View saved comparisons list
- [ ] Load comparison from history
- [ ] Delete comparison
- [ ] Test pagination/limits on endpoints
- [ ] Test auth requirements on all endpoints

## Performance Considerations

1. **Notification Indexes:** Created indexes on `(userId, read)` and `(userId, createdAt)` for fast queries
2. **Cleanup Task:** Implement cleanup of notifications older than 30 days
3. **Newsletter Batching:** Send newsletters in batches to avoid overwhelming email service
4. **Caching:** Cache newsletter subscribers list during send operations

## Security Notes

- All endpoints require authentication
- User can only access their own notifications, subscriptions, and comparisons
- Input validation on all endpoints (Zod schemas)
- No data leakage between users
- Proper cascade delete on User deletion
