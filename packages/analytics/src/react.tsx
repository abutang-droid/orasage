"use client";

import { useEffect } from "react";
import { getAnalyticsClient } from "./client";
import type { AnalyticsApp } from "./types";

type Props = {
  app: AnalyticsApp;
  locale?: string;
  path?: string;
};

export function AnalyticsPageView({ app, locale, path }: Props) {
  useEffect(() => {
    const client = getAnalyticsClient(app, {
      getLocale: () => locale,
    });
    client.page(path, locale ? { locale } : undefined);
  }, [app, locale, path]);

  return null;
}
