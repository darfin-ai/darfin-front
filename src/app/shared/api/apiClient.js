const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export function getAccessToken() {
  return localStorage.getItem('darfin_access_token');
}

export function getRefreshToken() {
  return localStorage.getItem('darfin_refresh_token');
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem('darfin_access_token', accessToken);
  localStorage.setItem('darfin_refresh_token', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('darfin_access_token');
  localStorage.removeItem('darfin_refresh_token');
  localStorage.removeItem('darfin_user');
  localStorage.removeItem('darfin_logged_in');
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/api/v1/auth/reissue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearTokens();
    throw new Error('Refresh failed');
  }

  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

// 비밀번호 검증이 필요한 엔드포인트는 401이 "비밀번호 오류"를 의미하므로 토큰 재시도 제외
const NO_RETRY_PATHS = ['/api/v1/users/me/password', '/api/v1/users/me'];

export async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const token = getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res = await fetch(url, { ...options, headers });

  const skipRetry = NO_RETRY_PATHS.some(
    (p) => path === p && (options.method === 'DELETE' || options.method === 'PATCH'),
  );

  if (res.status === 401 && getRefreshToken() && !skipRetry) {
    try {
      const newToken = await tryRefresh();
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw { status: 401, message: '세션이 만료되었습니다. 다시 로그인해주세요.' };
    }
  }

  const text = await res.text();

  if (!res.ok) {
    let err = {};
    try { err = JSON.parse(text); } catch { /* empty body */ }
    throw { status: res.status, message: err.message || err.errorMessage || err.error || '서버 오류가 발생했습니다.' };
  }

  return text ? JSON.parse(text) : null;
}

export { BASE_URL };
