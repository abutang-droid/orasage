import { describe, it, expect } from "vitest";
import { writeFileSync } from "fs";
import { calcSingleBazi, loadLunarLib } from "../client/src/lib/bazi.ts";
import { buildTieKouFreeInsight } from "../client/src/lib/tiekou-insight.ts";

describe("real cast smoke for Tie Kou UI", () => {
  it("calcSingleBazi emits four-layer fields consumed by free insight", async () => {
    const orig = globalThis.fetch;
    globalThis.fetch = async (input: any) => {
      const url = String(input);
      if (url.includes("/data/") || url.startsWith("/")) {
        const name = url.split("/data/").pop()!.split("?")[0];
        const { readFileSync } = await import("fs");
        const body = readFileSync(`./client/public/data/${name}`);
        return new Response(body, { headers: { "content-type": "application/json" } });
      }
      return orig(input as any);
    };

    await loadLunarLib();
    const data = await calcSingleBazi({
      name: "测试",
      gender: "male",
      year: 1990,
      month: 5,
      day: 15,
      hour: 8,
      minute: 0,
      calendar: "gregorian",
      birthplace: "北京",
      cityName: "北京",
      lng: 116.4074,
      lat: 39.9042,
      timezone: "+8",
    });

    expect(data.riZhu).toBeTruthy();
    expect(data.pattern?.primary || data.pattern?.fullLabel).toBeTruthy();
    expect(data.oneLineHit?.headline).toBeTruthy();
    expect(data.mingLiSummary?.overview).toMatch(/格局|一句击中|喜用神/);

    const insight = buildTieKouFreeInsight(data);
    const titles = insight.blocks.map((b) => b.title).join("|");
    expect(titles).toContain("铁口直断 · 格局强弱喜忌");
    expect(insight.blocks.some((b) => b.kind === "creed")).toBe(true);

    // Optional local dump for manual UI restore testing (ignored if dir missing).
    try {
      writeFileSync("/tmp/tiekou-fixture/real-cast.json", JSON.stringify({ type: "single", data }));
    } catch {
      /* ignore */
    }
  });
});
