# OraSage UI Design System Phase 1

## Token Source

Runtime tokens live in:

```text
shared/design-tokens/orasage-tokens.css
```

The values are mapped from:

```text
../docs/design-system/tokens/OraSage_Brand_Design_Tokens_v1.1.md
```

The requested `docs/design/OraSage_Brand_Design_Tokens_v1.1.md` path was not present in `code/`; the matching v1.1 file was found in the project-level design-system token directory.

## Mapping Summary

| Runtime semantic | OraSage v1.1 source |
|---|---|
| `--primary` | Jade primary CTA, from `color.jade.500` / dark `color.jade.400` |
| `--accent` | Brass editorial accent |
| `--destructive` | `color.status.error` |
| `--background` | Paper mode `color.ivory.50`; dark mode `color.ink.950` |
| `--card` / `--popover` | Paper surfaces; dark mode ink surfaces |
| `--ring` | Jade in light mode; brass in dark mode |
| `--orasage-brand-purple` | Violet semantic for tarot, intuition, selected and special report nodes |

## Legacy Compatibility

The following legacy variables remain as aliases and should be migrated gradually:

```text
--orasage-background
--orasage-surface
--orasage-primary
--orasage-secondary
--orasage-muted
--orasage-border
--orasage-border-subtle
--orasage-gold
--orasage-gold-light
--orasage-gold-pale
--orasage-gold-border
--orasage-purple
--orasage-font-sans
--orasage-font-serif
--orasage-radius-sm
--orasage-radius-md
--orasage-radius-lg
--orasage-control-h-sm
--orasage-control-h-md
--orasage-control-h-lg
```

Tailwind also keeps the legacy `sage.*` namespace so current pages do not need immediate migration.

## First Components

The first shadcn/Radix source components are available under:

```text
main/src/components/ui
```

Included: button, input, label, textarea, select, checkbox, radio-group, switch, card, badge, separator, dialog, dropdown-menu, tooltip, tabs, alert, skeleton.

## Preview

Development preview route:

```text
/{locale}/ui-preview
```

Example:

```text
/zh-CN/ui-preview
```
