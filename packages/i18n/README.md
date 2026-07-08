# @orasage/i18n

Shared locale foundation for the OraSage monorepo.

## Exports

- `CORE_LOCALES` / `EXTENDED_LOCALES` — T1 (4) and T2 (12) locale lists
- `normalizeLocale()` — BCP 47 normalization (`zh` → `zh-CN`, etc.)
- `detectLocale()` / `detectLocaleFromBrowser()` — cookie / query / Accept-Language priority
- `localeLabel()` — display names for language switchers
- `localeFromTarotLang()` / `tarotLangFromLocale()` — tarot short-code bridge

## Consumers

- `shared/shop-locale` — re-exports normalize/detect for shop currency
- `tarot` — `orasage-locale.ts` uses tarot lang bridge

Fortune apps (bazi/ziwei/tarot) keep their own UI dictionaries; this package unifies **locale detection and naming** only.
