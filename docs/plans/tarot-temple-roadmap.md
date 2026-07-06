# 塔罗祈福改版路线图

> 确认日期：**2026-07-06**  
> 产品依据：`tarot/MANTO_PRODUCT.md` §B、§C；OraSage 浅色主题

## 已确认决策

| # | 决策 |
|---|------|
| 1 | 地理第一层 = **大洲**（非省/州） |
| 2 | 地图 = **简化 SVG** + CMS 热点坐标 |
| 3 | 国家 = **IP 预填 + 手选可改** |
| 4 | 圣地宗教 = **CMS 字段驱动** + seed 常见案例 |
| 5 | 朝拜朝向 = **视觉象征**（无定位不阻塞） |
| 6 | 乐捐支付 = **mock 先上**（与现网一致） |
| 7 | 乐捐功德归入 **`meritOffer` / offer 路** |
| 8 | 随机倍数 = **`[10, 100]` 闭区间整数** |
| 9 | **Onboarding 与 /temple 同步**改地图选路 |
| 10 | **P0 去分享** 优先合入 |

## 分期

### P0 — 去分享（✅ 已合 main #140）

### P1 — CMS 地理→信仰（✅ 本 PR）

- `geo-regions` / `geo-countries` / `country-faiths` 集合
- seed：`shared/tarot-geo-seed.ts` + `npm run seed:tarot-geo`
- tarot API：`/api/geo/regions`、`/api/geo/countries`、`/api/geo/suggest-country`
- `GET /api/faiths?country=BR` 按国家主流排序

### P2 — 地图选路 UI + Onboarding

- 世界地图 SVG → 大洲 → 国家 → 信仰 → 守护神
- 用户表增加 `countryCode`（及可选 `continentCode`）
- IP 预填国家（可改）

### P3 — 朝拜体验 + 圣地朝向

- `sanctuaries` / `faiths` 扩展朝向字段
- 朝拜页整块触摸区、浅色神圣视觉
- 有圣地概念的信仰显示面向方向

### P4 — 功德体系对齐 + 说明页

- `merit.ts` 规则与 `MANTO_PRODUCT.md` §C2 对齐（无传播路）
- 功德说明 + 阶位权限说明 UI

### P5 — 乐捐 + 消费供养

- 祈福内乐捐 $0.01–$1（mock checkout）
- 功德 = `amount_usd × randomInt(10, 100)`
- 说明文案：体系维护与软硬件投入
- 消费功德 SKU 映射对齐文档

## 依赖关系

```
P0 → 可独立合 main
P1 → P2、P3 前置
P2 → P3（朝拜需完整选路上下文）
P4 可与 P1 并行
P5 依赖 shop checkout，可与 P4 并行
```
