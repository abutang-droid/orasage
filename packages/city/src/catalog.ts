import type { CityApiClient } from "./api.ts";
import { getSeedCities } from "./seed.ts";
import { mergeCityRecords } from "./search.ts";
import type { CityRecord } from "./types.ts";

let _api: CityApiClient | null = null;
let _cities: CityRecord[] | null = null;
let _loadPromise: Promise<CityRecord[]> | null = null;

export function configureCityApi(api: CityApiClient): void {
  _api = api;
  _cities = null;
  _loadPromise = null;
}

export function getCityApi(): CityApiClient | null {
  return _api;
}

export async function loadCityCatalog(): Promise<CityRecord[]> {
  if (_cities) return _cities;
  if (_loadPromise) return _loadPromise;

  _loadPromise = (async () => {
    const seed = getSeedCities();
    let overrides: CityRecord[] = [];
    if (_api) {
      try {
        overrides = await _api.listCities();
      } catch (err) {
        console.warn("[@orasage/city] Failed to load DB city records:", err);
      }
    }
    _cities = mergeCityRecords(seed, overrides);
    return _cities;
  })();

  return _loadPromise;
}

export function getLoadedCities(): CityRecord[] {
  return _cities ?? getSeedCities();
}

export function addCityToCatalog(record: CityRecord): void {
  if (!_cities) {
    _cities = mergeCityRecords(getSeedCities(), [record]);
    return;
  }
  _cities = mergeCityRecords(_cities, [record]);
}
