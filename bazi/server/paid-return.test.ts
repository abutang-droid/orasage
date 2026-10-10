/**
 * 回归：付完仍停在解锁页。
 * 禁止 paid=1 打开 free HTML；禁止从回跳 URL 剥掉 paid。
 * 禁止付费/restore 失败落到经典合盘表单。
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
  it("Home waits for paid HTML and never dumps to classic couple form", () => {
    const home = read("pages/Home.tsx");
    expect(home).toContain("waitForPaidReport");
    expect(home).toContain("ensurePaidReport");
    expect(home).toContain("paid-waiting");
    expect(home).toMatch(/await ensurePaidReport\.mutateAsync/);
    expect(home).toMatch(/paidPath[\s\S]{0,400}probeFixedReport/);
    expect(home).not.toMatch(/waitForPaidReport[\s\S]{0,300}setView\(['"]form['"]\)/);
    expect(home).toMatch(/snapshot\.mode === ['"]couple['"] && !wantsCouple/);
  });

  it("Vibe and couple views wait for paid; fall back to existing report not form", () => {
    const vibe = read("components/VibeBaziReport.tsx");
    const couple = read("components/BaziResult.tsx");
    expect(vibe).toContain("waitForPaidReport");
    expect(couple).toContain("waitForPaidReport");
    expect(vibe).toMatch(/paidPath[\s\S]{0,300}probeFixedReport/);
    expect(couple).toMatch(/paidPath[\s\S]{0,300}probeFixedReport/);
    expect(vibe).not.toMatch(/if \(!paidRestore \|\| res\.tier === "paid"\)/);
    expect(couple).not.toMatch(/!paidRestore \|\| res\.tier === "paid"/);
  });

  it("payment hook keeps paid=1 on the return URL", () => {
    const flow = read("_core/hooks/usePaymentFlow.ts");
    expect(flow).not.toMatch(/searchParams\.delete\(\s*["']paid["']\s*\)/);
  });
});
