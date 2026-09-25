import type { ReactNode } from "react";
import type { SingleBaziResult } from "@/lib/bazi";
import { DI_ZHI_CANG_GAN } from "@/lib/bazi";
import { useT } from "@/lib/i18n";
import { SERIF_F, SANS_F } from "@/theme";
import { WuXingPieChart } from "@/components/WuXingPieChart";
import {
  WX_LEGEND_ORDER,
  WX_PIE_COLORS,
  buildWxPieModel,
  classifyWxBalance,
  joinWxNamesEn,
  joinWxNamesPt,
  joinWxNamesZh,
  type WxPolarName,
} from "@/lib/wuxingPolar";

const POSTER_BG = "#FBF7EE";
const POSTER_INK = "#6B4F35";
const POSTER_MUTED = "#8A7358";
const POSTER_GOLD = "#C4A15A";
const POSTER_BORDER = "rgba(196, 161, 90, 0.28)";
const PILLAR_KEYS = ["pillar.year", "pillar.month", "pillar.day", "pillar.hour"] as const;

function FlourishTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      <span style={{ flex: 1, maxWidth: 56, height: 1, background: "linear-gradient(90deg, transparent, rgba(196,161,90,0.75))" }} />
      <h3
        className="text-base font-semibold tracking-widest"
        style={{ color: POSTER_GOLD, fontFamily: SERIF_F, letterSpacing: "0.28em" }}
      >
        {children}
      </h3>
      <span style={{ flex: 1, maxWidth: 56, height: 1, background: "linear-gradient(90deg, rgba(196,161,90,0.75), transparent)" }} />
    </div>
  );
}

function PosterCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="rounded-2xl px-4 py-5 sm:px-5"
      style={{
        background: POSTER_BG,
        border: `1px solid ${POSTER_BORDER}`,
        boxShadow: "0 8px 28px rgba(107, 79, 53, 0.06)",
      }}
    >
      {children}
    </div>
  );
}

