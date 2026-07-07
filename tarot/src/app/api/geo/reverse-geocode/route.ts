import { NextRequest, NextResponse } from 'next/server';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';

/** GET /api/geo/reverse-geocode?latitude=&longitude= — GPS coords → ISO country code */
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('latitude');
  const lon = req.nextUrl.searchParams.get('longitude');
  const latitude = lat ? Number(lat) : NaN;
  const longitude = lon ? Number(lon) : NaN;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ countryCode: null, error: 'invalid_coords' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      localityLanguage: 'zh',
    });
    const res = await fetchWithTimeout(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`,
      { timeoutMs: 6000 },
    );
    if (!res.ok) {
      return NextResponse.json({ countryCode: null, error: 'upstream' }, { status: 502 });
    }

    const data = (await res.json()) as { countryCode?: string };
    const code = data.countryCode?.trim().toUpperCase();
    if (!code || code.length !== 2) {
      return NextResponse.json({ countryCode: null, error: 'no_country' });
    }

    return NextResponse.json({ countryCode: code });
  } catch (err) {
    console.error('[api/geo/reverse-geocode]', err);
    return NextResponse.json({ countryCode: null, error: 'timeout' }, { status: 504 });
  }
}
