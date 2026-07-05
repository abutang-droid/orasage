import type { CityRecord } from "./types";
import seedData from "../data/cities-seed.json";

export function getSeedCities(): CityRecord[] {
  return seedData as CityRecord[];
}
