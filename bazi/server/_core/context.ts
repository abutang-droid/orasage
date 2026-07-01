import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // 区分正常认证失败（TRPCError）和意外系统错误
    if (error && typeof error === "object" && "code" in error) {
      // TRPCError 是预期的（未登录），静默处理
    } else {
      console.error("[Context] Unexpected auth error:", error);
    }
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
