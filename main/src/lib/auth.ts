const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';

export type AuthUser = {
  id: number;
  displayId: string | null;
  displayName: string;
  email: string;
  nickname: string;
  avatarUrl: string | null;
  birthDate: string | null;
  birthHour: string | null;
  birthPlaceProvince: string | null;
  birthPlaceCity: string | null;
  gender: string | null;
  preferredDeity: string | null;
  languagePreference: string | null;
  role: string;
  createdAt: string;
  lastSignedIn: string;
};

export type SavedProfile = {
  id: number;
  label: string | null;
  name: string;
  gender: string | null;
  birthYear: string | null;
  birthMonth: string | null;
  birthDay: string | null;
  birthHour: string | null;
  birthMinute: string | null;
  birthPlaceProvince: string | null;
  birthPlaceCity: string | null;
  birthPlaceLongitude: string | null;
  sourceApp: string | null;
  sourceAppLabel: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserOrder = {
  id: number;
  orderNo: string;
  title: string;
  amountCents: number;
  currency: string;
  amountDisplay: string;
  status: string;
  statusLabel: string;
  appSource: string | null;
  appLabel: string | null;
  shippingAddress: string | null;
  sku: string | null;
  recommendationContext: string | null;
  readingId: string | null;
  createdAt: string;
};

export type UserReading = {
  id: number;
  appSource: string;
  appLabel: string;
  readingId: string;
  title: string;
  summary: string | null;
  recommendationReason: string | null;
  crystalSku: string | null;
  createdAt: string;
};

export type UserRecommendation = {
  id: number;
  appSource: string;
  appLabel: string;
  crystalSku: string;
  reason: string;
  readingId: string | null;
  createdAt: string;
};

export type ProfileSyncPayload = {
  name: string;
  gender?: 'male' | 'female' | null;
  birthYear?: string | null;
  birthMonth?: string | null;
  birthDay?: string | null;
  birthHour?: string | null;
  birthMinute?: string | null;
  birthPlaceProvince?: string | null;
  birthPlaceCity?: string | null;
  birthPlaceLongitude?: string | null;
  sourceApp: 'bazi' | 'ziwei' | 'tarot';
  label?: string | null;
};

async function authFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${AUTH_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  return res;
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await authFetch('/auth/me');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`auth/me failed: ${res.status}`);
  const data = await res.json();
  return data.user as AuthUser;
}

export async function updateProfile(body: { nickname?: string }): Promise<AuthUser> {
  const res = await authFetch('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `profile update failed: ${res.status}`);
  }
  const data = await res.json();
  return data.user as AuthUser;
}

export async function logout(): Promise<void> {
  await authFetch('/auth/logout', { method: 'POST' });
}

export async function fetchSavedProfiles(): Promise<SavedProfile[]> {
  const res = await authFetch('/auth/me/profiles');
  if (!res.ok) throw new Error(`profiles fetch failed: ${res.status}`);
  const data = await res.json();
  return data.profiles as SavedProfile[];
}

export async function createSavedProfile(body: Partial<SavedProfile> & { name: string }): Promise<SavedProfile> {
  const res = await authFetch('/auth/me/profiles', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `create profile failed: ${res.status}`);
  }
  const data = await res.json();
  return data.profile as SavedProfile;
}

export async function syncSavedProfile(payload: ProfileSyncPayload): Promise<SavedProfile | null> {
  const res = await authFetch('/auth/me/profiles/sync', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (res.status === 401) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `sync profile failed: ${res.status}`);
  }
  const data = await res.json();
  return data.profile as SavedProfile;
}

export async function updateSavedProfile(id: number, body: Partial<SavedProfile> & { name: string }): Promise<SavedProfile> {
  const res = await authFetch(`/auth/me/profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `update profile failed: ${res.status}`);
  }
  const data = await res.json();
  return data.profile as SavedProfile;
}

export async function deleteSavedProfile(id: number): Promise<void> {
  const res = await authFetch(`/auth/me/profiles/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`delete profile failed: ${res.status}`);
}

export async function fetchOrders(): Promise<UserOrder[]> {
  const res = await authFetch('/auth/me/orders');
  if (!res.ok) throw new Error(`orders fetch failed: ${res.status}`);
  const data = await res.json();
  return data.orders as UserOrder[];
}

export async function fetchReadings(): Promise<UserReading[]> {
  const res = await authFetch('/auth/me/readings');
  if (!res.ok) throw new Error(`readings fetch failed: ${res.status}`);
  const data = await res.json();
  return data.readings as UserReading[];
}

export async function fetchRecommendations(): Promise<UserRecommendation[]> {
  const res = await authFetch('/auth/me/recommendations');
  if (!res.ok) throw new Error(`recommendations fetch failed: ${res.status}`);
  const data = await res.json();
  return data.recommendations as UserRecommendation[];
}

export function profileLoginUrl(locale: string, path = '/profile'): string {
  const returnUrl = encodeURIComponent(`https://orasage.com/${locale}${path}`);
  return `${AUTH_URL}/login?redirect=${returnUrl}`;
}
