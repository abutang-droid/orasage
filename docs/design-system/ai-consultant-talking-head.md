# OraSage AI 命理顾问 · 对镜头讲话视频规范

> 状态：**v1.0 草案**（2026-08-25）
> 片种：锁定人像的 **6–8 秒对镜头讲话**（image-to-video + 口型同步）
> 身份锁静帧：[`shared/brand/ai-consultant/identity-lock.png`](../../shared/brand/ai-consultant/identity-lock.png)
> 可粘贴提示词：[`shared/brand/ai-consultant/prompts/`](../../shared/brand/ai-consultant/prompts/)
> 上位文档：[`OraSage-VI-v1.0.md`](./OraSage-VI-v1.0.md) §8.4（社媒片头片尾）· §8.1（头像禁照片）

本文档是 **OraSage AI 命理顾问数字人** 的成片规范。所有对镜头讲话短片必须从同一张身份锁静帧出发，使用同一套运动约束，不得另造脸、另换装、另改构图。

---

## 0. 与 VI 的边界

| 项 | 裁决 |
| :--- | :--- |
| 本片种定位 | 独立数字人成片格式，不是新的品牌标志，也不是社媒默认头像 |
| 玄璧 / 字标 | 界面 chrome、favicon、App 图标、社媒头像仍走 VI §2 / §8.1，**禁止**用本人物照片替换 |
| 金色全息 | 仅允许出现在本锁定人像的星环 / 几何投影上；不得扩散为 UI 主题色或新的品牌金 |
| 片头片尾 | 本片种 **不加** 玄璧纸底片头。若投放社媒长内容，可把本 6–8 秒讲话嵌在 VI §8.4 片头/片尾之间 |
| 全站 Hero | 现有 CMS `displayMode=video` 可引用成片 URL；本规范 **不改** 各 App Hero 组件。静音循环请改用 §6.2 无声微动变体 |

---

## 1. 人物身份锁

### 1.1 角色

| 项 | 规范 |
| :--- | :--- |
| 角色名（内部） | OraSage AI 命理顾问 |
| 对外称呼 | 「命理顾问」；用户可见文案中的品牌名仍为 **OraSage** |
| 气质 | 安静、从容、智慧、温和、专业；像真实存在的高级顾问面对用户讲话 |
| 表情基线 | 中性偏柔和，**不夸张微笑**，不戏剧化 |

### 1.2 必须锁死的视觉锚点

生成、续写、换镜前对照静帧。下列元素与构图必须一致：

- **脸**：年轻东亚女性，对称五官，自然皮肤质感，棕色大眼直视镜头
- **左颊标记**（画面右侧）：金色几何纹——中心菱形 / 四角星，细线连向四枚小点
- **发型**：长直黑发，微侧分，发丝写实，不改成卷发 / 盘发 / 短发
- **服装**：黑色高领现代袍 / 旗袍感上衣；**左肩**搭一块米白色织物
- **饰品**：细长金色耳坠，末端一颗小金珠；不得增删项链、发饰、眼镜
- **胸前全息**：土星状带环行星 + 同心轨道 + 轨道上的金色小点；下方四角星套圆环的几何纹
- **构图**：正脸、齐眼高度、头肩特写、人物居中
- **背景**：深色虚化 + 细金色弧光 + 轻微粒子 / 光斑

### 1.3 身份锁文件

| 文件 | 规格 | 用途 |
| :--- | :--- | :--- |
| `shared/brand/ai-consultant/identity-lock.png` | 1024×1536，3:4，PNG | I2V / 口型模型的 **第一帧 / 参考图** |

换脸、重绘五官、用另一张 AI 人像「接近即可」——一律视为违规。若必须重出静帧，新图需能逐项通过 §1.2，并升版本号替换本文件。

---

## 2. 运动与镜头（所有成片强制）

| 参数 | 值 | 说明 |
| :--- | :--- | :--- |
| Motion strength | **Low** | 全身几乎静止 |
| Camera movement | **None** | 不推、不拉、不摇、不移、不变焦 |
| Expression strength | **Low** | 只允许极细微眉眼变化 |
| Lip sync | **Natural / Accurate** | 口型跟语音走，开合准确但不夸张 |
| Duration | **6–8 s** | 优先 8 秒；工具只有 5 / 10 档时取更接近且不循环拼贴 |
| FPS | **24–30** | 优先 24 fps |
| 画幅母版 | **3:4** | 再裁 1:1 / 16:9 / 9:16，禁止生成时改构图 |

