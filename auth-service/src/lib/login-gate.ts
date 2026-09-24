/** 登录页：已有会话时不要再甩出登录表单（后台回跳会形成反复登录）。 */

export type LoginPageGate =
  | { kind: "show-form" }
  | { kind: "redirect"; to: string }
  | { kind: "staff-denied" }
  | { kind: "session-mismatch" };

export function isStaffAdminDestination(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "admin.orasage.com" || host === "cms.orasage.com";
  } catch {
    return false;
  }
}

export function loginPageGate(input: {
  user: { isActiveStaff: boolean } | null;
  redirectTo: string;
  bouncedFromAdmin: boolean;
}): LoginPageGate {
  const { user, redirectTo, bouncedFromAdmin } = input;
  if (!user) return { kind: "show-form" };

  if (isStaffAdminDestination(redirectTo)) {
    if (!user.isActiveStaff) return { kind: "staff-denied" };
    if (bouncedFromAdmin) return { kind: "session-mismatch" };
  }

  return { kind: "redirect", to: redirectTo };
}
