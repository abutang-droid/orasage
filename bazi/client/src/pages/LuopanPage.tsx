import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { loadCityCatalog, matchLocalCity, toCityCoords } from '@orasage/city';
import { CityProvider, CitySearchInput } from '@orasage/city/react';
import type { BirthplaceValue } from '@orasage/city';
import { calcSingleBazi, loadLunarLib } from '@/lib/bazi';
import { cityApi } from '@/lib/city-client';
import { saveCheckoutSnapshot } from '@/lib/checkout-session';
import { trpc } from '@/lib/trpc';
import { BaziEntryChrome } from '@/components/BaziEntryChrome';
import { initLuopan, type LuopanDialState, type LuopanVoicePayload } from './luopan/engine.js';
import { pickCityFromSpeech } from './luopan/speechPlace';
import { parseLuopanSpeech, type LuopanSpeechFields } from './luopan/speechParse';
import markup from './luopan/markup.html?raw';
import './luopan/luopan.css';

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function classicRestorePath(): string {
  const params = new URLSearchParams(window.location.search);
  params.set('restore', '1');
  const q = params.toString();
  return q ? `/classic?${q}` : '/classic?restore=1';
}

export default function LuopanPage() {
  const [, setLocation] = useLocation();
  const hostRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ destroy: () => void; applyTranscript: (text: string) => void } | null>(null);
  const [citySlot, setCitySlot] = useState<HTMLElement | null>(null);
  const [nameSlot, setNameSlot] = useState<HTMLElement | null>(null);
  const [errSlot, setErrSlot] = useState<HTMLElement | null>(null);
  const [place, setPlace] = useState<BirthplaceValue>({ city: '', country: '' });
  const placeRef = useRef(place);
  placeRef.current = place;
  const [personName, setPersonName] = useState('');
  const nameRef = useRef(personName);
  nameRef.current = personName;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const capsQuery = trpc.bazi.voiceCapabilities.useQuery(undefined, { staleTime: 60_000 });
  const voiceMut = trpc.bazi.luopanVoice.useMutation();
  const preferAudioRef = useRef(false);
  preferAudioRef.current = Boolean(capsQuery.data?.stt);
  const mutateVoiceRef = useRef(voiceMut.mutateAsync);
  mutateVoiceRef.current = voiceMut.mutateAsync;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') === '1' || params.get('restore') === '1') {
      setLocation(classicRestorePath());
    }
  }, [setLocation]);

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
      const isLunar = s.calendar === 'lunar';
      const data = await calcSingleBazi({
        name: nameRef.current.trim() || '访客',
        gender: s.sex === '女' ? 'female' : 'male',
        year: isLunar ? s.lunarYear : s.y,
        month: isLunar ? s.lunarMonth : s.m,
        day: isLunar ? s.lunarDay : s.d,
        hour: s.hh,
        minute: s.mi,
        calendar: isLunar ? 'lunar' : 'gregorian',
        ...(isLunar && s.lunarLeap ? { isLeapMonth: true } : {}),
        birthplace: city.city,
        cityName: city.city,
        ...(lng != null ? { lng, lat: lat ?? 0, timezone } : {}),
      });
      saveCheckoutSnapshot({ type: 'single', data }, 'single');
      setLocation(classicRestorePath());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '排盘失败，请核对日期后再试。');
    } finally {
      setBusy(false);
    }
  }, [setLocation]);

  const applyPlaceAndName = useCallback(async (fields: LuopanSpeechFields, transcript: string) => {
    if (fields.name) setPersonName(fields.name);
    try {
      const catalog = await loadCityCatalog();
      let hit = fields.city ? matchLocalCity(catalog, fields.city) : null;
      if (!hit && fields.city) hit = pickCityFromSpeech(fields.city, catalog);
      if (!hit) hit = pickCityFromSpeech(transcript, catalog);
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

  const onTranscript = useCallback(async (text: string) => {
    if (placeRef.current.city?.trim()) return;
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

  const onVoice = useCallback(async ({ transcript, audio }: LuopanVoicePayload) => {
    const t = (transcript || '').trim();
    let audioBase64: string | undefined;
    if (audio && preferAudioRef.current && audio.size >= 800 && audio.size < 900_000) {
      try {
        audioBase64 = await blobToBase64(audio);
      } catch (err) {
        console.warn('luopan audio encode', err);
      }
    }
    try {
      const res = await mutateVoiceRef.current({
        ...(t ? { transcript: t } : {}),
        ...(audioBase64 ? { audioBase64, mimeType: audio?.type || 'audio/webm' } : {}),
      });
      await applyPlaceAndName(res.fields, res.transcript || t);
      return res.fields;
    } catch (err) {
      console.warn('luopan voice api', err);
      if (!t) return null;
      const fields = parseLuopanSpeech(t);
      await applyPlaceAndName(fields, t);
      return fields;
    }
  }, [applyPlaceAndName]);

  const onGoRef = useRef(onGo);
  onGoRef.current = onGo;
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;
  const onVoiceRef = useRef(onVoice);
  onVoiceRef.current = onVoice;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = markup;
    const api = initLuopan(host, {
      onGo: (s) => { void onGoRef.current(s); },
      onTranscript: (text) => { void onTranscriptRef.current(text); },
      onVoice: (payload) => onVoiceRef.current(payload),
      preferAudio: () => preferAudioRef.current,
    });
    apiRef.current = api;
    setNameSlot(host.querySelector('#luopan-name-slot') as HTMLElement | null);
    setCitySlot(host.querySelector('#luopan-city-slot') as HTMLElement | null);
    setErrSlot(host.querySelector('#luopan-err-slot') as HTMLElement | null);
    return () => {
      api.destroy();
      apiRef.current = null;
      setNameSlot(null);
      setCitySlot(null);
      setErrSlot(null);
    };
  }, []);

  const messages = (
    <>
      {error ? <p className="luopan-err" role="alert">{error}</p> : null}
      {busy ? <p className="luopan-err">正在起盘…</p> : null}
    </>
  );

  return (
    <div className={`luopan-root${busy ? ' luopan-busy' : ''}`}>
      <BaziEntryChrome active="luopan" />
      <div
        ref={hostRef}
        className="luopan-host"
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      />
      {nameSlot
        ? createPortal(
            <input
              id="luopan-name"
              type="text"
              className="luopan-name-field"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="请输入姓名"
              autoComplete="name"
              maxLength={32}
              aria-label="姓名"
            />,
            nameSlot,
          )
        : null}
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
    </div>
  );
}
