import type { BirthplaceValue, CityRecord } from '@orasage/city';
import { matchLocalCity } from '@orasage/city';

const CHINA = '中国';

const INTL_COUNTRY_HINTS = new Set([
  '美国', '加拿大', '英国', '法国', '德国', '澳大利亚', '日本', '韩国',
  '新加坡', '马来西亚', '泰国', '越南', '印度', '巴西', '墨西哥',
  'United States', 'USA', 'Canada', 'UK', 'Japan', 'Australia',
]);

function isIntlProvince(province: string): boolean {
  if (!province) return false;
  if (INTL_COUNTRY_HINTS.has(province)) return true;
  return province === province.toUpperCase() && /^[A-Z\s]+$/.test(province);
}

export function formFieldsToBirthplace(form: {
  city: string;
  province: string;
  longitude: number;
}): BirthplaceValue {
  if (!form.city) return { city: '', country: '' };
  if (isIntlProvince(form.province)) {
    return {
      city: form.city,
      country: form.province,
      lng: form.longitude,
      timezone: guessTimezone(form.longitude),
    };
  }
  return {
    city: form.city,
    country: CHINA,
    lng: form.longitude,
    timezone: '+8',
  };
}

export function birthplaceToFormFields(
  value: BirthplaceValue,
  catalog: CityRecord[] = [],
): { city: string; province: string; longitude: number } {
  if (!value.city) {
    return { city: '', province: '', longitude: 120 };
  }

  const lng = value.lng ?? 120;

  if (value.country && value.country !== CHINA) {
    return { city: value.city, province: value.country, longitude: lng };
  }

  const record =
    catalog.find((c) => c.city === value.city && c.country === CHINA) ??
    matchLocalCity(catalog, value.city);

  return {
    city: value.city,
    province: record?.province ?? '',
    longitude: lng,
  };
}

function guessTimezone(lng: number): string {
  if (lng >= 70 && lng <= 140) return '+8';
  if (lng < 0) return String(Math.round(lng / 15));
  return `+${Math.round(lng / 15)}`;
}
