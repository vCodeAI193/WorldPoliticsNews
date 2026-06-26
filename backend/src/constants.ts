export const TOKEN_TTL = {
  ACCESS: '15m',
  REFRESH: '30d',
  REFRESH_MS: 30 * 24 * 60 * 60 * 1000,
} as const;

export const CACHE_TTL = {
  FREE_MS: 60 * 60 * 1000,
  PLUS_MS: 30 * 60 * 1000,
} as const;

export const RATE_LIMIT = {
  GLOBAL_WINDOW_MS: 15 * 60 * 1000,
  GLOBAL_MAX: 200,
  ANALYSIS_WINDOW_MS: 60 * 60 * 1000,
  ANALYSIS_MAX: 20,
  AUTH_LOGIN_WINDOW_MS: 15 * 60 * 1000,
  AUTH_LOGIN_MAX: 10,
  AUTH_REGISTER_WINDOW_MS: 15 * 60 * 1000,
  AUTH_REGISTER_MAX: 5,
} as const;
