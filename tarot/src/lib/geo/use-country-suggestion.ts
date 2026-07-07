'use client';

import { useEffect, useRef, useState } from 'react';
import { detectCountryFromGeolocation, type GeoDetectSource } from '@/lib/geo/detect-country';
import { fetchWithTimeout } from '@/lib/fetch-with-timeout';
import type { GeoCountry } from '@/lib/geo/types';

export type CountrySuggestion = {
  country: GeoCountry;
  source: GeoDetectSource;
};

type IpSuggestResponse = {
  suggestedCode: string | null;
  country: GeoCountry | null;
  source: string;
};

const RESOLVE_TIMEOUT_MS = 18_000;
const IP_SUGGEST_TIMEOUT_MS = 8_000;

function matchCountry(code: string, countries: GeoCountry[]): GeoCountry | null {
  const upper = code.toUpperCase();
  return countries.find((c) => c.code.toUpperCase() === upper) ?? null;
}

/**
 * 定位优先级：浏览器 GPS → IP/CDN 头 → 无（用户手选）
 */
export function useCountrySuggestion(allCountries: GeoCountry[], enabled: boolean) {
  const [suggestion, setSuggestion] = useState<CountrySuggestion | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || allCountries.length === 0 || ran.current) return;
    ran.current = true;

    let cancelled = false;

    async function resolveLocation(): Promise<CountrySuggestion | null> {
      const gpsCode = await detectCountryFromGeolocation();
      if (gpsCode) {
        const country = matchCountry(gpsCode, allCountries);
        if (country) return { country, source: 'gps' };
      }

      const res = await fetchWithTimeout('/api/geo/suggest-country', {
        timeoutMs: IP_SUGGEST_TIMEOUT_MS,
      });
      if (!res.ok) return null;
      const data = (await res.json()) as IpSuggestResponse;
      if (data.country) return { country: data.country, source: 'ip' };
      return null;
    }

    async function resolve() {
      setResolving(true);
      let result: CountrySuggestion | null = null;

      try {
        result = await Promise.race([
          resolveLocation(),
          new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), RESOLVE_TIMEOUT_MS);
          }),
        ]);
      } catch {
        /* manual fallback */
      } finally {
        if (!cancelled) {
          setSuggestion(result);
          setResolving(false);
          setResolved(true);
        }
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [allCountries, enabled]);

  return { suggestion, resolving, resolved };
}
