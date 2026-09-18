import React from 'react';
import { WebScreen } from '../../components/web-screen';
import { ORASAGE_URLS } from '../../lib/urls';

/** 祈福 — 线上殿堂位于 tarot.orasage.com/temple（与全站底栏第 3 键一致） */
export default function TempleScreen() {
  return <WebScreen url={ORASAGE_URLS.temple} />;
}
