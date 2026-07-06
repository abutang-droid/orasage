# 守护神正式图 — 上传目录

把**待替换或覆盖**的正式图放进本目录，然后运行导入脚本。

> **说明：** 仓库默认守护神图已在 `tarot/public/gods/`（由 `download-deity-images.mjs` 从 Wikimedia 导入）。本目录仅用于**自有素材覆盖**，勿重复提交与 `public/gods/` 相同的文件。

## 上传方式（任选）

1. **Cursor 对话**：直接拖入本文件夹或 zip
2. **Git**：`git add tarot/tarot_pic/god/incoming/` 后 push
3. **本地复制到 Cloud Agent 工作区** 同路径

## 文件命名（任选一种）

| 方式 | 示例 |
|------|------|
| **code**（推荐） | `fatima.webp`、`shiva.png` |
| **中文名** | `法蒂玛.webp`、`湿婆.jpg` |
| **英文名** | `Shiva.webp`、`Fatima Zahra.png` |

支持 `.webp` `.png` `.jpg` `.jpeg`；导入时会统一为 `tarot/public/gods/{code}.webp`。

## 待替换 21 位

| code | 中文名 |
|------|--------|
| fatima | 法蒂玛 |
| shiva | 湿婆 |
| lakshmi | 拉克什米 |
| shakyamuni | 释迦牟尼 |
| ksitigarbha | 地藏菩萨 |
| guan_yu | 关公 |
| jade_emperor | 玉皇大帝 |
| ogun | 奥贡 |
| guru_nanak | 古鲁·那纳克 |
| allan_kardec | 阿兰·卡里德 |
| elijah | 以利亚 |
| amaterasu | 天照大神 |
| bahaullah | 巴哈欧拉 |
| mahavira | 大雄 |
| ahura_mazda | 阿胡拉·马兹达 |
| confucius | 孔子 |
| dangun | 檀君王 |
| pachamama | 帕查 Mama |
| iemanja | 伊曼雅 |
| oyasama | 天理王母 |
| cao_dai_mother | 母道 |

## 导入命令

```bash
node tarot/scripts/import-deity-images.mjs
```

脚本会：复制到 `public/gods/`、更新 `shared/tarot-faith-seed.ts`、删除对应 `.svg` 占位。
