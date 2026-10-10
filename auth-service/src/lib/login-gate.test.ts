import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isStaffAdminDestination, loginPageGate } from "./login-gate.ts";

describe("isStaffAdminDestination", () => {
  it("matches admin and cms hosts", () => {
    assert.equal(isStaffAdminDestination("https://admin.orasage.com"), true);
    assert.equal(isStaffAdminDestination("https://admin.orasage.com/cms/admin"), true);
    assert.equal(isStaffAdminDestination("https://cms.orasage.com/admin"), true);
    assert.equal(isStaffAdminDestination("https://orasage.com/zh-CN/profile"), false);
    assert.equal(isStaffAdminDestination("/center"), false);
  });
});

describe("loginPageGate", () => {
  it("shows the form when logged out", () => {
    assert.deepEqual(
      loginPageGate({
        user: null,
        redirectTo: "https://admin.orasage.com",
        bouncedFromAdmin: true,
      }),
      { kind: "show-form" },
    );
  });

  it("redirects a staff user to admin on first landing", () => {
    assert.deepEqual(
      loginPageGate({
        user: { isActiveStaff: true },
        redirectTo: "https://admin.orasage.com",
        bouncedFromAdmin: false,
      }),
      { kind: "redirect", to: "https://admin.orasage.com" },
    );
  });

  it("does not re-show login when a regular user is bounced from admin", () => {
    assert.deepEqual(
      loginPageGate({
        user: { isActiveStaff: false },
        redirectTo: "https://admin.orasage.com/cms/admin",
        bouncedFromAdmin: true,
      }),
      { kind: "staff-denied" },
    );
  });

  it("breaks the staff bounce loop when admin rejected a valid session", () => {
    assert.deepEqual(
      loginPageGate({
        user: { isActiveStaff: true },
        redirectTo: "https://admin.orasage.com",
        bouncedFromAdmin: true,
      }),
      { kind: "session-mismatch" },
    );
  });

  it("still sends a logged-in user to profile", () => {
    assert.deepEqual(
      loginPageGate({
        user: { isActiveStaff: false },
        redirectTo: "https://orasage.com/zh-CN/profile",
        bouncedFromAdmin: false,
      }),
      { kind: "redirect", to: "https://orasage.com/zh-CN/profile" },
    );
  });
});
