# OraSage App Shell（共享导航）

主源文件目录。构建前同步到各应用：

```bash
npm run app-shell:sync
# 或校验是否漂移：
npm run app-shell:check
```

手动同步（等效）：

```bash
for app in tarot/src/lib/orasage-app-shell ziwei/lib/orasage-app-shell bazi/client/src/lib/orasage-app-shell main/src/lib/orasage-app-shell shop/src/lib/orasage-app-shell admin/src/lib/orasage-app-shell cms/src/lib/orasage-app-shell; do
  mkdir -p "$app"
  cp shared/app-shell/{AppShell.tsx,AppBrandMark.tsx,OrasageAuthChip.tsx,SiteTopNav.tsx,BottomNav.tsx,config.ts,labels.ts,app-shell.css,index.ts} "$app/"
done
cp shared/app-shell/app-shell.css auth-service/public/assets/app-shell.css
```

各应用通过 `@/lib/orasage-app-shell` 引用。

## 全站导航规范

见 [`docs/AGENT-RULES.md`](../../docs/AGENT-RULES.md)：

- **全端移动壳**：`FixedBottomNav` 5 键底栏（塔罗 · 八字 · 祈福 · 商店 · 我的）
- PC 顶栏 `SiteTopNav` 已下线（文件保留，CSS 强制隐藏）

改 shell 后跑 `npm run app-shell:sync`。

## PC 页脚

见 [`docs/design-system/OraSage-Design-System-v1.1-Revised.md`](../../docs/design-system/OraSage-Design-System-v1.1-Revised.md) §7。

- 子应用使用 `PortalFooter` + `.orasage-portal-footer*`（`app-shell.css`）
- 仅展示版权 / 隐私政策 / 用户协议，**禁止**展示登录用户名或邮箱
- 法律链接统一指向主站 `/{locale}/privacy` 与 `/{locale}/terms`
