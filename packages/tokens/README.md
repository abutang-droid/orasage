# @orasage/tokens

Design token package for OraSage apps and `@orasage/ui`.

## Authority vs package copy

| Path | Role |
|------|------|
| `shared/design-tokens/orasage-tokens.css` | **Runtime authority** — edit here |
| `packages/tokens/src/orasage-tokens.css` | **Generated copy** for npm workspace / `@orasage/ui` |

Apps that `@import` the shared path directly (main, shop, bazi, …) read the authority file.  
`@orasage/ui` styles import the package copy — keep both aligned with sync.

## Commands (repo root)

```bash
# After editing shared/design-tokens/orasage-tokens.css
npm run tokens:sync

# CI / pre-commit: fail if package copy is stale
npm run tokens:check
```

## Exports

- `@orasage/tokens` — TS helpers (`OrasageControlSize`, `ORASAGE_COLORS`)
- `@orasage/tokens/css` — CSS variables
- `@orasage/tokens/tailwind-preset` — Tailwind v3 preset

Spec baseline: `docs/design-system/ui-phase-1.md` and brand token v1.1.
