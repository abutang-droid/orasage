export type ProfileSyncSource = 'bazi' | 'ziwei' | 'tarot';

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
  sourceApp: ProfileSyncSource;
  label?: string | null;
};

const AUTH_URL = (import.meta.env.VITE_AUTH_URL as string | undefined) || 'https://auth.orasage.com';

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

export async function fetchSavedProfiles(): Promise<SavedProfile[]> {
  try {
    const res = await fetch(`${AUTH_URL}/auth/me/profiles`, { credentials: 'include' });
    if (res.status === 401) return [];
    if (!res.ok) return [];
    const data = await res.json();
    return (data.profiles ?? []) as SavedProfile[];
  } catch {
    return [];
  }
}

export function profileDisplayLabel(p: SavedProfile): string {
  const birth = [p.birthYear, p.birthMonth, p.birthDay].filter(Boolean).join('-');
  const tag = p.label ? `[${p.label}] ` : '';
  return `${tag}${p.name}${birth ? ` · ${birth}` : ''}`;
}

export async function syncSavedProfile(payload: ProfileSyncPayload): Promise<void> {
  if (!payload.name?.trim()) return;
  try {
    const res = await fetch(`${AUTH_URL}/auth/me/profiles/sync`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.status === 401) return;
    if (!res.ok) console.warn('[profile-sync] failed:', res.status);
  } catch (err) {
    console.warn('[profile-sync] error:', err);
  }
}
