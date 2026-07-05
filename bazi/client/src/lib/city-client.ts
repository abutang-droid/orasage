import { createCityApiClient } from "@orasage/city";

const AUTH_URL =
  (import.meta.env.VITE_AUTH_URL as string | undefined) || "https://auth.orasage.com";

export const cityApi = createCityApiClient(AUTH_URL);
