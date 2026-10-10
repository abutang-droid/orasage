import { describe, expect, it } from "vitest";
import {
  assertPayerMayUnlock,
  canPayerUnlockReading,
  parseReportTierFromHtml,
} from "./reportUnlock.ts";

describe("canPayerUnlockReading", () => {
  it("lets the owning account unlock its own reading", () => {
    expect(canPayerUnlockReading(3, 3)).toBe(true);
  });

  it("lets a logged-in payer claim a guest reading (userId 0)", () => {
    expect(canPayerUnlockReading(0, 3)).toBe(true);
  });

  it("rejects another account unlocking someone else's reading", () => {
    expect(canPayerUnlockReading(3, 7)).toBe(false);
  });

  it("rejects guest or invalid payer ids", () => {
    expect(canPayerUnlockReading(0, 0)).toBe(false);
    expect(canPayerUnlockReading(3, 0)).toBe(false);
    expect(canPayerUnlockReading(0, -1)).toBe(false);
    expect(canPayerUnlockReading(1.5, 3)).toBe(false);
  });

  it("throws the live job error string on mismatch", () => {
    expect(() => assertPayerMayUnlock(3, 7)).toThrow("reading user mismatch");
    expect(() => assertPayerMayUnlock(0, 3)).not.toThrow();
  });
});

describe("parseReportTierFromHtml", () => {
  it("reads paid vs free markers", () => {
    expect(parseReportTierFromHtml(`<html lang="zh-CN" data-report-tier="paid">`)).toBe("paid");
    expect(parseReportTierFromHtml(`<html data-report-tier="free"><a class="paywall-cta"`)).toBe("free");
  });

  it("treats unmarked paywall pages as free, not paid", () => {
    expect(parseReportTierFromHtml(`<!doctype html><div class="paywall-section">解锁`)).toBe("free");
  });
});