### 2.1 允许

- 面对镜头，平静、温柔、专业地讲话
- 嘴唇随语音自然开合
- 自然眼神交流，偶尔轻轻眨眼
- 眉毛与眼周极细微的表情
- 头部极小幅度左右轻倾、轻微点头
- 身体稳定，仅保留呼吸起伏
- 长发基本静止，仅极轻微发丝
- 星环 / 光点 / 几何体保持稳定；可有极慢光晕呼吸与微弱粒子闪烁

### 2.2 禁止

- 夸张微笑、大笑、皱眉、惊讶、眨眼过密
- 大幅度转头、耸肩、举手、身体晃动
- 头发大幅飘动或造型变化
- 镜头运动或景别变化
- 背景星环旋转过快、粒子爆发、构图漂移
- 五官变形、换脸、换装、增减饰品
- 画面内烧录字幕、水印、Logo（字幕后期按 VI §8.4 叠加）
- 第二个人、手持道具、走位

---

## 3. 成片流程

本仓库 **不内建** 口型同步模型。成片在外部 I2V / Avatar 工具中完成，输入必须同时包含：

1. 身份锁静帧（§1.3）
2. 本节提示词（中文或英文择一，勿两套叠用造成指令冲突）
3. **语音轨**（口型以音频为准，不以提示词里的台词幻觉为准）

```
身份锁 PNG  +  语音 WAV/MP3  +  提示词
        │
        ▼
  Hedra / Kling Avatar / OmniHuman / HeyGen 等
        │
        ▼
  6–8s 成片  →  §7 验收  →  CMS 媒体库 / 投放
```

无音频时 **不得** 声称「口型准确」。无声需求走 §6.2。

---

## 4. 提示词（直接粘贴）

权威副本在 `shared/brand/ai-consultant/prompts/`。下面与文件同步；若有出入以该目录为准。

### 4.1 中文（Kling / 可灵 / 即梦 等）

```
保持原始人物的身份、脸部结构、发型、服装、饰品、背景和整体构图完全一致。

人物面对镜头，自然地进行一段平静、温柔、专业的讲话。

嘴唇根据语音自然同步开合，口型准确但不要夸张。说话过程中保持自然的眼神交流，偶尔轻轻眨眼，眉毛和眼部产生非常细微的自然表情变化。

头部只有非常轻微的自然移动，可以有极小幅度的左右倾斜和轻微点头。身体基本保持稳定，仅保留非常细微的呼吸起伏。

长发保持自然状态，仅有极轻微的发丝运动。

人物表情始终保持安静、从容、智慧、温和，不要夸张微笑，不要大幅度表情，不要戏剧化动作。

镜头固定，不推拉、不摇晃、不变焦。

背景中的星环、光点和几何元素保持稳定，仅允许非常轻微、缓慢的光晕呼吸和微弱粒子闪烁。

整体效果像一个真实存在的高级 AI 命理顾问正在面对用户讲话。

写实、电影级人像、自然皮肤、真实眼神、自然口型、细腻微表情、稳定面部结构、高一致性。
```

### 4.2 English（Runway / Luma / Hailuo / Hedra prompt box）

```
Lock identity to the first frame. Keep the same face structure, hairstyle, wardrobe, jewelry, background, and centered head-and-shoulders composition.

The woman faces the camera and speaks calmly, gently, and professionally.

Lips sync naturally and accurately to the audio, opening and closing without exaggeration. Maintain natural eye contact, occasional soft blinks, and very subtle brow and eye micro-expressions.

Head motion is tiny only: slight tilts and a faint nod. Body stays still except for a very small breathing rise. Hair stays nearly static, with only the slightest strand movement.

Expression stays quiet, composed, intelligent, and warm. No big smile, no large expressions, no dramatic gestures.

Camera locked: no push, pull, pan, tilt, or zoom.

Golden orbital rings, particles, and geometric holograms stay stable; only a very slow glow breathe and faint particle twinkle are allowed.

Photoreal cinematic portrait of a real senior AI numerology advisor speaking to the viewer. Natural skin, real eyes, stable face, high identity consistency.
```

