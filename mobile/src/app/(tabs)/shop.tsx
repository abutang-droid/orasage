import React from 'react';
import { WebScreen } from '../../components/web-screen';
import { ORASAGE_URLS } from '../../lib/urls';

/** 商城 — 原生结算落地前先以站内 WebView 接入 shop.orasage.com */
export default function ShopScreen() {
  return <WebScreen url={ORASAGE_URLS.shop} />;
}
