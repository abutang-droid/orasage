# OraSage App Shell（共享导航）

主源文件目录。构建前同步到各应用：

```bash
for app in tarot/src/lib/orasage-app-shell ziwei/lib/orasage-app-shell bazi/client/src/lib/orasage-app-shell; do
  mkdir -p "$app"
  cp shared/app-shell/{AppShell.tsx,config.ts,labels.ts,app-shell.css,index.ts} "$app/"
done
```

各应用通过 `@/lib/orasage-app-shell` 引用。