### 4.3 Negative（各工具 Negative / Avoid 栏）

```
identity change, different face, extra person, big smile, laughter, frowning, wide eyes, dramatic expression, large head turn, camera zoom, camera pan, handheld shake, hair flying, wardrobe change, extra jewelry, morphing face, distorted mouth, over-enunciated lips, glowing eyes, text, subtitles, watermark, logo, cartoon, anime
```

### 4.4 工具参数对照

| 工具栏位 | 取值 |
| :--- | :--- |
| Motion / Movement / CFG 动势 | Low / 最低非 0 档 |
| Camera | None / Static / 无运镜 |
| Expression | Low |
| Lip sync | On，绑定上传音频 |
| Duration | 6–8s（或 8s） |
| FPS | 24 或 25；最高 30 |

Hedra / Kling Avatar：静帧作形象，**音频驱动口型**，提示词只约束表情与头部微动，不要在提示词里再写长台词。

---

## 5. 默认语音（可替换）

口型跟音频。未指定台词时用下列默认（平静女声、语速偏慢、句间留呼吸，约 7 秒）：

> 你好，我是 OraSage 的命理顾问。今晚，我们慢慢把这件事看清楚。

TTS 建议：成熟温柔女声，不要播音腔、不要撒娇腔。品牌名读作 **OraSage**（Ora + Sage）。

替换台词时控制在 **6–8 秒内说完**，不要提速硬塞。语气遵守 VI §8.5：静谧、笃定，不贩卖焦虑。

---

## 6. 变体

### 6.1 对镜头讲话（默认，本规范主体）

有语音 + 口型。用于顾问开场、功能介绍、答疑片头。

### 6.2 无声微动循环（仅 Hero 静音背景）

删除「讲话 / 口型」句，其余约束不变。用于 `HomeHeroVideo` 一类 **muted + loop** 背景。仍须 Low motion、镜头锁死、身份锁。

无声提示词增量：

```
Do not speak. Mouth stays gently closed. Idle portrait with tiny breathing and occasional blinks only.
```

---

## 7. 验收清单

成片必须同时满足：

- [ ] 第一帧与 `identity-lock.png` 为同一人：五官、颊标、发型、服装、耳坠、肩上米色织物
- [ ] 胸前土星全息与下方几何纹仍在，未消失、未换成别的符号
- [ ] 镜头全程锁定，无推拉摇移变焦
- [ ] 口型与音频对齐，开合幅度克制（无声变体则闭口）
- [ ] 无夸张笑、无大幅度表情或肢体
- [ ] 头发无飘动造型变化
- [ ] 背景星环稳定，只有极慢光晕
- [ ] 时长 6–8 秒，24–30 fps
- [ ] 画面内无字幕、无水印、无第二人
- [ ] 循环点（若作 Hero）：首尾头位与表情可接，无跳切

任一项失败：回同一静帧重生成，不要在失败成片上再 I2V。

---

## 8. 交付与存放

| 项 | 规范 |
| :--- | :--- |
| 成片封装 | H.264 MP4，yuv420p，声轨 AAC（无声变体可无音轨） |
| 建议分辨率 | 母版 1080×1620（3:4）；16:9 Hero 从中裁；9:16 社媒从中裁 |
| 音量 | 对讲话峰值约 -6 dBTP，响度约 -16 LUFS |
| 入库 | CMS Media；各站 Hero 仍走现有 `videoUrl` 字段，不在本 PR 改运行时 |
| 文件命名 | `orasage-ai-consultant-talk-{purpose}-v{n}.mp4` |

---

## 9. 关联影响

| 范围 | 本次 | 后续 |
| :--- | :--- | :--- |
| 文档 / 品牌资产 | 新增本规范 + 身份锁 + 提示词 | — |
| main / shop / bazi / ziwei / tarot Hero | **不改代码** | 运营把验收通过的 MP4 填进 CMS Hero |
| 导航 / 登录 / 支付 | 无 | 无 |
| VI §8.1 头像 | 明确禁止用本照片作头像 | 保持 |

---

## 附录 · 版本

| 版本 | 日期 | 变更 |
| :--- | :--- | :--- |
| v1.0 | 2026-08-25 | 初版：身份锁、对镜头讲话提示词、运动参数、验收清单 |
