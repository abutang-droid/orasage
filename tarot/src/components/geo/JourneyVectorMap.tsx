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
};

function countryRegionLookup(countries: GeoCountry[]) {
  return new Map(countries.map((c) => [c.code, c.regionCode]));
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
}: JourneyVectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<JsVectorMapInstance | null>(null);
  const onSelectRef = useRef(onSelect);
  const mapId = useId().replace(/:/g, '');

  onSelectRef.current = onSelect;

  const countryCodesInContinent = useMemo(
    () => countries.map((c) => c.code),
    [countries],
  );

  const mapKey = `${step}-${continentCode ?? ''}-${countryCode ?? ''}-${faithMarkers.map((m) => m.id).join(',')}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let cancelled = false;

    async function initMap() {
      const [{ default: jsVectorMap }] = await Promise.all([
        import('jsvectormap'),
        import('jsvectormap/dist/maps/world-merc.js'),
      ]);

      if (cancelled || !container) return;

      mapRef.current?.destroy();
      container.innerHTML = '';

      const lookup = countryRegionLookup(allCountries);

      const series =
        step === 'region'
          ? { regions: [buildRegionStepSeries(allCountries)] }
          : step === 'country' && continentCode
            ? { regions: [buildCountryStepSeries(allCountries, continentCode)] }
            : step === 'faith' && countryCode
              ? { regions: [buildFaithStepSeries(countryCode)] }
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

      const focusOn =
        step === 'country' && continentCode && countryCodesInContinent.length > 0
          ? { regions: countryCodesInContinent, animate: true }
          : step === 'faith' && countryCode
            ? { region: countryCode, animate: true }
            : undefined;

      const map = new jsVectorMap({
        selector: container,
        map: 'world_merc',
        backgroundColor: 'transparent',
        draggable: true,
        zoomButtons: true,
        zoomOnScroll: true,
        showTooltip: true,
        regionStyle: JVM_REGION_STYLE,
        markerStyle: JVM_MARKER_STYLE,
        markersSelectable: step === 'faith',
        regionsSelectable: step !== 'faith',
        series,
        markers,
        focusOn,
        onRegionClick(_event, code) {
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
          if (step === 'country' && continentCode && countryCodesInContinent.length > 0) {
            instance.setFocus({ regions: countryCodesInContinent, animate: true });
          } else if (step === 'faith' && countryCode) {
            instance.setFocus({ region: countryCode, animate: true });
          }
        },
      });

      mapRef.current = map;
    }

    void initMap();

    return () => {
      cancelled = true;
      mapRef.current?.destroy();
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
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (step === 'region' && selectedId) {
      const codes = allCountries.filter((c) => c.regionCode === selectedId).map((c) => c.code);
      map.setSelectedRegions(codes);
      return;
    }

    if (step === 'country' && selectedId) {
      map.setSelectedRegions([selectedId]);
      return;
    }

    if (step === 'faith' && selectedId) {
      map.clearSelectedRegions();
      map.setSelectedMarkers(selectedId);
      return;
    }

    map.clearSelectedMarkers();
  }, [step, selectedId, allCountries]);

  useEffect(() => {
    const onResize = () => mapRef.current?.updateSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="journey-vector-map world-map" aria-label={ariaLabel}>
      <div
        ref={containerRef}
        id={`journey-map-${mapId}`}
        className="journey-vector-map-canvas"
        role="img"
        aria-label={ariaLabel}
      />
      <p className="world-map-gesture-hint">双指缩放 · 拖动平移 · 点选地图</p>
    </div>
  );
}
