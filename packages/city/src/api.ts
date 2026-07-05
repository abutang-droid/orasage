import type {
  CityLookupResponse,
  CityRecord,
  ConfirmCityPayload,
} from "./types";

export interface CityApiClient {
  listCities(): Promise<CityRecord[]>;
  lookupCity(query: string): Promise<CityLookupResponse>;
  confirmCity(payload: ConfirmCityPayload): Promise<CityRecord>;
}

export function createCityApiClient(baseUrl: string): CityApiClient {
  const root = baseUrl.replace(/\/$/, "");

  async function parseJson<T>(res: Response): Promise<T> {
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
    }
    return data;
  }

  return {
    async listCities() {
      const res = await fetch(`${root}/api/cities`, { credentials: "include" });
      const data = await parseJson<{ cities: CityRecord[] }>(res);
      return data.cities ?? [];
    },

    async lookupCity(query: string) {
      const res = await fetch(`${root}/api/cities/lookup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      return parseJson<CityLookupResponse>(res);
    },

    async confirmCity(payload: ConfirmCityPayload) {
      const res = await fetch(`${root}/api/cities/confirm`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await parseJson<{ city: CityRecord }>(res);
      return data.city;
    },
  };
}
