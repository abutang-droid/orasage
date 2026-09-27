export const PROMO_COOKIE = 'orasage_ch';
export const PROMO_QUERY_KEYS = ['ch', 'partner'] as const;
export const PROMO_LEGS = ['gold', 'silver', 'standard'] as const;
export type PromoLeg = (typeof PROMO_LEGS)[number];

export const PROMO_LEG_LABELS: Record<PromoLeg, string> = {
  gold: '金腿',
  silver: '银腿',
  standard: '普通',
};

export function isPromoLeg(value: string): value is PromoLeg {
  return (PROMO_LEGS as readonly string[]).includes(value);
}

export function normalizePromoCode(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
  return code.length >= 2 ? code : null;
}

export function promoCodeFromSearchParams(params: { get(name: string): string | null }): string | null {
  for (const key of PROMO_QUERY_KEYS) {
    const found = normalizePromoCode(params.get(key));
    if (found) return found;
  }
  return null;
}

export function computeCommissionCents(orderCents: number, rateBps: number): number {
  if (!Number.isFinite(orderCents) || !Number.isFinite(rateBps)) return 0;
  if (orderCents <= 0 || rateBps <= 0) return 0;
  const bps = Math.min(10_000, Math.max(0, Math.round(rateBps)));
  return Math.round((orderCents * bps) / 10_000);
}

export function promoCookieMaxAge(): number {
  return 90 * 24 * 60 * 60;
}

export function promoCookieSetOptions(hostname: string): {
  path: string;
  maxAge: number;
  sameSite: 'lax';
  domain?: string;
  secure?: boolean;
} {
  const isProd = hostname === 'orasage.com' || hostname.endsWith('.orasage.com');
  return {
    path: '/',
    maxAge: promoCookieMaxAge(),
    sameSite: 'lax',
    ...(isProd ? { domain: '.orasage.com', secure: true } : {}),
  };
}

type CookieBag = {
  set: (name: string, value: string, options: Record<string, unknown>) => unknown;
};

export function stampPromoChannelCookie(
  hostname: string,
  searchParams: { get(name: string): string | null },
  cookies: CookieBag,
): string | null {
  const code = promoCodeFromSearchParams(searchParams);
  if (!code) return null;
  cookies.set(PROMO_COOKIE, code, promoCookieSetOptions(hostname));
  return code;
}

export function capturePromoChannelInBrowser(): string | null {
  if (typeof window === 'undefined') return null;
  const code = promoCodeFromSearchParams(new URLSearchParams(window.location.search));
  if (!code) return null;
  const opts = promoCookieSetOptions(window.location.hostname);
  const parts = [
    `${PROMO_COOKIE}=${encodeURIComponent(code)}`,
    `Path=${opts.path}`,
    `Max-Age=${opts.maxAge}`,
    'SameSite=Lax',
  ];
  if (opts.domain) parts.push(`Domain=${opts.domain}`);
  if (opts.secure) parts.push('Secure');
  document.cookie = parts.join('; ');
  return code;
}

export function readPromoChannelFromCookieHeader(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === PROMO_COOKIE) {
      return normalizePromoCode(decodeURIComponent(rest.join('=')));
    }
  }
  return null;
}

export function promoCodeFromCookieStore(cookies: {
  get(name: string): { value: string } | undefined;
}): string | null {
  return normalizePromoCode(cookies.get(PROMO_COOKIE)?.value);
}

/** Query `ch`/`partner` first, then the attribution cookie. */
export function promoCodeFromRequest(input: {
  searchParams?: { get(name: string): string | null };
  cookies?: { get(name: string): { value: string } | undefined };
  cookieHeader?: string | null;
}): string | null {
  if (input.searchParams) {
    const fromQuery = promoCodeFromSearchParams(input.searchParams);
    if (fromQuery) return fromQuery;
  }
  if (input.cookies) {
    const fromStore = promoCodeFromCookieStore(input.cookies);
    if (fromStore) return fromStore;
  }
  return readPromoChannelFromCookieHeader(input.cookieHeader);
}

export function promoShareLinks(code: string) {
  const q = encodeURIComponent(code);
  return {
    portal: `https://orasage.com/zh-CN?ch=${q}`,
    bazi: `https://bazi.orasage.com/?ch=${q}`,
    shop: `https://shop.orasage.com/?ch=${q}`,
  };
}
