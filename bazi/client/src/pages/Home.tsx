/**
 * 八字排盘 — 主页面
 * Design: OraSage DS v1.1（单色黑/白/灰）
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { loadCityCatalog, matchLocalCity, toCityCoords } from "@orasage/city";
import { CitySearchInput } from "@orasage/city/react";
import { getLeapMonthOfYear, preloadDecade } from "@/lib/lunarData";
import { toast } from "sonner";
import {
  loadLunarLib,
  calcSingleBazi, calcDoubleBazi,
  type SingleBaziResult, type DoubleBaziResult,
  recommendBracelet,
} from "@/lib/bazi";
import { SingleBaziResultView, DoubleBaziResultView } from "@/components/BaziResult";
import { DatePicker } from "@/components/WheelPicker";
import { BaziHomeFeed } from "@/components/BaziHomeFeed";
import { BaziHomeHero } from "@/components/BaziHomeHero";
import { trpc } from "@/lib/trpc";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { syncSavedProfile, fetchSavedProfiles, profileDisplayLabel, type SavedProfile } from "@/lib/profile-sync";
import { syncBaziSingleReading, syncBaziDoubleReading } from "@/lib/reading-sync";
import { saveLastReadingId, getLastReadingId } from "@/_core/hooks/usePaymentFlow";
import { saveCheckoutSnapshot, loadCheckoutSnapshot } from "@/lib/checkout-session";
import { resolveUnknownBirthTime } from "@/lib/birth-time";
import { GOLD, GOLD_FAINT, GOLD_GHOST, HEADING, BODY_CLR, BORDER_CLR } from "@/theme";

const YEARS = Array.from({ length: 201 }, (_, i) => String(2100 - i)); // 1900-2100
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS_31 = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const DAYS_30 = Array.from({ length: 30 }, (_, i) => String(i + 1).padStart(2, "0"));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

interface PersonForm {
  name: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  gender: "male" | "female" | "";
  calendar: "solar" | "lunar";
  birthplace: { city: string; country: string; lng?: number; lat?: number; timezone?: string };
}

const emptyForm = (): PersonForm => ({
  name: "",
  year: "",
  month: "",
  day: "",
  hour: "",
  minute: "",
  gender: "",
  calendar: "solar",
  birthplace: { city: "", country: "" },
});

function syncPersonProfile(form: PersonForm, label?: string | null) {
  const month = form.month.startsWith("L") ? form.month.slice(1) : form.month;
  return syncSavedProfile({
    name: form.name.trim() || "访客",
    gender: (form.gender || "male") as "male" | "female",
    birthYear: form.year,
    birthMonth: month,
    birthDay: form.day,
    birthHour: form.hour || null,
    birthMinute: form.minute || null,
    birthPlaceCity: form.birthplace.city || null,
    birthPlaceLongitude: form.birthplace.lng != null ? String(form.birthplace.lng) : null,
    sourceApp: "bazi",
    label: label ?? null,
  });
}

type ViewState = "form" | "loading" | "result";
type ResultData =
  | { type: "single"; data: SingleBaziResult }
  | { type: "double"; data: DoubleBaziResult };

// ─── 设计常量 ─────────────────────────
const MUTED_CLR  = BODY_CLR;
const SANS       = "'Noto Sans SC','PingFang SC',sans-serif";
const SERIF_F    = "'Noto Serif SC','Source Han Serif SC',serif";

// ─── 加载动画 ─────────────────────────
function LoadingView() {
  const { t } = useT();
  return (
    <div
      className="flex flex-col items-center justify-center py-28 gap-8 animate-fade-in-up"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-20 h-20" aria-hidden>
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none"
          className="animate-spin" style={{ animationDuration: "3s" }}>
          <circle cx="50" cy="50" r="46" stroke={GOLD_FAINT} strokeWidth="1.5"/>
          <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4Z" fill={GOLD_GHOST}/>
          <circle cx="50" cy="27" r="4" fill={GOLD}/>
          <circle cx="50" cy="73" r="4" fill={GOLD_FAINT}/>
        </svg>
      </div>
      <p style={{ fontFamily: SERIF_F, fontSize: "0.9rem", color: GOLD, letterSpacing: "0.15em" }}>{t('loading.calculating')}</p>
    </div>
  );
}

/** 日期输入完成后的时间提示 */
function DayTimeHint() {
  const { t } = useT();
  return (
    <p style={{
      marginTop: "0.375rem", fontFamily: SANS, fontSize: "0.6875rem",
      color: MUTED_CLR, letterSpacing: "0.03em",
    }}>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline", verticalAlign: "baseline", marginRight: "0.25rem", position: "relative", top: "1px" }}>
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      {t('form.hint.time')}
    </p>
  );
}

