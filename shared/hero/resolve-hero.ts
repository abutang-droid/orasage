import type { MappedHeroContent } from './map-cms-hero';

export type HeroReachabilityOptions = {
  /** 公网 CMS 根，如 https://admin.orasage.com/cms */
  publicCmsBase?: string;
  /** 内网可达性检测根（服务端优先），如 http://127.0.0.1:3120/cms */
  internalCmsBase?: string;
};

function hasHeroText(hero: MappedHeroContent): boolean {
  return Boolean(
    hero.headline?.trim() ||
      hero.eyebrow?.trim() ||
      hero.subtitle?.trim() ||
      hero.bodyText?.trim(),
  );
}

/** 服务端用内网 URL 检测媒体是否真实存在，避免公网反代异常时误降级 */
export function cmsMediaUrlForReachability(
  url: string,
  opts?: HeroReachabilityOptions,
): string {
  const publicBase = (opts?.publicCmsBase ?? 'https://admin.orasage.com/cms').replace(
    /\/$/,
    '',
  );
  const internalBase = (opts?.internalCmsBase ?? 'http://127.0.0.1:3120/cms').replace(
    /\/$/,
    '',
  );
  if (internalBase && (url.startsWith(`${publicBase}/`) || url === publicBase)) {
    return internalBase + url.slice(publicBase.length);
  }
  return url;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 5000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Payload / 部分反代对静态媒体的 HEAD 会返回 404，但 GET 正常。
 * 每个探测请求使用独立超时，避免 HEAD 耗尽预算后 GET 被立即 abort。
 */
async function isUrlReachable(url: string): Promise<boolean> {
  try {
    let res = await fetchWithTimeout(url, { method: 'HEAD' });
    if (res.ok) return true;
    if (res.status === 405 || res.status === 501 || res.status === 404) {
      res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
      });
      if (res.ok) return true;
      // 个别上游不认 Range，再试一次普通 GET
      if (res.status === 416 || res.status === 400 || res.status === 404) {
        res = await fetchWithTimeout(url, { method: 'GET' });
      }
    }
    return res.ok;
  } catch {
    return false;
  }
}

async function isHeroMediaReachable(
  hero: MappedHeroContent,
  reachability?: HeroReachabilityOptions,
): Promise<boolean> {
  if (hero.displayMode === 'image') {
    if (!hero.imageUrl) return false;
    const checkUrl = cmsMediaUrlForReachability(hero.imageUrl, reachability);
    return isUrlReachable(checkUrl);
  }
  if (hero.displayMode === 'video') {
    if (!hero.videoUrl) return false;
    const checkUrl = cmsMediaUrlForReachability(hero.videoUrl, reachability);
    return isUrlReachable(checkUrl);
  }
  return true;
}

/**
 * CMS 图片/视频模式若媒体不可达且无文案，降级为内置 fallback 文本 Hero。
 * enabled:false 时保持隐藏。
 */
export async function resolveHeroWithFallback(
  mapped: MappedHeroContent | null,
  fallback: MappedHeroContent,
  reachability?: HeroReachabilityOptions,
): Promise<MappedHeroContent> {
  if (!mapped) return fallback;
  if (!mapped.enabled) return mapped;

  if (mapped.displayMode === 'text' && !mapped.headline?.trim()) {
    return { ...fallback, enabled: true };
  }

  if (mapped.displayMode === 'image' || mapped.displayMode === 'video') {
    const mediaOk = await isHeroMediaReachable(mapped, reachability);
    if (!mediaOk) {
      if (hasHeroText(mapped)) {
        return {
          ...mapped,
          displayMode: 'text',
          imageUrl: null,
          videoUrl: null,
          videoPosterUrl: null,
        };
      }
      return { ...fallback, enabled: true };
    }
  }

  return mapped;
}
