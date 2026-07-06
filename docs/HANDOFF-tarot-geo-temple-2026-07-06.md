# Agent 交接备忘录 — 塔罗地理旅程 / 祈福改版（2026-07-06）

> 写给下一任 Cloud Agent / 开发者。  
> 覆盖本轮主线：**jsVectorMap 地理选路 → GPS/IP 国家确认 → 列表选信仰/守护神 → 乐捐定价 → 守护神正式图 → 文档审计**。  
> 塔罗区长期背景见 [`HANDOFF-tarot.md`](./HANDOFF-tarot.md)。  
> 路线图见 [`plans/tarot-temple-roadmap.md`](./plans/tarot-temple-roadmap.md)。  
> 产品规格见 [`tarot/MANTO_PRODUCT.md`](../tarot/MANTO_PRODUCT.md)。

---

## 1. 做了什么（一句话）

在 `main` @ **`6a05630`**（生产已部署）上，将祈福/onboarding 的地理选路从「简化 SVG + 地图热点」升级为 **jsVectorMap 氛围地图 + GPS/IP 国家确认 + 内联列表选大洲/国家/信仰/守护神**；同步修复乐捐结账金额、替换 21 位守护神占位图，并完成文档与差距审计（PR **#178** 待合）。

---

## 2. 合入 main 的变更

| PR / commit | 主题 | 要点 |
|-------------|------|------|
| **#175** | 乐捐定价 | `quantity = 捐赠金额（分）`，目录单价 ¥0.01；`shared/tarot-merit/donation.ts` |
| **#176** | 守护神正式图 | 21 张 Wikimedia → `tarot/public/gods/*.webp`；移除 SVG 占位 |
| **`0efb04e`** | jsVectorMap | 安装 `jsvectormap@1.7.0`；`JourneyVectorMap.tsx` 替换 `WorldMapSvg` |
| **`85c621a`** | 国家确认 | GPS（BigDataCloud 反查）→ IP → 内联列表；检测后需用户确认 |
| **`6a05630`** | 信仰/守护神列表 | 移除地图信仰标记；`FaithPicker` + 守护神网格；修复 CMS 图 URL |
| **#178**（待合） | 文档审计 | roadmap/HANDOFF 同步、Onboarding 文案、`incoming/` 清理 |

**合并方式说明：** geo 相关分支（`cursor/jsvectormap-geo-journey-f1bd` 等）部分经本地 fast-forward 合入 `main`，未全部走独立 GitHub PR。远程 `origin/cursor/geo-*` 分支可清理。

---

## 3. 用户流程（现网行为）

### 3.1 地理旅程（`/temple` 与 `/onboarding` 共用）

```
进入 GeoJourneyPicker
    │
    ├─ GPS 可用 → 反查国家 → 确认卡「正确，继续 / 不是，手动选择」
    ├─ GPS 不可用 → IP 建议 → 同上
    └─ 均不可用 → 直接展示内联大洲 + 国家列表
    │
    ▼
国家确定后 → 内联 FaithPicker（按国家 CMS 排序，自定义信仰在首格）
    │
    ├─ /onboarding（pickDeity=false）→ 点选信仰即完成引导
    └─ /temple（pickDeity=true）→ 守护神推荐网格 → 点选守护神
    │
    ▼
地图（jsVectorMap）全程作氛围背景，不作为主要交互入口
```

### 3.2 祈福完整路径

```
/temple
  → journey（地理旅程，若无信仰/国家）
  → home（TempleHome，已有守护神）
  → worship（WorshipScreen 按住参拜）
  → blessing（BlessingScreen + 乐捐）
  → /daily-fortune（「去抽今日运势」）
```

### 3.3 乐捐结账

- SKU：`temple-donation`
- 用户选 ¥0.50 → checkout `quantity=50`，单价 ¥0.01 → 总额 ¥0.50
- 功德：`amount_usd × randomInt(10, 100)` → 计入 `meritOffer`
- 支付模式：默认 `mock`（与全站一致）

---

## 4. 关键代码与文件

### 4.1 地理旅程

| 职责 | 路径 |
|------|------|
| 主容器 | `tarot/src/components/geo/GeoJourneyPicker.tsx` |
| 矢量地图 | `tarot/src/components/geo/JourneyVectorMap.tsx` |
| 样式 | `tarot/src/components/geo/geo-journey.css`（`--jvm-*` 变量） |
| GPS 反查 | `tarot/src/lib/geo/detect-country.ts` |
| 检测 hook | `tarot/src/lib/geo/use-country-suggestion.ts` |
| 类型/本地存储 | `tarot/src/lib/geo/types.ts` |
| 地理 API | `tarot/src/app/api/geo/{regions,countries,suggest-country}/route.ts` |
| 地理 seed | `shared/tarot-geo-seed.ts`（`npm run seed:tarot-geo`） |
| CMS 地理 | `tarot/src/lib/cms/geo.ts` |

