# Sentry Setup Guide

## Prerequisites
- Free tier account at [sentry.io](https://sentry.io)

## Setup Steps

### 1. Create Sentry Account
- Go to https://sentry.io
- Sign up for free tier
- Create new project (select Next.js)

### 2. Get DSN
- Copy your DSN from Project Settings
- DSN format: `https://key@sentry.io/projectid`

### 3. Add to .env.local
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/projectid
```

### 4. Test Error Tracking
- Open the app in development mode: `npm run dev`
- Errors will be logged to the console in development
- In production, errors will be sent to Sentry

## Features
- ✅ Automatic error tracking via Error Boundaries
- ✅ Performance monitoring with tracing
- ✅ Session replay on errors (1 in 10 sessions)
- ✅ Release tracking
- ✅ Source map support
- ✅ React Error Boundary integration

## Implementation Details

### Files Involved
- `/apps/web/src/lib/sentry.ts` - Sentry initialization and utility functions
- `/apps/web/src/components/SentryProvider.tsx` - Client-side Sentry setup
- `/apps/web/src/components/layout/ErrorBoundary.tsx` - Error boundary with Sentry integration
- `/apps/web/src/app/layout.tsx` - Root layout with SentryProvider

### Error Boundary
The `ErrorBoundary` component catches React errors and automatically sends them to Sentry with component stack information. It displays a user-friendly error message in German.

### Utility Functions
- `initSentry()` - Initialize Sentry on the client
- `captureException(error, context)` - Manually capture exceptions
- `captureMessage(message, level, context)` - Manually capture messages

### Configuration
- **Traces Sample Rate**: 100% in development, 10% in production
- **Replay Sample Rate**: 10% of sessions recorded
- **Error Replay Rate**: 100% on errors
- **Development**: Errors NOT sent to Sentry (see beforeSend)

## Dashboard
View errors at: https://sentry.io/organizations/your-org/issues

## Note
- Errors in development (NODE_ENV=development) are NOT sent to Sentry by default
- Set `NEXT_PUBLIC_SENTRY_DSN` to enable error tracking
- The `SentryProvider` wrapper in the layout ensures client-side initialization
