# OraSage 设计统一 & Phase 5 后续 — 待完成计划

> 最后更新：2026-07-02  
> 关联分支：`cursor/design-unify-ziwei-9ded`  
> 关联 PR：[#21](https://github.com/abutang-droid/orasage/pull/21)（当前为 **draft**）

---

## 状态总览

| 模块 | 进度 | 说明 |
|------|------|------|
| 设计令牌 / App Shell | ✅ 已合并入分支 | `shared/design-tokens/`, `shared/app-shell/` |
| Ziwei 付费墙 parity | ✅ 已合并入分支 | `/chart` PaywallCard + usePaymentFlow |
| Bazi 浅色主题 | 🟡 主体完成 | 仍有 `BaziResult.tsx` 局部深色残留 |
| Ziwei report-job | ✅ 已合并入分支 | 待 E2E 实测支付→报告 |
| `/heming` 重定向 | ✅ 已部署验证 | 307 → `/chart?mode=heming` |
| VPS 部署 | 🟡 部分完成 | ziwei / bazi / shop 已部署；E2E 未跑 |
| PR 合并 main | ⬜ 未做 | 依赖 E2E 通过 |

---

## P0 — 合并前必做

- [ ] **浏览器 E2E 全流程**（Playwright，`scripts/e2e/`）
  - [ ] Bazi：排盘 → 付费墙 → 演示支付 → 返回 → Profile「查看报告」
  - [ ] Bazi 合盘：双人排盘 → 报告路径（`handleReportReady` + `shopOrderNo`）
  - [ ] Ziwei：单人/合盘 → 付费墙 → 演示支付 → 报告生成
  - [ ] 子页返回：进入 `/history`、`/knowledge` 等后底部导航/返回按钮正常
  - 建议 URL 加 `?lang=zh-CN` 避免英文 UI 导致选择器失败

- [ ] **Ziwei 合盘报告实测**
  - [ ] 确认 `syncZiweiReading(dataA, { couplePartner: dataB })` 写入的 `payloadJson` 含 `chartA`/`chartB`
  - [ ] Shop 演示支付后 `dispatchReportJob` 命中 `report-ziwei-*` → `ZIWEI_INTERNAL_URL/api/internal/report-job`
  - [ ] Auth `user_readings.report_url` 回写成功

- [ ] **VPS 环境变量核对**（`/opt/orasage/shop/.env`、`/opt/orasage/ziwei/.env`）
  - [ ] `JWT_SECRET`（shop 构建与运行必需）
  - [ ] `ZIWEI_INTERNAL_URL=http://127.0.0.1:3111`
  - [ ] `BAZI_INTERNAL_URL=http://127.0.0.1:3110`
  - [ ] `AUTH_INTERNAL_URL=http://127.0.0.1:3101`
  - [ ] Ziwei：`DEEPSEEK_API_KEY` 或 `MANUS_API_KEY` / `OPENAI_API_KEY`（report-job 依赖）

- [ ] **PR #21 收尾**
  - [ ] E2E 通过后取消 draft，转 ready for review
  - [ ] 合并到 `main`
  - [ ] `main` 全量 redeploy（bootstrap 或分应用脚本）

---

## P1 — 合并后短期

- [ ] **Bazi 结果页深色残留清理**（`bazi/client/src/components/BaziResult.tsx`）
  - AI 解读折叠区（`SectionCard`）部分仍用深色卡片色
  - `GanZhiCell` 的 `dark` 模式保留（四柱锚点），其余页面级背景应走 `theme.ts`

- [ ] **Tarot 付费墙 parity**
  - 复用 `shared/app-shell` + `usePaymentFlow` + `PaywallCard` 模式
  - Shop SKU：`report-tarot-*`（若产品侧已定义）

- [ ] **更新 `deploy/VPS-DEPLOY.md` 线上状态表**
  - 当前文档仍写 bazi/ziwei 502，与实际不符

- [ ] **Deploy 脚本统一**
  - 将 `CI=true pnpm install --force` 推广到 tarot 等其他 pnpm 应用，避免 VPS 交互阻塞

---

## P2 — 中期 / 可选

- [ ] 废弃路由与导航文案统一（旧 `/heming` 入口、底部 Tab 命名）
- [ ] Tarot 浅色主题与设计令牌对齐
- [ ] Admin 502 修复与部署
- [ ] CMS 部署（`cms.orasage.com` 当前 502）
- [ ] Stripe 真实支付 webhook 路径与演示支付路径一致性回归
- [ ] `scripts/e2e/package-lock.json` 是否纳入版本控制（当前未提交）

---

## 验收标准（Definition of Done）

1. PR #21 合并 `main`，VPS 各子域 HTTP 200/302 正常
2. Bazi + Ziwei 演示支付后 5 分钟内 `report_url` 可访问
3. 子页有返回，主 Tab 导航不丢失
4. Bazi 首页视觉为浅色纸感（`#FAFAF8`），四柱区保留深色对比
5. `/heming` 永久 307 到 `/chart?mode=heming`

---

## 关键命令速查

```bash
# 本地构建
cd ziwei && npm run build
cd bazi && pnpm run build   # 需 DATABASE_URL / JWT_SECRET

# VPS 远程部署（Cloud Agent / CI）
SSH_KEY=~/.ssh/deploy_key ORASAGE_REF=cursor/design-unify-ziwei-9ded bash deploy/remote-deploy-ziwei.sh
SSH_KEY=~/.ssh/deploy_key ORASAGE_REF=cursor/design-unify-ziwei-9ded bash deploy/remote-deploy-bazi.sh
SSH_KEY=~/.ssh/deploy_key ORASAGE_REF=cursor/design-unify-ziwei-9ded bash deploy/deploy-shop.sh

# 生产验证
curl -sI https://ziwei.orasage.com/heming | grep -i location
curl -sI https://bazi.orasage.com/
curl -sI https://shop.orasage.com/api/health
```
