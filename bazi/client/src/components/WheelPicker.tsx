/**
 * DatePicker / RegionPicker — 日期 & 出生地选择器
 */

import { useRef, useEffect, useState } from "react";
import { provinces, getCities, getDistricts } from "@/lib/regionData";

interface WheelPickerProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  label?: string;
  formatLabel?: (val: string) => string;
}

import {
  GOLD, GOLD_GHOST, HEADING, BODY_CLR, MUTED_CLR,
  BG_PAGE, BG_CARD, BORDER_CLR, SANS_F,
} from "@/theme";

const ERR_CLR = "#dc2626";
const SANS = SANS_F;

// ── 各字段的验证规则 ────────
type FieldKind = "year" | "month" | "day" | "hour" | "minute";

function validateField(kind: FieldKind, raw: string): string | null {
  const v = raw.trim();
  if (!v) return null; // 空值不报错，失焦恢复原值
  if (!/^\d+$/.test(v)) return "请输入数字";

  const n = parseInt(v, 10);
  switch (kind) {
    case "year":
      if (n < 1900 || n > 2100) return "年份需在 1900-2100 之间";
      break;
    case "month":
      if (n < 1 || n > 12) return "月份需在 01-12 之间";
      break;
    case "day":
      if (n < 1 || n > 31) return "日期需在 01-31 之间";
      break;
    case "hour":
      if (n < 0 || n > 23) return "小时需在 00-23 之间";
      break;
    case "minute":
      if (n < 0 || n > 59) return "分钟需在 00-59 之间";
      break;
  }
  return null;
}

// ── 格式化为两位数 ────────
function formatValue(kind: FieldKind, raw: string): string {
  const n = parseInt(raw, 10);
  if (isNaN(n)) return raw;
  if (kind === "year") return String(n);
  return String(n).padStart(2, "0");
}

// ── 从 options 中找最接近的值（输入不在列表中时回退） ──
function closestOption(options: string[], raw: string): string {
  const formatted = raw.padStart(2, "0");
  if (options.includes(formatted)) return formatted;
  if (options.includes(raw)) return raw;
  return options[0]; // 回退到第一个选项
}

