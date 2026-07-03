/**
 * 八字排盘 — 主页面
 * Design: OraSage · 纸感编辑风（与主站一致）
 */

import { useState, useEffect, useMemo, useRef } from "react";
import { getCityCoords, preloadCityData, searchCities, getCityDataStatus, checkLooksOverseas, type CityRecord } from "@/lib/cityData";
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
import { trpc } from "@/lib/trpc";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { syncSavedProfile, fetchSavedProfiles, profileDisplayLabel, type SavedProfile } from "@/lib/profile-sync";
import { syncBaziSingleReading, syncBaziDoubleReading } from "@/lib/reading-sync";
import { saveLastReadingId, getLastReadingId } from "@/_core/hooks/usePaymentFlow";
import { GOLD, GOLD_FAINT, GOLD_GHOST, HEADING, BODY_CLR, BG_PAGE, BG_CARD, BORDER_CLR } from "@/theme";

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
  birthplace: { city: string; country: string; lng?: number; timezone?: string };
}

const emptyForm = (): PersonForm => ({
  name: "", year: "1990", month: "01", day: "01", hour: "08", minute: "00",
  gender: "", calendar: "solar",
  birthplace: { city: "北京", country: "中国", lng: 116.4074, timezone: "+8" },
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
    <div className="flex flex-col items-center justify-center py-28 gap-8 animate-fade-in-up">
      <div className="relative w-20 h-20">
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

// ─── 城市搜索 ─────────────────────────
function CitySearchInput({ value, onChange }: {
  value: { city: string; country: string; lng?: number; timezone?: string };
  onChange: (v: { city: string; country: string; lng?: number; timezone?: string }) => void;
}) {
  const { t } = useT();
  const [query, setQuery] = useState(value.city || "");
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<CityRecord[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [aiSearching, setAiSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 外部 value 变化时同步输入框（如切换 Tab）
  useEffect(() => {
    const label = value.city
      ? (value.country && value.country !== '中国' ? `${value.city} · ${value.country}` : value.city)
      : '';
    setQuery(label);
  }, [value.city, value.country]);

  useEffect(() => {
    const status = getCityDataStatus();
    if (status.failed) {
      setDataError(t('form.city.failed'));
    } else if (!status.loaded) {
      setDataError(t('form.city.loading'));
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // AI 城市匹配（延迟查询）
  const triggerAiLookup = (q: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (q.length < 2) return;
    searchTimeoutRef.current = setTimeout(async () => {
      setAiSearching(true);
      setDataError(null);
      try {
        const result = await getCityCoords(q);
        if (result) {
          const label = result.country && result.country !== '中国'
            ? `${result.city} · ${result.country}` : result.city;
          setQuery(label);
          setOpen(false);
          setDataError(null);
          onChange({
            city: result.city || q,
            country: result.country || '',
            lng: result.lng,
            timezone: result.timezone,
          });
        } else if (checkLooksOverseas(q)) {
          setDataError(t('form.city.overseas_hint'));
        } else {
          setDataError(t('form.city.not_found'));
        }
      } catch {
        setDataError(t('form.city.failed'));
      } finally {
        setAiSearching(false);
      }
    }, 800);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (q.length >= 1) {
      const results = searchCities(q, 8);
      setSuggestions(results);
      setOpen(results.length > 0);
      const status = getCityDataStatus();
      if (results.length > 0) {
        setDataError(null);
      } else if (status.failed) {
        setDataError(t('form.city.failed'));
      } else if (!status.loaded) {
        setDataError(t('form.city.loading'));
      } else if (checkLooksOverseas(q)) {
        setDataError(t('form.city.overseas_hint'));
      } else {
        // 本地无匹配 → 触发 AI 查询
        setDataError(null);
        triggerAiLookup(q);
      }
    } else {
      setSuggestions([]);
      setOpen(false);
      setDataError(null);
      onChange({ city: '', country: '' });
    }
  };

  const handleSelect = (city: CityRecord) => {
    const label = city.country && city.country !== '中国'
      ? `${city.city} · ${city.country}` : city.city;
    setQuery(label);
    setOpen(false);
    onChange({ city: city.city, country: city.country || '', lng: city.lng, timezone: city.timezone });
  };

  const handleClear = () => {
    setQuery(''); setSuggestions([]); setOpen(false);
    onChange({ city: '', country: '' });
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors duration-200"
        style={{
          borderColor: focused ? GOLD : BORDER_CLR,
          background: BG_PAGE,
          boxShadow: focused ? `0 0 0 3px ${GOLD_FAINT}` : 'none',
        }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? GOLD : MUTED_CLR} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          onFocus={() => { setFocused(true); if (query.length >= 1) setOpen(suggestions.length > 0); }}
          onBlur={() => setFocused(false)}
          placeholder={t('form.city.placeholder')}
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            color: HEADING, fontFamily: SANS, fontSize: '0.9375rem', caretColor: GOLD,
          }}
        />
        {aiSearching && (
          <span className="text-xs" style={{ color: GOLD, opacity: 0.7 }}>{t('form.city.ai_matching')}</span>
        )}
        {query && (
          <button type="button" onClick={handleClear}
            style={{ color: MUTED_CLR, fontSize: '1rem', padding: '0 2px', lineHeight: 1 }}>
            ×
          </button>
        )}
        {aiSearching && (
          <span className="text-xs" style={{ color: GOLD, opacity: 0.7 }}>{t('form.city.searching')}</span>
        )}
      </div>
      {value.lng !== undefined && (
        <div style={{ fontSize: '0.6875rem', color: MUTED_CLR, marginTop: '0.25rem', paddingLeft: '0.25rem' }}>
          {value.lng > 0 ? t('city.longitude_east', '东经') + value.lng.toFixed(1) + '°' : t('city.longitude_west', '西经') + Math.abs(value.lng).toFixed(1) + '°'}
          {' · '}{t('city.timezone', '时区')} UTC{value.timezone || '+8'}
        </div>
      )}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 z-50 rounded-xl overflow-hidden"
          style={{
            top: 'calc(100% + 4px)',
            background: BG_CARD,
            border: `1px solid ${BORDER_CLR}`,
            boxShadow: '0 8px 32px rgba(46,41,91,0.12)',
          }}>
          {suggestions.map((city, i) => (
            <button
              key={i} type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(city); }}
              className="w-full text-left px-4 py-2.5 transition-colors"
              style={{ background: 'transparent', borderBottom: i < suggestions.length - 1 ? `1px solid ${BORDER_CLR}` : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = GOLD_GHOST)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: HEADING, fontFamily: SANS, fontSize: '0.9rem', fontWeight: 500 }}>{city.city}</span>
                <span style={{ fontSize: '0.7rem', color: MUTED_CLR, background: GOLD_GHOST, padding: '1px 8px', borderRadius: '4px' }}>
                  {city.country && city.country !== '中国' ? city.country : city.province || ''}
                </span>
              </div>
              {city.lng !== undefined && (
                <div style={{ fontSize: '0.65rem', color: MUTED_CLR, marginTop: '2px' }}>
                  {city.lng > 0 ? t('city.longitude_east', '东经') + ' ' + city.lng.toFixed(2) + '°' : t('city.longitude_west', '西经') + ' ' + Math.abs(city.lng).toFixed(2) + '°'}
                  {city.timezone && <span> · UTC{city.timezone}</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
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
function PersonFormPanel({ form, onChange }: {
  form: PersonForm;
  onChange: (patch: Partial<PersonForm>) => void;
}) {
  const { t } = useT();
  const isLunar = form.calendar === "lunar";
  const [leapMonth, setLeapMonth] = useState<number>(0);

  useEffect(() => {
    if (!isLunar) { setLeapMonth(0); return; }
    const y = parseInt(form.year) || 1990;
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
    const y = parseInt(form.year) || 1990;
    const m = parseInt(form.month.replace('L', '')) || 1;
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

  // 自动修正超出范围的日期
  useEffect(() => {
    const dayNum = parseInt(form.day, 10);
    if (isNaN(dayNum) || dayNum < 1) {
      onChange({ day: "01" });
    } else if (dayNum > dynamicDayOptions.length) {
      onChange({ day: String(dynamicDayOptions.length).padStart(2, "0") });
    }
  }, [maxDayCount, dynamicDayOptions.length, form.day, onChange]);

  useEffect(() => {
    if (!isLunar && form.month.startsWith("L")) {
      onChange({ month: form.month.slice(1) });
    }
  }, [isLunar, form.month, onChange]);

  // 必填字段验证
  const genderInvalid = !form.gender;
  const yearInvalid = !form.year || parseInt(form.year) < 1900 || parseInt(form.year) > 2100;

  // Field label helper
  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <div className="flex items-center gap-1 mb-2">
      <span className="bazi-home-field-label">{text}</span>
      {required && <span className="text-red-400 text-xs">*</span>}
    </div>
  );

  return (
    <div className="flex flex-col px-5 py-3 gap-4">

      {/* 姓名 + 性别 + 历法 */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1">
          <input
            type="text"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={t('form.name.placeholder')}
            className="ora-input !min-h-0 !py-2.5 !text-[0.9375rem]"
          />
        </div>

        <div className="bazi-home-segment">
          {(["male", "female"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ gender: g })}
              className={`bazi-home-segment-btn${form.gender === g ? ' is-active' : ''}`}
            >
              {g === "male" ? (t('form.gender.male') || "男") : (t('form.gender.female') || "女")}
            </button>
          ))}
        </div>

        <div className="bazi-home-segment">
          {(["solar", "lunar"] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ calendar: c })}
              className={`bazi-home-segment-btn${form.calendar === c ? ' is-active' : ''}`}
            >
              {c === "solar" ? (t('form.calendar.solar') || "公") : (t('form.calendar.lunar') || "农")}
            </button>
          ))}
        </div>
      </div>
      {isLunar && leapMonth > 0 && (
        <p style={{ color: GOLD, fontFamily: SANS, fontSize: '0.6875rem', marginTop: '-0.5rem' }}>
          {parseInt(form.year)}{t('form.calendar.lunar_hint')}{leapMonth}月
        </p>
      )}

      {/* 出生日期与时间 */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span style={{ fontFamily: SANS, fontSize: "0.8125rem", fontWeight: 600, color: HEADING }}>{t('form.birth_time')}</span>
          <span style={{ color: '#f87171', fontSize: '0.75rem' }}>*</span>
        </div>
        <div className="flex gap-2">
          <DatePicker label={t('date.year', '年')} options={YEARS} value={form.year} onChange={(v) => onChange({ year: v })} />
          <DatePicker
            label={t('date.month', '月')}
            options={isLunar ? lunarMonths : MONTHS}
            value={form.month}
            onChange={(v) => onChange({ month: v })}
            formatLabel={(v) => v.startsWith("L") ? (t('form.calendar.lunar_hint', '闰') || '闰') + parseInt(v.slice(1)) : v}
          />
          <DatePicker label={t('date.day', '日')} options={dynamicDayOptions} value={form.day} onChange={(v) => onChange({ day: v })} />
          <DatePicker label={t('date.hour', '时')} options={HOURS} value={form.hour} onChange={(v) => onChange({ hour: v })} />
          <DatePicker label={t('date.minute', '分')} options={MINUTES} value={form.minute} onChange={(v) => onChange({ minute: v })} />
        </div>
        <DayTimeHint />
      </div>

      {/* 出生地 */}
      <div>
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <Label text={t('form.birth_place')} />
        </div>
        <CitySearchInput
          value={form.birthplace}
          onChange={(v) => onChange({ birthplace: v })}
        />
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
  const { t } = useT();
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
    preloadCityData();
  }, []);

  // 登录后补同步占卜记录（未登录时排盘 sync 会 401 跳过，支付前需 payload 入库）
  useEffect(() => {
    if (!isAuthenticated || !result) return;
    const existingId = getLastReadingId() ?? undefined;
    if (result.type === "single") {
      const braceletRec = recommendBracelet(result.data.wuXing as unknown as Record<string, number>);
      const readingId = syncBaziSingleReading(result.data.name, result.data, braceletRec, existingId);
      saveLastReadingId(readingId);
    } else {
      const readingId = syncBaziDoubleReading(
        result.data.person1.name,
        result.data.person2.name,
        result.data,
        existingId,
      );
      saveLastReadingId(readingId);
    }
  }, [isAuthenticated, result]);

  const updateForm = (idx: 0 | 1, patch: Partial<PersonForm>) => {
    setForms((prev) => {
      const next = [...prev] as [PersonForm, PersonForm];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const handleSubmit = () => {
    const f0 = forms[0];
    // 必填验证
    if (!f0.gender) { toast.error(t('form.error.gender')); return; }
    if (!f0.year || parseInt(f0.year) < 1900 || parseInt(f0.year) > 2100) { toast.error(t('form.error.year')); return; }
    if (!f0.month || parseInt(f0.month) < 1 || parseInt(f0.month) > 12) { toast.error(t('form.error.month')); return; }
    if (!f0.day || parseInt(f0.day) < 1 || parseInt(f0.day) > 31) { toast.error(t('form.error.day')); return; }
    if (mode === "couple") {
      const f1 = forms[1];
      if (!f1.gender) { toast.error(t('form.error.gender_second')); return; }
      if (!f1.year || parseInt(f1.year) < 1900 || parseInt(f1.year) > 2100) { toast.error(t('form.error.year_second')); return; }
      if (!f1.month || parseInt(f1.month) < 1 || parseInt(f1.month) > 12) { toast.error(t('form.error.month_second')); return; }
      if (!f1.day || parseInt(f1.day) < 1 || parseInt(f1.day) > 31) { toast.error(t('form.error.day_second')); return; }
    }

    // 自动填充默认值并同步到 state
    const resolvedF0 = { ...f0 };
    if (!resolvedF0.name) resolvedF0.name = "访客";
    if (!resolvedF0.hour) resolvedF0.hour = "08";
    if (!resolvedF0.minute) resolvedF0.minute = "00";
    if (!resolvedF0.birthplace.city) resolvedF0.birthplace = { city: "北京", country: "中国", lng: 116.4074, timezone: "+8" };

    let resolvedF1: PersonForm | undefined;
    if (mode === "couple") {
      const f1 = forms[1];
      resolvedF1 = { ...f1 };
      if (!resolvedF1.name) resolvedF1.name = "访客";
      if (!resolvedF1.hour) resolvedF1.hour = "08";
      if (!resolvedF1.minute) resolvedF1.minute = "00";
      if (!resolvedF1.birthplace.city) resolvedF1.birthplace = { city: "北京", country: "中国", lng: 116.4074, timezone: "+8" };
    }

    // 同步 state（用于显示），但不依赖其值做计算
    updateForm(0, { name: resolvedF0.name, hour: resolvedF0.hour, minute: resolvedF0.minute, birthplace: resolvedF0.birthplace });
    if (mode === "couple" && resolvedF1) {
      updateForm(1, { name: resolvedF1.name, hour: resolvedF1.hour, minute: resolvedF1.minute, birthplace: resolvedF1.birthplace });
    }

    setView("loading");

    setTimeout(async () => {
      try {
        const toInput = async (f: PersonForm) => {
          const cityName = f.birthplace.city;
          const coords = f.birthplace.lng !== undefined
            ? { lng: f.birthplace.lng, lat: 0, timezone: f.birthplace.timezone || '+8' }
            : (cityName ? await getCityCoords(cityName) : null);
          const rawMonth = f.month;
          const isLeapMonth = rawMonth.startsWith('L');
          const monthNum = parseInt(isLeapMonth ? rawMonth.slice(1) : rawMonth);
          return {
            name: f.name.trim() || "访客",
            gender: (f.gender || "male") as "male" | "female",
            year: parseInt(f.year),
            month: monthNum,
            day: parseInt(f.day),
            hour: parseInt(f.hour),
            minute: parseInt(f.minute),
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
          const readingId = syncBaziSingleReading(resolvedF0.name, data, braceletRec);
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
          const readingId = syncBaziDoubleReading(resolvedF0.name, resolvedF1!.name, data);
          saveLastReadingId(readingId);
        }
        setView("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error(err);
        toast.error(t('toast.calc_error'));
        setView("form");
      }
    }, 1800);
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
            <header className="bazi-home-hero animate-fade-in-up">
              <p className="bazi-home-eyebrow">{t('home.eyebrow')}</p>
              <h1 className="bazi-home-title">{t('home.title')}</h1>
              <p className="bazi-home-subtitle">{t('home.subtitle')}</p>
            </header>

            <div className="bazi-home-card animate-fade-in-up">
              <div className="bazi-home-mode-bar">
                {(["single", "couple"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeSwitch(m)}
                    className={`bazi-home-mode-btn${mode === m ? ' is-active' : ''}`}
                  >
                    {m === "single" ? t('form.mode.single') : t('form.mode.couple')}
                  </button>
                ))}
              </div>

              {mode === "couple" && (
                <div className="bazi-home-person-tabs">
                  <p className="bazi-home-person-hint">
                    {t('form.person.editing', '编辑')}
                  </p>
                  {([t('form.person.first'), t('form.person.second')] as const).map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePerson(idx as 0 | 1)}
                      className={`bazi-home-person-tab${activePerson === idx ? ' is-active' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {savedProfiles.length > 0 && (
                <div className="mx-5 mb-3">
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
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none bg-secondary border border-border text-foreground"
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
              />

              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary bazi-home-submit"
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
