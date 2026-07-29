import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { appBillingSlots, products } from "../db/schema.ts";
import {
  requireConfigWrite,
  requireModuleScope,
  requirePartnerApiKey,
  type ModuleApiRequest,
} from "../lib/module-api-auth.ts";
import { getPartnerBySlug } from "../lib/partner-scope.ts";
import {
  getShopPublicConfig,
  setShopHomeLayout,
  SHOP_HOME_LAYOUTS,
} from "../lib/shop-settings.ts";
import { listHomepageFeaturedSkus } from "../lib/homepage-products.ts";
import { listConfigAuditLogs, recordConfigAudit } from "../lib/config-audit.ts";
import { formatAdminProduct } from "../lib/product-format.ts";

export const moduleApiV1Router = Router({ mergeParams: true });

moduleApiV1Router.use("/:partnerSlug", requirePartnerApiKey());

moduleApiV1Router.get("/:partnerSlug", async (req, res) => {
  const ctx = req as ModuleApiRequest;
  const partner = await getPartnerBySlug(ctx.moduleApi.partnerId);
  res.json({
    partner: {
      slug: partner!.slug,
      name: partner!.name,
      status: partner!.status,
      modules: ctx.moduleApi.enabledModules,
    },
    scopes: [...ctx.moduleApi.scopes],
    apiVersion: "v1",
  });
});

moduleApiV1Router.get("/:partnerSlug/modules", async (req, res) => {
  const ctx = req as ModuleApiRequest;
  res.json({
    partnerId: ctx.moduleApi.partnerId,
    modules: ctx.moduleApi.enabledModules.map((moduleKey) => ({
      moduleKey,
      enabled: true,
      scoped: ctx.moduleApi.scopes.has(`module:${moduleKey}`),
    })),
  });
});

moduleApiV1Router.get(
  "/:partnerSlug/shop/products",
  requireModuleScope("shop"),
  async (req, res) => {
    const ctx = req as ModuleApiRequest;
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.partnerId, ctx.moduleApi.partnerId), eq(products.active, true)))
      .orderBy(asc(products.sortOrder), asc(products.id));
    res.json({
      products: rows.map((row) =>
        formatAdminProduct(row),
      ),
    });
  },
);

moduleApiV1Router.get(
  "/:partnerSlug/shop/storefront",
  requireModuleScope("shop"),
  async (req, res) => {
    const ctx = req as ModuleApiRequest;
    const [config, skus] = await Promise.all([
      getShopPublicConfig(ctx.moduleApi.partnerId),
      listHomepageFeaturedSkus(ctx.moduleApi.partnerId),
    ]);
    res.json({
      partnerId: ctx.moduleApi.partnerId,
      homeLayout: config.homeLayout,
      homepageSkus: skus,
      layouts: SHOP_HOME_LAYOUTS,
    });
  },
);

const storefrontPutSchema = z.object({
  homeLayout: z.enum(SHOP_HOME_LAYOUTS),
});

moduleApiV1Router.put(
  "/:partnerSlug/shop/storefront",
  requireModuleScope("shop"),
  requireConfigWrite(),
  async (req, res) => {
    const ctx = req as ModuleApiRequest;
    try {
      const body = storefrontPutSchema.parse(req.body);
      const before = await getShopPublicConfig(ctx.moduleApi.partnerId);
      const homeLayout = await setShopHomeLayout(body.homeLayout, ctx.moduleApi.partnerId);
      await recordConfigAudit({
        partnerId: ctx.moduleApi.partnerId,
        actorType: "api_key",
        actorId: String(ctx.moduleApi.keyId),
        moduleKey: "shop",
        action: "storefront.update",
        resourceType: "shop_settings",
        resourceId: "home_layout",
        before,
        after: { homeLayout },
      });
      res.json({ homeLayout });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(422).json({ error: "参数错误", code: "validation_error", details: err.errors });
        return;
      }
      console.error("[module-api] storefront put:", err);
      res.status(500).json({ error: "服务器内部错误" });
    }
  },
);

moduleApiV1Router.get(
  "/:partnerSlug/billing/slots",
  requireModuleScope("billing"),
  async (req, res) => {
    const ctx = req as ModuleApiRequest;
    const slots = await db
      .select()
      .from(appBillingSlots)
      .where(eq(appBillingSlots.partnerId, ctx.moduleApi.partnerId))
      .orderBy(
        asc(appBillingSlots.appSource),
        asc(appBillingSlots.slotKey),
        asc(appBillingSlots.sortOrder),
      );
    res.json({ slots });
  },
);

const APP_IDS = ["bazi", "ziwei", "tarot"] as const;

moduleApiV1Router.get("/:partnerSlug/apps/:appId", async (req, res) => {
  const ctx = req as ModuleApiRequest;
  const appId = String(req.params.appId ?? "").trim();
  if (!(APP_IDS as readonly string[]).includes(appId)) {
    res.status(404).json({ error: "未知应用", code: "unknown_app" });
    return;
  }
  const moduleKey = `app.${appId}` as "app.bazi" | "app.ziwei" | "app.tarot";
  if (!ctx.moduleApi.scopes.has(`module:${moduleKey}`)) {
    res.status(403).json({ error: `缺少 module:${moduleKey}`, code: "module_scope_denied" });
    return;
  }
  res.json({
    appId,
    moduleKey,
    partnerId: ctx.moduleApi.partnerId,
    links: {
      contentHeroes: `/content/heroes?app=${appId}`,
      billing: `/billing?app=${appId}`,
    },
    note: "深链概览；内容编辑走自研 Admin /content，不开放 Payload。",
  });
});

moduleApiV1Router.get("/:partnerSlug/audit", async (req, res) => {
  const ctx = req as ModuleApiRequest;
  const limit = Math.min(Number(req.query.limit) || 30, 100);
  const logs = await listConfigAuditLogs(ctx.moduleApi.partnerId, limit);
  res.json({
    partnerId: ctx.moduleApi.partnerId,
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      moduleKey: l.moduleKey,
      actorType: l.actorType,
      resourceType: l.resourceType,
      resourceId: l.resourceId,
      createdAt: l.createdAt,
    })),
  });
});
