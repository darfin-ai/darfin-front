import { request, setTokens, BASE_URL } from './apiClient';

export async function signup({ email, password, name, phone, nickname, profileImage }) {
  return request('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, phone, nickname, profileImage }),
  });
}

export async function login({ email, password }) {
  const data = await request('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function findId({ name, phone }) {
  return request('/api/v1/auth/find-id', {
    method: 'POST',
    body: JSON.stringify({ name, phone }),
  });
}

export async function resetPassword({ email }) {
  return request('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function logout(refreshToken) {
  return request('/api/v1/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function getSocialLoginUrl(provider) {
  // provider: 'kakao' | 'google'
  return `${BASE_URL}/api/v1/auth/oauth2/authorize/${provider}`;
}
