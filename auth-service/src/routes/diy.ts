import { Router } from "express";
import { asc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { diyBeads, diyConfig, diyDesigns } from "../db/schema.ts";

export const diyRouter = Router();
export const diyInternalRouter = Router();

type BeadRow = typeof diyBeads.$inferSelect;

export function formatBead(row: BeadRow) {
  return {
    code: row.code,
    name: row.name,
    element: row.element,
    material: row.material,
    type: row.beadType as "crystal" | "spacer" | "disc",
    diameterMm: row.diameterMm,
    thicknessMm: row.thicknessMm,
    /** 占串长（隔片用厚度，其余用直径） */
    lengthMm: row.beadType === "disc" && row.thicknessMm ? row.thicknessMm : row.diameterMm,
    priceCents: row.priceCents,
    priceCentsUsd: row.priceCentsUsd,
    imageUrl: row.imageUrl,
    colors: row.colors,
    stock: row.stock,
    active: row.active,
    sortOrder: row.sortOrder,
  };
}

export async function getDiyConfigRow() {
  const [row] = await db.select().from(diyConfig).where(eq(diyConfig.id, 1)).limit(1);
  return row ?? {
    id: 1,
    lengthCorrectionMm: 3,
    minOrderCents: 9900,
    fitToleranceMm: 8,
    wristEaseMm: 10,
    updatedAt: new Date(),
  };
}

export function formatDiyConfig(row: Awaited<ReturnType<typeof getDiyConfigRow>>) {
  return {
    lengthCorrectionMm: row.lengthCorrectionMm,
    minOrderCents: row.minOrderCents,
    fitToleranceMm: row.fitToleranceMm,
    wristEaseMm: row.wristEaseMm,
  };
}

/** 公开目录：设计器初始化数据 */
diyRouter.get("/catalog", async (_req, res) => {
  try {
    const [rows, config] = await Promise.all([
      db.select().from(diyBeads).where(eq(diyBeads.active, true)).orderBy(asc(diyBeads.sortOrder), asc(diyBeads.id)),
      getDiyConfigRow(),
    ]);
    res.json({ beads: rows.map(formatBead), config: formatDiyConfig(config) });
  } catch (err) {
    console.error("[diy] catalog:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const quoteSchema = z.object({
  beads: z.array(z.string().min(1).max(100)).min(1).max(120),
  wristCm: z.number().min(10).max(25),
});

export type DiyQuoteResult = {
  ok: true;
  totalCents: number;
  totalCentsUsd: number;
  lengthMm: number;
  effectiveLengthMm: number;
  targetMm: number;
  items: Array<{
    code: string;
    name: string;
    element: string | null;
    material: string;
    type: string;
    sizeLabel: string;
    priceCents: number;
    quantity: number;
  }>;
};

/** 服务端验价：按现价重算、校验库存与串长（防前端改价） */
export async function computeDiyQuote(beadCodes: string[], wristCm: number): Promise<DiyQuoteResult> {
  const config = await getDiyConfigRow();
  const uniqueCodes = [...new Set(beadCodes)];
  const rows = await db.select().from(diyBeads).where(inArray(diyBeads.code, uniqueCodes));
  const byCode = new Map(rows.map((r) => [r.code, r]));

  const counts = new Map<string, number>();
  for (const code of beadCodes) {
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  let totalCents = 0;
  let totalCentsUsd = 0;
  let lengthMm = 0;

  for (const [code, qty] of counts) {
    const bead = byCode.get(code);
    if (!bead || !bead.active) {
      throw new Error(`珠子不存在或已下架: ${code}`);
    }
    if (qty > bead.stock) {
      throw new Error(`「${bead.name} ${bead.diameterMm}mm」库存不足（剩余 ${bead.stock} 颗）`);
    }
    const usd = bead.priceCentsUsd != null && bead.priceCentsUsd > 0
      ? bead.priceCentsUsd
      : bead.priceCents;
    totalCents += usd * qty;
    totalCentsUsd += usd * qty;
    const len = bead.beadType === "disc" && bead.thicknessMm ? bead.thicknessMm : bead.diameterMm;
    lengthMm += len * qty;
  }

  const effectiveLengthMm = lengthMm + config.lengthCorrectionMm;
  const targetMm = wristCm * 10 + config.wristEaseMm;
  if (effectiveLengthMm < targetMm - config.fitToleranceMm) {
    throw new Error("珠子数量不足以成串，请继续添加珠子");
  }
  if (effectiveLengthMm > targetMm + config.fitToleranceMm) {
    throw new Error("串长超出所选手围，请移除部分珠子或调大手围");
  }
  if (totalCentsUsd < config.minOrderCents) {
    throw new Error(`定制手串最低金额为 ${(config.minOrderCents / 100).toFixed(2)} USDT`);
  }

  const items = [...counts.entries()].map(([code, quantity]) => {
    const bead = byCode.get(code)!;
    const unit = bead.priceCentsUsd != null && bead.priceCentsUsd > 0
      ? bead.priceCentsUsd
      : bead.priceCents;
    const sizeLabel = bead.beadType === "disc" && bead.thicknessMm
      ? `${bead.diameterMm}×${bead.thicknessMm}mm`
      : `${bead.diameterMm}mm`;
    return {
      code,
      name: bead.name,
      element: bead.element,
      material: bead.material,
      type: bead.beadType,
      sizeLabel,
      priceCents: unit,
      quantity,
    };
  });

  return { ok: true, totalCents: totalCentsUsd, totalCentsUsd, lengthMm, effectiveLengthMm, targetMm, items };
}

diyInternalRouter.post("/quote", async (req, res) => {
  try {
    const body = quoteSchema.parse(req.body);
    const quote = await computeDiyQuote(body.beads, body.wristCm);
    res.json(quote);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("[diy] quote:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const designCreateSchema = z.object({
  userId: z.number().int().positive().optional(),
  name: z.string().max(100).optional(),
  beads: z.array(z.string().min(1).max(100)).min(1).max(120),
  wristCm: z.number().min(10).max(25),
  totalCents: z.number().int().nonnegative().optional(),
  status: z.enum(["draft", "ordered"]).default("draft"),
  orderNo: z.string().max(64).optional(),
});

diyInternalRouter.post("/designs", async (req, res) => {
  try {
    const body = designCreateSchema.parse(req.body);
    const [row] = await db.insert(diyDesigns).values({
      userId: body.userId ?? null,
      name: body.name ?? null,
      beads: body.beads,
      wristCm: body.wristCm,
      totalCents: body.totalCents ?? null,
      status: body.status,
      orderNo: body.orderNo ?? null,
    }).returning();
    res.status(201).json({ id: row.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[diy] create design:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

diyInternalRouter.patch("/designs/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = z.object({
      status: z.enum(["draft", "ordered"]).optional(),
      orderNo: z.string().max(64).optional(),
    }).parse(req.body);
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.status) updates.status = body.status;
    if (body.orderNo) updates.orderNo = body.orderNo;
    const [row] = await db.update(diyDesigns).set(updates).where(eq(diyDesigns.id, id)).returning();
    if (!row) {
      res.status(404).json({ error: "设计不存在" });
      return;
    }
    res.json({ success: true, id: row.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[diy] patch design:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

diyInternalRouter.get("/designs/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const [row] = await db.select().from(diyDesigns).where(eq(diyDesigns.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "设计不存在" });
    return;
  }
  res.json({ design: row });
});
