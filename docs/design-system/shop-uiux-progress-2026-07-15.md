# SHOP 首页 UI/UX 修复进度（2026-07-15）

分支：`cursor/shop-uiux-fix-3d1a`  
任务书：`OraSage-SHOP-Claude-Code-Fix-Brief-v1.md`  
基线：`48c4ffa`（祖先于当前 `main`）

## 影响评估摘要

| 范围 | 变更 |
|------|------|
| Shop 专属 | Hero / CrystalShowcase / PortalFooter / ProductImage / shop-home.css / products fallback i18n / shop-config locale |
| `shared/shop-crystal/` | 四语内容映射；accent 中性灰；`mergeCrystalContent(locale)` |
| `shared/app-shell/` | LocaleSwitcher listbox 键盘、BottomNav/SiteTopNav `aria-current`、触控 44px、窄屏顶栏两行、Hover 去金色半透明、reduced motion |
| 同步副本 | `npm run app-shell:sync` → main/shop/bazi/ziwei/tarot/admin/cms/auth |
| CMS / auth API | 仅消费；水晶 CMS 覆盖仅应用于 `zh-CN`；价格不做前端硬改 |
| S08 | VERIFY_ONLY（见下） |
| S16 | NEEDS_APPROVAL：未迁移 Tabler；移除页面内 `✦` 字符图标，改用既有 Lucide |

## IMPLEMENT 完成情况

| ID | 状态 | 说明 |
|----|------|------|
| S01 | DONE | 水晶故事/关键词/仪式四语默认；推荐链接带 locale；Footer i18n；fallback 商品文案本地化 |
| S02 | DONE | 购买操作区响应式 grid + `min-width:0`；窄屏 DIY 换行 |
| S03 | DONE | 信息文字改 `--os-color-mono-gray-deep` |
| S04 | DONE | 五行 Tabs roving tabindex + 方向键；共享 LocaleSwitcher listbox 键盘 |
| S05 | DONE | 包装 `radiogroup`/`radio`；缩略 `aria-pressed` |
| S06 | DONE | 语言/登录/底栏触控目标；≤360px 移动顶栏两行 |
| S07 | DONE | Hero Next/Image + 16:9 容器；主图/缩略分别 `sizes` |
| S09 | DONE | 无 headline 时 `sr-only` H1 = `home.heroTitle` |
| S10 | DONE | 桌面 Hero `max-height: min(42vh, 420px)` |
| S11 | DONE | 页签 scroll-snap + 右侧渐隐线索 + 选中项 scrollIntoView |
| S12 | DONE | 加购 `role=status`；错误 `role=alert` |
| S13 | DONE | 顶栏/底栏 `aria-current="page"` |
| S14 | DONE | Halo 中性灰；壳 Hover 去金色 rgba |
| S15 | DONE | 标签/短语 ≥12px；底栏 caption 12px |
| S17 | DONE | Halo / auth pulse / html smooth scroll 尊重 reduced motion |
| S18 | DONE | `:active` 反馈；过渡改用 motion/easing token |

## VERIFY_ONLY / NEEDS_APPROVAL

### S08 生产价格（VERIFY_ONLY）

- 源码 `FALLBACK_PRODUCTS` 与 drizzle 种子：标准装 `crystal-wood` **¥128**（12800）、礼盒装 **¥168**（16800）。
- 任务书线上观测：标准装 **¥268 / $39.90**，礼盒装 **¥168 / $23.33**。
- 结论：**礼盒价与种子一致；标准装为运营侧生产库改价**，非前端 SKU 错配。未在前端硬改价格。

### S16 图标库（NEEDS_APPROVAL）

- 全站仍依赖 Lucide（`packages/ui`、app-shell、shop）。
- 本次仅去掉 `✦` 字符装饰，改用已有 Lucide；**未**引入 Tabler / Iconify。

## 验证

```bash
npm run tokens:check && npm run app-shell:check && npm run ui:check
cd shop && npx tsc --noEmit && npm run build
```

浏览器 20 组合视口矩阵：本环境未做真机矩阵，标为 **UNVERIFIED**。
