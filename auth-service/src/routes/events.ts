import { Router } from "express";
import { z } from "zod";
import { getAuthUser } from "../lib/auth-user.ts";
import {
  ANALYTICS_APPS,
  insertAnalyticsEvents,
  isAnalyticsApp,
  sanitizeProperties,
  sanitizeReferrerHost,
  validateAnalyticsEvent,
  type AnalyticsEventInput,
} from "../lib/analytics.ts";

export const eventsRouter = Router();

const eventSchema = z.object({
  app: z.string(),
  event_name: z.string(),
  session_key: z.string(),
  locale: z.string().optional(),
  path: z.string().optional(),
  referrer: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});

const ingestSchema = z.object({
  events: z.array(eventSchema).min(1).max(25),
});

eventsRouter.post("/", async (req, res) => {
  try {
    const body = ingestSchema.parse(req.body);
    const user = await getAuthUser(req);
    const referrerHeader = typeof req.headers.referer === "string" ? req.headers.referer : undefined;

    const normalized: AnalyticsEventInput[] = [];
    for (const raw of body.events) {
      if (!isAnalyticsApp(raw.app)) {
        res.status(400).json({ error: `invalid app: ${raw.app}` });
        return;
      }
      const event: AnalyticsEventInput = {
        app: raw.app,
        eventName: raw.event_name,
        sessionKey: raw.session_key,
        userId: user?.id ?? null,
        locale: raw.locale ?? null,
        path: raw.path ?? null,
        referrerHost: sanitizeReferrerHost(raw.referrer ?? referrerHeader),
        properties: sanitizeProperties(raw.properties),
      };
      const err = validateAnalyticsEvent(event);
      if (err) {
        res.status(400).json({ error: err });
        return;
      }
      normalized.push(event);
    }

    const accepted = await insertAnalyticsEvents(normalized);
    res.status(202).json({ accepted, apps: ANALYTICS_APPS });
  } catch (e) {
    if (e instanceof z.ZodError) {
      res.status(400).json({ error: "invalid payload", details: e.flatten() });
      return;
    }
    console.error("[analytics] ingest failed", e);
    res.status(500).json({ error: "internal error" });
  }
});
