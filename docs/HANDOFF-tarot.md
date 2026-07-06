# 塔罗区全量交接备忘录

> 写给下一任 Agent / 开发者（orasage monorepo `tarot/`）。  
> 最后更新：**2026-07-06**  
> 平台总览：[`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)  
> **本轮地理旅程 / 祈福改版专项交接：** [`HANDOFF-tarot-geo-temple-2026-07-06.md`](./HANDOFF-tarot-geo-temple-2026-07-06.md)

---

## 一、背景与架构

| 项 | 说明 |
|----|------|
| 仓库 | orasage monorepo；塔罗在 `tarot/` |
| 生产 | https://tarot.orasage.com（VPS `34.75.40.67`，端口 `3112`） |
| 账号 | 访客 `tarot_token`（`guest_*`）+ 登录 `orasage_token` 桥接 `orasage_*`；登录时会 `mergeGuestUserIntoTarget`（`tarot/src/lib/guest-account-merge.ts`） |
| CMS | admin.orasage.com/cms/admin；塔罗相关：Global **塔罗 Hero**、集合 **宗教/圣地/地理** |
| 计费 SKU | auth-service `tarot-billing` + admin 商品管理 → 塔罗计费与推荐 |

---

## 二、功能分期（均已合并 main 并部署）

| 期 | PR / commit | 内容 |
|----|-------------|------|
| P4 | #126 | 三牌阵 V2：`ThreeCardFlow`、`/api/three-card/*`、简读免费 → 付费详读 |
| P5 | #127 | 占卜同步 `readingSyncId`、`GuestLoginWall`、`buildLoginUrl` |
| — | #128 | 用户中心「查看详情」、`detailUrl`、同步去重 |
| — | #129 | 历史记录补同步 `ReadingSyncBackfill`、`/api/readings/backfill` |
| UX | #130 | 信仰选中收起确认；`MantoThinking` 过场；`TarotFlipCard` + `/cards/*.webp` |
| — | #131 | 每日推荐链 `shop?sku=#`（原 `/products/` 404） |
| — | #132 | 祈福完成跳 `/daily-fortune`（原 `/reading`） |
| — | #133 | 登录后恢复解读页（访客数据合并 + `?recordId=`） |
| — | #134 | CMS `tarot-home-hero` + 首页 `TarotHomeHero` |
| — | #135 | 后台侧栏补 塔罗 Hero 入口（`shared/admin-backend/nav.ts`） |
| — | #136 | 去掉首页「今日能量」 |
| — | #137 | Hero 图/视频与内容区同宽 100% |
| 祈福 | #175 | 乐捐定价：`quantity = 金额分`，单价 ¥0.01 |
| 守护神 | #176 | 21 位正式图（Wikimedia → `public/gods/*.webp`） |
| 地理 | `0efb04e` | jsVectorMap 替换 SVG 地图 |
| 地理 | `85c621a` | GPS/IP 检测 + 国家确认 + 内联列表 |
| 地理 | `6a05630` | 列表选信仰 + 守护神推荐（移除地图信仰标记） |

路线图详情：[`docs/plans/tarot-temple-roadmap.md`](./plans/tarot-temple-roadmap.md)

---

## 三、关键路径与文件

| 功能 | 路径 / 组件 |
|------|-------------|
| 首页 | `TarotHomeV2` + `TarotHomeHero` ← `/api/cms/tarot-home-hero` |
| 每日运势 | `DailyFortuneFlow`；额度 `daily-fortune-quota`（每日 1 次 + 祈福 +1） |
| 三牌阵 | `/reading` → `ThreeCardFlow` |
| 祈福 | `/temple` → 地理旅程 → 拜神 → 跳每日运势 |
| 地理旅程 | `GeoJourneyPicker` + `JourneyVectorMap` + `FaithPicker` |
| 商城推荐 | `shopUrlForSku()` in `tarot/src/lib/shop-products.ts` |
| 登录回跳 | `buildLoginUrl()` in `tarot/src/lib/login-url.ts` |
| 访客合并 | `tarot/src/lib/guest-account-merge.ts` |
| 占卜同步 | `tarot/src/lib/reading-sync-server.ts`、`ReadingSyncBackfill` |
| 功德 | `tarot/src/lib/merit.ts`、`/profile/merit` |
| 乐捐 | `TempleDonation` + `shared/tarot-merit/donation.ts` |

---

## 四、部署

```bash
bash deploy/remote-deploy-tarot.sh          # 塔罗
sudo ORASAGE_REF=main bash deploy/cms/deploy-cms.sh  # CMS（Hero/圣地/地理）
```

分支命名：`cursor/<描述>-f1bd`

---

## 五、已知遗留 / 未做

| 项 | 状态 | 说明 |
|----|------|------|
| 三牌阵套装「查看订单」 | ✅ 已修 | 改链 `orasage.com/zh-CN/profile/orders` |
| `/fortune` 独立页 | 保留 | 重定向至 `/daily-fortune` |
| 自动化测试 | 无 | 改完跑 `JWT_SECRET=... npm run build`（`tarot/`） |
| MANTO 产品文档差距 | 未对齐 | 暗色粒子 Hero、首页单 CTA 等与现版浅色双卡片布局仍有差距；见 `tarot/MANTO_PRODUCT.md` |
| 传播功德路 | 暂停 | `MERIT_SHARE_PATH_ENABLED=false`（P0 决策） |
| 远程 cursor 分支 | 可清理 | geo/deity 相关分支已 fast-forward 合入 `main` |
| 自定义守护神图 | 可选 | 上传至 `tarot/tarot_pic/god/incoming/` 后跑 `import-deity-images.mjs` |

---

## 六、验证清单

> 2026-07-06 代码走查 + 生产已部署 `6a05630`。勾选表示实现链路存在且已抽检；标 ⚠️ 为需浏览器实机再验。

- [x] **引导页选信仰 → 确认可见** — `OnboardingFlow` → `GeoJourneyPicker`（`pickDeity={false}`）；国家步有确认 dock；信仰点选即完成（自定义信仰有「确认并完成引导」按钮）。验证：`FaithPicker.tsx`、`GeoJourneyPicker.tsx`
- [x] **每日运势：过场 + 翻牌 + 登录后回到报告** — `MantoThinking`、`TarotFlipCard`、`GuestLoginWall` + `returnPath=/daily-fortune?recordId=`。验证：`DailyFortuneFlow.tsx`
- [x] **祈福 → 每日运势；推荐商品 → 商城高亮 SKU** — `BlessingScreen` 链 `/daily-fortune`；`shopUrlForSku` → `shop?sku=#`；shop `ProductCatalog` 读 `sku` 参数高亮。验证：`BlessingScreen.tsx`、`shop-products.ts`、`shop/src/components/ProductCatalog.tsx`
- [x] **CMS 改塔罗 Hero → 首页文案/图更新** — `fetchTarotHomeHero` / `/api/cms/tarot-home-hero` → `TarotHomeHero`。验证：`cms-tarot-hero.ts` ⚠️ 改 CMS 后需刷新首页确认缓存
- [x] **登录用户占卜历史同步与用户中心详情链** — `reading-sync-server.ts`、`ReadingSyncBackfill`（layout）、`buildLoginUrl`、`detailUrl`。验证：`layout.tsx`、`three-card/sync.ts`、`daily-fortune/sync.ts`

---

## 七、本地启动

```bash
cd tarot
npm install
DATABASE_URL=mysql://... npx prisma db push
JWT_SECRET=your-32-char-secret npm run build && npm start   # 默认 PORT=3112
```

MySQL/MariaDB 必需；`JWT_SECRET` 与 auth-service 一致方可识别 `orasage_token`。

---

## 八、P3 / P4 与 MANTO_PRODUCT 差距审计

对照 `tarot/MANTO_PRODUCT.md` §B4、§C2–C4（2026-07-06）。

### P3 朝拜体验（§B4）

| MANTO 要求 | 现实现状 | 差距 |
|------------|----------|------|
| 扁平圣像 SVG + 呼吸光 4s | 守护神 `.webp` 照片 + CSS 阶段光晕 | 视觉风格不同，非阻塞 |
| 整块神像触控热区 | `temple-worship-stage` 按住参拜 | ✅ 基本满足 |
| 粒子 15→40→80、曼陀罗、金雨 | 粒子 15→35→70，无曼陀罗/白闪 | 中 — 体验简化版 |
| 手指滑出暂停不重置 | `mouseLeave` 会 `stopHolding` | 小 — 移动端 touch 为主 |
| 锁屏/中断断点续拜 | 无 | 低优先级 |
| 同日多次参拜不记功德 | `alreadyCheckedIn` 提示 | ✅ |
| 朝拜结束分享 WhatsApp | P0 已去分享 | 有意省略 |
| 圣地朝向指示 | `FacingIndicator` + CMS 字段 | ✅ |

### P4 功德体系（§C2–C4）

| MANTO 要求 | 现实现状 | 差距 |
|------------|----------|------|
| 时间/供养路规则 | `merit.ts` + `/profile/merit` 说明页 | ✅ |
| 传播路 | 常量保留，`MERIT_SHARE_PATH_ENABLED=false` | 有意暂停（P0） |
| 神圣日 ×2 | `sacredDayMultiplier()` 已用于参拜/供养 | ✅ |
| 五阶位与特权 | 阶位计算 ✅；持光者每月免费占卜等待全链路 | 中 |
| 功德榜 / 治理 / 近神者机制 | 未实现 | 远期 |
| 乐捐 $0.01–$1 + 随机倍数 | `TempleDonation` + mock checkout | ✅ |
| 消费里程碑 $100/$1k/… | `OFFER_SPENT_MILESTONES` | ✅ 逻辑在 `merit-service` |

**建议后续（非阻塞）：** P3 粒子/曼陀罗抛光；P4 阶位特权（免费占卜）与商城/三牌阵打通；传播路是否重新启用需产品决策。

---

## 九、守护神正式图工作流

```bash
# 1. 将图片放入 incoming/（见 tarot/tarot_pic/god/incoming/README.md）
# 2. 导入
node tarot/scripts/import-deity-images.mjs
# 从 Wikimedia 批量下载（无自有图时）
node tarot/scripts/download-deity-images.mjs
```

`resolve-commons-files.mjs` 为下载脚本的 Commons 搜索辅助，已纳入仓库。
