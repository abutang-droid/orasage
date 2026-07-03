# @orasage/ui

Shared OraSage UI primitives built on **Tailwind CSS** + **shadcn/ui** (Radix + CVA).

## Rules

1. **Only three control sizes:** `sm` (36px), `md` (44px, default), `lg` (48px)
2. Pages choose size via `size="sm|md|lg"` — do not override height, radius, font, border, or focus styles
3. **Tailwind tokens** from `@orasage/tokens` define colors, spacing, radii, and states
4. **shadcn/Radix** provide accessibility and interaction; OraSage tokens define appearance
5. **Pages handle layout**; components handle look and interaction

## Packages

| Package | Role |
|---------|------|
| `@orasage/tokens` | CSS variables + Tailwind preset |
| `@orasage/ui` | React components + static CSS for auth |

## React usage (Next / Vite apps)

```tsx
import { Button, Input, FormField } from '@orasage/ui';
import '@orasage/ui/styles';

<Button size="md">登录</Button>
<Input size="md" placeholder="邮箱" />
```

### Tailwind content path

```ts
// tailwind.config.ts
import { orasageTailwindPreset } from '@orasage/ui/tailwind-preset';

export default {
  presets: [orasageTailwindPreset],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@orasage/ui/src/**/*.{ts,tsx}',
  ],
};
```

## Static HTML (auth-service pilot)

```html
<link rel="stylesheet" href="/assets/orasage-ui.css" />
<button type="submit" class="oui-btn oui-btn--default" data-size="md">登录</button>
<input class="oui-input" data-size="md" name="email" />
```

Build/sync: `cp packages/ui/src/styles/components.css auth-service/public/assets/orasage-ui.css`

## Migration order

1. **auth-service** — static CSS layer (`oui-*` classes)
2. **main** + **shop** — React components (Tailwind v3)
3. **admin** — React or CSS layer
4. **bazi** — replace local shadcn with `@orasage/ui` re-exports
5. **ziwei** + **tarot** — replace `.btn-primary` / `.input-field`
6. **cms** — admin forms when needed
