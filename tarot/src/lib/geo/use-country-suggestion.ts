'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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

const IP_SUGGEST_TIMEOUT_MS = 8_000;

function matchCountry(code: string, countries: GeoCountry[]): GeoCountry | null {
  const upper = code.toUpperCase();
  return countries.find((c) => c.code.toUpperCase() === upper) ?? null;
}

/**
 * 定位优先级：IP/CDN 头（自动）→ 用户点击后再请求 GPS → 无（用户手选）
 */
export function useCountrySuggestion(allCountries: GeoCountry[], enabled: boolean) {
  const [suggestion, setSuggestion] = useState<CountrySuggestion | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [gpsResolving, setGpsResolving] = useState(false);
  const ipRan = useRef(false);

  const gpsAvailable =
    typeof window !== 'undefined' && typeof navigator !== 'undefined' && Boolean(navigator.geolocation);

  useEffect(() => {
    if (!enabled || allCountries.length === 0 || ipRan.current) return;
    ipRan.current = true;

    let cancelled = false;

    async function resolveIp() {
      setResolving(true);
      let result: CountrySuggestion | null = null;

      try {
        const res = await fetchWithTimeout('/api/geo/suggest-country', {
          timeoutMs: IP_SUGGEST_TIMEOUT_MS,
        });
        if (res.ok) {
          const data = (await res.json()) as IpSuggestResponse;
          if (data.country) result = { country: data.country, source: 'ip' };
        }
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

    void resolveIp();
    return () => {
      cancelled = true;
    };
  }, [allCountries, enabled]);

  const requestGps = useCallback(async (): Promise<CountrySuggestion | null> => {
    if (!gpsAvailable || allCountries.length === 0) return null;

    setGpsResolving(true);
    try {
      const gpsCode = await detectCountryFromGeolocation();
      if (!gpsCode) return null;

      const country = matchCountry(gpsCode, allCountries);
      if (!country) return null;

      const result: CountrySuggestion = { country, source: 'gps' };
      setSuggestion(result);
      setResolved(true);
      return result;
    } catch {
      return null;
    } finally {
      setGpsResolving(false);
    }
  }, [allCountries, gpsAvailable]);

  return { suggestion, resolving, resolved, requestGps, gpsResolving, gpsAvailable };
}
