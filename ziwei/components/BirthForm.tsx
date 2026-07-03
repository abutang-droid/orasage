'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { BirthInfo } from '@/lib/ziwei/types';
import { SHICHEN } from '@/lib/ziwei/constants';
import { PROVINCES } from '@/lib/ziwei/cities';
import { searchGlobalCities } from '@/lib/ziwei/globalCities';
import { useT } from '@/lib/i18n';
import { formToBirthInfo } from '@/lib/ziwei/share';
import { fetchSavedProfiles, profileDisplayLabel, savedProfileToBirthForm, type SavedProfile } from '@/lib/profile-sync';

export interface BirthFormState {
  name: string;
  year: string;
  month: string;
  day: string;
  clockHour: string;
  clockMinute: string;
  unknownTime: boolean;
  province: string;
  city: string;
  longitude: number;
  gender: 'male' | 'female';
  calendar: 'solar' | 'lunar';
}

interface BirthFormProps {
  onSubmit: (info: BirthInfo, form: BirthFormState) => void;
  loading?: boolean;
  initialData?: Partial<BirthFormState>;
  onFormSave?: (data: BirthFormState) => void;
  hideSubmit?: boolean;
}

type BirthplaceOption = {
  city: string;
  province: string;
  longitude: number;
  label: string;
};

const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const YEARS = Array.from({ length: 127 }, (_, i) => String(2026 - i));
const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const HOURS = Array.from({ length: 24 }, (_, i) => String(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i));

