import { getOrCreateSessionKey } from "./session";
import {
  DEFAULT_ANALYTICS_ENDPOINT,
  type AnalyticsApp,
  type AnalyticsClientOptions,
  type AnalyticsEventPayload,
  type AnalyticsProperties,
} from "./types";

export function createAnalyticsClient(options: AnalyticsClientOptions) {
  const endpoint = options.endpoint ?? DEFAULT_ANALYTICS_ENDPOINT;
  const queue: AnalyticsEventPayload[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  const flushIntervalMs = options.flushIntervalMs ?? 3000;

  function buildEvent(
    eventName: string,
    properties?: AnalyticsProperties,
    overrides?: Partial<Pick<AnalyticsEventPayload, "path" | "locale">>,
  ): AnalyticsEventPayload {
    return {
      app: options.app,
      event_name: eventName,
      session_key: getOrCreateSessionKey(),
      locale: overrides?.locale ?? options.getLocale?.(),
      path: overrides?.path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
      properties,
    };
  }

  function scheduleFlush() {
    if (flushTimer || typeof window === "undefined") return;
    flushTimer = setTimeout(() => {
      flushTimer = null;
      void flush();
    }, flushIntervalMs);
  }

  async function flush(): Promise<void> {
    if (queue.length === 0) return;
    const batch = queue.splice(0, 25);
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        keepalive: true,
        body: JSON.stringify({ events: batch }),
      });
      if (options.debug) console.debug("[analytics] flushed", batch.length);
    } catch (err) {
      if (options.debug) console.warn("[analytics] flush failed", err);
      queue.unshift(...batch);
    }
  }

  function enqueue(event: AnalyticsEventPayload) {
    queue.push(event);
    if (queue.length >= 10) {
      void flush();
      return;
    }
    scheduleFlush();
  }

  return {
    app: options.app as AnalyticsApp,
    track(eventName: string, properties?: AnalyticsProperties) {
      enqueue(buildEvent(eventName, properties));
    },
    page(path?: string, properties?: AnalyticsProperties) {
      enqueue(
        buildEvent("page_view", properties, {
          path: path ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
        }),
      );
    },
    flush,
  };
}

export type AnalyticsClient = ReturnType<typeof createAnalyticsClient>;

let sharedClients: Partial<Record<AnalyticsApp, AnalyticsClient>> = {};

export function getAnalyticsClient(app: AnalyticsApp, options?: Omit<AnalyticsClientOptions, "app">) {
  if (!sharedClients[app]) {
    sharedClients[app] = createAnalyticsClient({ app, ...options });
  }
  return sharedClients[app]!;
}

export function resetAnalyticsClientsForTests() {
  sharedClients = {};
}
