/**
 * 八字报告页 — Vibe Camp 视觉皮肤（单人）
 * 交互/支付/AI 解读契约不变；仅重做免费预览 + 章节壳层。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Archive,
  ArrowLeft,
  BarChart3,
  Brain,
  Briefcase,
  Check,
  ExternalLink,
  Grid2x2,
  Heart,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { SingleBaziResult } from "@/lib/bazi";
import { recommendBracelet } from "@/lib/bazi";
import { useT } from "@/lib/i18n";
import { usePaymentFlow } from "@/_core/hooks/usePaymentFlow";
import type { PlanType } from "@shared/types";
import { composeFreeReport } from "@shared/free-report";
import { STEM_WX, strengthKind, strengthShort } from "@shared/vernacular";
import { fetchBaziPlanProducts, type PlanProductInfo } from "@/lib/plan-products";
import { PlanSelectionModal } from "@/components/PlanSelectionModal";
import { BaziConfiguredProductRecommend } from "@/components/BaziConfiguredProductRecommend";
import {
  buildWxPieModel,
  classifyWxBalance,
  type WxPolarName,
} from "@/lib/wuxingPolar";
import {
  ensureReadingId,
  getStaticReportHref,
  materializeStaticReport,
} from "@/lib/static-report";
import "@/styles/bazi-report-vibe.css";

const WX_BAR_ORDER: WxPolarName[] = ["金", "火", "土", "水", "木"];
const WX_CHART_COLOR: Record<WxPolarName, string> = {
  金: "var(--vibe-chart-1)",
  火: "var(--vibe-chart-2)",
  土: "var(--vibe-chart-3)",
  水: "var(--vibe-chart-4)",
  木: "var(--vibe-chart-5)",
};
const WX_TRAIT_ZH: Record<WxPolarName, string> = {
  金: "决断",
  火: "热情",
  土: "稳定",
  水: "智慧",
  木: "生长",
};

const TEASER_ICONS = [Brain, Briefcase, Heart, Activity, TrendingUp] as const;

function strengthPct(strength: string): number {
  const k = strengthKind(strength);
  if (k === "身强") return 84;
  if (k === "身弱") return 42;
  return 72;
}

function firstSentence(text: string, max = 42): string {
  const s = text.split(/[。！？\n]/)[0]?.trim() ?? text.trim();
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function DonutChart({
  slices,
}: {
  slices: Array<{ name: WxPolarName; percent: number; value: number }>;
}) {
  const r = 42;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const top = [...slices].sort((a, b) => b.percent - a.percent)[0];
  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
        {slices.map((s) => {
          const len = (s.percent / 100) * C;
          const dash = `${Math.max(len - 1.5, 0)} ${C - Math.max(len - 1.5, 0)}`;
          const el = (
            <circle
              key={s.name}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={WX_CHART_COLOR[s.name]}
              strokeWidth="10"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px]" style={{ color: "var(--vibe-muted-foreground)" }}>
          最旺
        </span>
        <span className="vr-serif text-2xl font-semibold" style={{ color: "var(--vibe-foreground)" }}>
          {top ? `${top.name}旺` : "—"}
        </span>
        <span className="text-sm font-medium" style={{ color: "var(--vibe-chart-1)" }}>
          {top ? `${top.percent}%` : ""}
        </span>
      </div>
    </div>
  );
}

function RadarChart({
  slices,
}: {
  slices: Array<{ name: WxPolarName; value: number }>;
}) {
  const order: WxPolarName[] = ["金", "火", "土", "水", "木"];
  const CX = 130;
  const CY = 110;
  const R = 75;
  const maxVal = Math.max(...slices.map((s) => s.value), 1);
  const byName = new Map(slices.map((s) => [s.name, s.value]));
  const angles = order.map((_, i) => ((i * 72 - 90) * Math.PI) / 180);
  const point = (idx: number, ratio: number) => ({
    x: CX + R * ratio * Math.cos(angles[idx]),
    y: CY + R * ratio * Math.sin(angles[idx]),
  });
  const grid = [1, 0.8, 0.6, 0.4, 0.2].map((ratio) =>
    order.map((_, i) => {
      const p = point(i, ratio);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(" "),
  );
  const dataPts = order.map((name, i) => {
    const p = point(i, (byName.get(name) ?? 0) / maxVal);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(" ");
  const labelPos = order.map((name, i) => {
    const p = point(i, 1.18);
    return { name, value: byName.get(name) ?? 0, ...p };
  });

  return (
    <svg viewBox="0 0 260 220" className="mx-auto h-auto w-full max-w-[260px]" aria-label="五行雷达图">
      {grid.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="var(--vibe-border)" strokeWidth="1" />
      ))}
      {angles.map((a, i) => (
        <line
          key={i}
          x1={CX}
          y1={CY}
          x2={CX + R * Math.cos(a)}
          y2={CY + R * Math.sin(a)}
          stroke="var(--vibe-border)"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={dataPts}
        fill="color-mix(in srgb, var(--vibe-brand) 18%, transparent)"
        stroke="var(--vibe-brand)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {labelPos.map((lp) => (
        <text
          key={lp.name}
          x={lp.x}
          y={lp.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontWeight="500"
          fill="var(--vibe-foreground)"
        >
          {lp.name} {lp.value.toFixed(1)}
        </text>
      ))}
    </svg>
  );
}

function VibePaywall({
  selectedPlan,
  onSelectPlan,
  onPay,
  payLoading,
}: {
  selectedPlan: PlanType | null;
  onSelectPlan: (plan: PlanType) => void;
  onPay: (plan?: PlanType) => void;
  payLoading: boolean;
}) {
  const { t } = useT();
  const [plans, setPlans] = useState<PlanProductInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchBaziPlanProducts("single").then((list) => {
      if (!cancelled) {
        setPlans(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = plans.find((p) => p.type === selectedPlan) ?? plans.find((p) => p.highlight) ?? plans[0];

  return (
    <article className="vr-paywall" data-testid="bazi-paywall" data-dom-id="paywall-card">
      <div className="vr-paywall-glow" aria-hidden />
      <div className="vr-paywall-body">
        <div className="vr-diamond mb-3">
          <span className="vr-diamond-dot" />
        </div>
        <p className="vr-eyebrow mb-2">Unlock Full Report</p>
        <h3 className="vr-display text-2xl font-medium" style={{ color: "var(--vibe-foreground)" }}>
          解锁完整八字报告
        </h3>
        <p className="vr-serif mt-2 text-xs italic" style={{ color: "var(--vibe-muted-foreground)" }}>
          七大章节深度解析 · 终身运程详细推演
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs" style={{ color: "var(--vibe-foreground)" }}>
          {["命盘总览", "性格天赋", "事业财富", "感情关系", "健康管理", "大运流年", "开运建议"].map((label) => (
            <span key={label} className="vr-sans flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: "var(--vibe-brand)" }} />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-2" role="radiogroup" aria-label={t("paywall.choose_tier", "选择报告方案")}>
          {plans.map((plan) => {
            const active = (selectedPlan ?? selected?.type) === plan.type;
            const label = t(`plan.${plan.type}.name`, plan.name || plan.type);
            return (
              <button
                key={plan.type}
                type="button"
                role="radio"
                aria-checked={active}
                data-plan={plan.type}
                onClick={() => onSelectPlan(plan.type)}
                className="vr-sans flex w-full items-center justify-between rounded-full border px-4 py-2.5 text-left text-sm transition-colors"
                style={{
                  borderColor: active ? "var(--vibe-brand)" : "var(--vibe-border)",
                  background: active ? "var(--vibe-brand-faded)" : "var(--vibe-surface)",
                  color: active ? "var(--vibe-brand-deep)" : "var(--vibe-foreground)",
                }}
              >
                <span className="font-medium">{label}</span>
                <span className="font-semibold" style={{ color: "var(--vibe-brand)" }}>
                  {loading ? "…" : plan.priceDisplay}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-end justify-center gap-3">
          <div className="vr-price">
            {loading ? "…" : selected?.priceDisplay ?? "—"}
          </div>
        </div>
        <p className="vr-sans mt-1 text-[11px]" style={{ color: "var(--vibe-text-light)" }}>
          / 完整报告
        </p>

        <button
          type="button"
          className="vr-btn-primary mt-4"
          data-testid="bazi-paywall-unlock"
          disabled={!selected || payLoading}
          onClick={() => {
            if (!selected) return;
            onSelectPlan(selected.type);
            onPay(selected.type);
          }}
        >
          {payLoading ? t("paywall.unlocking", "正在解锁…") : "立即解锁 →"}
        </button>

        <div className="vr-sans mt-4 flex flex-wrap items-center justify-center gap-3 text-[11px]" style={{ color: "var(--vibe-muted-foreground)" }}>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />安全支付</span>
          <span className="flex items-center gap-1"><Archive className="h-3 w-3" />永久保存</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />3万+用户</span>
        </div>
      </div>
    </article>
  );
}

/** 付费解锁后后台生成 LLM 全文，写入同一 reading 固定页（详情 iframe 与外链共用） */
function PaidReportWriter({
  result,
  onReportReady,
  onStatus,
}: {
  result: SingleBaziResult;
  onReportReady?: (reportContent: string, sections: Array<{ title: string; content: string }>) => void;
  onStatus?: (status: "loading" | "ready" | "error") => void;
}) {
  const { t, locale } = useT();
  const [hasTriggered, setHasTriggered] = useState(false);
  const analyzeMutation = trpc.bazi.analyze.useMutation({
    onSuccess: (data) => {
      onStatus?.("ready");
      if (onReportReady && data?.report) {
        onReportReady(data.report, data.sections ?? []);
      }
    },
    onError: (err) => {
      onStatus?.("error");
      toast.error(t("report.error_prefix", "解读报告生成失败：") + err.message);
    },
  });

  useEffect(() => {
    if (hasTriggered) return;
    setHasTriggered(true);
    onStatus?.("loading");
    analyzeMutation.mutate({
      type: "single",
      lang: locale as "zh-CN" | "zh-TW" | "en" | "pt-BR",
      resultData: result as unknown as Record<string, unknown>,
    });
    // 仅触发一次全文生成
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function VibeBaziReport({
  result,
  onBack,
  onStartDouble,
}: {
  result: SingleBaziResult;
  onBack: () => void;
  onStartDouble?: () => void;
}) {
  const { t, term, locale } = useT();
  const payment = usePaymentFlow();
  const materializeReport = trpc.bazi.materializeReport.useMutation();
  const [tab, setTab] = useState<"preview" | "detailed">("preview");
  const [showPlans, setShowPlans] = useState(false);
  const [staticReportUrl, setStaticReportUrl] = useState<string | null>(() => getStaticReportHref());
  const [iframeNonce, setIframeNonce] = useState(0);
  const [paidGenStatus, setPaidGenStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const captureRef = useRef<HTMLDivElement>(null);
  const braceletRec = useMemo(
    () => recommendBracelet(result.wuXing as unknown as Record<string, number>),
    [result],
  );

  const free = useMemo(() => composeFreeReport(result, locale), [result, locale]);

  // 进入报告页即确保静态 HTML 已落盘（每 readingId 一份；详情与外链共用）
  useEffect(() => {
    let cancelled = false;
    const readingId = ensureReadingId();
    void materializeStaticReport({
      result,
      lang: locale,
      readingId,
      mutateAsync: materializeReport.mutateAsync,
    }).then((res) => {
      if (!cancelled && res?.reportPath) setStaticReportUrl(res.reportPath);
      else if (!cancelled && res?.reportUrl) setStaticReportUrl(res.reportUrl);
    });
    return () => {
      cancelled = true;
    };
    // 仅随盘面变化重跑；mutation 引用稳定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.birthStr, result.riZhu, result.year.gan, result.day.gan, result.hour.gan, locale]);

  useEffect(() => {
    const onUpgraded = (ev: Event) => {
      const detail = (ev as CustomEvent<{ reportUrl?: string }>).detail;
      const href = getStaticReportHref() || detail?.reportUrl || null;
      if (href) setStaticReportUrl(href);
      setIframeNonce((n) => n + 1);
      setPaidGenStatus("ready");
    };
    window.addEventListener("bazi:static-report-upgraded", onUpgraded);
    return () => window.removeEventListener("bazi:static-report-upgraded", onUpgraded);
  }, []);

  const wx = STEM_WX[result.riZhu] ?? result.riZhu;
  const strengthLabel =
    strengthKind(result.strength) === "身强"
      ? term("身强")
      : strengthKind(result.strength) === "身弱"
        ? term("身弱")
        : term("身中和");
  const strengthShortLabel = strengthShort(result.strength, locale.startsWith("zh") ? "zh" : "en");
  const pct = strengthPct(result.strength);
  const circumference = 2 * Math.PI * 42;
  const energyDash = `${(pct / 100) * circumference} ${circumference}`;

  const pieSlices = useMemo(() => buildWxPieModel(result.wuXing), [result.wuXing]);
  const barSlices = useMemo(() => {
    const byName = new Map(pieSlices.map((s) => [s.name, s]));
    const max = Math.max(...pieSlices.map((s) => s.value), 0.001);
    return WX_BAR_ORDER.map((name) => {
      const s = byName.get(name);
      return {
        name,
        value: s?.value ?? 0,
        percent: s?.percent ?? 0,
        barPct: Math.round(((s?.value ?? 0) / max) * 100),
      };
    });
  }, [pieSlices]);
  const balance = useMemo(() => classifyWxBalance(pieSlices), [pieSlices]);

  const pillars = [
    { key: "year", label: t("pillar.year", "年柱"), gan: result.year.gan, zhi: result.year.zhi },
    { key: "month", label: t("pillar.month", "月柱"), gan: result.month.gan, zhi: result.month.zhi },
    { key: "day", label: t("pillar.day", "日柱"), gan: result.day.gan, zhi: result.day.zhi, day: true },
    { key: "hour", label: t("pillar.hour", "时柱"), gan: result.hour.gan, zhi: result.hour.zhi },
  ];

  const teasers = free.sections.map((s, i) => ({
    title: s.title,
    body: firstSentence(s.body),
    Icon: TEASER_ICONS[i % TEASER_ICONS.length],
  }));

  useEffect(() => {
    if (payment.unlocked) setTab("detailed");
  }, [payment.unlocked]);

  const handleReportReady = (reportContent: string, _sections: Array<{ title: string; content: string }>) => {
    if (!payment.purchasedPlan) return;
    if (!payment.shopOrderNo && !payment.wooOrderId) return;
    payment.pushReportToWordPress({
      planType: payment.purchasedPlan,
      wooOrderId: payment.wooOrderId || undefined,
      shopOrderNo: payment.shopOrderNo || undefined,
      readingId: ensureReadingId(),
      reportContent,
      name: result.name,
      inputSummary: result as unknown as Record<string, unknown>,
    });
  };

  const birthMeta = [
    result.gender === "male" ? term("男命") : term("女命"),
    result.birthStr,
    result.birthCity || "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="bazi-report-vibe vr-fade-in" data-dom-id="vibe-bazi-report">
      <header className="mb-6" data-dom-id="report-header">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="vr-btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            {t("result.back", "返回")}
          </button>
          <span className="vr-chip-soft">OraSage</span>
        </div>
        <p className="vr-eyebrow mt-5">Bazi Report · Design Spec</p>
        <h1 className="vr-display mt-2 text-[32px] font-medium leading-tight" style={{ color: "var(--vibe-foreground)" }}>
          八字命盘报告
        </h1>
        <p className="vr-serif mt-2 text-sm italic" style={{ color: "var(--vibe-muted-foreground)" }}>
          为{result.name || "你"}生成的专业命理分析
        </p>
        {staticReportUrl ? (
          <a
            href={staticReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="vr-btn-ghost mt-3 inline-flex items-center gap-1.5 text-sm"
            data-testid="static-report-link"
            style={{ color: "var(--vibe-brand)" }}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t("report.static_page", "打开固定报告页")}
          </a>
        ) : null}
      </header>

      <nav className="vr-tabbar mb-5" role="tablist" aria-label="视图切换" data-dom-id="tab-switcher">
        <button
          type="button"
          role="tab"
          className={`vr-tab${tab === "preview" ? " is-active" : ""}`}
          aria-selected={tab === "preview"}
          data-testid="vibe-tab-preview"
          onClick={() => setTab("preview")}
        >
          免费预览
        </button>
        <button
          type="button"
          role="tab"
          className={`vr-tab${tab === "detailed" ? " is-active" : ""}`}
          aria-selected={tab === "detailed"}
          data-testid="vibe-tab-detailed"
          onClick={() => setTab("detailed")}
        >
          详细报告
        </button>
      </nav>

      {tab === "preview" ? (
        <section className="space-y-5" data-dom-id="section-preview">
          <article className="vr-card vr-card--soft" data-dom-id="hero-summary-card">
            <div className="vr-hero-glow" aria-hidden />
            <div className="vr-hero relative z-[1]">
              <div className="flex flex-col items-center gap-2">
                <span className="vr-hero-char">{result.riZhu}</span>
                <span className="vr-label">Daymaster</span>
                <span className="vr-display text-sm italic" style={{ color: "var(--vibe-muted-foreground)" }}>
                  {result.riZhu}
                  {wx}
                </span>
              </div>
              <div className="min-w-0">
                <p className="vr-eyebrow">Your Daymaster</p>
                <h2 className="vr-display mt-1 text-[22px] font-medium leading-tight" style={{ color: "var(--vibe-foreground)" }}>
                  {result.riZhu}
                  {wx}日主 · {strengthLabel}
                </h2>
                <p className="vr-quote-line mt-2">{free.dayMasterLine}</p>
                <p className="vr-sans mt-2 text-xs" style={{ color: "var(--vibe-text-light)" }}>
                  {birthMeta}
                </p>
              </div>
              <div className="hidden flex-col gap-2 min-[420px]:flex">
                {result.favorable?.length ? (
                  <span className="vr-chip-success">喜用 · {result.favorable.join("")}</span>
                ) : null}
                {result.unfavorable?.length ? (
                  <span className="vr-chip-danger">忌 · {result.unfavorable.join("")}</span>
                ) : null}
                <span className="vr-chip-purple">格局 · {strengthShortLabel}</span>
              </div>
            </div>

            <div className="relative z-[1] mt-5 grid grid-cols-4 gap-2 text-center text-sm">
              {pillars.map((p) => (
                <div
                  key={p.key}
                  className="vr-muted-box p-2"
                  style={
                    p.day
                      ? {
                          borderColor: "var(--vibe-brand)",
                          background: "var(--vibe-brand-faded)",
                        }
                      : undefined
                  }
                >
                  <p
                    className="vr-sans text-[10px]"
                    style={{ color: p.day ? "var(--vibe-brand-deep)" : "var(--vibe-text-light)" }}
                  >
                    {p.label}
                  </p>
                  <p
                    className="vr-display mt-0.5 font-medium"
                    style={{ color: p.day ? "var(--vibe-brand-deep)" : "var(--vibe-foreground)" }}
                  >
                    {p.gan}
                    {p.zhi}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative z-[1] mt-3 flex flex-wrap gap-2 min-[420px]:hidden">
              {result.favorable?.length ? (
                <span className="vr-chip-success">喜用 · {result.favorable.join("")}</span>
              ) : null}
              {result.unfavorable?.length ? (
                <span className="vr-chip-danger">忌 · {result.unfavorable.join("")}</span>
              ) : null}
            </div>
          </article>

          <article className="vr-card" data-dom-id="pillars-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="vr-eyebrow-muted">Four Pillars</p>
                <p className="vr-display mt-1 text-xl font-medium">四柱命盘</p>
              </div>
              <Grid2x2 className="h-4 w-4" style={{ color: "var(--vibe-text-light)" }} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {pillars.map((p) => (
                <div
                  key={p.key}
                  className="vr-muted-box p-3"
                  style={
                    p.day
                      ? {
                          borderColor: "var(--vibe-brand)",
                          background: "var(--vibe-brand-faded)",
                        }
                      : undefined
                  }
                >
                  <p
                    className="vr-sans text-[10px]"
                    style={{ color: p.day ? "var(--vibe-brand-deep)" : "var(--vibe-text-light)" }}
                  >
                    {p.day ? `${p.label} · 日主` : p.label}
                  </p>
                  <p
                    className="vr-display mt-1 text-lg font-medium"
                    style={{ color: p.day ? "var(--vibe-brand-deep)" : "var(--vibe-foreground)" }}
                  >
                    {p.gan}
                  </p>
                  <p
                    className="vr-serif text-sm"
                    style={{ color: p.day ? "var(--vibe-brand)" : "var(--vibe-muted-foreground)" }}
                  >
                    {p.zhi}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="vr-card" data-dom-id="elements-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="vr-eyebrow-muted">Five Elements</p>
                <p className="vr-display mt-1 text-xl font-medium">五行能量分布</p>
              </div>
              <BarChart3 className="h-4 w-4" style={{ color: "var(--vibe-text-light)" }} />
            </div>
            <div className="mb-5">
              <DonutChart slices={barSlices} />
            </div>
            <div className="space-y-3.5">
              {barSlices.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono" style={{ color: "var(--vibe-muted-foreground)" }}>
                      {s.value.toFixed(1)}
                    </span>
                  </div>
                  <div className="vr-bar-track mt-1.5">
                    <div
                      className="vr-bar-fill"
                      style={{ width: `${s.barPct}%`, backgroundColor: WX_CHART_COLOR[s.name] }}
                    />
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--vibe-muted-foreground)" }}>
                    {s.percent === Math.max(...barSlices.map((x) => x.percent))
                      ? `最强 · ${WX_TRAIT_ZH[s.name]}`
                      : WX_TRAIT_ZH[s.name]}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="mt-4 flex flex-wrap items-center gap-2 rounded-[var(--vibe-radius-sm)] border p-3"
              style={{
                borderColor: "var(--vibe-brand-faded)",
                background: "var(--vibe-brand-faded)",
              }}
            >
              <span
                className="vr-sans inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: "var(--vibe-brand)", color: "#fff" }}
              >
                衡
              </span>
              <p className="vr-sans text-sm">
                <span className="font-medium">五行旺相：</span>
                <span style={{ color: "var(--vibe-brand-deep)" }}>
                  {(balance.wang.length ? balance.wang : balance.ci).join("、") || "均衡"}
                </span>
                {balance.ruo.length ? (
                  <span style={{ color: "var(--vibe-muted-foreground)" }}> · {balance.ruo.join("、")}弱</span>
                ) : null}
              </p>
              <p className="vr-serif w-full text-xs italic" style={{ color: "var(--vibe-muted-foreground)" }}>
                {free.luckyLine}
              </p>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="vr-eyebrow-muted">Radar</p>
                <Target className="h-4 w-4" style={{ color: "var(--vibe-text-light)" }} />
              </div>
              <RadarChart slices={barSlices} />
            </div>
          </article>

          <article className="vr-card" data-dom-id="energy-card">
            <div className="mb-4">
              <p className="vr-eyebrow">Energy Layer</p>
              <p className="vr-display mt-1 text-xl font-medium">日主能量等级</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--vibe-card)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--vibe-brand)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={energyDash}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="vr-display text-2xl font-medium">{pct}%</span>
                  <span className="vr-sans text-[10px]" style={{ color: "var(--vibe-muted-foreground)" }}>
                    {strengthShortLabel}
                  </span>
                </div>
              </div>
              <p className="vr-serif flex-1 text-sm leading-relaxed" style={{ color: "var(--vibe-foreground)" }}>
                {free.sections[0]?.body ?? free.dayMasterLine}
              </p>
            </div>
          </article>

          <article className="vr-card" data-dom-id="insight-card">
            <p className="vr-eyebrow mb-2">Core Insight · 核心洞察</p>
            <h3 className="vr-display text-[22px] font-medium" style={{ color: "var(--vibe-foreground)" }}>
              你的日主性格
            </h3>
            <p className="vr-drop-cap vr-serif mt-4 text-[15px] leading-[1.8]" style={{ color: "var(--vibe-foreground)" }}>
              {free.sections[1]?.body ?? free.sections[0]?.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[strengthShortLabel, wx, ...(result.favorable ?? []).slice(0, 2)].filter(Boolean).map((tag) => (
                <span key={tag} className="vr-chip-soft">
                  {tag}
                </span>
              ))}
            </div>
          </article>

          <article className="vr-card" data-dom-id="ai-reading-card">
            <p className="vr-eyebrow mb-2">Vernacular Brief</p>
            <h3 className="vr-display text-xl font-medium">白话速读</h3>
            <p className="vr-serif mt-3 text-[15px] leading-[1.8]" style={{ color: "var(--vibe-foreground)" }}>
              {free.sections[2]?.body ?? free.sections[0]?.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {free.sections.slice(0, 4).map((s) => (
                <span key={s.title} className="vr-chip">
                  {firstSentence(s.title, 12)}
                </span>
              ))}
            </div>
          </article>

          <section className="space-y-3" data-dom-id="chapter-teasers">
            <div>
              <p className="vr-eyebrow-muted">Chapters</p>
              <p className="vr-display mt-1 text-xl font-medium">章节速览</p>
            </div>
            {teasers.map((teaser) => (
              <article key={teaser.title} className="vr-card flex items-start gap-3 !rounded-[var(--vibe-radius-md)] !p-3">
                <span className="vr-icon-box">
                  <teaser.Icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold" style={{ color: "var(--vibe-foreground)" }}>
                    {teaser.title}
                  </h3>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--vibe-muted-foreground)" }}>
                    {teaser.body}
                  </p>
                </div>
              </article>
            ))}
          </section>

          {!payment.unlocked ? (
            <VibePaywall
              selectedPlan={payment.selectedPlan}
              onSelectPlan={payment.setSelectedPlan}
              onPay={(plan) => payment.handlePaySelected(plan)}
              payLoading={payment.payLoading}
            />
          ) : (
            <button type="button" className="vr-btn-primary w-full" onClick={() => setTab("detailed")}>
              查看详细报告
            </button>
          )}
        </section>
      ) : (
        <section className="space-y-4" data-dom-id="section-detailed" ref={captureRef}>
          <p className="vr-serif text-sm" style={{ color: "var(--vibe-muted-foreground)" }}>
            {payment.unlocked
              ? "以下内容与「打开固定报告页」为同一份个人报告；付费全文写入后会自动刷新。"
              : "以下为排盘后的结构速览（与固定报告页相同）。付费解锁后同一页将更新为完整解读。"}
          </p>

          {payment.unlocked ? (
            <PaidReportWriter
              result={result}
              onReportReady={handleReportReady}
              onStatus={(s) => setPaidGenStatus(s)}
            />
          ) : null}

          {payment.unlocked && paidGenStatus === "loading" ? (
            <div className="vr-card flex flex-col items-center gap-3 py-8">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: "var(--vibe-brand)", borderTopColor: "transparent" }}
              />
              <p className="vr-serif text-sm" style={{ color: "var(--vibe-brand)" }}>
                {t("report.loading.main", "正在生成解读…")}
              </p>
            </div>
          ) : null}

          {staticReportUrl ? (
            <iframe
              key={`${staticReportUrl}-${iframeNonce}`}
              title="bazi-fixed-report"
              src={`${staticReportUrl}${staticReportUrl.includes("?") ? "&" : "?"}v=${iframeNonce}`}
              className="w-full min-h-[70vh] rounded-[var(--vibe-radius-md)] border-0 bg-transparent"
              data-testid="static-report-iframe"
              style={{ border: "1px solid var(--vibe-border-light)" }}
            />
          ) : (
            <div className="vr-card text-sm" style={{ color: "var(--vibe-muted-foreground)" }}>
              正在准备固定报告页…
            </div>
          )}

          {!payment.unlocked ? (
            <VibePaywall
              selectedPlan={payment.selectedPlan}
              onSelectPlan={payment.setSelectedPlan}
              onPay={(plan) => payment.handlePaySelected(plan)}
              payLoading={payment.payLoading}
            />
          ) : (
            <>
              {payment.purchasedPlan === "basic" && braceletRec?.deficiencyWx ? (
                <BaziConfiguredProductRecommend
                  chart={{
                    birthStr: result.birthStr,
                    gender: result.gender,
                    name: result.name,
                    wuXing: result.wuXing as unknown as Record<string, number>,
                  }}
                />
              ) : null}
              {onStartDouble ? (
                <button type="button" className="vr-btn-primary w-full" onClick={onStartDouble}>
                  {t("result.double", "合盘分析")}
                </button>
              ) : null}
              <button type="button" className="vr-btn-ghost w-full" onClick={onBack}>
                {t("result.back", "返回")}
              </button>
            </>
          )}
        </section>
      )}

      <footer className="mt-10 border-t pt-6 text-center" style={{ borderColor: "var(--vibe-border-light)" }}>
        <div className="vr-diamond mb-3">
          <span className="vr-diamond-dot" />
        </div>
        <p className="vr-display text-sm italic" style={{ color: "var(--vibe-foreground)" }}>
          OraSage
        </p>
        <p className="vr-sans mt-1 text-[11px]" style={{ color: "var(--vibe-text-light)" }}>
          八字报告设计规范 · 仅作参考，不作为人生决策依据
        </p>
      </footer>

      {showPlans ? (
        <PlanSelectionModal
          open={showPlans}
          onClose={() => setShowPlans(false)}
          mode="single"
          onSelectPlan={(plan, orderId) => {
            payment.setUnlocked(true);
            payment.setPurchasedPlan(plan);
            if (orderId) payment.setWooOrderId(orderId);
            setShowPlans(false);
          }}
        />
      ) : null}
    </div>
  );
}
