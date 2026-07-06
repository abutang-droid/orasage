'use client';

import { useEffect, useRef, useState } from 'react';
import { detectCountryFromGeolocation, type GeoDetectSource } from '@/lib/geo/detect-country';
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
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || allCountries.length === 0 || ran.current) return;
    ran.current = true;

    let cancelled = false;

    async function resolve() {
      setResolving(true);
      try {
        const gpsCode = await detectCountryFromGeolocation();
        if (cancelled) return;
        if (gpsCode) {
          const country = matchCountry(gpsCode, allCountries);
          if (country) {
            setSuggestion({ country, source: 'gps' });
            return;
          }
        }

        const res = await fetch('/api/geo/suggest-country');
        if (cancelled || !res.ok) return;
        const data = (await res.json()) as IpSuggestResponse;
        if (data.country) {
          setSuggestion({ country: data.country, source: 'ip' });
        }
      } catch {
        /* manual fallback */
      } finally {
        if (!cancelled) setResolving(false);
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [allCountries, enabled]);

  return { suggestion, resolving };
}
