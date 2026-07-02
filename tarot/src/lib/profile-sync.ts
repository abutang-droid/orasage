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

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';

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
