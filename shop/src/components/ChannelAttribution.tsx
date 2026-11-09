'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  CHANNEL_COOKIE,
  CHANNEL_COOKIE_MAX_AGE_SEC,
  CHANNEL_QUERY_PARAM,
  normalizeChannelCode,
} from '../../../shared/sales-channels/index';

/** 记住 `?channel=`，之后的购物车结账仍能归到这个渠道。 */
export function ChannelAttribution() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get(CHANNEL_QUERY_PARAM);

  useEffect(() => {
    const code = normalizeChannelCode(raw);
    if (!code) return;
    document.cookie = `${CHANNEL_COOKIE}=${code}; Path=/; Max-Age=${CHANNEL_COOKIE_MAX_AGE_SEC}; SameSite=Lax`;
  }, [pathname, raw]);

  return null;
}
