import type { Request } from "express";
import { detectLocale, LOCALE_COOKIE } from "../../../packages/i18n/src/index.ts";
import { localeFromRedirect } from "./site-chrome-html.ts";

const REDIRECT_LOCALES = ['zh-CN', 'zh-TW', 'en', 'pt-BR', 'es', 'fr', 'de', 'ja', 'ko', 'vi', 'th', 'ar'] as const;

function readCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : undefined;
}

function localeInRedirect(url?: string): string | null {
  if (!url) return null;
  try {
    const pathname = url.startsWith("http") ? new URL(url).pathname : url;
    const seg = pathname.split("/").filter(Boolean)[0];
    if (seg && (REDIRECT_LOCALES as readonly string[]).includes(seg)) return seg;
  } catch {
    /* ignore */
  }
  return null;
}

/** redirect path locale → ?lang= → NEXT_LOCALE cookie → Accept-Language */
export function resolveAuthPageLocale(req: Request, redirectUrl?: string): string {
  const fromRedirect = localeInRedirect(redirectUrl);
  if (fromRedirect) return fromRedirect;

  const cookieHeader = typeof req.headers.cookie === "string" ? req.headers.cookie : "";
  return detectLocale({
    queryLocale: typeof req.query.lang === "string" ? req.query.lang : undefined,
    cookieLocale: readCookie(cookieHeader, LOCALE_COOKIE) ?? readCookie(cookieHeader, "orasage_shop_locale"),
    acceptLanguage: typeof req.headers["accept-language"] === "string" ? req.headers["accept-language"] : undefined,
  });
}

export { localeFromRedirect };
