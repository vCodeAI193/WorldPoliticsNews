// Auth
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserPublic;
}

export interface UserPublic {
  id: string;
  email: string;
  subscriptionTier: 'free' | 'plus';
  createdAt: string;
}

// Politicians / Parties
export interface Entity {
  id: string;           // Wikidata Q-ID (e.g. "Q567")
  name: string;
  country: string;
  type: 'politician' | 'party';
  imageUrl?: string;
  description?: string;
}

export interface SearchResult {
  entities: Entity[];
  total: number;
}

// AI Analysis
export interface ArticleSnippet {
  title: string;
  url: string;
  source: string;
  date: string;
  snippet: string;
  sentiment: number;    // -1.0 to 1.0
}

export type SentimentLabel =
  | 'sehr negativ'
  | 'negativ'
  | 'neutral'
  | 'positiv'
  | 'sehr positiv';

export interface AnalysisResult {
  entityId: string;
  entityName: string;
  entityType: 'politician' | 'party';
  summary: string;
  sentiment: number;    // -1.0 to 1.0
  sentimentLabel: SentimentLabel;
  articles: ArticleSnippet[];
  keywords: string[];
  generatedAt: string;
  expiresAt: string;
  cached: boolean;
}

// Watchlist
export interface WatchlistItem {
  id: string;
  entityType: 'politician' | 'party';
  entityId: string;
  entityName: string;
  entityCountry?: string;
  createdAt: string;
}

// Trending
export interface TrendingEntity {
  entityId: string;
  entityName: string;
  entityType: 'politician' | 'party';
  sentiment: number;
  sentimentLabel: SentimentLabel;
  generatedAt: string;
}

export interface AnalysisHistoryPoint {
  sentiment: number;
  sentimentLabel: SentimentLabel;
  generatedAt: string;
}

// API response wrappers
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Sentiment helpers
export function toSentimentLabel(score: number): SentimentLabel {
  if (score <= -0.6) return 'sehr negativ';
  if (score <= -0.2) return 'negativ';
  if (score < 0.2) return 'neutral';
  if (score < 0.6) return 'positiv';
  return 'sehr positiv';
}

// Subscription
export interface SubscriptionStatus {
  tier: 'free' | 'plus';
  stripeCustomerId?: string;
  nextBillingDate?: string;
}

// Pricing
export interface PricingPlan {
  id: 'free' | 'plus';
  name: string;
  price: number;
  currency: string;
  interval: 'month' | null;
  features: string[];
}
