/**
 * 免费结果页的铁口直断引擎展示数据。
 * 罗盘起盘会跳到 classic 结果页；此处必须消费四层过滤字段，不能再走白话 composeFreeReport。
 */
import type { SingleBaziResult } from "./bazi";

export type TieKouInsightBlock = {
  kind: "hit" | "verdict" | "climate" | "dead" | "flow" | "summary" | "dayun" | "shensha" | "creed";
  title: string;
  body: string;
  meta?: Record<string, string>;
};

export function buildTieKouFreeInsight(result: SingleBaziResult): {
  headline: string;
  subline: string;
  patternLabel: string;
  strength: string;
  favorable: string;
  unfavorable: string;
  blocks: TieKouInsightBlock[];
} {
  const hit = result.oneLineHit;
  const patternLabel = result.pattern?.fullLabel || result.pattern?.primary || "—";
  const favorable = result.favorable?.length ? result.favorable.join(" / ") : "均衡";
  const unfavorable = result.unfavorable?.length ? result.unfavorable.join(" / ") : "均衡";
  const blocks: TieKouInsightBlock[] = [];

  if (hit?.headline) {
    blocks.push({
      kind: "hit",
      title: "一句击中",
      body: hit.subline ? `${hit.headline} · ${hit.subline}` : hit.headline,
    });
  }

  blocks.push({
    kind: "verdict",
    title: "铁口直断 · 格局强弱喜忌",
    body: result.pattern?.description || "",
    meta: {
      格局: patternLabel,
      强弱: result.strength || "—",
      喜用: favorable,
      忌神: unfavorable,
    },
  });

  if (result.climate?.active && result.climate.description) {
    blocks.push({
      kind: "climate",
      title: "调候（L2）",
      body: result.climate.description,
    });
  }

  const dead = result.deadPoint;
  if (dead?.insight || dead?.mechanism) {
    const head = dead.target ? `${dead.target}←${dead.attacker || "?"} — ` : "";
    blocks.push({
      kind: "dead",
      title: "死锁点（L4）",
      body: `${head}${dead.insight || dead.mechanism}`,
    });
  }

  const flows = (result.flowIssues ?? []).slice(0, 4);
  if (flows.length) {
    blocks.push({
      kind: "flow",
      title: "气机（L3）",
      body: flows
        .map((issue) => `${issue.label || issue.severity || "气机"}：${issue.description || ""}`)
        .join("\n"),
    });
  }

  if (result.mingLiSummary?.overview) {
    const parts = [
      result.mingLiSummary.overview,
      result.mingLiSummary.personality,
      result.mingLiSummary.career,
    ].filter(Boolean);
    blocks.push({
      kind: "summary",
      title: "命理小结",
      body: parts.join("\n"),
    });
  }

  const daYun = (result.daYun ?? []).slice(0, 8);
  if (daYun.length) {
    blocks.push({
      kind: "dayun",
      title: "大运",
      body: daYun.map((dy) => `${dy.gan}${dy.zhi}（${dy.startAge}岁起）`).join(" · "),
    });
  }

  const shensha = Object.entries(result.shensha ?? {}).filter(([, vals]) => vals?.length);
  if (shensha.length) {
    blocks.push({
      kind: "shensha",
      title: "神煞",
      body: shensha.map(([name, vals]) => `${name}：${vals.join("、")}`).join("；"),
    });
  }

  blocks.push({
    kind: "creed",
    title: "铁口直断 · 四层过滤",
    body: "四柱、藏干加权五行、格局、调候、气机、死锁点、喜忌、大运、神煞均来自 OraSage 排盘引擎。本盘不构成任何医疗、法律、财务或人生决策建议。",
  });

  return {
    headline: hit?.headline || patternLabel,
    subline: hit?.subline || "",
    patternLabel,
    strength: result.strength || "—",
    favorable,
    unfavorable,
    blocks,
  };
}
