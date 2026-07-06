# 塔罗区全量交接备忘录

> 写给下一任 Agent / 开发者（orasage monorepo `tarot/`）。  
> 最后更新：**2026-07-06**  
> 平台总览：[`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)

---

## 一、背景与架构

| 项 | 说明 |
|----|------|
| 仓库 | orasage monorepo；塔罗在 `tarot/` |
| 生产 | https://tarot.orasage.com（VPS `34.75.40.67`，端口 `3112`） |
| 账号 | 访客 `tarot_token`（`guest_*`）+ 登录 `orasage_token` 桥接 `orasage_*`；登录时会 `mergeGuestUserIntoTarget`（`tarot/src/lib/guest-account-merge.ts`） |
| CMS | admin.orasage.com/cms/admin；塔罗相关：Global **塔罗 Hero**、集合 **宗教/圣地** |
| 计费 SKU | auth-service `tarot-billing` + admin 商品管理 → 塔罗计费与推荐 |

---

## 二、功能分期（均已合并 main 并部署）

| 期 | PR | 内容 |
|----|-----|------|
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

---

## 三、关键路径与文件

| 功能 | 路径 / 组件 |
|------|-------------|
| 首页 | `TarotHomeV2` + `TarotHomeHero` ← `/api/cms/tarot-home-hero` |
| 每日运势 | `DailyFortuneFlow`；额度 `daily-fortune-quota`（每日 1 次 + 祈福 +1） |
| 三牌阵 | `/reading` → `ThreeCardFlow` |
| 祈福 | `/temple` → 拜神 → 跳每日运势 |
| 商城推荐 | `shopUrlForSku()` in `tarot/src/lib/shop-products.ts` |
| 登录回跳 | `buildLoginUrl()` in `tarot/src/lib/login-url.ts` |
| 访客合并 | `tarot/src/lib/guest-account-merge.ts` |
| 占卜同步 | `tarot/src/lib/reading-sync-server.ts` |

---

## 四、部署

```bash
bash deploy/remote-deploy-tarot.sh          # 塔罗
sudo ORASAGE_REF=main bash deploy/cms/deploy-cms.sh  # CMS（Hero/圣地）
```

分支命名：`cursor/<描述>-f1bd`

---

## 五、已知遗留 / 未做

| 项 | 状态 | 说明 |
|----|------|------|
| 三牌阵套装「查看订单」 | ✅ 已修 | 改链 `orasage.com/zh-CN/profile/orders`（原 `shop.orasage.com/account/orders` 404） |
| `/fortune` 独立页 | 保留 | 首页已不再用，路由仍存在 |
| 自动化测试 | 无 | 改完跑 `JWT_SECRET=... npm run build`（`tarot/`） |
| MANTO 产品文档差距 | 未对齐 | 暗色粒子 Hero、首页单 CTA 等与现版浅色双卡片布局仍有差距；见 `tarot/MANTO_PRODUCT.md` |

---

## 六、验证清单

- [ ] 引导页选信仰 → 确认可见
- [ ] 每日运势：过场 + 翻牌 + 登录后回到报告
- [ ] 祈福 → 每日运势；推荐商品 → 商城高亮 SKU
- [ ] CMS 改塔罗 Hero → 首页文案/图更新
- [ ] 登录用户占卜历史同步与用户中心详情链

---

## 七、本地启动

```bash
cd tarot
npm install
DATABASE_URL=mysql://... npx prisma db push
JWT_SECRET=your-32-char-secret npm run build && npm start   # 默认 PORT=3112
```

MySQL/MariaDB 必需；`JWT_SECRET` 与 auth-service 一致方可识别 `orasage_token`。
