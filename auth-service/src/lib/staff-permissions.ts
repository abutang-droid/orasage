import {
  permissionsToArray,
  resolveStaffPermissions,
  type AnyStaffPermission,
  type StaffPermissionInput,
} from "../../../shared/staff-permissions/index.ts";
import { isStaffRole } from "../../../shared/staff-roles/index.ts";
import type { users } from "../db/schema.ts";

export type StaffAuthUser = typeof users.$inferSelect;

export function staffPermissionInput(user: StaffAuthUser): StaffPermissionInput {
  return {
    role: isStaffRole(user.role) ? user.role : "shop_ops",
    grants: user.staffGrants,
    revokes: user.staffRevokes,
  };
}

export function effectivePermissionsForUser(user: StaffAuthUser): Set<AnyStaffPermission> {
  if (!isStaffRole(user.role)) return new Set();
  return resolveStaffPermissions(staffPermissionInput(user));
}

export function effectivePermissionsArray(user: StaffAuthUser): AnyStaffPermission[] {
  return permissionsToArray(effectivePermissionsForUser(user));
}

export function userIsActiveStaff(user: StaffAuthUser): boolean {
  return isStaffRole(user.role) && !user.staffDisabled;
}
