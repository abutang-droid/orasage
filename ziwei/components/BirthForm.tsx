'use client';

import { useState, useMemo, useEffect, useId, useRef } from 'react';
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

const CURRENT_YEAR = new Date().getFullYear();
const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const YEARS = Array.from({ length: CURRENT_YEAR - 1900 + 1 }, (_, i) => String(CURRENT_YEAR - i));
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
  const uid = useId();
  const yearRef = useRef<HTMLSelectElement>(null);
  const monthRef = useRef<HTMLSelectElement>(null);
  const dayRef = useRef<HTMLSelectElement>(null);

  const ids = {
    name: `${uid}-name`,
    year: `${uid}-year`,
    month: `${uid}-month`,
    day: `${uid}-day`,
    hour: `${uid}-hour`,
    minute: `${uid}-minute`,
    city: `${uid}-city`,
    errYear: `${uid}-err-year`,
    errMonth: `${uid}-err-month`,
    errDay: `${uid}-err-day`,
  };

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
      : y < 1900 || y > CURRENT_YEAR ? t('form.error.year.range', { max: CURRENT_YEAR })
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
    if (hasError) {
      if (errors.year) yearRef.current?.focus();
      else if (errors.month) monthRef.current?.focus();
      else if (errors.day) dayRef.current?.focus();
      return;
    }
    onFormSave?.({ ...form });
    onSubmit(formToBirthInfo(form), form);
  };

  return (
    <form className="ziwei-birth-form" onSubmit={handleSubmit} noValidate>
      {savedProfiles.length > 0 && (
        <div>
          <label className="ziwei-calc-field-label" htmlFor={`${uid}-saved`}>
            {t('form.savedProfile')}
          </label>
          <select
            id={`${uid}-saved`}
            name="savedProfile"
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

      <div className="ziwei-birth-form-row">
        <div className="ziwei-birth-form-name">
          <label className="ziwei-calc-field-label" htmlFor={ids.name}>
            {t('form.name')}
          </label>
          <Input
            id={ids.name}
            name="name"
            type="text"
            className="ziwei-field-input h-auto min-h-0 shadow-none"
            placeholder={t('form.name.placeholder')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="name"
          />
        </div>
        <div className="ziwei-calc-segment" role="radiogroup" aria-label={t('form.gender')}>
          {(['male', 'female'] as const).map((g) => (
            <Button
              key={g}
              type="button"
              role="radio"
              aria-checked={form.gender === g}
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
        <div className="ziwei-calc-segment" role="radiogroup" aria-label={t('form.calendar.label')}>
          {(['solar', 'lunar'] as const).map((c) => (
            <Button
              key={c}
              type="button"
              role="radio"
              aria-checked={form.calendar === c}
              variant="outline"
              className={`ziwei-calc-segment-btn h-auto min-h-0${form.calendar === c ? ' is-active' : ''}`}
              onClick={() => setForm({ ...form, calendar: c })}
            >
              {c === 'solar' ? t('form.calendar.solar') : t('form.calendar.lunar')}
            </Button>
          ))}
        </div>
      </div>

      <fieldset className="ziwei-birth-datetime">
        <legend className="ziwei-calc-field-label">{t('form.birth.datetime')}</legend>
        <div className="ziwei-birth-form-row ziwei-birth-form-row--datetime">
          <label className="sr-only" htmlFor={ids.year}>{t('form.year')}</label>
          <select
            ref={yearRef}
            id={ids.year}
            name="year"
            className={`ziwei-field-select ziwei-field-select--compact${showErr('year') && errors.year ? ' is-error' : ''}`}
            value={form.year}
            aria-invalid={showErr('year') && Boolean(errors.year)}
            aria-describedby={showErr('year') && errors.year ? ids.errYear : undefined}
            onChange={(e) => { setForm({ ...form, year: e.target.value }); setTouched((prev) => ({ ...prev, year: true })); }}
          >
            <option value="">{t('form.year')}</option>
            {YEARS.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
          </select>
          <label className="sr-only" htmlFor={ids.month}>{t('form.month')}</label>
          <select
            ref={monthRef}
            id={ids.month}
            name="month"
            className={`ziwei-field-select ziwei-field-select--compact${showErr('month') && errors.month ? ' is-error' : ''}`}
            value={form.month}
            aria-invalid={showErr('month') && Boolean(errors.month)}
            aria-describedby={showErr('month') && errors.month ? ids.errMonth : undefined}
            onChange={(e) => { setForm({ ...form, month: e.target.value }); setTouched((prev) => ({ ...prev, month: true })); }}
          >
            <option value="">{t('form.month')}</option>
            {MONTHS.map((mo) => <option key={mo} value={mo}>{`${mo}${t('form.month.suffix')}`}</option>)}
          </select>
          <label className="sr-only" htmlFor={ids.day}>{t('form.day')}</label>
          <select
            ref={dayRef}
            id={ids.day}
            name="day"
            className={`ziwei-field-select ziwei-field-select--compact${showErr('day') && errors.day ? ' is-error' : ''}`}
            value={form.day}
            aria-invalid={showErr('day') && Boolean(errors.day)}
            aria-describedby={showErr('day') && errors.day ? ids.errDay : undefined}
            onChange={(e) => { setForm({ ...form, day: e.target.value }); setTouched((prev) => ({ ...prev, day: true })); }}
          >
            <option value="">{t('form.day')}</option>
            {DAYS.map((dy) => <option key={dy} value={dy}>{`${dy}${t('form.day.suffix')}`}</option>)}
          </select>
          <label className="sr-only" htmlFor={ids.hour}>{t('form.hour.suffix')}</label>
          <select
            id={ids.hour}
            name="clockHour"
            className="ziwei-field-select ziwei-field-select--compact"
            value={form.clockHour}
            disabled={form.unknownTime}
            aria-disabled={form.unknownTime}
            onChange={(e) => setForm({ ...form, clockHour: e.target.value })}
          >
            {HOURS.map((h) => (
              <option key={h} value={h}>{h.padStart(2, '0')}{t('form.hour.suffix')}</option>
            ))}
          </select>
          <label className="sr-only" htmlFor={ids.minute}>{t('form.minute.suffix')}</label>
          <select
            id={ids.minute}
            name="clockMinute"
            className="ziwei-field-select ziwei-field-select--compact"
            value={form.clockMinute}
            disabled={form.unknownTime}
            aria-disabled={form.unknownTime}
            onChange={(e) => setForm({ ...form, clockMinute: e.target.value })}
          >
            {MINUTES.map((min) => (
              <option key={min} value={min}>{min.padStart(2, '0')}{t('form.minute.suffix')}</option>
            ))}
          </select>
        </div>
        {(showErr('year') && errors.year) && (
          <p id={ids.errYear} className="ziwei-field-error" role="alert">{errors.year}</p>
        )}
        {(showErr('month') && errors.month) && (
          <p id={ids.errMonth} className="ziwei-field-error" role="alert">{errors.month}</p>
        )}
        {(showErr('day') && errors.day) && (
          <p id={ids.errDay} className="ziwei-field-error" role="alert">{errors.day}</p>
        )}
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
      </fieldset>

      <div>
        <label className="ziwei-calc-field-label" htmlFor={ids.city}>
          {t('form.birth.place')}
        </label>
        <CitySearchInput
          value={birthplace}
          onChange={handleBirthplaceChange}
          inputId={ids.city}
          ariaLabel={t('form.birth.place')}
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
