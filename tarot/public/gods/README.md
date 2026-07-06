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

每位守护神对应 `{code}.svg` 简图占位（无底部水印）。

| code | 文件 | 守护神 | 简图符号 |
|------|------|--------|----------|
| `fatima` | `fatima.svg` | 法蒂玛 | 新月 + 星 |
| `shiva` | `shiva.svg` | 湿婆 | 三叉戟 |
| `lakshmi` | `lakshmi.svg` | 拉克什米 | 莲花 |
| `shakyamuni` | `shakyamuni.svg` | 释迦牟尼 | 法轮 |
| `ksitigarbha` | `ksitigarbha.svg` | 地藏菩萨 | 锡杖 |
| `guan_yu` | `guan_yu.svg` | 关公 | 青龙刀 |
| `jade_emperor` | `jade_emperor.svg` | 玉皇大帝 | 云冠 |
| `ogun` | `ogun.svg` | 奥贡 | 铁器 / 砧 |
| `guru_nanak` | `guru_nanak.svg` | 古鲁·那纳克 | 锡克法徽 |
| `allan_kardec` | `allan_kardec.svg` | 阿兰·卡里德 | 书 + 灵焰 |
| `elijah` | `elijah.svg` | 以利亚 | 火柱 |
| `amaterasu` | `amaterasu.svg` | 天照大神 | 日轮 / 镜 |
| `bahaullah` | `bahaullah.svg` | 巴哈欧拉 | 九角星 |
| `mahavira` | `mahavira.svg` | 大雄 | 心莲 |
| `ahura_mazda` | `ahura_mazda.svg` | 阿胡拉·马兹达 | 光轮 |
| `confucius` | `confucius.svg` | 孔子 | 书卷 |
| `dangun` | `dangun.svg` | 檀君王 | 山峰 |
| `pachamama` | `pachamama.svg` | 帕查 Mama | 大地曲线 |
| `iemanja` | `iemanja.svg` | 伊曼雅 | 海浪 + 月 |
| `oyasama` | `oyasama.svg` | 天理王母 | 心形莲 |
| `cao_dai_mother` | `cao_dai_mother.svg` | 母道 | 天眼三角 |

重新生成全部简图：

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
