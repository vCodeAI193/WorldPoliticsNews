import Constants from 'expo-constants';
import { getAccessToken, refreshAccessToken } from './auth';
import type { ApiResponse, AnalysisResult, SearchResult, TrendingEntity, WatchlistItem, UserPublic } from '@wpn/shared-types';

const BASE: string = Constants.expoConfig?.extra?.API_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) return apiFetch<T>(path, init);
  }

  const data: ApiResponse<T> = await res.json();
  if (!data.success) throw new Error((data as any).error);
  return (data as any).data;
}

function entityApi(type: 'politician' | 'party') {
  const plural = type === 'politician' ? 'politicians' : 'parties';
  return {
    search: (q: string) =>
      apiFetch<SearchResult>(`/api/${plural}/search?q=${encodeURIComponent(q)}`),
    analysis: (id: string, name: string) =>
      apiFetch<AnalysisResult>(`/api/${plural}/${id}/analysis?name=${encodeURIComponent(name)}`),
  };
}

export const api = {
  politicians: entityApi('politician'),
  parties: entityApi('party'),
  watchlist: {
    get: () => apiFetch<WatchlistItem[]>('/api/watchlist'),
    add: (item: Omit<WatchlistItem, 'id' | 'createdAt'>) =>
      apiFetch<WatchlistItem>('/api/watchlist', { method: 'POST', body: JSON.stringify(item) }),
    remove: (id: string) => apiFetch<null>(`/api/watchlist/${id}`, { method: 'DELETE' }),
  },
  auth: {
    register: (email: string, password: string) =>
      apiFetch<{ token: string; refreshToken: string; user: UserPublic }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      apiFetch<{ token: string; refreshToken: string; user: UserPublic }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: (refreshToken: string) =>
      apiFetch<null>('/api/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  },
  users: {
    me: () => apiFetch<UserPublic>('/api/users/me'),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiFetch<null>('/api/users/me/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    deleteAccount: (password: string) =>
      apiFetch<null>('/api/users/me', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      }),
  },
  trending: {
    get: () => apiFetch<TrendingEntity[]>('/api/trending'),
  },
  subscriptions: {
    createCheckout: () => apiFetch<{ url: string }>('/api/subscriptions/create-checkout', { method: 'POST' }),
  },
};
