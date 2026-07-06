declare module 'jsvectormap' {
  export type JsVectorMapMarkerConfig = {
    name?: string;
    coords: [number, number];
    style?: Record<string, unknown>;
  };

  export type JsVectorMapOptions = {
    selector: string | HTMLElement;
    map?: string;
    backgroundColor?: string;
    draggable?: boolean;
    zoomButtons?: boolean;
    zoomOnScroll?: boolean;
    showTooltip?: boolean;
    focusOn?: {
      region?: string;
      regions?: string[];
      animate?: boolean;
    };
    regionStyle?: Record<string, Record<string, string | number>>;
    markerStyle?: Record<string, Record<string, string | number>>;
    markers?: Record<string, JsVectorMapMarkerConfig>;
    markersSelectable?: boolean;
    regionsSelectable?: boolean;
    series?: {
      regions?: Array<{
        attribute?: string;
        scale?: Record<string, string>;
        values?: Record<string, string>;
      }>;
    };
    selectedRegions?: string[];
    onRegionClick?: (event: Event, code: string) => void;
    onMarkerClick?: (event: Event, code: string) => void;
    onLoaded?: (map: JsVectorMapInstance) => void;
  };

  export type JsVectorMapInstance = {
    destroy: () => void;
    setFocus: (config: {
      region?: string;
      regions?: string[];
      coords?: [number, number];
      scale?: number;
      animate?: boolean;
    }) => void;
    setSelectedRegions: (codes: string | string[]) => void;
    clearSelectedRegions: (codes?: string | string[]) => void;
    setSelectedMarkers: (codes: string | string[]) => void;
    clearSelectedMarkers: () => void;
    addMarkers: (markers: Record<string, JsVectorMapMarkerConfig>) => void;
    removeMarkers: (markers?: string[]) => void;
    reset: () => void;
    updateSize: () => void;
  };

  export default class jsVectorMap {
    constructor(options: JsVectorMapOptions);
    destroy: () => void;
    setFocus: JsVectorMapInstance['setFocus'];
    setSelectedRegions: JsVectorMapInstance['setSelectedRegions'];
    clearSelectedRegions: JsVectorMapInstance['clearSelectedRegions'];
    setSelectedMarkers: JsVectorMapInstance['setSelectedMarkers'];
    clearSelectedMarkers: JsVectorMapInstance['clearSelectedMarkers'];
    addMarkers: JsVectorMapInstance['addMarkers'];
    removeMarkers: JsVectorMapInstance['removeMarkers'];
    reset: () => void;
    updateSize: () => void;
  }
}

declare module 'jsvectormap/dist/maps/world-merc.js';
