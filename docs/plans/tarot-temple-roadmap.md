# 塔罗祈福改版路线图

> 确认日期：**2026-07-06**（2026-07-06 二次更新：jsVectorMap + 列表选路）  
> 产品依据：`tarot/MANTO_PRODUCT.md` §B、§C；OraSage 浅色主题

## 已确认决策

| # | 决策 |
|---|------|
| 1 | 地理第一层 = **大洲**（非省/州） |
| 2 | 地图 = **jsVectorMap**（`world_merc`）作氛围背景；**交互选路以列表为主**（大洲/国家/信仰/守护神） |
| 3 | 国家 = **GPS → IP → 手动列表**；自动检测后需用户确认 |
| 4 | 圣地宗教 = **CMS 字段驱动** + seed 常见案例 |
| 5 | 朝拜朝向 = **视觉象征**（`FacingIndicator`，无定位不阻塞） |
| 6 | 乐捐支付 = **mock 先上**（与现网一致） |
| 7 | 乐捐功德归入 **`meritOffer` / offer 路** |
| 8 | 随机倍数 = **`[10, 100]` 闭区间整数** |
| 9 | **Onboarding 与 /temple 同步**改地理旅程（Onboarding 不选守护神） |
| 10 | **P0 去分享** 优先合入 |

## 分期

### P0 — 去分享（✅ 已合 main #140）

### P1 — CMS 地理→信仰（✅ 已合 main）

- `geo-regions` / `geo-countries` / `country-faiths` 集合
- seed：`shared/tarot-geo-seed.ts` + `npm run seed:tarot-geo`
- tarot API：`/api/geo/regions`、`/api/geo/countries`、`/api/geo/suggest-country`
- `GET /api/faiths?country=BR` 按国家主流排序

### P2 — 地理旅程 UI + Onboarding（✅ 已合 main，`0efb04e`–`6a05630`）

- **jsVectorMap** 世界地图（`JourneyVectorMap.tsx`），卸载时 `map.destroy()`
- GPS（BigDataCloud 反查）→ IP 建议 → 内联大洲/国家列表
- 自动检测国家后展示确认卡（「正确，继续」/「不是，手动选择」）
- 信仰：**内联 `FaithPicker`**（按国家排序，无地图信仰标记）
- 守护神（仅 `/temple`）：内联推荐网格，`pickDeity={true}`
- 用户表 `countryCode` / `continentCode`（Prisma + onboarding API）
- Onboarding 共用 `GeoJourneyPicker`，`pickDeity={false}`

### P3 — 朝拜体验 + 圣地朝向（🟡 部分完成）

| 项 | 状态 |
|----|------|
| `sanctuaries` / `faiths` 朝向字段 + `facing.ts` | ✅ |
| `WorshipScreen` 按住参拜 + `FacingIndicator` | ✅ |
| 整块触摸区（神像 stage 可按住） | ✅ 基本实现 |
| MANTO 级粒子/曼陀罗/音效/断点续拜 | ❌ 见 `HANDOFF-tarot.md` §八 P3 差距 |

### P4 — 功德体系对齐 + 说明页（🟡 部分完成）

| 项 | 状态 |
|----|------|
| 时间/供养路规则与 `merit.ts` | ✅ |
| `/profile/merit` 规则说明 UI | ✅ |
| 传播路 | ⏸ `MERIT_SHARE_PATH_ENABLED=false`（P0 决策） |
| 神圣日 ×2 | ✅ `sacredDayMultiplier()` |
| 阶位特权（免费占卜等） | 🟡 常量已定义，部分未全链路启用 |

### P5 — 乐捐 + 消费供养（✅ 基本完成）

- 祈福内乐捐 $0.01–$1（mock checkout，`temple-donation` SKU）
- 功德 = `amount_usd × randomInt(10, 100)` → `meritOffer`
- `shared/tarot-merit/donation.ts` 跨 shop/tarot 共享
- 消费功德 SKU 映射见 `resolveTarotOfferKind`

## 依赖关系

```
P0 → 可独立合 main
P1 → P2、P3 前置
P2 → P3（朝拜需完整选路上下文）✅ 已满足
P4 可与 P1 并行（传播路已暂停）
P5 依赖 shop checkout ✅ mock 已通
```

## 关键文件

| 功能 | 路径 |
|------|------|
| 地理旅程 | `tarot/src/components/geo/GeoJourneyPicker.tsx` |
| 矢量地图 | `tarot/src/components/geo/JourneyVectorMap.tsx` |
| 国家检测 | `tarot/src/lib/geo/detect-country.ts`、`use-country-suggestion.ts` |
| 信仰选择 | `tarot/src/components/FaithPicker.tsx` |
| 朝拜 | `tarot/src/components/temple/WorshipScreen.tsx` |
| 乐捐 | `tarot/src/components/temple/TempleDonation.tsx` |
| 守护神图 | `tarot/public/gods/`、`tarot/scripts/import-deity-images.mjs` |
