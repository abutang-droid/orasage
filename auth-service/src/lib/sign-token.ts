import { signToken, type JwtPayload } from "./jwt.ts";
import { isStaffRole } from "../../../shared/staff-roles/index.ts";
import type { users } from "../db/schema.ts";
import { effectivePermissionsForUser, userIsActiveStaff } from "./staff-permissions.ts";
import { scopePermissionsForStaff } from "./partner-scope.ts";

export async function signTokenForUser(user: typeof users.$inferSelect): Promise<string> {
  const payload: JwtPayload = { sub: String(user.id), role: user.role };
  if (isStaffRole(user.role) && userIsActiveStaff(user)) {
    const base = effectivePermissionsForUser(user);
    const scoped = await scopePermissionsForStaff(user, base);
    payload.perms = [...scoped.permissions].join(",");
  }
  return signToken(payload);
}

export function parsePermsFromJwt(perms?: string): string[] {
  if (!perms) return [];
  return perms.split(",").map((s) => s.trim()).filter(Boolean);
}
