# Agent 交接 — 2026-10-03

> 写给**下一轮对话**的 Cloud Agent。先读本文，再读 [`AGENT-RULES.md`](./AGENT-RULES.md)。  
> 平台总览仍见 [`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)。  
> 用户对 Agent 的回复里**不要提 PR 编号**，除非用户问。

开新对话可把下面这段贴进第一条消息：

```
先读 docs/HANDOFF-agent-2026-10-03.md 和 docs/AGENT-RULES.md。
生产是家用机 overlay，禁止 git reset --hard。
未点名的内容一律不改。铁口直断和手机罗盘刻度不要回归。
```

---

## 0. 开场必守

| 条 | 规则 |
|----|------|
| **未点名不改** | 只改当次指令明确提到的内容。没写到的页面 / 文案 / 功能 / 其它 App / 语言一律不动。扩面必须有「全站」「一并改」等明确字样。见 `docs/AGENT-RULES.md` §任务范围。 |
| **最高宪法** | 已点名的改动必须穿透到末端（`shared/` → 各 App 副本、部署、入口页）。未点名的东西不要动手。 |
| **全站** | 仅当用户说「全站」时覆盖 8 个域名下所有页（含 admin / cms）。导航形态未经批准不改。 |
| **生产** | 家用源站 `root@ssh.orasage.com`（Cloudflare Tunnel）。**禁止**把 GCP `34.75.40.67` 当默认目标。**禁止** `git reset --hard` / 强清 dirty 树。 |
| **铁口** | 生产八字报告引擎是《铁口直断》4 层过滤。禁止用白话「结构顾问」prompt 覆盖。 |
| **罗盘刻度** | 手机上罗盘环上的数字必须留在环上，修 CSS/SVG 时回归此项。 |

---

## 1. 本轮用户意图（按时间）

| 顺序 | 用户要求 | 结果 |
|------|----------|------|
| 1 | 测试报告关联 / 详情页 / 分享 | 报告详情 + 静态 HTML + 用户 readings 关联，多层叠写在生产 |
| 2 | 详情页没优化 → 风格对了内容有问题 | vibe 赭石样式 + 按 `readingId` 统一详情/固定报告内容 |
| 3 | 手机罗盘数字 | 刻度留在环上（生产 overlay） |
| 4 | 检查排盘引擎 / 铁口 | 恢复铁口直断；**禁止再被白话稿覆盖** |
| 5 | 把 vibe 合并到主分支并应用 | vibe 叠到铁口结果；生产已 overlay |
| 6 | 导出品牌规范 → 中文名「海棠未眠」→ 只留一套规范 | 唯一规范 `docs/design-system/OraSage-Brand-Spec.md` v2.2 |
| 7 | 中文双品牌落地全站（中文主海棠未眠 / 辅 OraSage；其它语言不用汉字） | 已落地并 **合并同步到家用生产** |
| 8 | 确定规则：未点名不改 | 已写入 `docs/AGENT-RULES.md` |
| 9 | **写交接文档** | 本文 |

---

## 2. Git 该看哪条分支

生产跟踪分支（功能栈底座）：

```
cursor/bazi-luopan-home-cdf4   @ 3f27af17
```

含：罗盘首页 + 品牌规范 + 中文双品牌落地 + 塔罗中文标题补 locale。

本会话最后一条 docs 分支（未点名不改）：

```
cursor/agent-scope-rule-cdf4   @ 5a905752   （base: cursor/bazi-luopan-home-cdf4）
```

**不要**默认从 `main` 开功能。`main` 远落后于家用生产（生产 git HEAD 仍是旧 `main`，靠 dirty overlay 跑新功能）。

新功能分支命名：`cursor/<descriptive-name>-cdf4`，base 用 `cursor/bazi-luopan-home-cdf4`，除非用户指定。

### 已合入跟踪分支（2026-10-03）

| 内容 | 提交 |
|------|------|
| 品牌规范唯一化 + 海棠未眠适用范围 | `3ca11503` … `f9c1d9e3` |
| 中文全站双品牌落地 | `6b7ff871` |
| 紫微 chart 标题去重后缀 | `9ecfb9d4` |
| 塔罗首页 title 传入 locale | `3f27af17` |

GitHub 上对应草稿已 **MERGED** 进跟踪分支（#444 规范、#445 落地）。不要再拿这两条当未完成。

---

## 3. 生产机真实状态（最重要）

| 项 | 值 |
|----|----|
| SSH | `source deploy/lib/ssh-setup.sh && setup_ssh_key && test_ssh_connection` → `root@ssh.orasage.com`（cloudflared，勿直连 :22） |
| 代码 | `/opt/orasage` |
| git | 分支 `main`，SHA **`ae0fb4f`**，**约 120 个 dirty 文件 + 若干 untracked overlay** |
| 备份 | `/opt/orasage/.overlay-backup/`（品牌这次：`brand-zh-land-20261003235614`） |

**部署方式：叠文件 + 重建 systemd，禁止 reset。**

1. 备份将改的文件到 `.overlay-backup/<topic>-<timestamp>/`
2. `git apply --reject` 或对 dirty 文件做外科替换（铁口 / vibe 报告 HTML 不能整文件覆盖）
3. 按应用 `npm run build` / bazi `pnpm run build`，然后 `systemctl restart orasage-<app>`
4. 不要跑会 `git reset --hard` 的 `deploy-shop-on-vps.sh` / `scripts/vps-deploy-main.sh`

单位：`orasage-{main,auth,shop,admin,bazi,ziwei,tarot,cms}`

2026-10-03 双品牌已 overlay 并全量重建，`fail=0`。日志：`/tmp/brand-rebuild.log`（副本在 Cloud Agent artifacts `brand-rebuild.log`）。

### 生产 overlay 里有、跟踪分支 git 里未必有的能力

这些大多以 **VPS dirty / untracked** 存在，修品牌时曾刻意避开整文件覆盖：

- 铁口直断 prompt / 报告（`bazi/server/prompts.ts` 等仍是铁口，不是白话结构顾问）
- vibe / design-spec 报告 HTML（`bazi/server/reportHtml.ts` 是赭石长页，不是旧短模板）
- 手机罗盘刻度、语音 NLU
- 静态固定报告、详情页、readings 关联、admin 测试报告
- 计费槽位隐藏、推广渠道
- 全站赭石 token 的 CSS dirty 副本

以后叠 git 补丁：**失败的 hunk 按生产现文手术替换，禁止用跟踪分支旧文件盖掉铁口 / vibe。**

---

## 4. 品牌（已上线）

**唯一规范：** [`docs/design-system/OraSage-Brand-Spec.md`](./design-system/OraSage-Brand-Spec.md) v2.2  
导出：`docs/design-system/export/`  
本目录其它旧 VI / DS 文档是跳转，不要当第二套规范。

| locale | 主名 | 辅名 |
|--------|------|------|
| `zh` / `zh-CN` / `zh-TW` | 海棠未眠 | OraSage（更小、深灰） |
| 其它 | OraSage | 无汉字品牌 |

实现源：`shared/app-shell/brand.ts`  
改完跑 `npm run app-shell:sync`（`scripts/app-shell/sync-app-shell.mjs`，需含 `brand.ts`）。

中文顶栏（门户 **或** 中文 locale 的子应用）用母品牌双 lockup。  
非中文子应用保留产品名：BaZi / ZiWei / Manto / Five Elements。

auth 从 `shared/app-shell/brand.ts` import；生产跑 `node dist/index.js`，改 chrome **必须重建 auth**。

### 2026-10-03 线上抽检（已通过）

| 页 | 中文顶栏 / 标题 |
|----|-----------------|
| `orasage.com/zh-CN` | 海棠未眠 + OraSage；标题 `… \| 海棠未眠` |
| `orasage.com/en` | 仅 OraSage，无「海棠未眠」 |
| auth `/login` 中文 | `登录以继续 — 海棠未眠` |
| shop 中文 cookie | `能量商城 \| 海棠未眠` |
| shop 英文 | 产品名 Five Elements；标题 OraSage |
| bazi | 文档标题已是海棠未眠（顶栏 SPA 水合） |
| ziwei `/chart` | `紫微斗数排盘 \| 海棠未眠` |
| tarot | `塔罗占卜 · 每日拜神 \| 海棠未眠`（补过 locale） |
| admin 中文 | `登录以继续 — 海棠未眠` |

浏览器默认英文时，子应用顶栏显示产品名是**符合规范**的，不要当成回归去「修」成海棠未眠。

---

## 5. 共享层与命令

```
shared/app-shell/          # 导航 / 品牌 / 页脚 chrome 主源
npm run app-shell:sync     # 同步到 8 个 orasage-app-shell 副本
shared/design-tokens/      # tokens 主源；tokens:sync
```

八字：`pnpm`（不是 npm）。端口：main 3100、auth 3101、shop 3102、admin 3103、bazi 3110、ziwei 3111、tarot 3112、cms 3120。

本地 cookie 域是 `.orasage.com`，打 `127.0.0.1` 留不住；用 JSON `token` 当 `Authorization: Bearer`。

---

## 6. 未完成 / 不要擅自做

| 项 | 说明 |
|----|------|
| 未点名不改 规则合入跟踪分支 | 在 `cursor/agent-scope-rule-cdf4`，等用户说合并再合 |
| 叠在生产、未全部进 `bazi-luopan-home` git 的 PR | vibe / 铁口 / 刻度 / 报告详情 / 静态报告 / 计费 / 推广等仍是独立草稿。用户没说合并就不要批量合进跟踪分支 |
| 合进 GitHub `main` | 不是当前生产跟踪方式 |
| 全站导航改形态 | 禁止，除非用户明确批准 |
| 把英文/pt-BR 改成中文品牌 | 禁止 |
| 铁口改回白话报告 | 禁止 |
| Stripe 真收款 | 仍默认 `PAYMENT_MODE=mock` |
| GCP 部署 | 除非任务点名 |

用户若说「合并同步」：把**当次**功能合进 `cursor/bazi-luopan-home-cdf4`，再 overlay 家用机。不要 `gh pr merge`（用 git FF/merge 推 base；`gh` 只读）。不要提 PR 号给用户。

---

## 7. 回归清单（改八字 / chrome 时）

1. 铁口：`bazi/server/prompts.ts` 仍含「铁口直断派」+ 四层过滤，不是「八字结构顾问」白话稿。
2. 手机罗盘：窄屏拖环后数字仍在环上。
3. 中文顶栏双品牌、英文无汉字品牌。
4. 导航 PC / 移动形态与改前一致。
5. auth 改了必须 `npm run build` 再 restart，否则仍跑旧 `dist/`。

---

## 8. 本轮不要再重复的坑

- 生产 `auth` 是 `node dist/index.js`，只改 `src/` 看不见。
- 紫微 child layout 不要再套一层 `buildOrasageMetadata` 后缀，否则变成 `… \| OraSage \| 海棠未眠`。
- 塔罗首页 `tarotPageMeta` 必须传 `locale`，否则中文标题停在 `\| OraSage`。
- shop 中文不是 path `/zh-CN`（会 404），靠 cookie / switcher。
- 品牌落地补丁会在铁口 / vibe `reportHtml.ts` 上 reject，必须按生产现文件改品牌字符串。
- Cloud Agent 截图有时在 `/cursor/stores/<id>/artifacts/`，要拷到 `/opt/cursor/artifacts/` 用户才看得到。
