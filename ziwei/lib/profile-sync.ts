import type { BirthFormState } from '@/components/BirthForm';
import type { SavedProfile } from '../../shared/profile-sync/fetch';
import { fetchSavedProfiles, profileDisplayLabel } from '../../shared/profile-sync/fetch';

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

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || process.env.AUTH_URL || 'https://auth.orasage.com';

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

export function birthFormToProfileSync(
  form: BirthFormState,
  options?: { label?: string | null },
): ProfileSyncPayload {
  return {
    name: form.name.trim() || '命主',
    gender: form.gender,
    birthYear: form.year || null,
    birthMonth: form.month || null,
    birthDay: form.day || null,
    birthHour: form.unknownTime ? null : form.clockHour || null,
    birthMinute: form.unknownTime ? null : form.clockMinute || null,
    birthPlaceProvince: form.province || null,
    birthPlaceCity: form.city || null,
    birthPlaceLongitude: form.longitude != null ? String(form.longitude) : null,
    sourceApp: 'ziwei',
    label: options?.label ?? null,
  };
}

export function syncBirthFormProfile(form: BirthFormState, options?: { label?: string | null }) {
  return syncSavedProfile(birthFormToProfileSync(form, options));
}

export { fetchSavedProfiles, profileDisplayLabel };
export type { SavedProfile };

export function savedProfileToBirthForm(p: SavedProfile): Partial<BirthFormState> {
  return {
    name: p.name,
    gender: (p.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
    year: p.birthYear ?? '',
    month: p.birthMonth ?? '',
    day: p.birthDay ?? '',
    clockHour: p.birthHour ?? '8',
    clockMinute: p.birthMinute ?? '0',
    unknownTime: !p.birthHour,
    province: p.birthPlaceProvince ?? '',
    city: p.birthPlaceCity ?? '',
    longitude: p.birthPlaceLongitude ? parseFloat(p.birthPlaceLongitude) : 120,
  };
}
