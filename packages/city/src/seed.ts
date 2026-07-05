import type { CityRecord } from "./types.ts";
import seedData from "../data/cities-seed.json";

export function getSeedCities(): CityRecord[] {
  return seedData as CityRecord[];
}
