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
  Calendar,
  Check,
  ChevronDown,
  Grid2x2,
  Heart,
  Lock,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import type { SingleBaziResult } from "@/lib/bazi";
import { recommendBracelet } from "@/lib/bazi";
import { useT } from "@/lib/i18n";
import { usePaymentFlow } from "@/_core/hooks/usePaymentFlow";
import type { PlanType } from "@shared/types";
import { composeFreeReport } from "@shared/free-report";
import { STEM_WX, strengthKind, strengthShort } from "@shared/vernacular";
import { sanitizeReportBrandText } from "@shared/report-brand";
import { fetchBaziPlanProducts, type PlanProductInfo } from "@/lib/plan-products";
import { PlanSelectionModal } from "@/components/PlanSelectionModal";
import { BaziConfiguredProductRecommend } from "@/components/BaziConfiguredProductRecommend";
import {
  buildWxPieModel,
  classifyWxBalance,
  type WxPolarName,
} from "@/lib/wuxingPolar";
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
        fill="color-mix(in srgb, var(--vibe-primary) 18%, transparent)"
        stroke="var(--vibe-primary)"
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
      <div className="vr-paywall-head">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <p className="vr-label" style={{ color: "inherit", opacity: 0.9 }}>
            完整报告
          </p>
        </div>
        <h3 className="mt-2 text-xl font-semibold">解锁完整命理报告</h3>
        <p className="mt-1 text-sm opacity-90">七大章节 · 深度解读 · 大运流年推演</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-2 text-sm" style={{ color: "var(--vibe-foreground)" }}>
          {["命盘总览", "性格天赋", "事业财富", "感情关系", "健康管理", "大运流年", "开运建议"].map((label) => (
            <span key={label} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: "var(--vibe-primary)" }} />
              {label}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-2" role="radiogroup" aria-label={t("paywall.choose_tier", "选择报告方案")}>
          {plans.map((plan) => {
            const active = (selectedPlan ?? selected?.type) === plan.type;
            return (
              <button
                key={plan.type}
                type="button"
                role="radio"
                aria-checked={active}
                data-plan={plan.type}
                onClick={() => onSelectPlan(plan.type)}
                className="flex w-full items-center justify-between rounded-[var(--vibe-radius-md)] border px-3 py-2.5 text-left text-sm transition-colors"
                style={{
                  borderColor: active ? "var(--vibe-primary)" : "var(--vibe-border)",
                  background: active
                    ? "color-mix(in srgb, var(--vibe-primary) 10%, transparent)"
                    : "var(--vibe-muted)",
                  color: "var(--vibe-foreground)",
                }}
              >
                <span className="font-medium">{plan.name || plan.type}</span>
                <span className="font-semibold" style={{ color: "var(--vibe-primary)" }}>
                  {loading ? "…" : plan.priceDisplay}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-semibold" style={{ color: "var(--vibe-foreground)" }}>
              {loading ? "…" : selected?.priceDisplay ?? "—"}
            </p>
          </div>
          <button
            type="button"
            className="vr-btn-primary"
            data-testid="bazi-paywall-unlock"
            disabled={!selected || payLoading}
            onClick={() => {
              if (!selected) return;
              onSelectPlan(selected.type);
              onPay(selected.type);
            }}
          >
            {payLoading ? t("paywall.unlocking", "正在解锁…") : "立即解锁"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--vibe-muted-foreground)" }}>
          <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />安全支付</span>
          <span className="flex items-center gap-1"><Archive className="h-3 w-3" />永久保存</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />3万+用户</span>
        </div>
      </div>
    </article>
  );
}

function VibeChapters({
  result,
  onReportReady,
}: {
  result: SingleBaziResult;
  onReportReady?: (reportContent: string, sections: Array<{ title: string; content: string }>) => void;
}) {
  const { t, locale } = useT();
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const [hasTriggered, setHasTriggered] = useState(false);
  const analyzeMutation = trpc.bazi.analyze.useMutation({
    onSuccess: (data) => {
      if (onReportReady && data?.report) {
        onReportReady(data.report, data.sections ?? []);
      }
    },
    onError: (err) => {
      toast.error(t("report.error_prefix", "解读报告生成失败：") + err.message);
    },
  });

  useEffect(() => {
    if (!hasTriggered && !analyzeMutation.data && !analyzeMutation.isPending) {
      setHasTriggered(true);
      analyzeMutation.mutate({
        type: "single",
        lang: locale as "zh-CN" | "zh-TW" | "en" | "pt-BR",
        resultData: result as unknown as Record<string, unknown>,
      });
    }
  }, [hasTriggered, analyzeMutation.data, analyzeMutation.isPending, locale, result]);

  const sections = analyzeMutation.data?.sections ?? [];

  if (analyzeMutation.isPending || (!analyzeMutation.data && !analyzeMutation.error)) {
    return (
      <div className="vr-card flex flex-col items-center gap-3 py-10">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: "var(--vibe-primary)", borderTopColor: "transparent" }}
        />
        <p className="vr-serif text-sm" style={{ color: "var(--vibe-primary)" }}>
          {t("report.loading.main", "正在生成解读…")}
        </p>
      </div>
    );
  }

  if (!sections.length) {
    return (
      <div className="vr-card text-sm" style={{ color: "var(--vibe-muted-foreground)" }}>
        {t("report.error_prefix", "解读报告生成失败：")}暂无章节
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => {
        const open = openSections.has(index);
        const paragraphs = section.content.split(/\n\s*\n/).filter(Boolean);
        return (
          <article key={`${section.title}-${index}`} className="vr-chapter" data-dom-id={`chapter-${index + 1}`}>
            <button
              type="button"
              className="vr-chapter-toggle"
              aria-expanded={open}
              onClick={() => {
                setOpenSections((prev) => {
                  const next = new Set(prev);
                  if (next.has(index)) next.delete(index);
                  else next.add(index);
                  return next;
                });
              }}
            >
              <div>
                <p className="vr-label">Chapter {String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-base font-semibold" style={{ color: "var(--vibe-foreground)" }}>
                  {section.title}
                </h3>
              </div>
              <ChevronDown
                className="h-5 w-5 shrink-0 transition-transform"
                style={{
                  color: "var(--vibe-muted-foreground)",
                  transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {open ? (
              <div className="vr-chapter-body space-y-3 text-sm" style={{ color: "var(--vibe-foreground)" }}>
                {paragraphs.map((para, pi) => (
                  <div key={pi} className="vr-muted-box mt-4 p-3 leading-relaxed">
                    <Streamdown>{sanitizeReportBrandText(para)}</Streamdown>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
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
  const [tab, setTab] = useState<"preview" | "detailed">("preview");
  const [showPlans, setShowPlans] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const braceletRec = useMemo(
    () => recommendBracelet(result.wuXing as unknown as Record<string, number>),
    [result],
  );

  const free = useMemo(() => composeFreeReport(result, locale), [result, locale]);
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
      reportContent,
      name: result.name,
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
      <header className="mb-5" data-dom-id="report-header">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="vr-btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5">
            <ArrowLeft className="h-4 w-4" />
            {t("result.back", "返回")}
          </button>
          <span className="vr-chip">OraSage</span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--vibe-radius)]"
            style={{ background: "var(--vibe-primary)", color: "var(--vibe-primary-foreground)" }}
          >
            <Calendar className="h-4 w-4" />
          </span>
          <span className="vr-label">Bazi Report</span>
        </div>
        <h1 className="vr-serif mt-3 text-[28px] leading-tight" style={{ color: "var(--vibe-foreground)" }}>
          八字命盘报告
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--vibe-muted-foreground)" }}>
          为{result.name || "你"}生成的专业命理分析
        </p>
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
          <article className="vr-card" data-dom-id="hero-summary-card">
            <div className="flex items-center gap-5">
              <div
                className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-[var(--vibe-radius)] border"
                style={{
                  borderColor: "var(--vibe-primary)",
                  background: "color-mix(in srgb, var(--vibe-primary) 10%, transparent)",
                }}
              >
                <span className="vr-serif text-6xl leading-none" style={{ color: "var(--vibe-primary)" }}>
                  {result.riZhu}
                </span>
                <span
                  className="absolute -bottom-1.5 rounded-full px-2 py-0.5 text-[9px] font-medium"
                  style={{ background: "var(--vibe-primary)", color: "var(--vibe-primary-foreground)" }}
                >
                  日主
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="vr-chip-primary inline-flex">
                  <Sparkles className="h-3 w-3" />
                  <span>
                    {result.riZhu}
                    {wx}日主 · {strengthLabel}
                  </span>
                </div>
                <h2 className="vr-serif mt-2 text-xl leading-tight" style={{ color: "var(--vibe-foreground)" }}>
                  {result.name}的命盘解读
                </h2>
                <p className="mt-1 text-xs" style={{ color: "var(--vibe-muted-foreground)" }}>
                  {birthMeta}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
              {pillars.map((p) => (
                <div
                  key={p.key}
                  className="vr-muted-box p-2"
                  style={
                    p.day
                      ? {
                          borderColor: "var(--vibe-primary)",
                          background: "color-mix(in srgb, var(--vibe-primary) 10%, transparent)",
                        }
                      : undefined
                  }
                >
                  <p
                    className="text-[10px]"
                    style={{ color: p.day ? "var(--vibe-primary)" : "var(--vibe-muted-foreground)" }}
                  >
                    {p.label}
                  </p>
                  <p
                    className="mt-0.5 font-semibold"
                    style={{ color: p.day ? "var(--vibe-primary)" : "var(--vibe-foreground)" }}
                  >
                    {p.gan}
                    {p.zhi}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="vr-chip">{free.dayMasterLine}</span>
              {result.favorable?.length ? (
                <span className="vr-chip-soft">喜用：{result.favorable.join("、")}</span>
              ) : null}
              {result.unfavorable?.length ? (
                <span className="vr-chip">忌神：{result.unfavorable.join("、")}</span>
              ) : null}
            </div>
          </article>

          <article className="vr-card" data-dom-id="pillars-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="vr-label">四柱命盘</p>
              <Grid2x2 className="h-4 w-4" style={{ color: "var(--vibe-muted-foreground)" }} />
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              {pillars.map((p) => (
                <div
                  key={p.key}
                  className="vr-muted-box p-3"
                  style={
                    p.day
                      ? {
                          borderColor: "var(--vibe-primary)",
                          background: "color-mix(in srgb, var(--vibe-primary) 10%, transparent)",
                        }
                      : undefined
                  }
                >
                  <p
                    className="text-[10px]"
                    style={{ color: p.day ? "var(--vibe-primary)" : "var(--vibe-muted-foreground)" }}
                  >
                    {p.day ? `${p.label} · 日主` : p.label}
                  </p>
                  <p
                    className="mt-1 text-lg font-semibold"
                    style={{ color: p.day ? "var(--vibe-primary)" : "var(--vibe-foreground)" }}
                  >
                    {p.gan}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: p.day ? "var(--vibe-primary)" : "var(--vibe-muted-foreground)" }}
                  >
                    {p.zhi}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="vr-card" data-dom-id="elements-card">
            <div className="mb-4 flex items-center justify-between">
              <p className="vr-label">五行分布</p>
              <BarChart3 className="h-4 w-4" style={{ color: "var(--vibe-muted-foreground)" }} />
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
              className="mt-4 flex flex-wrap items-center gap-2 rounded-[var(--vibe-radius-md)] border p-3"
              style={{
                borderColor: "color-mix(in srgb, var(--vibe-primary) 30%, transparent)",
                background: "color-mix(in srgb, var(--vibe-primary) 10%, transparent)",
              }}
            >
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                style={{ background: "var(--vibe-primary)", color: "var(--vibe-primary-foreground)" }}
              >
                衡
              </span>
              <p className="text-sm">
                <span className="font-medium">五行旺相：</span>
                <span style={{ color: "var(--vibe-primary)" }}>
                  {(balance.wang.length ? balance.wang : balance.ci).join("、") || "均衡"}
                </span>
                {balance.ruo.length ? (
                  <span style={{ color: "var(--vibe-muted-foreground)" }}> · {balance.ruo.join("、")}弱</span>
                ) : null}
              </p>
              <p className="w-full text-xs" style={{ color: "var(--vibe-muted-foreground)" }}>
                {free.luckyLine}
              </p>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="vr-label">五行雷达图</p>
                <Target className="h-4 w-4" style={{ color: "var(--vibe-muted-foreground)" }} />
              </div>
              <RadarChart slices={barSlices} />
            </div>
          </article>

          <article className="vr-card" data-dom-id="energy-card">
            <div className="mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: "var(--vibe-primary)" }} />
              <p className="vr-label">日主能量层</p>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative h-28 w-28 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--vibe-muted)" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--vibe-primary)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={energyDash}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-semibold">{pct}%</span>
                  <span className="text-[10px]" style={{ color: "var(--vibe-muted-foreground)" }}>
                    {strengthShortLabel}
                  </span>
                </div>
              </div>
              <p className="flex-1 text-sm leading-relaxed" style={{ color: "var(--vibe-foreground)" }}>
                {free.sections[0]?.body ?? free.dayMasterLine}
              </p>
            </div>
          </article>

          <article className="vr-card" data-dom-id="insight-card">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--vibe-primary)" }} />
              <p className="vr-label">核心洞察</p>
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--vibe-foreground)" }}>
              {free.sections[1]?.body ?? free.sections[0]?.body}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[strengthShortLabel, wx, ...(result.favorable ?? []).slice(0, 2)].filter(Boolean).map((tag) => (
                <span key={tag} className="vr-chip-primary">
                  {tag}
                </span>
              ))}
            </div>
          </article>

          <article className="vr-card" data-dom-id="ai-reading-card">
            <div className="mb-3 flex items-center gap-2">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px]"
                style={{ background: "var(--vibe-primary)", color: "var(--vibe-primary-foreground)" }}
              >
                <Sparkles className="h-3 w-3" />
              </span>
              <p className="vr-label">白话速读</p>
            </div>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--vibe-foreground)" }}>
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
            <p className="vr-label">章节速览</p>
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
          {!payment.unlocked ? (
            <>
              <div className="vr-card text-sm" style={{ color: "var(--vibe-muted-foreground)" }}>
                详细报告需解锁后查看。以下为章节目录预览。
              </div>
              {["命盘总览", "性格与天赋", "事业与财富", "感情关系", "健康管理", "大运流年推演", "开运建议"].map(
                (title, i) => (
                  <article key={title} className="vr-chapter opacity-70">
                    <div className="vr-chapter-toggle">
                      <div>
                        <p className="vr-label">Chapter {String(i + 1).padStart(2, "0")}</p>
                        <h3 className="mt-1 text-base font-semibold">{title}</h3>
                      </div>
                      <Lock className="h-4 w-4" style={{ color: "var(--vibe-muted-foreground)" }} />
                    </div>
                  </article>
                ),
              )}
              <VibePaywall
                selectedPlan={payment.selectedPlan}
                onSelectPlan={payment.setSelectedPlan}
                onPay={(plan) => payment.handlePaySelected(plan)}
                payLoading={payment.payLoading}
              />
            </>
          ) : (
            <>
              <VibeChapters result={result} onReportReady={handleReportReady} />
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

      <footer className="mt-10 border-t pt-6 text-center" style={{ borderColor: "var(--vibe-border)" }}>
        <p className="text-xs" style={{ color: "var(--vibe-muted-foreground)" }}>
          八字排盘报告 · OraSage
        </p>
        <p className="mt-1 text-[10px]" style={{ color: "var(--vibe-muted-foreground)" }}>
          仅作参考，不作为人生决策依据
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
