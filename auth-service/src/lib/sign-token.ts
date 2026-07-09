import { signToken, type JwtPayload } from "./jwt.ts";
import { isStaffRole } from "../../../shared/staff-roles/index.ts";
import type { users } from "../db/schema.ts";
import { effectivePermissionsArray, userIsActiveStaff } from "./staff-permissions.ts";

export async function signTokenForUser(user: typeof users.$inferSelect): Promise<string> {
  const payload: JwtPayload = { sub: String(user.id), role: user.role };
  if (isStaffRole(user.role) && userIsActiveStaff(user)) {
    payload.perms = effectivePermissionsArray(user).join(",");
  }
  return signToken(payload);
}

export function parsePermsFromJwt(perms?: string): string[] {
  if (!perms) return [];
  return perms.split(",").map((s) => s.trim()).filter(Boolean);
}
