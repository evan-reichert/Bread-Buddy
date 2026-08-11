export type Credentials = {
  username: string;
  password: string;
};

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  access_token_expires_in: number;
  refresh_token_expires_in: number;
};

export type LoginResponse = TokenPair & {
  username: string;
  message: string;
};

export type RegisterResponse = TokenPair & {
  id: string;
  username: string;
  created_at: string;
  message: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');

const STORAGE_KEYS = {
  accessToken: 'bb_access_token',
  refreshToken: 'bb_refresh_token',
  tokenType: 'bb_token_type',
  username: 'bb_username',
  lastActivityAt: 'bb_last_activity_at',
};

export const SESSION_INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000;

async function requestJson<T>(path: string, body: object): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Unable to reach the API. Make sure the backend is running.');
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const details = payload && payload.detail;
    const validationMessage =
      Array.isArray(details) && details.length > 0 && typeof details[0]?.msg === 'string'
        ? details[0].msg
        : null;
    const message =
      (typeof details === 'string' && details) ||
      validationMessage ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

export async function registerUser(credentials: Credentials): Promise<RegisterResponse> {
  return requestJson<RegisterResponse>('/register', credentials);
}

export async function loginUser(credentials: Credentials): Promise<LoginResponse> {
  return requestJson<LoginResponse>('/login', credentials);
}

export async function refreshToken(refresh_token: string): Promise<TokenPair> {
  return requestJson<TokenPair>('/token/refresh', { refresh_token });
}

export function persistSession(tokenPair: TokenPair, username: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, tokenPair.access_token);
  localStorage.setItem(STORAGE_KEYS.refreshToken, tokenPair.refresh_token);
  localStorage.setItem(STORAGE_KEYS.tokenType, tokenPair.token_type);
  localStorage.setItem(STORAGE_KEYS.username, username);
  touchSessionActivity();
}

export function hasStoredSession(): boolean {
  return Boolean(
    localStorage.getItem(STORAGE_KEYS.accessToken) &&
      localStorage.getItem(STORAGE_KEYS.refreshToken),
  );
}

// Token helpers
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.accessToken);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.refreshToken);
}

export function setAccessToken(newToken: string): void {
  localStorage.setItem(STORAGE_KEYS.accessToken, newToken);
}

export function setRefreshToken(newToken: string): void {
  localStorage.setItem(STORAGE_KEYS.refreshToken, newToken);
}

// Shared request wrappers for authenticated API calls
async function authorizedRequest<T>(
  method: 'GET' | 'PUT',
  path: string,
  body?: object,
): Promise<T> {
  const execute = async (accessToken: string): Promise<Response> => {
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          ...(body ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new Error('Unable to reach the API. Make sure the backend is running.');
    }
  };

  const parseJson = async (response: Response): Promise<unknown> => {
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return response.json();
  };

  const currentAccessToken = getAccessToken();
  if (!currentAccessToken) {
    clearStoredSession();
    throw new Error('Authentication required. Please sign in again.');
  }

  let response = await execute(currentAccessToken);

  if (response.status === 401) {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      clearStoredSession();
      throw new Error('Session expired. Please sign in again.');
    }

    try {
      const refreshedPair = await refreshToken(currentRefreshToken);
      setAccessToken(refreshedPair.access_token);
      setRefreshToken(refreshedPair.refresh_token);
      response = await execute(refreshedPair.access_token);
    } catch {
      clearStoredSession();
      throw new Error('Session expired. Please sign in again.');
    }
  }

  const payload = await parseJson(response);
  if (!response.ok) {
    const details = payload && (payload as { detail?: unknown }).detail;
    const message =
      (typeof details === 'string' && details) ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
  localStorage.removeItem(STORAGE_KEYS.tokenType);
  localStorage.removeItem(STORAGE_KEYS.username);
  localStorage.removeItem(STORAGE_KEYS.lastActivityAt);
}

function getLastActivityTimestamp(): number | null {
  const raw = localStorage.getItem(STORAGE_KEYS.lastActivityAt);
  if (!raw) {
    return null;
  }

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function touchSessionActivity(): void {
  localStorage.setItem(STORAGE_KEYS.lastActivityAt, String(Date.now()));
}

export function isSessionExpired(timeoutMs = SESSION_INACTIVITY_TIMEOUT_MS): boolean {
  const lastActivityAt = getLastActivityTimestamp();
  if (lastActivityAt === null) {
    return false;
  }

  return Date.now() - lastActivityAt >= timeoutMs;
}

// Authenticated GET call
export async function authenticatedGet<T>(path: string): Promise<T> {
  return authorizedRequest<T>('GET', path);
}

// Authenticated PUT call
export async function authenticatedPut<T>(path: string, body: object): Promise<T> {
  return authorizedRequest<T>('PUT', path, body);
}
