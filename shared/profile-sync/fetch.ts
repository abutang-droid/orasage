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

const AUTH_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_AUTH_URL) ||
  (typeof import.meta !== 'undefined' && (import.meta as { env?: { VITE_AUTH_URL?: string } }).env?.VITE_AUTH_URL) ||
  'https://auth.orasage.com';

/** 获取用户中心已保存的测试对象（未登录返回空数组） */
export async function fetchSavedProfiles(): Promise<SavedProfile[]> {
  try {
    const res = await fetch(`${AUTH_URL}/auth/me/profiles`, {
      credentials: 'include',
    });
    if (res.status === 401) return [];
    if (!res.ok) {
      console.warn('[profile-fetch] failed:', res.status);
      return [];
    }
    const data = await res.json();
    return (data.profiles ?? []) as SavedProfile[];
  } catch (err) {
    console.warn('[profile-fetch] error:', err);
    return [];
  }
}

export function profileDisplayLabel(p: SavedProfile): string {
  const birth = [p.birthYear, p.birthMonth, p.birthDay].filter(Boolean).join('-');
  const tag = p.label ? `[${p.label}] ` : '';
  return `${tag}${p.name}${birth ? ` · ${birth}` : ''}`;
}
