import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { saveBaziRecord, getUserBaziRecords, deleteBaziRecord, getDb } from "./db";
import { purchases, baziReports } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";
import { ENV } from "./_core/env";
import { PLAN_OPTIONS } from "@shared/types";
import fs from "fs";
import { llmRateLimit, paymentRateLimit } from "./_core/rateLimitMiddleware";
import { parseSections, buildSingleBaziPrompt, buildDoubleBaziPrompt, buildFreeInsightPrompt } from "./prompts";
import { aiSystemLanguagePrefix } from "../../shared/ai-locale/index.ts";
import { fetchReportProductRecommend } from "./reportRecommend";
import { sanitizeReportBrandText } from "../shared/report-brand.ts";
import { sanitizeInsightJson, sanitizeVernacularText } from "../shared/vernacular-sanitize.ts";
import { composeFreeReport } from "../shared/free-report.ts";
import { getPriceMap, DEFAULT_PRICE_MAP } from "./priceFetcher";
import {
  ensureStaticFreeReport,
  upsertReadingWithReport,
  writePaidReadingReport,
} from "./staticFreeReport";
import { generateBaziReportContent } from "./reportGenerator";
import { readReportTier, resolveReadingReportPaths } from "./readingReport";
import {
  chartInputFingerprint,
  chartKindFromResult,
  sanitizeDeviceId,
  stableChartReadingId,
} from "../shared/chart-identity";

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? "http://127.0.0.1:3101";
const BAZI_PUBLIC_URL = process.env.BAZI_PUBLIC_URL ?? "https://bazi.orasage.com";

/** 推送报告 URL 到 auth 用户中心 readings */
async function pushReportToAuth(params: {
  userId: number;
  readingId: string;
  reportUrl: string;
  title: string;
  summary?: string;
}) {
  const res = await fetch(`${AUTH_INTERNAL}/internal/readings/${encodeURIComponent(params.readingId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      reportUrl: params.reportUrl,
      title: params.title,
      summary: params.summary,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`auth reading update failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

async function verifyShopOrder(orderNo: string, userId?: number) {
  try {
    const res = await fetch(`${AUTH_INTERNAL}/internal/orders/${encodeURIComponent(orderNo)}`);
    if (!res.ok) return { verified: false, error: "Order not found" };
    const data = await res.json();
    const order = data.order as { userId: number; status: string; sku?: string | null };
    if (userId && order.userId !== userId) {
      return { verified: false, error: "Order user mismatch" };
    }
    if (!["paid", "completed"].includes(order.status)) {
      return { verified: false, error: "Order not paid", status: order.status };
    }
    return { verified: true, orderNo, status: order.status, sku: order.sku };
  } catch (e: unknown) {
    return { verified: false, error: e instanceof Error ? e.message : "verify failed" };
  }
}

/** 推送报告 URL 到 WordPress 用户中心（独立函数，buyPlan 和补推复用） */
async function pushReportToWordPress(wpUrl: string, params: {
  email: string; name: string; planType: string; price: string;
  reportUrl: string; reportTitle: string; excerpt: string;
  wooOrderId?: string | number;
}) {
  const res = await fetch(`${wpUrl}/wp-json/orasage/v1/save-report`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      email: params.email,
      name: params.name,
      planType: params.planType,
      price: params.price,
      report_url: params.reportUrl,
      report_title: params.reportTitle,
      excerpt: params.excerpt,
      createdAt: new Date().toISOString(),
      order_id: params.wooOrderId || undefined,
    }),
  });
  const text = await res.text();
  console.log('[WordPress] Push response:', res.status, text.substring(0, 300));
  if (!res.ok) {
    throw new Error(`WordPress returned ${res.status}: ${text.substring(0, 200)}`);
  }
}

const PLAN_PRODUCT_MAP: Record<string, number[]> = {
  basic: [342],
  advanced: [486, 2226],
  premium: [488, 3591],
};

