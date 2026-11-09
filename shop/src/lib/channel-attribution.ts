import type { NextRequest } from 'next/server';
import { CHANNEL_COOKIE, normalizeChannelCode } from '../../../shared/sales-channels/index';

/** 请求体优先，其次是商城 Cookie。非法编码当成没有渠道。 */
export function channelCodeFromCheckout(req: NextRequest, explicit?: string | null): string | undefined {
  return normalizeChannelCode(explicit) ?? normalizeChannelCode(req.cookies.get(CHANNEL_COOKIE)?.value) ?? undefined;
}
