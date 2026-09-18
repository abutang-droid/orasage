# 绿水晶短视频（Orico Cosmos）

根据 `SCRIPT.md` 分镜生成的 9:16 竖屏短视频。

## 成片

- **社交版（推荐上传）**: `green-crystal-orico-cosmos-social.mp4`（约 34 秒，1080×1920）
- 高码率母版见 Cloud Agent artifacts：`green-crystal-orico-cosmos.mp4`

## 重建

```bash
# 需已安装 ffmpeg、edge-tts，且 shot*.png 与 n*.mp3 已就绪
python3 build_video.py
# 再压一版社交码率：
ffmpeg -y -i green-crystal-orico-cosmos.mp4 -c:v libx264 -crf 23 -c:a aac -b:a 128k -movflags +faststart green-crystal-orico-cosmos-social.mp4
```

旁白：edge-tts `zh-CN-XiaoxiaoNeural`；配乐为脚本合成的 ambient drone + 片尾水晶共鸣。