/**
 * 服务端权威校验 WooCommerce 订单：状态是否已支付 + 商品是否与所选方案匹配。
 * 供 verifyWooOrderProc（客户端查询）与 buyPlan（写入前的服务端校验）复用 ——
 * 此前 buyPlan 完全没有调用本函数，任何人都能直接调用 buyPlan 并让购买记录
 * 以 status: "completed" 落库，而不管传入的 wooOrderId 是否真实有效。
 */
async function verifyWooOrder(orderId: string | number, planType?: "basic" | "advanced" | "premium") {
  const wpUrl = ENV.wordpressUrl;
  const ck = ENV.wpWooKey;
  const cs = ENV.wpWooSecret;
  if (!wpUrl || !ck || !cs) {
    return { verified: false, error: "WooCommerce API not configured" };
  }
  try {
    const auth = Buffer.from(ck + ":" + cs).toString("base64");
    const res = await fetch(`${wpUrl}/wp-json/wc/v3/orders/${orderId}`, {
      headers: { authorization: "Basic " + auth },
    });
    if (!res.ok) return { verified: false, error: "Order not found" };
    const order = await res.json();

    const validStatuses = ["completed", "processing", "on-hold"];
    if (!validStatuses.includes(order.status)) {
      return { verified: false, error: "Order not paid", status: order.status };
    }

    const productIds = (order.line_items || []).map((i: any) => i.product_id);
    const allowed = planType ? (PLAN_PRODUCT_MAP[planType] || []) : [342, 486, 488, 2226, 3591];
    const matched = productIds.some((pid: number) => allowed.includes(pid));

    return { verified: matched, orderId, status: order.status, total: order.total, productIds, matched };
  } catch (e: any) {
    return { verified: false, error: e.message };
  }
}

export const verifyWooOrderProc = publicProcedure
  .input(z.object({
    orderId: z.union([z.string(), z.number()]),
    planType: z.enum(["basic", "advanced", "premium"]).optional(),
  }))
  .query(async ({ input }) => verifyWooOrder(input.orderId, input.planType));

export const verifyShopOrderProc = publicProcedure
  .input(z.object({ orderNo: z.string().min(1), userId: z.number().optional() }))
  .query(async ({ input }) => verifyShopOrder(input.orderNo, input.userId));

