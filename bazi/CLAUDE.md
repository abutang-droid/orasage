# CLAUDE.md

## 🤖 行为准则 (Behavioral Rules)
- 提交信息（Commit Message）必须使用中文。
- 修改代码之前，必须先列出【修改计划】（明确说明涉及文件及改动逻辑）供我确认，严禁直接修改或重写代码。
- 改动任何插件、第三方依赖或本地服务时，必须显式更新版本号。
- 每次完成任务，必须向我详细汇报改动结果与测试通过情况。
- 改动完成后推送到github

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: Orasage (八字排盘计算器)

A Bazi (Four Pillars of Destiny) calculator and AI-powered report generator. Brand: **Orasage** (Ora + Sage).

### Quick Commands

```bash
pnpm install            # Install dependencies
pnpm dev                # Start dev server (tsx watch)
pnpm build              # Build frontend + bundle server
pnpm test               # Run all vitest tests
pnpm test -- -t "name"  # Run a single test file
pnpm check              # TypeScript type check
pnpm format             # Prettier format
pnpm db:push            # Push Drizzle schema to database
```

### Architecture Overview


```
┌─────────────────────────────────────────────────┐
│  Client (React 19 + Tailwind 4)                  │
│  client/src/                                      │
│    pages/    ← Route-level pages (Home, History) │
│    components/ ← Reusable UI + BaziResult, Footer│
│    lib/bazi.ts ← CORE: all Bazi calculation logic│
│    lib/cityData.ts ← City search & coords        │
│    lib/lunarData.ts ← Lunar calendar lookup table│
│    App.tsx     ← Routes (/, /history)            │
│    index.css   ← OraSage design system tokens    │
├─────────────────────────────────────────────────┤
│  Server (Express 4 + tRPC 11)                    │
│  server/                                          │
│    routers.ts ← tRPC procedures (bazi + auth)    │
│    db.ts        ← Drizzle query helpers          │
│    _core/       ← Framework plumbing (auth, env, │
│                  llm, storage, cookies, trpc)    │
├─────────────────────────────────────────────────┤
│  Shared                                            │
│  drizzle/schema.ts ← DB tables (users,          │
│                      baziRecords, purchases,     │
│                      baziReports)                │
│  shared/types.ts ← Shared Zod/types             │
│  shared/const.ts ← Constants (COOKIE_NAME, etc.) │
└─────────────────────────────────────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `client/src/lib/bazi.ts` | **Core calculation engine** — pillars, five elements, strength analysis, favorable/unfavorable elements, shensha, daYun, daily fortune, double-bazi synastry, bracelet recommendations |
| `client/src/lib/lunarData.ts` | Lunar calendar lookup table (1900-2100), fetched from CDN by decade, with `getShiZhu` (hour pillar) calculation |
| `client/src/lib/cityData.ts` | City coordinate database (592 cities), search by Chinese name, pinyin, alias |
| `client/src/pages/Home.tsx` | Main page: input form, single/double mode, city search |
| `client/src/components/BaziResult.tsx` | Result display: single/double views, AI analysis panel, section collapse, daily fortune, bracelet rec |
| `server/routers.ts` | tRPC procedures: auth, bazi.analyze (LLM report), records CRUD, plan purchase |
| `server/db.ts` | Database helpers for baziRecords, purchases, baziReports |
| `drizzle/schema.ts` | Drizzle schema definitions |
| `client/src/index.css` | OraSage design system — color palette, fonts, component classes |

### Development Workflow

1. **Schema changes**: Edit `drizzle/schema.ts`, then `pnpm db:push`
2. **Database queries**: Add helpers in `server/db.ts`
3. **tRPC procedures**: Add/extend in `server/routers.ts`, then wire UI with `trpc.*.useQuery/useMutation`
4. **Frontend**: Create/update components in `client/src/`, register routes in `client/src/App.tsx`
5. **Tests**: Add specs in `server/*.test.ts`, run `pnpm test`

### Design System: OraSage

- **Colors**: Lavender Mist background (#F7F4FA), Brand Gold (#D9A441), Ink Purple headings (#2E295B), Body Purple Gray (#5D5973)
- **Fonts**: Noto Serif SC for headings, Noto Sans SC for body
- **Pattern**: Light theme, white cards, gold accents, soft shadows
- All CSS variables in `client/src/index.css` — use `var(--gold)`, `var(--heading)`, etc.

### Critical Rules

- **tRPC-first**: Use `trpc.*.useQuery/useMutation` for all backend calls — no Axios/fetch wrappers
- **Auth**: Use `useAuth()` hook, never manipulate cookies manually
- **Images/media**: Never store locally in `client/public/` — upload via `manus-upload-file` CLI and use returned `/manus-storage/` paths
- **Datetime**: Store UTC Unix timestamps in DB; convert to local timezone only for display
- **Error handling**: tRPC surfaces typed errors — use `isLoading`, empty states, toast notifications
