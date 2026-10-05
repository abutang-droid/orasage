/**
 * 回归：付完仍停在解锁页。
 * 禁止 paid=1 打开 free HTML；禁止从回跳 URL 剥掉 paid。
 */
import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const client = path.resolve(here, "../client/src");

function read(rel: string) {
  return fs.readFileSync(path.join(client, rel), "utf8");
}

describe("paid return never opens free paywall HTML", () => {
  it("Home waits for paid HTML instead of probing any existing file", () => {
    const home = read("pages/Home.tsx");
    expect(home).toContain("waitForPaidReport");
    expect(home).toContain("ensurePaidReport");
    expect(home).toContain("paid-waiting");
    expect(home).not.toMatch(/params\.get\(['"]paid['"]\) === ['"]1['"][\s\S]{0,500}probeFixedReport/);
  });

  it("Vibe and couple views wait for paid instead of opening reused free files", () => {
    const vibe = read("components/VibeBaziReport.tsx");
    const couple = read("components/BaziResult.tsx");
    expect(vibe).toContain("waitForPaidReport");
    expect(couple).toContain("waitForPaidReport");
    expect(vibe).not.toMatch(/if \(!paidRestore \|\| res\.tier === "paid"\)/);
    expect(couple).not.toMatch(/!paidRestore \|\| res\.tier === "paid"/);
  });

  it("payment hook keeps paid=1 on the return URL", () => {
    const flow = read("_core/hooks/usePaymentFlow.ts");
    expect(flow).not.toMatch(/searchParams\.delete\(\s*["']paid["']\s*\)/);
  });
});
