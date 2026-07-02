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
import path from "path";
import { llmRateLimit, paymentRateLimit } from "./_core/rateLimitMiddleware";
import { parseSections, buildSingleBaziPrompt, buildDoubleBaziPrompt, buildFreeInsightPrompt } from "./prompts";
import { renderMarkdown } from "./reportHtml";
import { getPriceMap, DEFAULT_PRICE_MAP } from "./priceFetcher";

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

    /** AI 城市查询（公开接口） */
    lookupCity: publicProcedure
      .input(z.object({ query: z.string().min(1).max(200) }))
      .mutation(async ({ input }) => {
        const prompt = `用户输入了一个城市名称"${input.query}"，请识别这个城市并返回 JSON：

{
  "city": "城市中文名",
  "country": "国家（如\"中国\"、\"美国\"）",
  "province": "省份/州",
  "lng": 经度数字（WGS84）,
  "lat": 纬度数字（WGS84）,
  "timezone": "时区偏移（如\"+8\"、\"-5\"）"
}

如果无法识别该城市，返回 null。
只返回 JSON，不要其他文字。`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "你是一个地理信息助手。只返回 JSON，不要解释。" },
            { role: "user", content: prompt },
          ],
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) return null;

        try {
          const raw = typeof content === "string" ? content
            : (content as Array<{ type: string; text?: string }>).map(c => c.text ?? "").join("");
          // 提取 JSON（LLM 可能包含 markdown 代码块）
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (!jsonMatch) return null;
          const parsed = JSON.parse(jsonMatch[0]);
          if (!parsed || !parsed.city) return null;
          return {
            city: String(parsed.city),
            country: String(parsed.country || "未知"),
            province: String(parsed.province || ""),
            lng: Number(parsed.lng),
            lat: Number(parsed.lat),
            timezone: String(parsed.timezone || "+8"),
          };
        } catch {
          return null;
        }
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
          : buildDoubleBaziPrompt(input.resultData);

        const langMap: Record<string, string> = {
          "zh-CN": "用中文（简体）撰写，",
          "zh-TW": "用中文（繁体）撰写，",
          en: "Write in English, ",
          "pt-BR": "Escreva em Português (Brasil), ",
        };
        const langGuide = langMap[input.lang] ?? "用中文（简体）撰写，";

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: langGuide + "你是铁口直断派命理顾问 OraSage，严格遵循《铁口直断》手册的四层过滤+裁决引擎进行分析。每句结论必须有'算法依据'，语言犀利、一针见血。避免感性修饰词，使用'我们'或'OraSage'自称。当前年份是 2026 年，所有流年分析以 2026 年为基准，不要提及 2025 年或更早的年份。",
            },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("LLM 返回内容为空");
        const content = typeof rawContent === "string"
          ? rawContent
          : (rawContent as Array<{ type: string; text?: string }>).map(c => c.text ?? "").join("");

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

        const langMap: Record<string, string> = {
          "zh-CN": "用中文（简体）撰写，",
          "zh-TW": "用中文（繁体）撰写，",
          en: "Write in English, ",
          "pt-BR": "Escreva em Português (Brasil), ",
        };
        const langGuide = langMap[input.lang] ?? "用中文（简体）撰写，";

        const response = await invokeLLM({
          messages: [
            { role: "system", content: langGuide + "你是铁口直断派的专业东方命理顾问。根据用户的实际排盘数据，生成个性化的简短命理解读。当前年份是 2026 年，所有分析以 2026 年为基准，不要提及 2025 年或更早的年份。只返回 JSON，不要 markdown 代码块。" },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices?.[0]?.message?.content;
        if (!rawContent) throw new Error("LLM 返回内容为空");
        const content = typeof rawContent === "string" ? rawContent : "";
        try {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) throw new Error("No JSON found");
          return JSON.parse(jsonMatch[0]);
        } catch {
          return {
            title: "命格不凡，自有天机",
            traits: "您的八字蕴含独特能量，建议深入解读以了解完整命理格局。",
            career: "适合发挥自身五行优势的行业方向。",
            partner: "根据五行互补原则选择合作伙伴。",
            risk: `2026年需关注自身五行平衡，注意身心调节。`,
            lucky: "幸运色: 金色、紫色 ｜ 幸运方位: 东南",
          };
        }
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

        // ── ② 生成静态 HTML 报告（不依赖 email，有报告内容就执行） ──
        let reportUrl = '';

        if (input.reportContent) {
          try {
            const reportId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const fileName = `${reportId}.html`;
            const reportsDir = process.env.NODE_ENV === "development"
              ? path.resolve(import.meta.dirname, "..", "dist", "public", "reports")
              : path.resolve(import.meta.dirname, "public", "reports");
            fs.mkdirSync(reportsDir, { recursive: true });
            console.log('[StaticReport] reportsDir:', reportsDir, 'exists:', fs.existsSync(reportsDir));

            const planLabelMap: Record<string, string> = { basic: '深度解读', advanced: '能量手串', premium: '终极能量礼盒' };
            const planLabel = planLabelMap[input.planType] || input.planType;
            const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });

            const reportHtml = renderMarkdown(input.reportContent);

            const staticHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${planLabel} - OraSage</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Noto Serif SC",serif;background:#F7F4FA;color:#3D3852;line-height:1.8}
.container{max-width:720px;margin:2rem auto;padding:0 1rem}
.card{background:#FFF;border-radius:16px;padding:2.5rem;box-shadow:0 4px 24px rgba(46,41,91,0.06);border:1px solid #E7E1EE;margin-bottom:1.5rem}
.header{text-align:center;padding:2.5rem 1rem 1.5rem}
.header h1{font-family:"Noto Serif SC",serif;font-size:1.6rem;color:#2E295B;margin-bottom:0.25rem}
.header .meta{font-size:0.8rem;color:#7B7488}
.header .badge{display:inline-block;background:rgba(217,164,65,0.1);color:#D9A441;padding:0.2rem 0.75rem;border-radius:999px;font-size:0.75rem;font-weight:600;margin-bottom:0.5rem}
.report-content h2{font-size:1.15rem;color:#2E295B;margin:1.75rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(217,164,65,0.15)}
.report-content h3{font-size:1.05rem;color:#2E295B;margin:1.25rem 0 0.5rem}
.report-content h1{font-size:1.25rem;color:#2E295B;margin:1.5rem 0 0.5rem}
.report-content p{margin-bottom:0.75rem}
.report-content ul{padding-left:1.5rem;margin-bottom:0.75rem}
.report-content li{margin-bottom:0.25rem}
.report-content strong{color:#2E295B}
.footer{text-align:center;padding:1.5rem;font-size:0.7rem;color:#7B7488;font-family:"Noto Sans SC",sans-serif}
.footer a{color:#D9A441;text-decoration:none}
@media(max-width:640px){.card{padding:1.5rem}.container{margin:1rem auto}}
</style>
</head>
<body>
<div class="header"><div class="badge">${planLabel}</div><h1>OraSage 命理报告</h1>
<p class="meta">生成于 ${dateStr}</p></div>
<div class="container"><div class="card"><div class="report-content"><p>${reportHtml}</p></div></div></div>
<div class="footer"><p>由 <a href="https://www.c2.pub">OraSage</a> 生成 · 仅供参考</p></div>
</body>
</html>`;

            const filePath = path.join(reportsDir, fileName);
            fs.writeFileSync(filePath, staticHtml, 'utf-8');
            reportUrl = `${BAZI_PUBLIC_URL}/reports/${fileName}`;
            console.log('[StaticReport] Saved to:', filePath, 'size:', fs.statSync(filePath).size, 'URL:', reportUrl);

            // 更新 purchase 记录：设置 reportUrl，标记 push 状态初始为 pending
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
                const planLabelMap: Record<string, string> = { basic: '深度解读', advanced: '能量手串', premium: '终极能量礼盒' };
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
              const planLabelMap: Record<string, string> = { basic: '深度解读', advanced: '能量手串', premium: '终极能量礼盒' };
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