export function BaziMingpanCard({ result }: { result: SingleBaziResult }) {
  const { t } = useT();
  const pillars = [result.year, result.month, result.day, result.hour];
  const labels = PILLAR_KEYS.map((k) => t(k));

  return (
    <PosterCard>
      <FlourishTitle>{t("result.pillars", "八字命盘")}</FlourishTitle>
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {pillars.map((p, i) => {
          const isDay = i === 2;
          return (
            <div key={i} className="flex flex-col items-center">
              <span
                className="text-[11px] mb-2"
                style={{
                  color: isDay ? POSTER_GOLD : POSTER_MUTED,
                  fontFamily: SERIF_F,
                  letterSpacing: "0.08em",
                }}
              >
                {labels[i]}
              </span>
              <div
                className="flex flex-col items-center justify-center"
                style={
                  isDay
                    ? {
                        border: `1.5px solid ${POSTER_GOLD}`,
                        borderRadius: 14,
                        padding: "10px 12px 8px",
                        minWidth: 56,
                      }
                    : { padding: "10px 12px 8px", minWidth: 56 }
                }
              >
                <span
                  className="leading-none"
                  style={{
                    color: POSTER_INK,
                    fontFamily: SERIF_F,
                    fontSize: "1.85rem",
                    fontWeight: 600,
                  }}
                >
                  {p.gan}
                </span>
                <span
                  className="leading-none mt-2"
                  style={{
                    color: POSTER_INK,
                    fontFamily: SERIF_F,
                    fontSize: "1.85rem",
                    fontWeight: 600,
                  }}
                >
                  {p.zhi}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-1.5">
        <span
          className="shrink-0 text-[10px] pt-0.5"
          style={{
            color: POSTER_MUTED,
            fontFamily: SERIF_F,
            writingMode: "vertical-rl",
            letterSpacing: "0.18em",
          }}
        >
          {t("pillar.canggan", "藏干")}
        </span>
        <div className="grid grid-cols-4 gap-1 sm:gap-2 flex-1">
          {pillars.map((p, i) => {
            const cang = DI_ZHI_CANG_GAN[p.zhi] ?? [];
            const isDay = i === 2;
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="flex items-center justify-center gap-1 min-h-[1.1rem]">
                  {cang.map((cg) => (
                    <span
                      key={cg}
                      className="text-[12px]"
                      style={{ color: POSTER_INK, fontFamily: SERIF_F }}
                    >
                      {cg}
                    </span>
                  ))}
                </div>
                <span
                  className="text-[11px]"
                  style={{
                    color: isDay ? POSTER_GOLD : POSTER_MUTED,
                    fontFamily: SERIF_F,
                  }}
                >
                  {labels[i]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </PosterCard>
  );
}

function TaijiMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 100 100" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="50" cy="50" r="46" fill="none" stroke={POSTER_GOLD} strokeWidth="3" />
      <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4Z" fill={POSTER_GOLD} />
      <circle cx="50" cy="27" r="11.5" fill={POSTER_BG} />
      <circle cx="50" cy="73" r="11.5" fill={POSTER_GOLD} />
      <circle cx="50" cy="27" r="4.2" fill={POSTER_GOLD} />
      <circle cx="50" cy="73" r="4.2" fill={POSTER_BG} />
    </svg>
  );
}

function joinNames(names: WxPolarName[], locale: string): string {
  if (locale.startsWith("zh")) return joinWxNamesZh(names);
  if (locale.startsWith("pt")) return joinWxNamesPt(names);
  return joinWxNamesEn(names);
}

function composeBalanceText(
  t: (key: string, fallback?: string) => string,
  locale: string,
  wuXing: { 木?: number; 火?: number; 土?: number; 金?: number; 水?: number },
): string {
  const slices = buildWxPieModel(wuXing);
  const balance = classifyWxBalance(slices);
  const advice = balance.adviceWx
    ? t(`result.wx.advice.${balance.adviceWx}`, "建议在生活中调和五行。")
    : t("result.wx.advice.balanced", "建议在生活中保持作息与饮食的稳定节奏，以调和身心。");

  if (balance.balanced) {
    const even = t("result.wx.balance.even", "五行较为均衡");
    const lead = t("result.wx.balance.lead", "命局{body}。").replace("{body}", even);
    const gap = locale.startsWith("zh") ? "" : " ";
    return `${lead}${gap}${advice}`;
  }

  const j = (n: WxPolarName[]) => joinNames(n, locale);
  const parts: string[] = [];
  if (balance.wang.length) {
    parts.push(t("result.wx.balance.wang", "{names}较旺").replace("{names}", j(balance.wang)));
  }
  if (balance.ci.length) {
    parts.push(t("result.wx.balance.ci", "{names}次之").replace("{names}", j(balance.ci)));
  }
  if (balance.ruo.length) {
    parts.push(t("result.wx.balance.ruo", "{names}偏弱").replace("{names}", j(balance.ruo)));
  }
  const body = parts.join(locale.startsWith("zh") ? "，" : ", ");
  const lead = t("result.wx.balance.lead", "命局{body}。").replace("{body}", body);
  const gap = locale.startsWith("zh") ? "" : " ";
  return `${lead}${gap}${advice}`;
}

export function WuXingDistributionSection({
  wuXing,
}: {
  wuXing: { 木?: number; 火?: number; 土?: number; 金?: number; 水?: number };
}) {
  const { t, locale } = useT();
  const slices = buildWxPieModel(wuXing);
  const byName = new Map(slices.map((s) => [s.name, s]));
  const copy = composeBalanceText(t, locale, wuXing);

  return (
    <PosterCard>
      <FlourishTitle>{t("result.wx.dist", "五行分布")}</FlourishTitle>
      <p
        className="text-center text-[12px] -mt-3 mb-2"
        style={{ color: POSTER_MUTED, fontFamily: SANS_F, letterSpacing: "0.04em" }}
      >
        {t("result.wx.dist_sub", "命盘中五行力量的分布情况")}
      </p>
      <WuXingPieChart wuXing={wuXing} />

      <div className="grid grid-cols-5 gap-1 mt-1 mb-4">
        {WX_LEGEND_ORDER.map((name) => {
          const s = byName.get(name);
          const color = WX_PIE_COLORS[name];
          return (
            <div key={name} className="flex flex-col items-center gap-0.5 px-0.5">
              <span className="text-lg font-semibold" style={{ color, fontFamily: SERIF_F }}>
                {locale.startsWith("zh") ? name : locale.startsWith("pt") ? joinWxNamesPt([name]) : joinWxNamesEn([name])}
              </span>
              <span className="text-sm font-semibold" style={{ color, fontFamily: SANS_F }}>
                {s?.percent ?? 0}%
              </span>
              <span
                className="text-[10px] text-center leading-tight"
                style={{ color: POSTER_MUTED, fontFamily: SANS_F }}
              >
                {t(`result.wx.trait.${name}`)}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="flex items-start gap-2.5 pt-3"
        style={{ borderTop: "1px solid rgba(196,161,90,0.22)" }}
      >
        <TaijiMark />
        <div className="min-w-0">
          <p
            className="text-[13px] font-semibold mb-1"
            style={{ color: POSTER_INK, fontFamily: SERIF_F, letterSpacing: "0.08em" }}
          >
            {t("result.wx.balance", "五行平衡分析")}
          </p>
          <p
            className="text-[12px] leading-relaxed"
            style={{ color: POSTER_MUTED, fontFamily: SANS_F, lineHeight: 1.75 }}
          >
            {copy}
          </p>
        </div>
      </div>
    </PosterCard>
  );
}
