import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { fetchGeoCountriesWithFallback } from '@/lib/cms/geo';

/** ISO 3166-1 alpha-2 from common CDN / proxy headers (best-effort) */
function countryFromHeaders(h: Headers): string | null {
  const candidates = [
    h.get('cf-ipcountry'),
    h.get('x-vercel-ip-country'),
    h.get('cloudfront-viewer-country'),
  ];
  for (const c of candidates) {
    const code = c?.trim().toUpperCase();
    if (code && code.length === 2 && code !== 'XX' && code !== 'T1') return code;
  }
  return null;
}

/** GET /api/geo/suggest-country — IP/CDN 预填国家（可手选覆盖） */
export async function GET() {
  try {
    const h = await headers();
    const suggestedCode = countryFromHeaders(h);
    const { countries } = await fetchGeoCountriesWithFallback();
    const match = suggestedCode
      ? countries.find((c) => c.code.toUpperCase() === suggestedCode)
      : undefined;

    return NextResponse.json({
      suggestedCode: match?.code ?? suggestedCode,
      country: match ?? null,
      source: match ? 'header' : suggestedCode ? 'header_unknown' : 'none',
    });
  } catch (err) {
    console.error('[api/geo/suggest-country]', err);
    return NextResponse.json({ suggestedCode: null, country: null, source: 'error' });
  }
}
