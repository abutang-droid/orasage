'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  SHIPPING_CONTINENTS,
  continentForCountry,
  countriesForContinent,
  shippingContinentLabel,
  shippingCountryLabel,
  type ShippingContinentCode,
} from '../../../shared/shop-fulfillment/index';

export type AddressLocationValue = {
  countryCode?: string;
  province?: string;
  city?: string;
  district?: string;
};

type Props = {
  value: AddressLocationValue;
  onChange: (patch: AddressLocationValue) => void;
  required?: boolean;
};

type RegionsResponse = {
  items?: string[];
  manual?: boolean;
  suggestion?: string;
};

const MANUAL_VALUE = '__manual__';

export function AddressLocationFields({ value, onChange, required = true }: Props) {
  const t = useTranslations('shipping');
  const locale = useLocale();
  const [continent, setContinent] = useState<ShippingContinentCode | ''>(() =>
    continentForCountry(value.countryCode) ?? '',
  );
  const [provinces, setProvinces] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [provinceManual, setProvinceManual] = useState(false);
  const [cityManual, setCityManual] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const countryOptions = useMemo(
    () => countriesForContinent(continent || null),
    [continent],
  );

  // Sync continent when value.countryCode set externally (address book)
  useEffect(() => {
    const next = continentForCountry(value.countryCode);
    if (next && next !== continent) setContinent(next);
  }, [value.countryCode]); // eslint-disable-line react-hooks/exhaustive-deps -- only follow country

  // Load provinces after country selected
  useEffect(() => {
    const code = value.countryCode?.trim().toUpperCase();
    if (!code) {
      setProvinces([]);
      setProvinceManual(false);
      setHint(null);
      return;
    }
    let cancelled = false;
    setLoadingProvinces(true);
    setHint(null);
    void fetch(`/api/shipping/regions?country=${encodeURIComponent(code)}&locale=${encodeURIComponent(locale)}`, {
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: RegionsResponse | null) => {
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data!.items! : [];
        setProvinces(items);
        const needManual = Boolean(data?.manual) || items.length === 0;
        setProvinceManual(needManual);
        if (needManual && data?.suggestion) setHint(data.suggestion);
        // If current province not in list, keep value but switch to manual select mode
        if (
          value.province
          && items.length > 0
          && !items.includes(value.province)
        ) {
          setProvinceManual(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setProvinces([]);
        setProvinceManual(true);
        setHint(t('regionsLoadFailed'));
      })
      .finally(() => {
        if (!cancelled) setLoadingProvinces(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on country/locale only
  }, [value.countryCode, locale]);

  // Load cities after province selected (skip when province is free-text-only empty)
  useEffect(() => {
    const code = value.countryCode?.trim().toUpperCase();
    const province = value.province?.trim();
    if (!code || !province) {
      setCities([]);
      setCityManual(false);
      return;
    }
    let cancelled = false;
    setLoadingCities(true);
    const qs = new URLSearchParams({
      country: code,
      province,
      locale,
    });
    void fetch(`/api/shipping/regions?${qs}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: RegionsResponse | null) => {
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data!.items! : [];
        setCities(items);
        const needManual = Boolean(data?.manual) || items.length === 0;
        setCityManual(needManual);
        if (
          value.city
          && items.length > 0
          && !items.includes(value.city)
        ) {
          setCityManual(true);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCities([]);
        setCityManual(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingCities(false);
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on country/province/locale
  }, [value.countryCode, value.province, locale]);

  function onContinentChange(next: string) {
    const code = next as ShippingContinentCode | '';
    setContinent(code);
    setProvinces([]);
    setCities([]);
    setProvinceManual(false);
    setCityManual(false);
    setHint(null);
    onChange({
      countryCode: '',
      province: '',
      city: '',
      district: '',
    });
  }

  function onCountryChange(next: string) {
    setProvinces([]);
    setCities([]);
    setProvinceManual(false);
    setCityManual(false);
    setHint(null);
    onChange({
      countryCode: next,
      province: '',
      city: '',
      district: '',
    });
  }

  function onProvinceSelect(next: string) {
    if (next === MANUAL_VALUE) {
      setProvinceManual(true);
      onChange({ province: '', city: '', district: '' });
      return;
    }
    setProvinceManual(false);
    setCities([]);
    setCityManual(false);
    onChange({ province: next, city: '', district: '' });
  }

  function onCitySelect(next: string) {
    if (next === MANUAL_VALUE) {
      setCityManual(true);
      onChange({ city: '', district: '' });
      return;
    }
    setCityManual(false);
    onChange({ city: next, district: '' });
  }

  const showProvinceSelect = !provinceManual && provinces.length > 0;
  const showCitySelect = !cityManual && cities.length > 0 && Boolean(value.province?.trim());

  return (
    <>
      <label className="shop-shipping-label">
        {t('continent')}
        <select
          className="shop-shipping-input"
          value={continent}
          onChange={(e) => onContinentChange(e.target.value)}
          required={required}
        >
          <option value="">{t('selectContinent')}</option>
          {SHIPPING_CONTINENTS.map((c) => (
            <option key={c.code} value={c.code}>
              {shippingContinentLabel(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="shop-shipping-label">
        {t('country')}
        <select
          className="shop-shipping-input"
          value={value.countryCode ?? ''}
          onChange={(e) => onCountryChange(e.target.value)}
          required={required}
          disabled={!continent}
        >
          <option value="">{t('selectCountry')}</option>
          {countryOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {shippingCountryLabel(c, locale)}
            </option>
          ))}
        </select>
      </label>

      <label className="shop-shipping-label">
        {t('province')}
        {loadingProvinces ? (
          <p className="shop-shipping-hint">{t('loadingRegions')}</p>
        ) : null}
        {showProvinceSelect ? (
          <select
            className="shop-shipping-input"
            value={
              value.province && provinces.includes(value.province)
                ? value.province
                : ''
            }
            onChange={(e) => onProvinceSelect(e.target.value)}
          >
            <option value="">{t('selectProvince')}</option>
            {provinces.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
            <option value={MANUAL_VALUE}>{t('enterManually')}</option>
          </select>
        ) : (
          <input
            type="text"
            className="shop-shipping-input"
            value={value.province ?? ''}
            onChange={(e) => onChange({ province: e.target.value, city: '', district: '' })}
            autoComplete="address-level1"
            placeholder={t('provinceManualPlaceholder')}
            disabled={!value.countryCode}
          />
        )}
        {provinceManual && provinces.length > 0 ? (
          <button
            type="button"
            className="shop-shipping-linkish"
            onClick={() => setProvinceManual(false)}
          >
            {t('useList')}
          </button>
        ) : null}
      </label>

      <label className="shop-shipping-label">
        {t('city')}
        {loadingCities ? (
          <p className="shop-shipping-hint">{t('loadingCities')}</p>
        ) : null}
        {showCitySelect ? (
          <select
            className="shop-shipping-input"
            value={
              value.city && cities.includes(value.city)
                ? value.city
                : ''
            }
            onChange={(e) => onCitySelect(e.target.value)}
          >
            <option value="">{t('selectCity')}</option>
            {cities.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
            <option value={MANUAL_VALUE}>{t('enterManually')}</option>
          </select>
        ) : (
          <input
            type="text"
            className="shop-shipping-input"
            value={value.city ?? ''}
            onChange={(e) => onChange({ city: e.target.value, district: '' })}
            autoComplete="address-level2"
            placeholder={t('cityManualPlaceholder')}
            disabled={!value.countryCode}
          />
        )}
        {cityManual && cities.length > 0 ? (
          <button
            type="button"
            className="shop-shipping-linkish"
            onClick={() => setCityManual(false)}
          >
            {t('useList')}
          </button>
        ) : null}
      </label>

      {hint ? <p className="shop-shipping-hint">{hint}</p> : null}
    </>
  );
}
