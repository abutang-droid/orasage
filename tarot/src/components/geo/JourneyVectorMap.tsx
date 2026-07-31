'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import type { JsVectorMapInstance } from 'jsvectormap';
import 'jsvectormap/dist/jsvectormap.css';
import {
  buildCountryStepSeries,
  buildFaithStepSeries,
  buildRegionStepSeries,
  JVM_MARKER_STYLE,
  JVM_REGION_STYLE,
} from '@/lib/geo/journey-map-styles';
import { mapPercentToCoords } from '@/lib/geo/map-percent-to-coords';
import { normalizeCountryCode } from '@/lib/geo/country-label';
import type { GeoCountry } from '@/lib/geo/types';

export type JourneyFaithMarker = {
  id: string;
  label: string;
  sublabel?: string;
  mapX: number;
  mapY: number;
};

export type JourneyVectorMapProps = {
  step: 'region' | 'country' | 'faith';
  allCountries: GeoCountry[];
  countries: GeoCountry[];
  continentCode?: string;
  countryCode?: string;
  faithMarkers?: JourneyFaithMarker[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
  ariaLabel?: string;
  /** 定位已确定国家时，地图仅作背景装饰 */
  ambient?: boolean;
  gestureHint?: string;
};

function countryRegionLookup(countries: GeoCountry[]) {
  return new Map(countries.map((c) => [c.code, c.regionCode]));
}

function regionExistsOnMap(instance: JsVectorMapInstance, code: string) {
  const region = instance.regions?.[code];
  return Boolean(region?.element?.shape);
}

function filterMapRegionCodes(instance: JsVectorMapInstance, codes: string[]) {
  return codes.filter((code) => regionExistsOnMap(instance, code));
}

function safeSetFocus(
  instance: JsVectorMapInstance,
  focus: { regions?: string[]; region?: string; animate?: boolean },
) {
  try {
    if (focus.regions?.length) {
      const regions = filterMapRegionCodes(instance, focus.regions);
      if (!regions.length) return;
      instance.setFocus({ ...focus, regions });
      return;
    }
    if (focus.region) {
      if (!regionExistsOnMap(instance, focus.region)) return;
      instance.setFocus(focus);
    }
  } catch {
    /* jsVectorMap setFocus can throw when bbox is undefined */
  }
}

function safeDestroy(map: JsVectorMapInstance | null) {
  if (!map) return;
  try {
    map.destroy();
  } catch {
    /* map may be partially initialized */
  }
}

export function JourneyVectorMap({
  step,
  allCountries,
  countries,
  continentCode,
  countryCode,
  faithMarkers = [],
  selectedId,
  onSelect,
  ariaLabel = '世界地图',
  ambient = false,
  gestureHint,
}: JourneyVectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<JsVectorMapInstance | null>(null);
  const mapReadyRef = useRef(false);
  const initGenRef = useRef(0);
  const onSelectRef = useRef(onSelect);
  const mapId = useId().replace(/:/g, '');

  onSelectRef.current = onSelect;

  const countryCodesInContinent = useMemo(
    () => countries.map((c) => c.code),
    [countries],
  );

  const mapKey = `${step}-${continentCode ?? ''}-${countryCode ?? ''}-${countryCodesInContinent.join(',')}-${faithMarkers.map((m) => m.id).join(',')}-${ambient ? 'ambient' : 'interactive'}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const initGen = ++initGenRef.current;
    let cancelled = false;
    mapReadyRef.current = false;

    async function initMap() {
      try {
        const [{ default: jsVectorMap }] = await Promise.all([
          import('jsvectormap'),
          import('jsvectormap/dist/maps/world-merc.js'),
        ]);

        if (cancelled || initGen !== initGenRef.current || !container) return;

        safeDestroy(mapRef.current);
        mapRef.current = null;
        container.innerHTML = '';

        const lookup = countryRegionLookup(allCountries);

        const series =
          step === 'region'
            ? { regions: [buildRegionStepSeries(allCountries)] }
            : step === 'country' && continentCode
              ? { regions: [buildCountryStepSeries(allCountries, continentCode)] }
              : step === 'faith' && countryCode
                ? { regions: [buildFaithStepSeries(normalizeCountryCode(countryCode))] }
                : undefined;

        const markers =
          step === 'faith'
            ? Object.fromEntries(
                faithMarkers.map((marker) => [
                  marker.id,
                  {
                    name: marker.sublabel ? `${marker.label} · ${marker.sublabel}` : marker.label,
                    coords: mapPercentToCoords(marker.mapX, marker.mapY),
                  },
                ]),
              )
            : undefined;

        const lockInteraction = ambient && step !== 'faith';

        const map = new jsVectorMap({
          selector: container,
          map: 'world_merc',
          backgroundColor: 'transparent',
          draggable: !lockInteraction,
          zoomButtons: !lockInteraction,
          zoomOnScroll: !lockInteraction,
          showTooltip: !ambient,
          regionStyle: JVM_REGION_STYLE,
          markerStyle: JVM_MARKER_STYLE,
          markersSelectable: step === 'faith',
          regionsSelectable: !lockInteraction && step !== 'faith',
          series,
          markers,
          onRegionClick(_event, code) {
            if (lockInteraction) return;
            if (step === 'region') {
              const regionCode = lookup.get(code);
              if (regionCode) onSelectRef.current(regionCode);
              return;
            }
            if (step === 'country') {
              const allowed = countries.some((c) => c.code === code);
              if (allowed) onSelectRef.current(code);
            }
          },
          onMarkerClick(_event, code) {
            if (step === 'faith') onSelectRef.current(code);
          },
          onLoaded(instance) {
            if (cancelled || initGen !== initGenRef.current) return;
            mapReadyRef.current = true;
            if (step === 'country' && continentCode && countryCodesInContinent.length > 0) {
              safeSetFocus(instance, { regions: countryCodesInContinent, animate: true });
            } else if (step === 'faith' && countryCode) {
              safeSetFocus(instance, { region: normalizeCountryCode(countryCode), animate: true });
            }
          },
        });

        if (cancelled || initGen !== initGenRef.current) {
          safeDestroy(map);
          return;
        }

        mapRef.current = map;
      } catch {
        if (!cancelled && initGen === initGenRef.current && container) {
          container.innerHTML = '';
        }
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      mapReadyRef.current = false;
      safeDestroy(mapRef.current);
      mapRef.current = null;
    };
  }, [
    mapKey,
    allCountries,
    countries,
    continentCode,
    countryCode,
    countryCodesInContinent,
    faithMarkers,
    step,
    ambient,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReadyRef.current) return;

    try {
      if (step === 'region' && selectedId) {
        const codes = filterMapRegionCodes(
          map,
          allCountries.filter((c) => c.regionCode === selectedId).map((c) => c.code),
        );
        if (codes.length) map.setSelectedRegions(codes);
        return;
      }

      if (step === 'country' && selectedId && regionExistsOnMap(map, selectedId)) {
        map.setSelectedRegions([selectedId]);
        return;
      }

      if (step === 'faith' && selectedId) {
        map.clearSelectedRegions();
        map.setSelectedMarkers(selectedId);
        return;
      }

      map.clearSelectedMarkers();
    } catch {
      /* map may be mid-destroy */
    }
  }, [mapKey, step, selectedId, allCountries]);

  useEffect(() => {
    const onResize = () => {
      try {
        mapRef.current?.updateSize();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div
      className={`journey-vector-map world-map${ambient ? ' journey-vector-map--ambient' : ''}`}
      aria-label={ariaLabel}
    >
      <div
        ref={containerRef}
        id={`journey-map-${mapId}`}
        className="journey-vector-map-canvas"
        role="img"
        aria-label={ariaLabel}
      />
      {!ambient && gestureHint ? (
        <p className="world-map-gesture-hint">{gestureHint}</p>
      ) : null}
    </div>
  );
}