### 4.2 信仰 / 守护神

| 职责 | 路径 |
|------|------|
| 信仰选择器 | `tarot/src/components/FaithPicker.tsx` |
| 信仰 API | `tarot/src/app/api/faiths/route.ts`（`?country=BR` 区域排序） |
| 守护神 API | `tarot/src/app/api/sanctuaries/route.ts` |
| CMS 圣地 | `tarot/src/lib/cms/sanctuaries.ts`（**重写 localhost CMS 图为 `/gods/` 或 `/media/`**） |
| 信仰 seed | `shared/tarot-faith-seed.ts` |
| 正式图目录 | `tarot/public/gods/*.webp` |
| 导入脚本 | `tarot/scripts/import-deity-images.mjs` |
| 下载脚本 | `tarot/scripts/download-deity-images.mjs` |
| 自有图上传 | `tarot/tarot_pic/god/incoming/`（仅覆盖用，勿重复提交与 public 相同文件） |

### 4.3 祈福 / 功德 / 乐捐

| 职责 | 路径 |
|------|------|
| 祈福页状态机 | `tarot/src/app/temple/page.tsx` |
| 按住参拜 | `tarot/src/components/temple/WorshipScreen.tsx` |
| 朝向指示 | `tarot/src/components/temple/FacingIndicator.tsx`、`tarot/src/lib/temple/facing.ts` |
| 结束页 | `tarot/src/components/temple/BlessingScreen.tsx` |
| 乐捐 UI | `tarot/src/components/temple/TempleDonation.tsx` |
| 乐捐常量 | `shared/tarot-merit/donation.ts` |
| 功德规则 | `tarot/src/lib/merit.ts`、`tarot/src/lib/merit-service.ts` |
| 功德说明页 | `tarot/src/app/profile/merit/page.tsx` |
| checkout | `tarot/src/app/api/checkout/route.ts` |

### 4.4 Onboarding

| 职责 | 路径 |
|------|------|
| 引导流程 | `tarot/src/components/OnboardingFlow.tsx` |
| 地理步 | 内嵌 `GeoJourneyPicker`，`pickDeity={false}`，`faithConfirmLabel="确认并完成引导"` |
| 完成 API | `tarot/src/app/api/onboarding/complete/route.ts`（写入 `countryCode`/`continentCode`/`faith`） |

---

## 5. 数据模型

**Prisma（`tarot/prisma/schema.prisma`）用户表扩展：**

- `countryCode` — ISO 3166-1 alpha-2
- `continentCode` — 大洲 code（与 CMS `geo-regions` 一致）

**CMS 集合（Payload，`cms/`）：**

- `geo-regions` — 大洲
- `geo-countries` — 国家（归属大洲）
- `country-faiths` — 国家主流宗教排序
- `faiths` — 宗教（含朝向字段）
- `sanctuaries` — 圣地/守护神（含 `imageUrl`、朝向）

---

## 6. 部署

```bash
# 塔罗（native，默认）
SSH_KEY=~/.ssh/deploy_key ORASAGE_REF=main bash deploy/remote-deploy-tarot.sh

# CMS（地理/圣地/Hero 有改动时）
sudo ORASAGE_REF=main bash deploy/cms/deploy-cms.sh
```

| 项 | 值 |
|----|-----|
| VPS | `ubuntu@34.75.40.67` |
| 生产 URL | https://tarot.orasage.com |
| 端口 | `3112` |
| 代码目录 | `/opt/orasage` |

**环境变量（tarot）：**

- `DATABASE_URL` — MySQL/MariaDB
- `JWT_SECRET` — 与 auth-service 一致（识别 `orasage_token`）
- `PORT` — 默认 3112

---

## 7. 本地启动

```bash
# MySQL
sudo service mariadb start

cd tarot
npm install
DATABASE_URL=mysql://user:pass@127.0.0.1:3306/tarot npx prisma db push
JWT_SECRET=your-32-char-secret-minimum npm run build && npm start
```

地理 seed（可选，需 CMS + Postgres）：

```bash
cd cms && DATABASE_URL=... PAYLOAD_SECRET=... npm run seed:tarot-geo
```

---

## 8. 验证清单

> 2026-07-06 代码走查；生产 @ `6a05630`。浏览器实机建议再跑一遍。