// ─── 表单面板 ─────────────────────────
function PersonFormPanel({ form, onChange, fieldErrors, ids }: {
  form: PersonForm;
  onChange: (patch: Partial<PersonForm>) => void;
  fieldErrors?: Partial<Record<"gender" | "year" | "month" | "day" | "city", string>>;
  ids: {
    name: string;
    place: string;
    placeLabel: string;
    timeHint: string;
    gender: string;
    calendar: string;
    year: string;
  };
}) {
  const { t } = useT();
  const isLunar = form.calendar === "lunar";
  const [leapMonth, setLeapMonth] = useState<number>(0);

  useEffect(() => {
    if (!isLunar) { setLeapMonth(0); return; }
    if (!form.year.trim()) { setLeapMonth(0); return; }
    const y = parseInt(form.year, 10);
    if (Number.isNaN(y)) { setLeapMonth(0); return; }
    preloadDecade(y);
    getLeapMonthOfYear(y).then(setLeapMonth);
  }, [form.year, isLunar]);

  const lunarMonths = useMemo(() => {
    const base = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
    if (!isLunar || leapMonth === 0) return base;
    const result: string[] = [];
    for (const m of base) {
      result.push(m);
      if (parseInt(m) === leapMonth) result.push(`L${String(leapMonth).padStart(2, "0")}`);
    }
    return result;
  }, [isLunar, leapMonth]);

  // 根据年月计算实际最大天数（公历用 Date API，农历根据大小月）
  const maxDayCount = useMemo(() => {
    if (!form.year.trim() || !form.month.trim()) return 31;
    const y = parseInt(form.year, 10);
    const m = parseInt(form.month.replace('L', ''), 10);
    if (Number.isNaN(y) || Number.isNaN(m)) return 31;
    if (isLunar) {
      // 农历：大月30天，小月29天；简单处理用30天
      return 30;
    }
    return new Date(y, m, 0).getDate();
  }, [form.year, form.month, isLunar]);

  // 动态日数选项：按实际日历月天数生成
  const dynamicDayOptions = useMemo(() => {
    return Array.from({ length: maxDayCount }, (_, i) => String(i + 1).padStart(2, "0"));
  }, [maxDayCount]);

  // 自动修正超出范围的日期（空值保持占位，不预填）
  useEffect(() => {
    if (!form.day) return;
    const dayNum = parseInt(form.day, 10);
    if (isNaN(dayNum) || dayNum < 1) {
      onChange({ day: "" });
    } else if (dayNum > dynamicDayOptions.length) {
      onChange({ day: String(dynamicDayOptions.length).padStart(2, "0") });
    }
  }, [maxDayCount, dynamicDayOptions.length, form.day, onChange]);

  useEffect(() => {
    if (!isLunar && form.month.startsWith("L")) {
      onChange({ month: form.month.slice(1) });
    }
  }, [isLunar, form.month, onChange]);

  const genderError = fieldErrors?.gender;
  const yearError = fieldErrors?.year;
  const monthError = fieldErrors?.month;
  const dayError = fieldErrors?.day;
  const cityError = fieldErrors?.city;

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <label htmlFor={ids.name} className="sr-only">{t('form.name.placeholder')}</label>
          <input
            id={ids.name}
            name="name"
            type="text"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('form.name.placeholder')}
            className="bazi-field-input"
            autoComplete="name"
          />
        </div>

        <fieldset id={ids.gender} className="bazi-calc-segment m-0 min-w-0 border-0 p-0" aria-invalid={genderError ? true : undefined} aria-describedby={genderError ? `${ids.gender}-error` : undefined}>
          <legend className="sr-only">{t('form.error.gender')}</legend>
          {(["male", "female"] as const).map((g) => (
            <label key={g} className={`bazi-calc-segment-btn${form.gender === g ? ' is-active' : ''}`}>
              <input
                type="radio"
                name={`${ids.gender}-radio`}
                value={g}
                checked={form.gender === g}
                onChange={() => onChange({ gender: g })}
                className="sr-only"
              />
              {g === "male" ? (t('form.gender.male') || "男") : (t('form.gender.female') || "女")}
            </label>
          ))}
        </fieldset>

        <fieldset id={ids.calendar} className="bazi-calc-segment m-0 min-w-0 border-0 p-0">
          <legend className="sr-only">{t('form.calendar.solar')} / {t('form.calendar.lunar')}</legend>
          {(["solar", "lunar"] as const).map((c) => (
            <label key={c} className={`bazi-calc-segment-btn${form.calendar === c ? ' is-active' : ''}`}>
              <input
                type="radio"
                name={`${ids.calendar}-radio`}
                value={c}
                checked={form.calendar === c}
                onChange={() => onChange({ calendar: c })}
                className="sr-only"
              />
              {c === "solar" ? (t('form.calendar.solar') || "公") : (t('form.calendar.lunar') || "农")}
            </label>
          ))}
        </fieldset>
      </div>
      {genderError ? (
        <p id={`${ids.gender}-error`} role="alert" className="text-xs text-red-600" style={{ marginTop: "-0.5rem" }}>{genderError}</p>
      ) : null}
      {isLunar && leapMonth > 0 && form.year.trim() && (
        <p style={{ color: "var(--os-color-mono-gray-deep, #6b7280)", fontFamily: SANS, fontSize: '0.6875rem', marginTop: '-0.5rem' }}>
          {parseInt(form.year, 10)}{t('form.calendar.lunar_hint')}{leapMonth}月
        </p>
      )}

      {/* 出生日期与时间 */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="flex items-center gap-2 mb-1 px-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span className="bazi-calc-field-label">{t('form.birth_time')}</span>
          <span className="text-red-500 text-xs" aria-hidden>*</span>
        </legend>
        <div className="flex gap-2">
          <DatePicker
            kind="year"
            label={t('date.year', '年')}
            options={YEARS}
            value={form.year}
            onChange={(v) => onChange({ year: v })}
            invalid={Boolean(yearError)}
            describedBy={yearError ? `${ids.year}-error` : ids.timeHint}
          />
          <DatePicker
            kind="month"
            label={t('date.month', '月')}
            options={isLunar ? lunarMonths : MONTHS}
            value={form.month}
            onChange={(v) => onChange({ month: v })}
            formatLabel={(v) => v.startsWith("L") ? (t('form.calendar.lunar_hint', '闰') || '闰') + parseInt(v.slice(1)) : v}
            invalid={Boolean(monthError)}
          />
          <DatePicker
            kind="day"
            label={t('date.day', '日')}
            options={dynamicDayOptions}
            value={form.day}
            onChange={(v) => onChange({ day: v })}
            invalid={Boolean(dayError)}
          />
          <DatePicker kind="hour" label={t('date.hour', '时')} options={HOURS} value={form.hour} onChange={(v) => onChange({ hour: v })} describedBy={ids.timeHint} />
          <DatePicker kind="minute" label={t('date.minute', '分')} options={MINUTES} value={form.minute} onChange={(v) => onChange({ minute: v })} describedBy={ids.timeHint} />
        </div>
        <div id={ids.timeHint}><DayTimeHint /></div>
        {yearError ? <p id={`${ids.year}-error`} role="alert" className="text-xs text-red-600 mt-1">{yearError}</p> : null}
        {monthError ? <p role="alert" className="text-xs text-red-600 mt-1">{monthError}</p> : null}
        {dayError ? <p role="alert" className="text-xs text-red-600 mt-1">{dayError}</p> : null}
      </fieldset>

      {/* 出生地 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary" aria-hidden>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <label id={ids.placeLabel} htmlFor={ids.place} className="bazi-calc-field-label">
            {t('form.birth_place')}
          </label>
        </div>
        <CitySearchInput
          id={ids.place}
          value={form.birthplace}
          onChange={(v) => onChange({ birthplace: v })}
          fieldClassName="bazi-city-field"
          dropdownClassName="bazi-city-dropdown"
          optionClassName="bazi-city-option"
          aria-labelledby={ids.placeLabel}
          aria-invalid={cityError ? true : undefined}
          aria-describedby={cityError ? `${ids.place}-error` : undefined}
        />
        {cityError ? <p id={`${ids.place}-error`} role="alert" className="text-xs text-red-600 mt-1">{cityError}</p> : null}
      </div>

    </div>
  );
}

function savedProfileToPersonForm(p: SavedProfile): Partial<PersonForm> {
  return {
    name: p.name,
    gender: (p.gender === 'female' ? 'female' : 'male') as 'male' | 'female',
    year: p.birthYear ?? '1990',
    month: p.birthMonth ?? '01',
    day: p.birthDay ?? '01',
    hour: p.birthHour ?? '08',
    minute: p.birthMinute ?? '00',
    birthplace: {
      city: p.birthPlaceCity ?? '北京',
      country: '中国',
      lng: p.birthPlaceLongitude ? parseFloat(p.birthPlaceLongitude) : 116.4074,
      timezone: '+8',
    },
  };
}

// ─── 主组件 ─────────────────
export default function Home() {
  const { t, locale } = useT();
  const [mode, setMode] = useState<"single" | "couple">("single");
  const [activePerson, setActivePerson] = useState<0 | 1>(0);
  const [forms, setForms] = useState<[PersonForm, PersonForm]>([emptyForm(), emptyForm()]);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);

  useEffect(() => {
    void fetchSavedProfiles().then(setSavedProfiles);
  }, []);

  // 切换模式时重置第二人
  const handleModeSwitch = (m: "single" | "couple") => {
    setMode(m);
    setActivePerson(0);
    if (m === "couple") {
      setForms((prev) => [prev[0], emptyForm()] as [PersonForm, PersonForm]);
    }
  };

  // 切换 Tab 时确保表单独立
  const handlePersonSwitch = (idx: 0 | 1) => {
    setActivePerson(idx);
  };

  // 确保双人模式下两个表单独立，切换人选时不共用数据
  useEffect(() => {
    if (mode === "single") {
      setForms((prev) => [prev[0], emptyForm()]);
    }
  }, [mode]);
  const [view, setView] = useState<ViewState>("form");
  const [result, setResult] = useState<ResultData | null>(null);
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const saveRecord = trpc.bazi.saveRecord.useMutation({
    onSuccess: () => { utils.bazi.getRecords.refetch(); },
    onError: (err) => {
      console.error("[保存排盘记录失败]", err);
      toast.error(t('toast.save_error'));
    },
  });

  useEffect(() => {
    loadLunarLib();
    void loadCityCatalog();
  }, []);

  // 支付回跳：恢复排盘结果页（避免回到首页空白）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') !== '1' && params.get('restore') !== '1') return;

    const snapshot = loadCheckoutSnapshot();
    if (!snapshot) {
      if (params.get('paid') === '1') {
        toast.error(t('paywall.restore_failed', '支付成功，请重新排盘后查看完整报告'));
      }
      return;
    }

    setResult(snapshot.result);
    setMode(snapshot.mode);
    setView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [t]);

  useEffect(() => {
    if (result) {
      saveCheckoutSnapshot(result, mode);
    }
  }, [result, mode]);

  // 登录后补同步占卜记录（未登录时排盘 sync 会 401 跳过，支付前需 payload 入库）
  useEffect(() => {
    if (!isAuthenticated || !result) return;
    const existingId = getLastReadingId() ?? undefined;
    if (result.type === "single") {
      const braceletRec = recommendBracelet(result.data.wuXing as unknown as Record<string, number>);
      const readingId = syncBaziSingleReading(result.data.name, result.data, braceletRec, existingId, locale);
      saveLastReadingId(readingId);
    } else {
      const readingId = syncBaziDoubleReading(
        result.data.person1.name,
        result.data.person2.name,
        result.data,
        existingId,
        locale,
      );
      saveLastReadingId(readingId);
    }
  }, [isAuthenticated, result, locale]);

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"gender" | "year" | "month" | "day" | "city", string>>>({});
  const formFieldIds = {
    name: "bazi-field-name",
    place: "bazi-field-place",
    placeLabel: "bazi-field-place-label",
    timeHint: "bazi-field-time-hint",
    gender: "bazi-field-gender",
    calendar: "bazi-field-calendar",
    year: "bazi-field-year",
  };

  const updateForm = (idx: 0 | 1, patch: Partial<PersonForm>) => {
    setForms((prev) => {
      const next = [...prev] as [PersonForm, PersonForm];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (patch.gender !== undefined) delete next.gender;
      if (patch.year !== undefined) delete next.year;
      if (patch.month !== undefined) delete next.month;
      if (patch.day !== undefined) delete next.day;
      if (patch.birthplace !== undefined) delete next.city;
      return next;
    });
  };

  const focusFirstError = (errors: Partial<Record<"gender" | "year" | "month" | "day" | "city", string>>) => {
    const order: Array<keyof typeof errors> = ["gender", "year", "month", "day", "city"];
    for (const key of order) {
      if (!errors[key]) continue;
      const el =
        key === "gender" ? document.getElementById(formFieldIds.gender)?.querySelector<HTMLElement>("input")
        : key === "year" ? document.querySelector<HTMLElement>('[data-bazi-date-kind="year"]')
        : key === "month" ? document.querySelector<HTMLElement>('[data-bazi-date-kind="month"]')
        : key === "day" ? document.querySelector<HTMLElement>('[data-bazi-date-kind="day"]')
        : document.getElementById(formFieldIds.place);
      el?.focus();
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      break;
    }
  };

  const handleSubmit = () => {
    const collectErrors = (f: PersonForm, second: boolean) => {
      const bag: Partial<Record<"gender" | "year" | "month" | "day" | "city", string>> = {};
      if (!f.gender) bag.gender = t(second ? 'form.error.gender_second' : 'form.error.gender');
      if (!f.year || parseInt(f.year) < 1900 || parseInt(f.year) > 2100) {
        bag.year = t(second ? 'form.error.year_second' : 'form.error.year');
      }
      const monthNum = parseInt(f.month.replace('L', ''), 10);
      if (!f.month || Number.isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        bag.month = t(second ? 'form.error.month_second' : 'form.error.month');
      }
      if (!f.day || parseInt(f.day) < 1 || parseInt(f.day) > 31) {
        bag.day = t(second ? 'form.error.day_second' : 'form.error.day');
      }
      if (!f.birthplace.city?.trim()) {
        bag.city = t(second ? 'form.error.city_second' : 'form.error.city');
      }
      return bag;
    };

    if (mode === "couple") {
      const e0 = collectErrors(forms[0], false);
      if (Object.keys(e0).length > 0) {
        setActivePerson(0);
        setFieldErrors(e0);
        toast.error(Object.values(e0)[0]!);
        requestAnimationFrame(() => focusFirstError(e0));
        return;
      }
      const e1 = collectErrors(forms[1], true);
      if (Object.keys(e1).length > 0) {
        setActivePerson(1);
        setFieldErrors(e1);
        toast.error(Object.values(e1)[0]!);
        requestAnimationFrame(() => focusFirstError(e1));
        return;
      }
    } else {
      const errors = collectErrors(forms[0], false);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        toast.error(Object.values(errors)[0]!);
        requestAnimationFrame(() => focusFirstError(errors));
        return;
      }
    }

    setFieldErrors({});

    const f0 = forms[0];
    // 自动填充默认值并同步到 state
    const resolvedF0 = { ...f0 };
    if (!resolvedF0.name) resolvedF0.name = "访客";
    const time0 = resolveUnknownBirthTime(resolvedF0.hour, resolvedF0.minute);
    resolvedF0.hour = time0.hour;
    resolvedF0.minute = time0.minute;

    let resolvedF1: PersonForm | undefined;
    if (mode === "couple") {
      const f1 = forms[1];
      resolvedF1 = { ...f1 };
      if (!resolvedF1.name) resolvedF1.name = "访客";
      const time1 = resolveUnknownBirthTime(resolvedF1.hour, resolvedF1.minute);
      resolvedF1.hour = time1.hour;
      resolvedF1.minute = time1.minute;
    }

    // 同步 state（用于显示），但不依赖其值做计算
    updateForm(0, { name: resolvedF0.name, hour: resolvedF0.hour, minute: resolvedF0.minute, birthplace: resolvedF0.birthplace });
    if (mode === "couple" && resolvedF1) {
      updateForm(1, { name: resolvedF1.name, hour: resolvedF1.hour, minute: resolvedF1.minute, birthplace: resolvedF1.birthplace });
    }

    setView("loading");

    const MIN_LOADING_MS = 220; // 非阻断最短视觉过渡（原固定 1.8s）
    const startedAt = Date.now();

    void (async () => {
      try {
        const toInput = async (f: PersonForm) => {
          const cityName = f.birthplace.city;
          let coords: { lng: number; lat: number; timezone: string } | null = null;
          if (f.birthplace.lng !== undefined) {
            coords = {
              lng: f.birthplace.lng,
              lat: f.birthplace.lat ?? 0,
              timezone: f.birthplace.timezone || "+8",
            };
          } else if (cityName) {
            const catalog = await loadCityCatalog();
            const local = matchLocalCity(catalog, cityName);
            if (local) coords = toCityCoords(local);
          }
          const rawMonth = f.month;
          const isLeapMonth = rawMonth.startsWith('L');
          const monthNum = parseInt(isLeapMonth ? rawMonth.slice(1) : rawMonth);
          const time = resolveUnknownBirthTime(f.hour, f.minute);
          return {
            name: f.name.trim() || "访客",
            gender: (f.gender || "male") as "male" | "female",
            year: parseInt(f.year),
            month: monthNum,
            day: parseInt(f.day),
            hour: parseInt(time.hour, 10),
            minute: parseInt(time.minute, 10),
            calendar: f.calendar === "solar" ? ("gregorian" as const) : ("lunar" as const),
            ...(isLeapMonth ? { isLeapMonth: true } : {}),
            birthplace: [f.birthplace.country, f.birthplace.city].filter(Boolean).join(' '),
            cityName: cityName || undefined,
            ...(coords ? { lng: coords.lng, lat: coords.lat, timezone: coords.timezone } : {}),
          };
        };

        if (mode === "single") {
          const input0 = await toInput(resolvedF0);
          const data = await calcSingleBazi(input0);
          setResult({ type: "single", data });
          if (isAuthenticated) {
            saveRecord.mutate({
              type: "single", name1: resolvedF0.name, inputData: input0,
              resultSummary: { riZhu: data.riZhu, strength: data.strength, wuXing: data.wuXing, favorable: data.favorable, unfavorable: data.unfavorable },
            });
          }
          void syncPersonProfile(resolvedF0);
          const braceletRec = recommendBracelet(data.wuXing as unknown as Record<string, number>);
          const readingId = syncBaziSingleReading(resolvedF0.name, data, braceletRec, undefined, locale);
          saveLastReadingId(readingId);
        } else {
          const [input0, input1] = await Promise.all([toInput(resolvedF0), toInput(resolvedF1!)]);
          const data = await calcDoubleBazi(input0, input1);
          setResult({ type: "double", data });
          if (isAuthenticated) {
            saveRecord.mutate({
              type: "couple", name1: resolvedF0.name, name2: resolvedF1!.name,
              inputData: { person1: input0, person2: input1 },
              resultSummary: { score: data.score, rating: data.rating },
            });
          }
          void syncPersonProfile(resolvedF0, "A");
          void syncPersonProfile(resolvedF1!, "B");
          const readingId = syncBaziDoubleReading(resolvedF0.name, resolvedF1!.name, data, undefined, locale);
          saveLastReadingId(readingId);
        }
        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_LOADING_MS) {
          await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed));
        }
        setView("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error(err);
        toast.error(t('toast.calc_error'));
        setView("form");
      }
    })();
  };

  const handleBack = () => {
    setView("form"); setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartDouble = () => {
    setMode("couple");
    setActivePerson(1);
    setForms((prev) => [prev[0], emptyForm()] as [PersonForm, PersonForm]);
    setView("form");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="bazi-home-page px-4">

        {view === "loading" && <LoadingView />}

        {view === "result" && result && (
          result.type === "single"
            ? <SingleBaziResultView result={result.data} onBack={handleBack} onStartDouble={handleStartDouble} />
            : <DoubleBaziResultView result={result.data} onBack={handleBack} />
        )}

        {view === "form" && (
          <>
            <BaziHomeHero />

            <div className="bazi-calc-form bazi-calc-section animate-fade-in-up">
              <div className="bazi-calc-mode-bar">
                {(["single", "couple"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeSwitch(m)}
                    className={`bazi-calc-mode-btn${mode === m ? ' is-active' : ''}`}
                  >
                    {m === "single" ? t('form.mode.single') : t('form.mode.couple')}
                  </button>
                ))}
              </div>

              {mode === "couple" && (
                <div className="bazi-calc-person-tabs">
                  <p className="bazi-calc-person-hint">
                    {t('form.person.editing', '编辑')}
                  </p>
                  {([t('form.person.first'), t('form.person.second')] as const).map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePerson(idx as 0 | 1)}
                      className={`bazi-calc-person-tab${activePerson === idx ? ' is-active' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {savedProfiles.length > 0 && (
                <div className="mb-3">
                  <label className="block text-[11px] mb-1.5 text-muted-foreground">
                    {t('form.saved_profile')}
                  </label>
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const picked = savedProfiles.find((p) => p.id === id);
                      if (picked) {
                        updateForm(mode === 'single' ? 0 : activePerson, savedProfileToPersonForm(picked));
                      }
                      e.target.value = '';
                    }}
                    className="bazi-field-select"
                  >
                    <option value="">{t('form.saved_profile.placeholder')}</option>
                    {savedProfiles.map((p) => (
                      <option key={p.id} value={p.id}>{profileDisplayLabel(p)}</option>
                    ))}
                  </select>
                </div>
              )}

              <PersonFormPanel
                form={forms[mode === "single" ? 0 : activePerson]}
                onChange={(patch) => updateForm(mode === "single" ? 0 : activePerson, patch)}
                fieldErrors={fieldErrors}
                ids={formFieldIds}
              />

              <button
                type="button"
                onClick={handleSubmit}
                className="bazi-calc-submit"
              >
                {mode === "single" ? t('form.submit.single') : t('form.submit.couple')}
              </button>
            </div>

            <BaziHomeFeed />
          </>
        )}
      </div>
    </div>
  );
}
