# 守护神图片资源

## 已有正式图（8 位）

| code | 文件 | 守护神 |
|------|------|--------|
| `aparecida` | `Aparecida.webp` | 阿帕雷西达圣母 |
| `guadalupe` | `Guadalupe.webp` | 瓜达卢佩圣母 |
| `lujan` | `Luján.webp` | 卢汉圣母 |
| `santonino` | `Santo Niño.webp` | 圣婴耶稣 |
| `guanyin` | `观音.webp` | 观音 |
| `brahma` | `四面佛.webp` | 四面佛 |
| `ganesha` | `象神.webp` | 象神 |
| `mazu` | `妈祖.webp` | 妈祖 |

## 简图占位（21 位，待替换）

已全部替换为正式 WebP（2026-07-06）。重新生成占位仅用于开发回滚：


```bash
node tarot/scripts/generate-deity-placeholders.mjs
```

## 手动替换为正式图

1. 将成品图放入本目录，命名为 **`{code}.webp`**（小写 ASCII，与上表 `code` 一致）。
2. 在 `shared/tarot-faith-seed.ts` 把对应 `imageUrl` 改为 `/gods/{code}.webp`。
3. 在 VPS 上同步并重新播种 CMS：

   ```bash
   cd /opt/orasage/cms && npm run seed:tarot
   sudo bash /opt/orasage/deploy/tarot/deploy-tarot.sh
   ```

4. （可选）删除旧的 `{code}.svg` 占位文件。

建议成品尺寸：**512×512** 或 **1024×1024**，WebP，主体居中，四周留 10% 安全边距（圆形裁切用于选神列表）。
