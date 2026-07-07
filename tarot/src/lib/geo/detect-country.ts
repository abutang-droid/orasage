import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

export type GeoDetectSource = 'gps' | 'ip' | 'manual';

const GEOLOCATION_TIMEOUT_MS = 12_000;
const REVERSE_GEOCODE_TIMEOUT_MS = 6_000;

async function reverseGeocodeCountryCode(latitude: number, longitude: number): Promise<string | null> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  try {
    const res = await fetchWithTimeout(`/api/geo/reverse-geocode?${params}`, {
      timeoutMs: REVERSE_GEOCODE_TIMEOUT_MS,
    });
    if (res.ok) {
      const data = (await res.json()) as { countryCode?: string };
      const code = data.countryCode?.trim().toUpperCase();
      if (code && code.length === 2) return code;
    }
  } catch {
    /* try direct fallback */
  }

  try {
    const bdcParams = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: 'zh',
    });
    const res = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${bdcParams}`,
      { timeoutMs: REVERSE_GEOCODE_TIMEOUT_MS },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { countryCode?: string };
    const code = data.countryCode?.trim().toUpperCase();
    return code && code.length === 2 ? code : null;
  } catch {
    return null;
  }
}

/** 浏览器定位 + 反向地理编码 → ISO 3166-1 alpha-2 */
export async function detectCountryFromGeolocation(): Promise<string | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;

  const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 300_000, enableHighAccuracy: false },
    );
  });

  if (!coords) return null;

  return reverseGeocodeCountryCode(coords.latitude, coords.longitude);
}