export const appRouter = router({
  system: systemRouter,
  verifyWooOrder: verifyWooOrderProc,
  verifyShopOrder: verifyShopOrderProc,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  bazi: router({
    /** 获取付费方案列表（公开接口） */
    getPlans: publicProcedure.query(() => {
      return PLAN_OPTIONS;
    }),

    /** AI 解读（公开接口，无需登录） */
    analyze: publicProcedure
      .use(llmRateLimit)
      .input(z.object({
        type: z.enum(["single", "couple"]),
        lang: z.enum(["zh-CN", "zh-TW", "en", "pt-BR"]).default("zh-CN"),
        resultData: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ input }) => {
        const prompt = input.type === "single"
          ? buildSingleBaziPrompt(input.resultData, input.lang)
          : buildDoubleBaziPrompt(input.resultData, input.lang);

        const langGuide = aiSystemLanguagePrefix(input.lang);

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: langGuide + "你是八字结构顾问 OraSage。正文必须现象→机制→句尾「体系里叫」。身弱只写「支持你的力量少于消耗你的力量」或「偏耗」。禁止医疗、财务、法律建议，禁止有救、开运、神煞、疾病、投资失利。当前年份是 2026 年，年份写成「2026 年（丙午）」。",
            },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("LLM 返回内容为空");
        const content = sanitizeVernacularText(sanitizeReportBrandText(
          typeof rawContent === "string"
            ? rawContent
            : (rawContent as Array<{ type: string; text?: string }>).map(c => c.text ?? "").join(""),
        ));

        // 解析 Markdown 章节：按 ### 标题分割
        const sections = parseSections(content);
        return { report: content, sections };
      }),

    /** 免费命理解读（轻量，只返回 6 个字段） */
    freeInsight: publicProcedure
      .use(llmRateLimit)
      .input(z.object({
        lang: z.enum(["zh-CN", "zh-TW", "en", "pt-BR"]).default("zh-CN"),
        resultData: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ input }) => {
        const prompt = buildFreeInsightPrompt(input.resultData, input.lang);

        const langGuide = aiSystemLanguagePrefix(input.lang);

        const response = await invokeLLM({
          messages: [
            { role: "system", content: langGuide + "你是八字结构顾问。输出白话 JSON：现象→机制→体系里叫。身弱写偏耗。禁止疾病、投资、有救、开运。只返回 JSON。" },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("LLM 返回内容为空");
        const content = typeof rawContent === "string" ? rawContent : "";
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("No JSON found");
          return sanitizeInsightJson(JSON.parse(jsonMatch[0]) as Record<string, unknown>);
        } catch {
          const composed = composeFreeReport(input.resultData as Parameters<typeof composeFreeReport>[0], input.lang);
          return {
            title: composed.sections[0]?.title ?? "",
            matrix: composed.sections[0]?.body ?? "",
            pattern: composed.sections[1]?.body ?? "",
            personality: composed.sections[2]?.body ?? "",
            risk: composed.sections[3]?.body ?? "",
            lucky: composed.luckyLine,
          };
        }
      }),

    /**
     * 排盘完成后：网络 AI 生成简版，落成固定静态 HTML，并写入 readings。
     * 同一账号（或设备）+ 同一输入 → 同一 readingId，已有文件则不再调模型。
     */
    materializeReport: publicProcedure
      .use(llmRateLimit)
      .input(z.object({
        lang: z.enum(["zh-CN", "zh-TW", "en", "pt-BR"]).default("zh-CN"),
        resultData: z.record(z.string(), z.unknown()),
        readingId: z.string().min(1).max(128).optional(),
        deviceId: z.string().min(8).max(80).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const fingerprint = chartInputFingerprint(input.resultData);
        const deviceId = sanitizeDeviceId(input.deviceId);
        const userId = ctx.user?.id ?? 0;
        const computedId = stableChartReadingId({
          userId,
          deviceId: deviceId || "anon",
          fingerprint,
        });
        // 支付回跳带来的已有 readingId：订单/文件绑的是那条，不能改成新指纹 ID。
        const requestedId = input.readingId?.trim() || "";
        const requestedExists = requestedId
          ? Boolean(readReportTier(resolveReadingReportPaths(requestedId).absolutePath))
          : false;
        const readingId = requestedExists ? requestedId : computedId;
        const kind = chartKindFromResult(input.resultData);
        const paths = resolveReadingReportPaths(readingId);
        const existingTier = readReportTier(paths.absolutePath);
        const xf = ctx.req.headers["x-forwarded-for"];
        const clientIp = (typeof xf === "string" ? xf.split(",")[0].trim() : "")
          || ctx.req.ip
          || "";

        let result;
        if (existingTier) {
          result = {
            ...paths,
            reused: true as const,
            skipped: true as const,
            tier: existingTier,
          };
        } else {
          const { report } = await generateBaziReportContent(
            kind,
            input.resultData,
            input.lang,
            "brief",
          );
          result = ensureStaticFreeReport(input.resultData, input.lang, {
            readingId,
            reportContent: report,
          });
        }

        const name = kind === "couple"
          ? `${String((input.resultData.person1 as { name?: string } | undefined)?.name ?? "甲")} & ${String((input.resultData.person2 as { name?: string } | undefined)?.name ?? "乙")}`
          : (String(input.resultData.name ?? "").trim() || "访客");
        const riZhu = String(input.resultData.riZhu ?? "");
        const strength = String(input.resultData.strength ?? "");
        const summary = [
          kind === "couple" ? "合盘简版" : (riZhu ? `日主 ${riZhu}` : null),
          strength || null,
          result.reused ? "已有固定页" : "新生成固定页",
        ].filter(Boolean).join(" · ");

        const saved = await upsertReadingWithReport({
          userId,
          readingId,
          title: kind === "couple" ? `八字合盘速览 · ${name}` : `八字结构速览 · ${name}`,
          summary,
          reportUrl: result.reportUrl,
          payloadJson: JSON.stringify({
            type: kind,
            lang: input.lang,
            resultData: input.resultData,
            reportId: result.reportId,
            reportPath: result.reportPath,
            tier: result.tier,
            deviceId,
            clientIp,
            inputFingerprint: fingerprint,
          }),
        });

        console.log(
          "[StaticReport] materialize",
          result.reused ? "keep" : "write",
          result.fileName,
          result.reportUrl,
          `tier=${result.tier}`,
          saved ? "saved-to-admin" : "admin-save-failed",
        );
        return {
          success: true as const,
          reportId: result.reportId,
          fileName: result.fileName,
          reportUrl: result.reportUrl,
          reportPath: result.reportPath,
          reused: result.reused,
          readingId,
          tier: result.tier,
          savedToAdmin: saved,
        };
      }),

    /** 保存排盘记录（需登录） */
    saveRecord: protectedProcedure
      .input(z.object({
        type: z.enum(["single", "couple"]),
        name1: z.string().max(64),
        name2: z.string().max(64).optional(),
        inputData: z.any(),
        resultSummary: z.any().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await saveBaziRecord({
          userId: ctx.user.id,
          type: input.type,
          name1: input.name1,
          name2: input.name2 ?? null,
          inputData: input.inputData,
          resultSummary: input.resultSummary ?? null,
        });
        return { success: true };
      }),

    /** 获取用户历史排盘记录（需登录） */
    getRecords: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .query(async ({ ctx, input }) => {
        const records = await getUserBaziRecords(ctx.user.id, input?.limit ?? 20);
        return records;
      }),

    /** 删除排盘记录（需登录） */
    deleteRecord: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteBaziRecord(input.id, ctx.user.id);
        return { success: true };
      }),

    /** 购买方案（生成报告 + 推送 WordPress 用户中心，两步解耦可补推） */
    /** 该接口同时支持 batch=1 POST 和直接 POST body */
    buyPlan: publicProcedure
      .use(paymentRateLimit)
      .input(z.object({
        planType: z.enum(["basic", "advanced", "premium"]),
        email: z.string().optional().default(''),
        name: z.string().optional().default(''),
        wooOrderId: z.union([z.string(), z.number()]).optional(),
        shopOrderNo: z.string().optional(),
        readingId: z.string().optional(),
        inputSummary: z.any().optional(),
        reportContent: z.string().optional().default(''),
      }).passthrough())
      .mutation(async ({ ctx, input }) => {
        try {
        // 诊断日志
        console.log('[buyPlan] input:', typeof input === 'undefined' ? 'undefined' : JSON.stringify(input).substring(0, 500));
        const db = await getDb();
        // 从 WooCommerce 动态获取定价（失败时 fallback 到默认值）
        const priceMap = await getPriceMap().catch(() => ({ ...DEFAULT_PRICE_MAP }));

        let purchaseId: number | null = null;

        // ── ① 服务端校验订单（此前完全信任客户端传入的 wooOrderId，未做任何
        //    服务端校验就把购买记录写成 status: "completed"，任何人都能伪造
        //    一个不存在/不匹配的 wooOrderId 直接拿到"已完成"的购买记录）。
        //    提供了 wooOrderId 时必须服务端复核；未提供时维持原有行为不变
        //    （该路径可能被其他未在本次审查范围内的调用方依赖，不做改动）。
        let verifiedStatus: "pending" | "completed" | "failed" = "completed";
        if (input.shopOrderNo) {
          const verification = await verifyShopOrder(input.shopOrderNo, ctx.user?.id);
          if (!verification.verified) {
            console.warn('[buyPlan] shopOrderNo 校验未通过:', input.shopOrderNo, verification.error);
            verifiedStatus = "pending";
          }
        } else if (input.wooOrderId) {
          const verification = await verifyWooOrder(input.wooOrderId, input.planType);
          if (!verification.verified) {
            console.warn('[buyPlan] wooOrderId 校验未通过，购买记录降级为 pending:', input.wooOrderId, verification.error);
            verifiedStatus = "pending";
          }
        }

        // ── ② 记录购买（DB 降级不阻塞） ──
        if (db) {
          try {
            const result = await db.insert(purchases).values({
              userId: ctx.user?.id ?? 0,
              baziRecordId: null,
              planType: input.planType,
              price: priceMap[input.planType],
              stripePaymentId: null,
              status: verifiedStatus,
              name: input.name ?? null,
              inputSummary: input.inputSummary ?? null,
            });
            purchaseId = Number((result as any)?.insertId ?? 0);
          } catch (e) {
            console.error('[buyPlan] Failed to insert purchase record:', e);
          }
        } else {
          console.warn('[buyPlan] Database not available — skipping purchase record');
        }

        let email = ctx.user?.email || input.email || '';
        let buyerName = input.name || ctx.user?.name || '';

        // ── ② 付费全文覆盖同一 reading 固定页（与免费速览同 URL；无 readingId 时降级独立文件） ──
        let reportUrl = '';

        if (input.reportContent) {
          try {
            const planLabelMap: Record<string, string> = { basic: '深度解读', advanced: '水晶手串', premium: '终极能量礼盒' };
            const planLabel = planLabelMap[input.planType] || input.planType;
            const summary = input.inputSummary as Record<string, unknown> | undefined;
            const wuXing = summary?.wuXing as Record<string, number> | undefined;
            const brandedReport = sanitizeReportBrandText(input.reportContent);
            const productRecommend = input.planType === 'basic'
              ? await fetchReportProductRecommend(wuXing, {
                  chart: summary
                    ? {
                        birthStr: String(summary.birthStr ?? summary.birth ?? ''),
                        gender: String(summary.gender ?? 'male'),
                        name: input.name || buyerName || undefined,
                      }
                    : undefined,
                })
              : null;

            const readingId =
              (input.readingId && input.readingId.trim()) ||
              `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

            const written = writePaidReadingReport({
              readingId,
              reportContent: brandedReport,
              planLabel,
              subjectName: input.name || buyerName || undefined,
              locale: "zh-CN",
              resultData: summary,
              productRecommend,
            });
            reportUrl = written.reportUrl;
            console.log(
              '[StaticReport] Paid overwrite',
              written.fileName,
              'size:',
              fs.statSync(written.absolutePath).size,
              'URL:',
              reportUrl,
            );

            if (purchaseId && db) {
              try {
                await db.update(purchases)
                  .set({ reportUrl, pushStatus: 'pending' })
                  .where(eq(purchases.id, purchaseId));
              } catch (e) {
                // 非致命
              }
            }
          } catch (e) {
            console.error('[StaticReport] Failed to generate:', e);
          }
        }

        // ── ③ 推送 WordPress 用户中心（需 email） ──
        // 优先级：ctx.user.email > input.email > WC API 反查
        if (input.reportContent && reportUrl) {
          // WC API 反查兜底
          if (!email && input.wooOrderId) {
            try {
              const wpUrl = ENV.wordpressUrl;
              const ck = ENV.wpWooKey;
              const cs = ENV.wpWooSecret;
              console.log('[WordPress] Fetching order email from WC API. orderId:', input.wooOrderId);
              if (wpUrl && ck && cs) {
                const auth = Buffer.from(ck + ":" + cs).toString("base64");
                const orderRes = await fetch(`${wpUrl}/wp-json/wc/v3/orders/${input.wooOrderId}`, {
                  headers: { authorization: "Basic " + auth },
                });
                if (orderRes.ok) {
                  const order = await orderRes.json() as any;
                  email = order?.billing?.email || '';
                  const firstName = order?.billing?.first_name || '';
                  const lastName = order?.billing?.last_name || '';
                  buyerName = buyerName || [firstName, lastName].filter(Boolean).join(' ');
                } else {
                  const body = await orderRes.text();
                  console.error('[WordPress] WC API error:', orderRes.status, body.substring(0, 200));
                }
              } else {
                console.warn('[WordPress] Missing WC API credentials');
              }
            } catch (e) {
              console.error('[buyPlan] Failed to fetch WooCommerce order email:', e);
            }
          }

          if (email) {
            try {
              const wpUrl = ENV.wordpressUrl;
              if (wpUrl) {
                const planLabelMap: Record<string, string> = { basic: '深度解读', advanced: '水晶手串', premium: '终极能量礼盒' };
                const planLabel = planLabelMap[input.planType] || input.planType;
                const title = (input.reportContent || '').match(/^###\s*(.+)$/m);
                const reportTitle = title ? title[1].replace(/[*#]/g, '').trim() : `${planLabel} · ${buyerName || email}`;
                const excerpt = (input.reportContent || '').slice(0, 200).replace(/[*#]/g, '').trim();

                // 推送当前报告
                await pushReportToWordPress(wpUrl, {
                  email, name: buyerName, planType: input.planType, price: priceMap[input.planType],
                  reportUrl, reportTitle, excerpt,
                  wooOrderId: input.wooOrderId,
                });
                console.log('[WordPress] Push SUCCESS for email:', email);

                // 标记 push 成功
                if (purchaseId && db) {
                  try {
                    await db.update(purchases).set({ pushStatus: 'pushed' }).where(eq(purchases.id, purchaseId));
                  } catch (_) {}
                }
              }
            } catch (e) {
              console.error('[WordPress] Push failed for email:', email, e);
              // 失败可以后续补推 — reportUrl 已生成，purchase.pushStatus 保持 pending
              if (purchaseId && db) {
                try {
                  await db.update(purchases).set({ pushStatus: 'failed' }).where(eq(purchases.id, purchaseId));
                } catch (_) {}
              }
            }
          } else {
            console.warn('[WordPress] No email — report saved but not pushed. wooOrderId:', input.wooOrderId);
          }

          if (input.readingId && ctx.user?.id) {
            try {
              const planLabelMap: Record<string, string> = { basic: '深度解读', advanced: '水晶手串', premium: '终极能量礼盒' };
              const planLabel = planLabelMap[input.planType] || input.planType;
              await pushReportToAuth({
                userId: ctx.user.id,
                readingId: input.readingId,
                reportUrl,
                title: `${planLabel} · ${buyerName || '报告'}`,
                summary: (input.reportContent || '').slice(0, 500),
              });
              console.log('[Auth] Report pushed for reading:', input.readingId);
            } catch (e) {
              console.error('[Auth] pushReportToAuth failed:', e);
            }
          }
        }

        return { success: true, planType: input.planType, report_url: reportUrl || undefined };
        } catch (e: any) {
          console.error('[buyPlan] Unhandled error:', e?.message || e, e?.stack?.substring(0, 500));
          return { success: false, error: e?.message || 'Unknown error', planType: input.planType };
        }
      }),

    /** 获取用户已购报告列表（需登录） */
    getMyReports: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(baziReports)
          .where(eq(baziReports.userId, ctx.user.id))
          .orderBy(desc(baziReports.createdAt))
          .limit(input?.limit ?? 20);
      }),

    /** 生成 PDF 报告（需登录，且已完成购买） */
    generatePDF: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const report = await db.select().from(baziReports)
          .where(eq(baziReports.id, input.reportId))
          .limit(1);
        if (!report.length || report[0].userId !== ctx.user.id) {
          throw new Error("Report not found");
        }
        if (!report[0].pdfUrl) {
          // TODO: 实现 PDF 生成逻辑
          throw new Error("PDF not yet generated");
        }
        return { pdfUrl: report[0].pdfUrl };
      }),
  }),
});

export type AppRouter = typeof appRouter;