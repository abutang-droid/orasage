import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'wouter';
import { loadCityCatalog, matchLocalCity, toCityCoords } from '@orasage/city';
import { CityProvider, CitySearchInput } from '@orasage/city/react';
import type { BirthplaceValue } from '@orasage/city';
import { calcSingleBazi, loadLunarLib, type SingleBaziResult } from '@/lib/bazi';
import { cityApi } from '@/lib/city-client';
import { initLuopan, type LuopanDialState } from './luopan/engine.js';
import { pickCityFromSpeech } from './luopan/speechPlace';
import { luopanToPersonInput } from './luopan/luopanPerson';
import { LuopanResult } from './luopan/LuopanResult';
import markup from './luopan/markup.html?raw';
import './luopan/luopan.css';

export default function LuopanPage() {
  const [, setLocation] = useLocation();
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ destroy: () => void; applyTranscript: (text: string) => void } | null>(null);
  const [citySlot, setCitySlot] = useState<HTMLElement | null>(null);
  const [errSlot, setErrSlot] = useState<HTMLElement | null>(null);
  const [place, setPlace] = useState<BirthplaceValue>({ city: '', country: '' });
  const placeRef = useRef(place);
  placeRef.current = place;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SingleBaziResult | null>(null);

  const onGo = useCallback(async (s: LuopanDialState) => {
    const city = placeRef.current;
    if (!city.city?.trim()) {
      setError('请先填写出生城市，用来校正真太阳时。');
      hostRef.current?.querySelector('#placeBox')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (!s.sex) {
      setError('请选择女或男。');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await loadLunarLib();
      let lng = city.lng;
      let lat = city.lat;
      let timezone = city.timezone || '+8';
      if (lng == null) {
        const catalog = await loadCityCatalog();
        const local = matchLocalCity(catalog, city.city);
        if (local) {
          const coords = toCityCoords(local);
          lng = coords.lng;
          lat = coords.lat;
          timezone = coords.timezone;
        }
      }
      const data = await calcSingleBazi(luopanToPersonInput(s, {
        ...city,
        ...(lng != null ? { lng, lat: lat ?? 0, timezone } : {}),
      }));
      setResult(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '排盘失败，请核对日期后再试。');
    } finally {
      setBusy(false);
    }
  }, []);

  const onTranscript = useCallback(async (text: string) => {
    try {
      const catalog = await loadCityCatalog();
      const hit = pickCityFromSpeech(text, catalog);
      if (!hit) return;
      const coords = toCityCoords(hit);
      setPlace({
        city: hit.city,
        country: hit.country,
        lng: coords.lng,
        lat: coords.lat,
        timezone: coords.timezone,
      });
      setError('');
    } catch (err) {
      console.warn('luopan speech city', err);
    }
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = markup;
    const back = host.querySelector('[data-luopan-back]');
    const onBackClick = (e: Event) => {
      e.preventDefault();
      setLocation('/');
    };
    back?.addEventListener('click', onBackClick);
    const api = initLuopan(host, { onGo, onTranscript });
    apiRef.current = api;
    setCitySlot(host.querySelector('#luopan-city-slot') as HTMLElement | null);
    setErrSlot(host.querySelector('#luopan-err-slot') as HTMLElement | null);
    return () => {
      back?.removeEventListener('click', onBackClick);
      api.destroy();
      apiRef.current = null;
      setCitySlot(null);
      setErrSlot(null);
    };
  }, [onGo, onTranscript, setLocation]);

  const messages = (
    <>
      {error ? <p className="luopan-err" role="alert">{error}</p> : null}
      {busy ? <p className="luopan-err">正在起盘…</p> : null}
    </>
  );

  return (
    <div className={`luopan-root${busy ? ' luopan-busy' : ''}`}>
      <div
        ref={hostRef}
        className="luopan-host"
        hidden={!!result}
        style={{ width: '100%', display: result ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center' }}
      />
      {citySlot
        ? createPortal(
            <CityProvider api={cityApi} locale="zh-CN">
              <CitySearchInput
              value={place}
              onChange={(v) => {
                setPlace(v);
                if (v.city) setError('');
              }}
              fieldClassName="luopan-city-field"
              dropdownClassName="luopan-city-dropdown"
              optionClassName="luopan-city-option"
            />
            </CityProvider>,
            citySlot,
          )
        : null}
      {errSlot ? createPortal(messages, errSlot) : messages}
      {result ? (
        <LuopanResult result={result} onBack={() => setResult(null)} />
      ) : (
        <p className="stage-foot">
          <Link href="/">返回经典填写页</Link>
          {'　·　'}
          八字罗盘 · 竹简命盘
        </p>
      )}
    </div>
  );
}
