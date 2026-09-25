import { Link } from "wouter";
import { useI18n } from "@orasage/i18n/react";
import { mainPortalUrl } from "@/lib/orasage-app-shell/config";
import { useT } from "@/lib/i18n";
import "./BaziEntryChrome.css";

type Mode = "luopan" | "classic";

function withLang(path: string): string {
  if (typeof window === "undefined") return path;
  const lang = new URLSearchParams(window.location.search).get("lang");
  if (!lang) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}lang=${encodeURIComponent(lang)}`;
}

export function BaziEntryChrome({ active }: { active: Mode }) {
  const { locale } = useI18n();
  const { t } = useT();
  const backHref = active === "luopan" ? mainPortalUrl(locale) : withLang("/");
  const backIsExternal = active === "luopan";
  const luopanHref = withLang("/");
  const classicHref = withLang("/classic");

  return (
    <div className={`bazi-entry-chrome bazi-entry-chrome--${active}`}>
      {backIsExternal ? (
        <a className="bazi-entry-back" href={backHref}>
          <Chevron />
          {t("nav.back", "返回")}
        </a>
      ) : (
        <Link href={backHref} className="bazi-entry-back">
          <Chevron />
          {t("nav.back", "返回")}
        </Link>
      )}
      <div className="bazi-entry-switch" role="group" aria-label={t("nav.mode_switch", "排盘方式")}>
        <Link
          href={luopanHref}
          className={`bazi-entry-switch-btn${active === "luopan" ? " is-active" : ""}`}
          aria-current={active === "luopan" ? "page" : undefined}
        >
          {t("nav.mode.luopan", "罗盘")}
        </Link>
        <Link
          href={classicHref}
          className={`bazi-entry-switch-btn${active === "classic" ? " is-active" : ""}`}
          aria-current={active === "classic" ? "page" : undefined}
        >
          {t("nav.mode.classic", "计算器")}
        </Link>
      </div>
    </div>
  );
}

function Chevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
