import type { MappedHeroContent } from './map-cms-hero';

function hasHeroText(hero: MappedHeroContent): boolean {
  return Boolean(
    hero.headline?.trim() ||
      hero.eyebrow?.trim() ||
      hero.subtitle?.trim() ||
      hero.bodyText?.trim(),
  );
}

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-0' },
        signal: controller.signal,
        redirect: 'follow',
      });
    }
    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

async function isHeroMediaReachable(hero: MappedHeroContent): Promise<boolean> {
  if (hero.displayMode === 'image') {
    return hero.imageUrl ? isUrlReachable(hero.imageUrl) : false;
  }
  if (hero.displayMode === 'video') {
    return hero.videoUrl ? isUrlReachable(hero.videoUrl) : false;
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
): Promise<MappedHeroContent> {
  if (!mapped) return fallback;
  if (!mapped.enabled) return mapped;

  if (mapped.displayMode === 'text' && !mapped.headline?.trim()) {
    return { ...fallback, enabled: true };
  }

  if (mapped.displayMode === 'image' || mapped.displayMode === 'video') {
    const mediaOk = await isHeroMediaReachable(mapped);
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
