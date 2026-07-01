/**
 * 频率限制中间件 — tRPC middleware 封装
 */
import { t } from "./trpc";
import { checkRateLimit, LLM_RATE_LIMIT, PAYMENT_RATE_LIMIT } from "./rateLimit";
import type { TrpcContext } from "./context";

/** LLM 调用频率限制中间件 */
export const llmRateLimit = t.middleware(async ({ ctx, next }) => {
  checkRateLimit(ctx as TrpcContext, LLM_RATE_LIMIT);
  return next();
});

/** 付费接口频率限制中间件 */
export const paymentRateLimit = t.middleware(async ({ ctx, next }) => {
  checkRateLimit(ctx as TrpcContext, PAYMENT_RATE_LIMIT);
  return next();
});
