export type GeoDetectSource = 'gps' | 'ip' | 'manual';

/** 浏览器定位 + 反向地理编码 → ISO 3166-1 alpha-2 */
export async function detectCountryFromGeolocation(): Promise<string | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;

  const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: 12_000, maximumAge: 300_000, enableHighAccuracy: false },
    );
  });

  if (!coords) return null;

  try {
    const params = new URLSearchParams({
      latitude: String(coords.latitude),
      longitude: String(coords.longitude),
      localityLanguage: 'zh',
    });
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { countryCode?: string };
    const code = data.countryCode?.trim().toUpperCase();
    return code && code.length === 2 ? code : null;
  } catch {
    return null;
  }
}
