// Ensure required env vars are set before any module loads the validator in index.ts
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-chars-long';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-32-chars';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.DEMO_MODE = 'true';
