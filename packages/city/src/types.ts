export interface CityRecord {
  city: string;
  country: string;
  province: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
  pinyin?: string;
}

export interface CityCoords {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
}

export interface BirthplaceValue {
  city: string;
  country: string;
  lng?: number;
  lat?: number;
  timezone?: string;
}

export interface CityLookupResult {
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
  confidence: number;
  suggestion?: string;
}

export interface CityLookupFailure {
  found: false;
  suggestion?: string;
}

export type CityLookupResponse = CityLookupResult | CityLookupFailure;

export interface ConfirmCityPayload {
  query: string;
  city: string;
  province: string;
  country: string;
  lng: number;
  lat: number;
  timezone: string;
  alias?: string[];
}