| # | 场景 | 预期 | 关键文件 |
|---|------|------|----------|
| 1 | Onboarding 地理步 | GPS/IP 确认或列表选国家 → 选信仰 → 完成引导 | `OnboardingFlow.tsx`、`GeoJourneyPicker.tsx` |
| 2 | `/temple` 首次进入 | 地理旅程 → 选守护神 → 进入 home | `temple/page.tsx` |
| 3 | 国家后选信仰 | **列表**展示，**无地图信仰标记** | `FaithPicker.tsx` |
| 4 | 信仰后选守护神 | 网格推荐，图正常显示（非 localhost 404） | `sanctuaries.ts` |
| 5 | 按住参拜 ≥3s | 进入 blessing，+功德 | `WorshipScreen.tsx` |
| 6 | 乐捐 ¥0.50 | checkout 总额 ¥0.50，非 ¥0.01 | `TempleDonation.tsx`、`donation.ts` |
| 7 | 祈福完成 | 「去抽今日运势」→ `/daily-fortune` | `BlessingScreen.tsx` |
| 8 | 日运推荐商品 | 链 `shop.orasage.com?sku=...#...` 高亮 SKU | `shop-products.ts` |
| 9 | 登录后日运 | `GuestLoginWall` 回跳 `?recordId=` | `DailyFortuneFlow.tsx` |
| 10 | CMS 改 Hero | 首页 `TarotHomeHero` 更新 | `cms-tarot-hero.ts` ⚠️ 注意缓存 |

**构建检查（无自动化测试套件）：**

```bash
cd tarot && JWT_SECRET=local-dev-jwt-secret-32chars-min npm run build
```

---

## 9. 已知问题与刻意省略

| 项 | 说明 |
|----|------|
| 地图信仰标记 | 已移除（曾导致错误 URL）；**勿恢复** |
| 传播功德路 | `MERIT_SHARE_PATH_ENABLED=false`（P0 去分享决策） |
| MANTO 视觉差距 | 现版浅色主题 + 照片守护神，非文档暗色 SVG/曼陀罗；见 `HANDOFF-tarot.md` §八 |
| `phase === "pick"` | 独立守护神页仍保留（`?change=deity`），主流程已内嵌于 `GeoJourneyPicker` |
| `/fortune` | 重定向至 `/daily-fortune`，可保留或后续删除 |
| 自动化测试 | 无 geo 旅程单测；依赖 build + 手动/E2E |
| 远程分支 | `origin/cursor/geo-*`、`deity-*` 可删 |

---

## 10. 建议后续（按优先级）

1. **合入 PR #178** — 文档与 Onboarding 文案（`cursor/docs-cleanup-audit-f1bd`）
2. **P3 朝拜抛光** — 粒子/曼陀罗/滑出续拜（非阻塞，见差距审计）
3. **P4 阶位特权** — 持光者每月免费占卜与三牌阵/日运打通
4. **自有守护神图** — 上传 `incoming/` → `import-deity-images.mjs` → 部署
5. **清理远程分支** — geo/deity 相关 `cursor/*` 已合 main
6. **传播路** — 需产品决策是否重新启用

---

## 11. 踩坑记录

| 问题 | 原因 | 处理 |
|------|------|------|
| 地图点信仰报错/坏链 | 地图 marker 链到不存在路由 | 改为列表 `FaithPicker` |
| 守护神图 404 | CMS `imageUrl` 含 `127.0.0.1` | `sanctuaries.ts` 重写为 `/gods/` 或 `/media/` |
| 乐捐 ¥0.50 只扣 ¥0.01 | quantity 未按分计 | `templeDonationQuantity(amountCents)` |
| Cloud Agent 收不到用户本地图 | 对话附件不写工作区 | 用 `download-deity-images.mjs` 从 Wikimedia 拉取 |
| jsVectorMap 内存泄漏 | 未 destroy | `JourneyVectorMap` unmount 时 `map.destroy()` |
| 本地 cookie 测登录 | `secure` + `.orasage.com` domain | 本地用 `Authorization: Bearer <token>` |

---

## 12. 相关文档索引

| 文档 | 用途 |
|------|------|
| [`HANDOFF-tarot.md`](./HANDOFF-tarot.md) | 塔罗区长期交接 + P3/P4 差距表 |
| [`plans/tarot-temple-roadmap.md`](./plans/tarot-temple-roadmap.md) | 祈福改版分期路线图 |
| [`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md) | 全站架构与部署 |
| [`tarot/MANTO_PRODUCT.md`](../tarot/MANTO_PRODUCT.md) | 产品完整规格 |
| [`AGENTS.md`](../AGENTS.md) | Cloud Agent 运行与环境说明 |

---

*文档版本：2026-07-06 · 生产 commit `6a05630` · 待合文档 PR #178*
