import { AUTH_BASE_URL } from './urls';

/** publicUser 形状 — 对应 auth-service/src/lib/auth-user.ts */
export type OrasageUser = {
  id: number;
  displayId: string | null;
  displayName: string;
  email: string;
  nickname: string | null;
  avatarUrl: string | null;
  birthDate: string | null;
  birthHour: string | null;
  birthPlaceProvince: string | null;
  birthPlaceCity: string | null;
  gender: 'male' | 'female' | null;
  preferredDeity: string | null;
  languagePreference: string | null;
  role: string;
  createdAt: string;
  lastSignedIn: string | null;
};

export type AuthResponse = { token: string; user: OrasageUser };

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${AUTH_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const message = typeof data.error === 'string' ? data.error : `请求失败（${res.status}）`;
    throw new ApiError(res.status, message);
  }
  return data as T;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export function register(
  email: string,
  password: string,
  nickname?: string,
): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { email, password, nickname: nickname || undefined },
  });
}

export function fetchMe(token: string): Promise<{ user: OrasageUser }> {
  return request<{ user: OrasageUser }>('/auth/me', { token });
}
