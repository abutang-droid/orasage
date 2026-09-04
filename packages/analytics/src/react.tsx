"use client";

import { useEffect } from "react";
import { getAnalyticsClient } from "./client";
import {
  DEFAULT_PLAUSIBLE_DOMAIN,
  DEFAULT_PLAUSIBLE_SRC,
  type AnalyticsApp,
} from "./types";

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

/** Cookie-less Plausible snippet. Domain defaults to orasage.com. */
export function PlausibleScript({
  domain = DEFAULT_PLAUSIBLE_DOMAIN,
  src = DEFAULT_PLAUSIBLE_SRC,
}: {
  domain?: string;
  src?: string;
} = {}) {
  if (!domain) return null;
  return <script defer data-domain={domain} src={src} />;
}
