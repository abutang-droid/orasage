# @orasage/i18n

Shared i18n foundation for the OraSage monorepo — the **single dictionary
mechanism** for all apps (platform roadmap §3, design system §10).

## Exports

### `.` (core, framework-agnostic)

- `CORE_LOCALES` / `EXTENDED_LOCALES` — T1 (4) and T2 (12) locale lists
- `normalizeLocale()` / `toCoreLocale()` — BCP 47 normalization + T1 mapping
- `detectLocale()` / `detectLocaleFromBrowser()` — `?lang` → cookie → Accept-Language
- `LOCALE_COOKIE` / `setLocaleCookie()` / `cookieDomain()` — cross-subdomain cookie contract
- `LOCALE_LABELS` / `localeLabel()` — display names for language switchers
- `createTranslator()` / `formatMessage()` — message runtime (`{param}` interpolation)
- `localeFromTarotLang()` / `tarotLangFromLocale()` — tarot short-code bridge

### `./react`

- `I18nProvider` — unified provider: detects locale on mount, switches in place
  (no reload), persists the shared cookie, syncs `?lang`, resolves static or
  lazy per-locale dictionaries
- `useI18n()` / `useT()` — locale + translate hooks

## Consumers

| App | How |
|-----|-----|
| bazi / ziwei / tarot | `I18nProvider` + thin app adapter (`lib/i18n`); dictionaries stay app-local |
| main | next-intl; locale list / labels / default sourced from this package (`main/src/i18n/routing.ts`) |
| shop | next-intl; detection via `shared/shop-locale` → this package |
| auth-service | server-side `detectLocale` / `toCoreLocale` / `EXTENDED_LOCALES` |
| shared/app-shell | `locale-cookie.ts` re-exports the cookie contract + labels from here |

Dictionary **content** stays in each app (`bazi/client/src/lib/i18n/`,
`ziwei/lib/i18n/`, `tarot/src/lib/i18n/`, `main/messages/`, `shop/messages/`);
this package owns locale naming, detection, persistence and the runtime.
