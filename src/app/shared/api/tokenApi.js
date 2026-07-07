import { request } from './apiClient';

export async function getMyTokenStatus() {
  return request('/api/v1/tokens/me', { method: 'GET' });
}

export async function getTokenHistory() {
  return request('/api/v1/tokens/history', { method: 'GET' });
}
