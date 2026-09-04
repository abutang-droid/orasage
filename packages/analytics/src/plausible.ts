import { getAnalyticsClient } from "./client";
import type { AnalyticsApp, AnalyticsProperties } from "./types";

type PlausibleFn = (
  event: string,
  options?: { props?: Record<string, string | number | boolean> },
) => void;

export function trackPlausible(
  event: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const plausible = (window as unknown as { plausible?: PlausibleFn }).plausible;
  if (typeof plausible !== "function") return;
  plausible(event, props ? { props } : undefined);
}

/** First-party analytics_events + Plausible custom event (when the script is present). */
export function trackConversion(
  app: AnalyticsApp,
  eventName: string,
  properties?: AnalyticsProperties,
): void {
  getAnalyticsClient(app).track(eventName, properties);
  trackPlausible(eventName, properties);
}
