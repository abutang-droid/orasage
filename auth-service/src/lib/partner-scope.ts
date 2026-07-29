import { and, eq } from "drizzle-orm";
import type { Request } from "express";
import { db } from "../db/index.ts";
import { partnerModules, partners } from "../db/schema.ts";
import {
  PLATFORM_PARTNER_SLUG,
  applyPartnerPermissionScope,
} from "../../../shared/partners/index.ts";
import type { AnyStaffPermission } from "../../../shared/staff-permissions/index.ts";
import type { AdminRequest } from "./admin-auth.ts";
import type { StaffAuthUser } from "./staff-permissions.ts";

export { PLATFORM_PARTNER_SLUG };

export async function listPartnerRows() {
  return db.select().from(partners).orderBy(partners.id);
}

export async function getPartnerBySlug(slug: string) {
  const [row] = await db.select().from(partners).where(eq(partners.slug, slug)).limit(1);
  return row ?? null;
}

export async function listEnabledModuleKeys(partnerId: string): Promise<string[]> {
  const rows = await db
    .select({ moduleKey: partnerModules.moduleKey })
    .from(partnerModules)
    .where(and(eq(partnerModules.partnerId, partnerId), eq(partnerModules.enabled, true)));
  return rows.map((r) => r.moduleKey);
}

export async function listModulesForPartner(partnerId: string) {
  return db
    .select()
    .from(partnerModules)
    .where(eq(partnerModules.partnerId, partnerId))
    .orderBy(partnerModules.moduleKey);
}

export function resolveStaffPartnerId(user: StaffAuthUser): string {
  return user.partnerId?.trim() || PLATFORM_PARTNER_SLUG;
}

/**
 * 当前请求的租户作用域。
 * 超管可通过 ?partner= 切换查看其它合作方数据。
 */
export function scopedPartnerId(req: Request): string {
  const ctx = req as AdminRequest;
  if (ctx.adminUser?.role === "admin") {
    const q = req.query.partner;
    if (typeof q === "string" && /^[a-z0-9][a-z0-9-]{0,62}$/.test(q)) {
      return q;
    }
  }
  return ctx.partnerId || PLATFORM_PARTNER_SLUG;
}

export async function scopePermissionsForStaff(
  user: StaffAuthUser,
  base: ReadonlySet<AnyStaffPermission>,
): Promise<{ partnerId: string; modules: string[]; permissions: Set<AnyStaffPermission> }> {
  const partnerId = resolveStaffPartnerId(user);
  const modules = await listEnabledModuleKeys(partnerId);
  const permissions = applyPartnerPermissionScope(base, {
    partnerId,
    enabledModules: modules,
    isPlatformAdmin: user.role === "admin",
  });
  return { partnerId, modules, permissions };
}
