# AI 命理顾问数字人资产

> 成片规范：[`docs/design-system/ai-consultant-talking-head.md`](../../../docs/design-system/ai-consultant-talking-head.md)
> VI：本人物 **不得** 用作社媒头像 / favicon / App 图标（VI §8.1）。

| 路径 | 内容 |
| :--- | :--- |
| `identity-lock.png` | 对镜头讲话的身份锁静帧（1024×1536，3:4） |
| `silent-idle-3s.mp4` | 3 秒无声微动预览（锁镜头、轻呼吸、光晕；无音轨） |
| `build_silent_idle.py` | 从身份锁重建 `silent-idle-3s.mp4` |
| `prompts/talking-head.zh.txt` | 中文 I2V 提示词 |
| `prompts/talking-head.en.txt` | 英文 I2V 提示词 |
| `prompts/negative.en.txt` | Negative / Avoid |
| `prompts/silent-idle.en.txt` | 无声微动循环（Hero 静音背景） |
| `prompts/params.json` | 时长、帧率、动势等机器可读参数 |

成片在外部口型工具中用本静帧 + 音频 + 提示词生成，验收清单见规范 §7。