// ════════════════════════════════════════════════════════════════════════
// DatePicker — 可点击下拉 + 可双击手动输入 + 即时校验
// ════════════════════════════════════════════════════════════════════════
export function DatePicker({
  options, value, onChange, label, formatLabel,
}: WheelPickerProps & { kind?: FieldKind }) {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const display = formatLabel ? formatLabel(value) : value;

  // 从 label 推断字段类型
  const kind: FieldKind = (label === "年" ? "year" :
    label === "月" ? "month" :
    label === "日" ? "day" :
    label === "时" ? "hour" :
    label === "分" ? "minute" : "year");

  useEffect(() => {
    if (!open && !isEditing) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (isEditing) commitEdit();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, isEditing]);

  // 默认占位文本
  const placeholders: Record<FieldKind, string> = {
    year: "1900", month: "12", day: "31", hour: "23", minute: "59",
  };
  const placeholder = placeholders[kind] || "";

  const handleClick = () => {
    if (isEditing) return;
    setIsEditing(true);
    setEditValue("");
    setError(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setEditValue(raw);
    const err = validateField(kind, raw);
    setError(err);
    // 输入有效时立即生效
    if (!err && raw.trim()) {
      const formatted = formatValue(kind, raw.trim());
      onChange(formatted);
    }
  };

  const commitEdit = () => {
    const raw = editValue.trim();
    if (!raw) {
      setIsEditing(false);
      setEditValue("");
      setError(null);
      return;
    }
    const err = validateField(kind, raw);
    if (err) {
      setError(err);
      return;
    }
    const formatted = formatValue(kind, raw);
    onChange(formatted);
    setIsEditing(false);
    setEditValue("");
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue("");
      setError(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 flex-1 select-none" ref={containerRef}>
      {label && (
        <span className="text-xs" style={{ color: error ? ERR_CLR : MUTED_CLR, fontFamily: SANS, fontSize: "0.6875rem" }}>
          {error ? error : label}
        </span>
      )}
      <div className="relative w-full">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={editValue}
            placeholder={placeholder}
            onChange={handleInputChange}
            onBlur={commitEdit}
            onKeyDown={handleKeyDown}
            className={`bazi-date-input${error ? ' border-destructive' : ''}`}
            style={error ? { borderColor: ERR_CLR, color: ERR_CLR } : undefined}
          />
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="bazi-date-trigger flex items-center justify-center"
          >
            {display}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 三级联动出生地选择器 ────────────────────────────────────────────────────────

interface RegionPickerProps {
  value: { province: string; city: string; district: string };
  onChange: (val: { province: string; city: string; district: string }) => void;
}

export function RegionPicker({ value, onChange }: RegionPickerProps) {
  const [step, setStep] = useState<'province' | 'city' | 'district' | null>(null);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const cities = value.province ? getCities(value.province) : [];
  const districts = value.province && value.city ? getDistricts(value.province, value.city) : [];

  useEffect(() => {
    if (!step) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setStep(null);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [step]);

  const openStep = (s: 'province' | 'city' | 'district') => {
    setStep(step === s ? null : s);
    setSearch("");
  };

  const selectProvince = (p: string) => {
    const firstCity = getCities(p)[0] || "";
    const firstDistrict = firstCity ? getDistricts(p, firstCity)[0] || "" : "";
    onChange({ province: p, city: firstCity, district: firstDistrict });
    setStep('city');
    setSearch("");
  };

  const selectCity = (c: string) => {
    const firstDistrict = getDistricts(value.province, c)[0] || "";
    onChange({ ...value, city: c, district: firstDistrict });
    setStep('district');
    setSearch("");
  };

  const selectDistrict = (d: string) => {
    onChange({ ...value, district: d });
    setStep(null);
    setSearch("");
  };

  const getFilteredList = () => {
    if (step === 'province') return provinces.filter(p => p.includes(search));
    if (step === 'city') return cities.filter(c => c.includes(search));
    if (step === 'district') return districts.filter(d => d.includes(search));
    return [];
  };

  const getPlaceholder = () => {
    if (step === 'province') return "搜索省份...";
    if (step === 'city') return "搜索城市...";
    if (step === 'district') return "搜索区县...";
    return "";
  };

  const handleSelect = (item: string) => {
    if (step === 'province') selectProvince(item);
    else if (step === 'city') selectCity(item);
    else if (step === 'district') selectDistrict(item);
  };

  const getSelectedForStep = (s: 'province' | 'city' | 'district') => {
    if (s === 'province') return value.province;
    if (s === 'city') return value.city;
    return value.district;
  };

  const btnStyle = (active: boolean, hasValue: boolean) => ({
    flex: 1,
    padding: '8px 6px',
    background: active ? 'rgba(200,168,75,0.12)' : 'rgba(255,255,255,0.03)',
    border: `1px solid ${active ? 'rgba(200,168,75,0.7)' : 'rgba(200,168,75,0.25)'}`,
    borderRadius: '6px',
    color: hasValue ? 'rgba(240,208,128,0.9)' : 'rgba(200,168,75,0.35)',
    fontSize: '12px',
    fontFamily: "'Noto Serif SC', serif",
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex gap-1.5">
        {(['province', 'city', 'district'] as const).map((s) => {
          const labels = { province: '省份', city: '城市', district: '区县' };
          const val = getSelectedForStep(s);
          const disabled = s === 'city' && !value.province || s === 'district' && !value.city;
          return (
            <button
              key={s}
              type="button"
              onClick={() => !disabled && openStep(s)}
              style={{
                ...btnStyle(step === s, !!val),
                opacity: disabled ? 0.35 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {val || labels[s]}
            </button>
          );
        })}
      </div>

      {step && (
        <div
          className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden"
          style={{
            bottom: 'calc(100% + 4px)',
            background: 'rgba(14,12,8,0.97)',
            border: '1px solid rgba(200,168,75,0.35)',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: 'rgba(240,208,128,0.8)', caretColor: '#c8a84b' }}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {getFilteredList().length === 0 ? (
              <div className="px-3 py-3 text-xs text-center" style={{ color: 'rgba(200,168,75,0.4)' }}>无匹配结果</div>
            ) : (
              getFilteredList().map((item) => {
                const isSelected = item === getSelectedForStep(step);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2.5 text-sm transition-colors duration-150"
                    style={{
                      color: isSelected ? '#f0d080' : 'rgba(200,168,75,0.65)',
                      background: isSelected ? 'rgba(200,168,75,0.12)' : 'transparent',
                      fontFamily: "'Noto Serif SC', serif",
                    }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.06)'; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {item}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 组合选择器：出生地（保留向后兼容） ─────────────────────────────

interface ListPickerProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function ListPicker({ options, value, onChange, placeholder }: ListPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter((o) => o.includes(search));

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded text-sm transition-all duration-200"
        style={{
          background: open ? "rgba(200,168,75,0.08)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${open ? "rgba(200,168,75,0.6)" : "rgba(200,168,75,0.3)"}`,
          color: value ? "rgba(240,208,128,0.9)" : "rgba(200,168,75,0.35)",
        }}
      >
        <span>{value || placeholder || "请选择"}</span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(200,168,75,0.6)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-50 rounded-lg overflow-hidden animate-fade-in"
          style={{
            bottom: "calc(100% + 4px)",
            background: "rgba(14,12,8,0.97)",
            border: "1px solid rgba(200,168,75,0.35)",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(200,168,75,0.15)" }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索省份..."
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: "rgba(240,208,128,0.8)", caretColor: "#c8a84b" }}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-center" style={{ color: "rgba(200,168,75,0.4)" }}>无匹配结果</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); setSearch(""); }}
                  className="w-full text-left px-3 py-2.5 text-sm transition-colors duration-150"
                  style={{
                    color: opt === value ? "#f0d080" : "rgba(200,168,75,0.65)",
                    background: opt === value ? "rgba(200,168,75,0.12)" : "transparent",
                  }}
                  onMouseEnter={(e) => { if (opt !== value) (e.target as HTMLElement).style.background = "rgba(200,168,75,0.06)"; }}
                  onMouseLeave={(e) => { if (opt !== value) (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