function calcTrueSolarBranch(clockHour: number, clockMinute: number, longitude: number): number {
  const clockMins = clockHour * 60 + clockMinute;
  const offset = (longitude - 120) * 4;
  const solar = ((clockMins + offset) % 1440 + 1440) % 1440;
  if (solar >= 1380 || solar < 60) return 0;
  return Math.floor((solar - 60) / 120) + 1;
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (!y || !m || !d) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

function searchBirthplaces(query: string): BirthplaceOption[] {
  const q = query.trim();
  if (!q) return [];
  const lower = q.toLowerCase();
  const results: BirthplaceOption[] = [];
  const seen = new Set<string>();

  for (const p of PROVINCES) {
    for (const c of p.cities) {
      if (c.name.includes(q) || p.name.includes(q)) {
        const key = `${c.name}|${p.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            city: c.name,
            province: p.name,
            longitude: c.longitude,
            label: `${c.name} · ${p.name}`,
          });
        }
      }
    }
  }

  for (const g of searchGlobalCities(q)) {
    const key = `${g.city}|${g.country}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push({
        city: g.city,
        province: g.country,
        longitude: g.longitude,
        label: `${g.city} · ${g.country}`,
      });
    }
  }

  return results.filter((r) => r.label.toLowerCase().includes(lower) || r.city.includes(q)).slice(0, 8);
}

function birthplaceLabel(form: Pick<BirthFormState, 'city' | 'province'>) {
  if (!form.city) return '';
  return form.province && form.province !== form.city ? `${form.city} · ${form.province}` : form.city;
}

export default function BirthForm({ onSubmit, loading, initialData, onFormSave, hideSubmit }: BirthFormProps) {
  const t = useT();

  const [form, setForm] = useState<BirthFormState>({
    name: initialData?.name ?? '',
    year: initialData?.year ?? '',
    month: initialData?.month ?? '',
    day: initialData?.day ?? '',
    clockHour: initialData?.clockHour ?? '8',
    clockMinute: initialData?.clockMinute ?? '0',
    unknownTime: initialData?.unknownTime ?? false,
    province: initialData?.province ?? '',
    city: initialData?.city ?? '',
    longitude: initialData?.longitude ?? 120,
    gender: initialData?.gender ?? 'male',
    calendar: initialData?.calendar ?? 'solar',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [birthplaceQuery, setBirthplaceQuery] = useState(() => birthplaceLabel({
    city: initialData?.city ?? '',
    province: initialData?.province ?? '',
  }));
  const [birthplaceOpen, setBirthplaceOpen] = useState(false);
  const birthplaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void fetchSavedProfiles().then(setSavedProfiles);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (birthplaceRef.current && !birthplaceRef.current.contains(e.target as Node)) {
        setBirthplaceOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    onFormSave?.({ ...form });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const birthplaceSuggestions = useMemo(
    () => searchBirthplaces(birthplaceQuery),
    [birthplaceQuery],
  );

  const branch = useMemo(() => {
    if (form.unknownTime) return 0;
    return calcTrueSolarBranch(
      parseInt(form.clockHour) || 0,
      parseInt(form.clockMinute) || 0,
      form.longitude,
    );
  }, [form.clockHour, form.clockMinute, form.longitude, form.unknownTime]);

  const offsetMin = Math.round((form.longitude - 120) * 4);
  const shichenInfo = SHICHEN[branch];

  const y = parseInt(form.year) || 0;
  const m = parseInt(form.month.replace(/^L/, '')) || 0;
  const d = parseInt(form.day) || 0;

  const errors = {
    year: !form.year ? t('form.error.year.required')
      : y < 1900 || y > 2026 ? t('form.error.year.range')
      : '',
    month: !form.month ? t('form.error.month.required') : '',
    day: !form.day ? t('form.error.day.required')
      : form.year && form.month && form.calendar === 'solar' && !isValidDate(y, m, d)
        ? t('form.error.day.invalid', { month: m, day: d })
        : '',
  };
  const hasError = Object.values(errors).some(Boolean);
  const showErr = (field: string) => touched[field] || submitAttempted;

  const handleBirthplaceInput = (value: string) => {
    setBirthplaceQuery(value);
    setBirthplaceOpen(value.trim().length > 0);
    if (!value.trim()) {
      setForm((prev) => ({ ...prev, province: '', city: '', longitude: 120 }));
    } else {
      setForm((prev) => ({ ...prev, city: value.trim(), province: '' }));
    }
  };

  const handleBirthplaceSelect = (opt: BirthplaceOption) => {
    setBirthplaceQuery(opt.label);
    setBirthplaceOpen(false);
    setForm((prev) => ({
      ...prev,
      city: opt.city,
      province: opt.province,
      longitude: opt.longitude,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setTouched({ year: true, month: true, day: true });
    if (hasError) return;
    onFormSave?.({ ...form });
    onSubmit(formToBirthInfo(form), form);
  };

  return (
    <form className="ziwei-birth-form" onSubmit={handleSubmit}>
      {savedProfiles.length > 0 && (
        <div>
          <label className="ziwei-calc-field-label">{t('form.savedProfile')}</label>
          <select
            className="ziwei-field-select"
            defaultValue=""
            onChange={(e) => {
              const id = Number(e.target.value);
              const picked = savedProfiles.find((p) => p.id === id);
              if (picked) {
                const next = { ...form, ...savedProfileToBirthForm(picked) };
                setForm(next);
                setBirthplaceQuery(birthplaceLabel(next));
              }
              e.target.value = '';
            }}
          >
            <option value="">{t('form.savedProfile.placeholder')}</option>
            {savedProfiles.map((p) => (
              <option key={p.id} value={p.id}>{profileDisplayLabel(p)}</option>
            ))}
          </select>
        </div>
      )}

      {/* 姓名 / 性别 / 公农历 */}
      <div className="ziwei-birth-form-row">
        <div className="ziwei-birth-form-name">
          <input
            type="text"
            className="ziwei-field-input"
            placeholder={t('form.name.placeholder')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="ziwei-calc-segment" role="group" aria-label={t('form.gender')}>
          {(['male', 'female'] as const).map((g) => (
            <button
              key={g}
              type="button"
              className={`ziwei-calc-segment-btn${form.gender === g ? ' is-active' : ''}`}
              onClick={() => setForm({ ...form, gender: g })}
            >
              {g === 'male' ? t('form.gender.male') : t('form.gender.female')}
            </button>
          ))}
        </div>
        <div className="ziwei-calc-segment" role="group" aria-label={t('form.calendar.label')}>
          {(['solar', 'lunar'] as const).map((c) => (
            <button
              key={c}
              type="button"
              className={`ziwei-calc-segment-btn${form.calendar === c ? ' is-active' : ''}`}
              onClick={() => setForm({ ...form, calendar: c })}
            >
              {c === 'solar' ? t('form.calendar.solar') : t('form.calendar.lunar')}
            </button>
          ))}
        </div>
      </div>

      {/* 出生年月日时分 */}
      <div>
        <label className="ziwei-calc-field-label">{t('form.birth.datetime')}</label>
        <div className="ziwei-birth-form-row ziwei-birth-form-row--datetime">
          <select
            className={`ziwei-field-select ziwei-field-select--compact${showErr('year') && errors.year ? ' is-error' : ''}`}
            value={form.year}
            onChange={(e) => { setForm({ ...form, year: e.target.value }); setTouched((t) => ({ ...t, year: true })); }}
            required
          >
            <option value="">{t('form.year')}</option>
            {YEARS.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
          </select>
          <select
            className={`ziwei-field-select ziwei-field-select--compact${showErr('month') && errors.month ? ' is-error' : ''}`}
            value={form.month}
            onChange={(e) => { setForm({ ...form, month: e.target.value }); setTouched((t) => ({ ...t, month: true })); }}
            required
          >
            <option value="">{t('form.month')}</option>
            {MONTHS.map((mo) => <option key={mo} value={mo}>{`${mo}${t('form.month.suffix')}`}</option>)}
          </select>
          <select
            className={`ziwei-field-select ziwei-field-select--compact${showErr('day') && errors.day ? ' is-error' : ''}`}
            value={form.day}
            onChange={(e) => { setForm({ ...form, day: e.target.value }); setTouched((t) => ({ ...t, day: true })); }}
            required
          >
            <option value="">{t('form.day')}</option>
            {DAYS.map((dy) => <option key={dy} value={dy}>{`${dy}${t('form.day.suffix')}`}</option>)}
          </select>
          <select
            className="ziwei-field-select ziwei-field-select--compact"
            value={form.clockHour}
            disabled={form.unknownTime}
            onChange={(e) => setForm({ ...form, clockHour: e.target.value })}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{h.padStart(2, '0')}{t('form.hour.suffix')}</option>
            ))}
          </select>
          <select
            className="ziwei-field-select ziwei-field-select--compact"
            value={form.clockMinute}
            disabled={form.unknownTime}
            onChange={(e) => setForm({ ...form, clockMinute: e.target.value })}
          >
            {MINUTES.map((min) => (
              <option key={min} value={min}>{min.padStart(2, '0')}{t('form.minute.suffix')}</option>
            ))}
          </select>
        </div>
        {(showErr('year') && errors.year) && <p className="ziwei-field-error">{errors.year}</p>}
        {(showErr('month') && errors.month) && <p className="ziwei-field-error">{errors.month}</p>}
        {(showErr('day') && errors.day) && <p className="ziwei-field-error">{errors.day}</p>}
        {!form.unknownTime && (
          <p className="ziwei-solar-hint">
            {t('form.solar.hour')}
            <strong>{SHICHEN_NAMES[branch]}{t('form.hour.suffix')}</strong>
            {shichenInfo ? `（${shichenInfo.range}）` : ''}
          </p>
        )}
        <label className="ziwei-checkbox-row" style={{ marginTop: '0.5rem' }}>
          <input
            type="checkbox"
            checked={form.unknownTime}
            onChange={(e) => setForm({ ...form, unknownTime: e.target.checked })}
          />
          <span>{t('form.unknown.time')}</span>
        </label>
      </div>

      {/* 出生地 — 文本输入 */}
      <div>
        <label className="ziwei-calc-field-label">{t('form.birth.place')}</label>
        <div className="ziwei-birthplace-wrap" ref={birthplaceRef}>
          <input
            type="text"
            className="ziwei-field-input"
            value={birthplaceQuery}
            onChange={(e) => handleBirthplaceInput(e.target.value)}
            onFocus={() => { if (birthplaceQuery.trim()) setBirthplaceOpen(true); }}
            placeholder={t('form.birthplace.placeholder')}
          />
          {birthplaceOpen && birthplaceSuggestions.length > 0 && (
            <div className="ziwei-birthplace-dropdown">
              {birthplaceSuggestions.map((opt) => (
                <button
                  key={`${opt.city}-${opt.province}`}
                  type="button"
                  className="ziwei-birthplace-option"
                  onClick={() => handleBirthplaceSelect(opt)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {form.city ? (
          <p className="ziwei-field-hint">
            {form.city}{form.province ? ` · ${form.province}` : ''} · {t('form.longitude')} {form.longitude.toFixed(1)}° · {t('form.timezone')} {offsetMin > 0 ? '+' : ''}{offsetMin} {t('form.minutes')}
          </p>
        ) : (
          <p className="ziwei-field-hint">{t('form.location.hint')}</p>
        )}
      </div>

      {!hideSubmit && (
        <button type="submit" className="ziwei-calc-submit" disabled={loading}>
          {loading ? t('form.submit.loading') : t('form.submit')}
        </button>
      )}
    </form>
  );
}
