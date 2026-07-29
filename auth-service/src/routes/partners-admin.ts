import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { partnerModules, partners } from "../db/schema.ts";
import {
  assertPermission,
  requireStaff,
  requireSuperAdmin,
  type AdminRequest,
} from "../lib/admin-auth.ts";
import {
  getPartnerBySlug,
  listEnabledModuleKeys,
  listModulesForPartner,
  listPartnerRows,
  PLATFORM_PARTNER_SLUG,
} from "../lib/partner-scope.ts";
import {
  DELIVERY_TEMPLATES,
  isDeliveryTemplateId,
  isPartnerModuleKey,
  modulesForTemplate,
  PARTNER_MODULE_KEYS,
  sanitizeApiKeyScopes,
} from "../../../shared/partners/index.ts";
import { hasStaffPermission } from "../../../shared/staff-permissions/index.ts";
import {
  createApiKey,
  listApiKeysForPartner,
  revokeApiKey,
} from "../lib/partner-api-keys.ts";
import { listConfigAuditLogs, recordConfigAudit } from "../lib/config-audit.ts";

export const partnersAdminRouter = Router();
partnersAdminRouter.use(requireStaff);

function formatPartner(
  row: typeof partners.$inferSelect,
  modules: Array<{ moduleKey: string; enabled: boolean }>,
) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    modules: modules.filter((m) => m.enabled).map((m) => m.moduleKey),
    moduleDetails: modules,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** 列表：超管见全部；合作方员工仅见本租户 */
partnersAdminRouter.get("/", assertPermission("platform.partners", "ops.overview"), async (req, res) => {
  const ctx = req as AdminRequest;
  try {
    const rows = await listPartnerRows();
    const canManagePartners = hasStaffPermission(ctx.staffPermissions, "platform.partners");
    const visible = canManagePartners
      ? rows
      : rows.filter((r) => r.slug === ctx.partnerId);
    const out = await Promise.all(
      visible.map(async (row) => {
        const mods = await listModulesForPartner(row.slug);
        return formatPartner(
          row,
          mods.map((m) => ({ moduleKey: m.moduleKey, enabled: m.enabled })),
        );
      }),
    );
    res.json({
      partners: out,
      platformSlug: PLATFORM_PARTNER_SLUG,
      currentPartnerId: ctx.partnerId,
    });
  } catch (err) {
    console.error("[admin/partners] list:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/** 交付模板清单（必须在 /:slug 之前注册） */
partnersAdminRouter.get("/meta/templates", assertPermission("platform.partners"), async (_req, res) => {
  res.json({
    templates: Object.entries(DELIVERY_TEMPLATES).map(([id, modules]) => ({
      id,
      modules,
    })),
  });
});

partnersAdminRouter.get("/:slug", assertPermission("platform.partners", "ops.overview"), async (req, res) => {
  const ctx = req as AdminRequest;
  const slug = String(req.params.slug ?? "").trim();
  if (!slug) {
    res.status(400).json({ error: "缺少 slug" });
    return;
  }
  if (ctx.adminUser.role !== "admin" && slug !== ctx.partnerId) {
    res.status(403).json({ error: "不可跨租户查看" });
    return;
  }
  const row = await getPartnerBySlug(slug);
  if (!row) {
    res.status(404).json({ error: "合作方不存在" });
    return;
  }
  const mods = await listModulesForPartner(slug);
  res.json({
    partner: formatPartner(
      row,
      mods.map((m) => ({ moduleKey: m.moduleKey, enabled: m.enabled })),
    ),
  });
});

const upsertSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]{0,62}$/),
  name: z.string().min(1).max(200),
  status: z.enum(["active", "disabled"]).optional(),
  modules: z.array(z.string()).optional(),
  /** Phase E 交付模板：展开为 modules（与 modules 二选一，template 优先） */
  template: z.string().optional(),
});

async function applyPartnerModules(slug: string, moduleList: string[]) {
  const wanted = new Set(moduleList.filter(isPartnerModuleKey));
  if (slug !== PLATFORM_PARTNER_SLUG) wanted.delete("platform");
  for (const key of PARTNER_MODULE_KEYS) {
    if (slug !== PLATFORM_PARTNER_SLUG && key === "platform") continue;
    const enabled = wanted.has(key);
    await db
      .insert(partnerModules)
      .values({ partnerId: slug, moduleKey: key, enabled })
      .onConflictDoUpdate({
        target: [partnerModules.partnerId, partnerModules.moduleKey],
        set: { enabled },
      });
  }
}

