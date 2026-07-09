export const ANALYTICS_APPS = [
  "main",
  "shop",
  "admin",
  "bazi",
  "ziwei",
  "tarot",
  "cms",
  "auth",
] as const;

export type AnalyticsApp = (typeof ANALYTICS_APPS)[number];

export type AnalyticsProperties = Record<string, string | number | boolean>;

export type AnalyticsEventPayload = {
  app: AnalyticsApp;
  event_name: string;
  session_key: string;
  locale?: string;
  path?: string;
  referrer?: string;
  properties?: AnalyticsProperties;
};

export type AnalyticsClientOptions = {
  app: AnalyticsApp;
  endpoint?: string;
  getLocale?: () => string | undefined;
  flushIntervalMs?: number;
  debug?: boolean;
};

export const DEFAULT_ANALYTICS_ENDPOINT =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ANALYTICS_URL
    ? process.env.NEXT_PUBLIC_ANALYTICS_URL
    : typeof process !== "undefined" && process.env?.VITE_ANALYTICS_URL
      ? process.env.VITE_ANALYTICS_URL
      : "https://auth.orasage.com/api/events";
