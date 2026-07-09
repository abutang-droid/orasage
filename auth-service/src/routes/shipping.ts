import { Router } from "express";
import { estimateShippingFeeFromDb } from "../lib/shipping-zones.ts";

export const shippingRouter = Router();

/** GET /api/shipping/estimate?country=US&recipients=1&weightGrams=600 */
shippingRouter.get("/estimate", async (req, res) => {
  try {
    const country = String(req.query.country ?? "CN");
    const recipients = Math.max(1, Number(req.query.recipients) || 1);
    const weightRaw = req.query.weightGrams;
    const weightGrams = weightRaw != null && weightRaw !== "" ? Number(weightRaw) : null;
    const feeCents = await estimateShippingFeeFromDb(
      country,
      recipients,
      Number.isFinite(weightGrams) ? weightGrams : null,
    );
    res.json({ feeCents, country, recipients, weightGrams: weightGrams ?? null });
  } catch (err) {
    console.error("[shipping] estimate:", err);
    res.status(500).json({ error: "运费估算失败" });
  }
});