/** 创建 / 更新合作方（仅超管） */
partnersAdminRouter.post("/", requireSuperAdmin, assertPermission("platform.partners"), async (req, res) => {
  try {
    const body = upsertSchema.parse(req.body);
    if (body.slug === PLATFORM_PARTNER_SLUG && body.status === "disabled") {
      res.status(400).json({ error: "不可停用平台自营 orasage" });
      return;
    }
    const existing = await getPartnerBySlug(body.slug);
    let row: typeof partners.$inferSelect;
    if (existing) {
      const [updated] = await db
        .update(partners)
        .set({
          name: body.name,
          status: body.status ?? existing.status,
          updatedAt: new Date(),
        })
        .where(eq(partners.slug, body.slug))
        .returning();
      row = updated;
    } else {
      const [created] = await db
        .insert(partners)
        .values({
          slug: body.slug,
          name: body.name,
          status: body.status ?? "active",
        })
        .returning();
      row = created;
    }

    let moduleList = body.modules;
    if (body.template && isDeliveryTemplateId(body.template)) {
      moduleList = modulesForTemplate(body.template);
    }
    if (moduleList) {
      await applyPartnerModules(body.slug, moduleList);
      await recordConfigAudit({
        partnerId: body.slug,
        actorType: "staff",
        actorId: String((req as AdminRequest).adminUser.id),
        moduleKey: "platform",
        action: existing ? "partner.update_modules" : "partner.create",
        resourceType: "partners",
        resourceId: body.slug,
        after: { modules: moduleList, template: body.template ?? null },
      });
    }

    const mods = await listModulesForPartner(body.slug);
    res.status(existing ? 200 : 201).json({
      partner: formatPartner(
        row,
        mods.map((m) => ({ moduleKey: m.moduleKey, enabled: m.enabled })),
      ),
      templates: DELIVERY_TEMPLATES,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin/partners] upsert:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

partnersAdminRouter.put("/:slug/modules", requireSuperAdmin, assertPermission("platform.partners"), async (req, res) => {
  try {
    const slug = String(req.params.slug ?? "").trim();
    const body = z.object({
      modules: z.array(z.string()).optional(),
      template: z.string().optional(),
    }).parse(req.body);
    const row = await getPartnerBySlug(slug);
    if (!row) {
      res.status(404).json({ error: "合作方不存在" });
      return;
    }
    let moduleList = body.modules ?? [];
    if (body.template && isDeliveryTemplateId(body.template)) {
      moduleList = modulesForTemplate(body.template);
    }
    await applyPartnerModules(slug, moduleList);
    if (slug !== PLATFORM_PARTNER_SLUG) {
      await db
        .delete(partnerModules)
        .where(and(eq(partnerModules.partnerId, slug), eq(partnerModules.moduleKey, "platform")));
    }
    const modules = await listEnabledModuleKeys(slug);
    await recordConfigAudit({
      partnerId: slug,
      actorType: "staff",
      actorId: String((req as AdminRequest).adminUser.id),
      moduleKey: "platform",
      action: "partner.update_modules",
      resourceType: "partner_modules",
      resourceId: slug,
      after: { modules, template: body.template ?? null },
    });
    res.json({ slug, modules });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin/partners] modules:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

/* ── Phase E：API Keys ───────────────────────────────────── */

partnersAdminRouter.get(
  "/:slug/api-keys",
  requireSuperAdmin,
  assertPermission("platform.partners"),
  async (req, res) => {
    const slug = String(req.params.slug ?? "").trim();
    if (!(await getPartnerBySlug(slug))) {
      res.status(404).json({ error: "合作方不存在" });
      return;
    }
    const keys = await listApiKeysForPartner(slug);
    res.json({ keys });
  },
);

partnersAdminRouter.post(
  "/:slug/api-keys",
  requireSuperAdmin,
  assertPermission("platform.partners"),
  async (req, res) => {
    try {
      const slug = String(req.params.slug ?? "").trim();
      if (!(await getPartnerBySlug(slug))) {
        res.status(404).json({ error: "合作方不存在" });
        return;
      }
      const body = z.object({
        name: z.string().max(120).optional(),
        scopes: z.array(z.string()).optional(),
      }).parse(req.body);
      const ctx = req as AdminRequest;
      const { key, raw } = await createApiKey({
        partnerId: slug,
        name: body.name,
        scopes: body.scopes ? sanitizeApiKeyScopes(body.scopes) : undefined,
        createdBy: ctx.adminUser.id,
      });
      await recordConfigAudit({
        partnerId: slug,
        actorType: "staff",
        actorId: String(ctx.adminUser.id),
        moduleKey: "platform",
        action: "api_key.create",
        resourceType: "partner_api_keys",
        resourceId: String(key.id),
        after: { keyPrefix: key.keyPrefix, scopes: key.scopes },
      });
      res.status(201).json({
        key,
        raw,
        note: "明文 Key 仅此一次返回，请立即保存。",
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ error: "参数错误", details: err.errors });
        return;
      }
      console.error("[admin/partners] create api key:", err);
      res.status(500).json({ error: "服务器内部错误" });
    }
  },
);

partnersAdminRouter.post(
  "/:slug/api-keys/:id/revoke",
  requireSuperAdmin,
  assertPermission("platform.partners"),
  async (req, res) => {
    const slug = String(req.params.slug ?? "").trim();
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const key = await revokeApiKey(slug, id);
    if (!key) {
      res.status(404).json({ error: "Key 不存在" });
      return;
    }
    await recordConfigAudit({
      partnerId: slug,
      actorType: "staff",
      actorId: String((req as AdminRequest).adminUser.id),
      moduleKey: "platform",
      action: "api_key.revoke",
      resourceType: "partner_api_keys",
      resourceId: String(id),
    });
    res.json({ key });
  },
);

partnersAdminRouter.get(
  "/:slug/audit-logs",
  requireSuperAdmin,
  assertPermission("platform.partners"),
  async (req, res) => {
    const slug = String(req.params.slug ?? "").trim();
    if (!(await getPartnerBySlug(slug))) {
      res.status(404).json({ error: "合作方不存在" });
      return;
    }
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const logs = await listConfigAuditLogs(slug, limit);
    res.json({ logs });
  },
);
