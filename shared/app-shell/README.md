# OraSage App Shell（共享导航）

主源文件目录。构建前同步到各应用：

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

- **PC（≥1024px）**：`SiteTopNav` 顶栏
- **移动（<1024px）**：`FixedBottomNav` 5 键底栏

CSS 在 `app-shell.css` 内用媒体查询切换，无需各应用单独判断首页/子页。
