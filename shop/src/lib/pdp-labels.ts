import type { PdpContentLabels } from '@/lib/pdp-content';

type Translator = {
  (key: string): string;
  raw?: (key: string) => unknown;
};

function rawString(t: Translator, key: string, fallback: string): string {
  const value = t.raw?.(key);
  return typeof value === 'string' ? value : fallback;
}

/** Build PDP content labels from next-intl `pdp` namespace. */
export function pdpContentLabelsFromT(t: Translator): PdpContentLabels {
  const materialsRaw = (t.raw?.('materials') ?? {}) as Record<string, string>;
  return {
    energyDetails: t('accordion.energyDetails'),
    productDetails: t('accordion.productDetails'),
    reportDetails: t('accordion.reportDetails'),
    serviceDetails: t('accordion.serviceDetails'),
    spiritualStory: t('accordion.spiritualStory'),
    deepReading: t('accordion.deepReading'),
    moreAbout: t('accordion.moreAbout'),
    pairingGuide: t('accordion.pairingGuide'),
    upgradePath: t('accordion.upgradePath'),
    wearGuide: t('accordion.wearGuide'),
    wearGuidePairing: t('accordion.wearGuidePairing'),
    upgradeGuide: t('accordion.upgradeGuide'),
    specs: t('accordion.specs'),
    faq: t('accordion.faq'),
    related: t('accordion.related'),
    materials: materialsRaw,
    // Use raw templates — next-intl rejects t() without ICU values for {element}/{material}.
    eyebrowElement: rawString(t, 'eyebrowElement', 'Element · {element} · {material}'),
    eyebrowMaterial: rawString(t, 'eyebrowMaterial', '{material}'),
    reportBazi: t('reportBazi'),
    reportZiwei: t('reportZiwei'),
    reportTarot: t('reportTarot'),
    serviceConsult: t('serviceConsult'),
    ziweiChatPack: t('ziweiChatPack'),
    ziweiChatYearly: t('ziweiChatYearly'),
    templeDonation: t('templeDonation'),
  };
}
