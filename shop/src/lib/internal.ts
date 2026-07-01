import type { NextRequest } from 'next/server';

const LOCAL_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * 判断请求是否来自本机（同一 VPS 上的其他 App，走 127.0.0.1 内网调用）。
 *
 * 安全要点：
 * - 优先使用 Nginx 权威设置的 `X-Real-IP`（`proxy_set_header X-Real-IP $remote_addr`），
 *   该 header 由 Nginx 覆盖写入，客户端无法伪造。
 * - `X-Forwarded-For` 由 Nginx 通过 `$proxy_add_x_forwarded_for` 追加在链路末尾，
 *   因此必须取最后一段（最贴近 Nginx 的一跳），不能取第一段——否则攻击者可在请求头
 *   中伪造 `X-Forwarded-For: 127.0.0.1`，被 Nginx 追加后变成
 *   `127.0.0.1, <真实IP>`，若取第一段即被绕过。
 * - 缺失以上两个 header 时默认拒绝（fail closed），而不是默认放行。
 */
export function isLocalRequest(req: NextRequest | Request) {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return LOCAL_IPS.has(realIp);
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim()).filter(Boolean);
    const nearestHop = parts[parts.length - 1];
    return nearestHop ? LOCAL_IPS.has(nearestHop) : false;
  }

  // 无法确认来源（例如本地开发直连 Next.js 且没有反代 header）时，
  // 仅在非生产环境放行，生产环境一律拒绝。
  return process.env.NODE_ENV !== 'production';
}
