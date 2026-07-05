import { createCityApiClient } from '@orasage/city';

const AUTH_URL =
  process.env.NEXT_PUBLIC_AUTH_URL || process.env.AUTH_URL || 'https://auth.orasage.com';

export const cityApi = createCityApiClient(AUTH_URL);
