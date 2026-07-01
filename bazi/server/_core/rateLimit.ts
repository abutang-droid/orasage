/**
 * 频率限制 — 基于 IP 的滑动窗口
 *
 * 用于保护 LLM 调用和付费接口，防止滥用消耗 API 配额。
 * 内存存储，进程重启后重置。
 */
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context";

// ─── 限流配置 ──────────────────────────────────────────────────

export interface RateLimitConfig {
  /** 窗口内最大请求数 */
  maxRequests: number;
  /** 窗口大小（毫秒） */
  windowMs: number;
  /** 接口名称（用于日志和分组 key） */
  label: string;
}

/** LLM 调用限流：每 IP 每分钟 5 次 */
export const LLM_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000,
  label: "LLM",
};

/** 付费接口限流：每 IP 每分钟 10 次 */
export const PAYMENT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowMs: 60_000,
  label: "Payment",
};

// ─── 存储 ──────────────────────────────────────────────────────

interface WindowEntry {
  timestamps: number[];
}

const store = new Map<string, WindowEntry>();

// 定期清理过期条目（每 5 分钟），不阻止进程退出
const CLEANUP_INTERVAL = 5 * 60_000;
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    entry.timestamps = entry.timestamps.filter((ts: number) => now - ts < PAYMENT_RATE_LIMIT.windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  });
}, CLEANUP_INTERVAL).unref();

// ─── 核心逻辑 ──────────────────────────────────────────────────

/** 从请求中提取客户端 IP */
function getClientIP(ctx: TrpcContext): string {
  const req = ctx.req;
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress ?? req.ip ?? "unknown";
}

/**
 * 检查并更新频率限制，超限时抛出 TRPCError。
 * 作为 tRPC middleware 的基础函数，也可独立调用。
 */
export function checkRateLimit(
  ctx: TrpcContext,
  config: RateLimitConfig
): void {
  const ip = getClientIP(ctx);
  const key = `${ip}:${config.label}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // 清理窗口外的旧记录
  entry.timestamps = entry.timestamps.filter((ts: number) => now - ts < config.windowMs);

  if (entry.timestamps.length >= config.maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfter = Math.ceil((oldestInWindow + config.windowMs - now) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `请求过于频繁，请在 ${retryAfter} 秒后重试`,
    });
  }

  entry.timestamps.push(now);
}
