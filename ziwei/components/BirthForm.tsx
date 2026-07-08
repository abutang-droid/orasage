'use client';

import { useState, useMemo, useEffect } from 'react';
import { Mars, Venus } from 'lucide-react';
import { Button } from '@orasage/ui/button';
import { Checkbox } from '@orasage/ui/checkbox';
import { Input } from '@orasage/ui/input';
import type { BirthplaceValue } from '@orasage/city';
import { loadCityCatalog } from '@orasage/city';
import { CitySearchInput } from '@orasage/city/react';
import type { BirthInfo } from '@/lib/ziwei/types';
import { SHICHEN } from '@/lib/ziwei/constants';
import { useT } from '@/lib/i18n';
import { formToBirthInfo } from '@/lib/ziwei/share';
import { birthplaceToFormFields, formFieldsToBirthplace } from '@/lib/birthplace';
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
  const [cityCatalog, setCityCatalog] = useState<Awaited<ReturnType<typeof loadCityCatalog>>>([]);
  const [birthplace, setBirthplace] = useState<BirthplaceValue>(() =>
    formFieldsToBirthplace({
      city: initialData?.city ?? '',
      province: initialData?.province ?? '',
      longitude: initialData?.longitude ?? 120,
    }),
  );

  useEffect(() => {
    void loadCityCatalog().then(setCityCatalog).catch(() => {});
  }, []);

  useEffect(() => {
    void fetchSavedProfiles().then(setSavedProfiles);
  }, []);

  useEffect(() => {
    onFormSave?.({ ...form });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const handleBirthplaceChange = (value: BirthplaceValue) => {
    setBirthplace(value);
    const next = birthplaceToFormFields(value, cityCatalog);
    setForm((prev) => ({
      ...prev,
      city: next.city,
      province: next.province,
      longitude: next.longitude,
    }));
  };

  useEffect(() => {
    if (!form.city || cityCatalog.length === 0 || form.province) return;
    const next = birthplaceToFormFields(birthplace, cityCatalog);
    if (next.province) {
      setForm((prev) => ({ ...prev, province: next.province }));
    }
  }, [cityCatalog, form.city, form.province, birthplace]);

  const branch = useMemo(() => {
    if (form.unknownTime) return 0;
    return calcTrueSolarBranch(
      parseInt(form.clockHour) || 0,
      parseInt(form.clockMinute) || 0,
      form.longitude,
    );
  }, [form.clockHour, form.clockMinute, form.longitude, form.unknownTime]);

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
                setBirthplace(formFieldsToBirthplace(next));
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
          <Input
            type="text"
            className="ziwei-field-input h-auto min-h-0 shadow-none"
            placeholder={t('form.name.placeholder')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="ziwei-calc-segment" role="group" aria-label={t('form.gender')}>
          {(['male', 'female'] as const).map((g) => (
            <Button
              key={g}
              type="button"
              variant="outline"
              className={`ziwei-calc-segment-btn h-auto min-h-0${form.gender === g ? ' is-active' : ''}`}
              onClick={() => setForm({ ...form, gender: g })}
            >
              <span className="inline-flex items-center gap-1">
                {g === 'male' ? <Mars size={14} strokeWidth={2} aria-hidden /> : <Venus size={14} strokeWidth={2} aria-hidden />}
                {g === 'male' ? t('form.gender.male') : t('form.gender.female')}
              </span>
            </Button>
          ))}
        </div>
        <div className="ziwei-calc-segment" role="group" aria-label={t('form.calendar.label')}>
          {(['solar', 'lunar'] as const).map((c) => (
            <Button
              key={c}
              type="button"
              variant="outline"
              className={`ziwei-calc-segment-btn h-auto min-h-0${form.calendar === c ? ' is-active' : ''}`}
              onClick={() => setForm({ ...form, calendar: c })}
            >
              {c === 'solar' ? t('form.calendar.solar') : t('form.calendar.lunar')}
            </Button>
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
          <Checkbox
            checked={form.unknownTime}
            onCheckedChange={(checked) => setForm({ ...form, unknownTime: checked === true })}
            className="size-3.5 rounded-xs border-[var(--ziwei-control-border)] data-[state=checked]:border-[var(--os-color-mono-black)] data-[state=checked]:bg-[var(--os-color-mono-black)]"
          />
          <span>{t('form.unknown.time')}</span>
        </label>
      </div>

      {/* 出生地 — 全站地址库 */}
      <div>
        <label className="ziwei-calc-field-label">{t('form.birth.place')}</label>
        <CitySearchInput
          value={birthplace}
          onChange={handleBirthplaceChange}
          className="ziwei-birthplace-wrap"
          fieldClassName="ziwei-city-field"
          dropdownClassName="ziwei-city-dropdown"
          optionClassName="ziwei-city-option"
        />
        {!form.city ? (
          <p className="ziwei-field-hint">{t('form.location.hint')}</p>
        ) : null}
      </div>

      {!hideSubmit && (
        <Button type="submit" className="ziwei-calc-submit w-full" disabled={loading}>
          {loading ? t('form.submit.loading') : t('form.submit')}
        </Button>
      )}
    </form>
  );
}
