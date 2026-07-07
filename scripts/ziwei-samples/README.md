# 紫微 51 万样本库 — 运维与 AI 优化

## 目录结构（VPS，不入 Git）

```
/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit/
├── samples-out/year-YYYY/YYYY-MM.jsonl.gz   # 720 行/月
└── samples-index.sqlite                     # 可选，build-sqlite-index 生成
```

## 下载与校验

```bash
bash deploy/remote-download-ziwei-samples.sh   # 远程下载
node scripts/ziwei-samples/verify-index.mjs    # 完整性校验
```

## SQLite 索引（Phase B，加速冷启动）

全量构建约需数分钟，一次性执行：

```bash
ZIWEI_SAMPLES_DIR=/opt/orasage/data/ziwei-samples/ziwei-samples-toolkit \
  node scripts/ziwei-samples/build-sqlite-index.mjs
```

`deploy/ziwei/deploy-ziwei.sh` 会在检测到 `samples-out` 时自动设置 `ZIWEI_SAMPLES_DIR`；索引文件存在时 `lookup.ts` 自动优先读 SQLite。

## 环境变量（ziwei/.env）

| 变量 | 默认 | 说明 |
|------|------|------|
| `ZIWEI_SAMPLES_DIR` | VPS 路径 | 样本根目录 |
| `ZIWEI_SAMPLES_INDEX` | `$DIR/samples-index.sqlite` | SQLite 索引 |
| `ZIWEI_SAMPLES_ENABLED` | 开启 | `false` 关闭注入 |
| `ZIWEI_SAMPLES_MAX_TOPIC_CHARS` | 800 | 单主题截断 |
| `ZIWEI_SAMPLES_MAX_CONTEXT_CHARS` | 6000 | 总上下文截断 |
| `ZIWEI_PREVIEW_LLM` | 关闭 | `true` 预览走 LLM 润色 |
| `ZIWEI_CLASSICS_RAG` | 开启 | `false` 关闭古籍引用 |

## 评估快照（Phase C）

```bash
cd ziwei && npm run eval:prompt
EVAL_WRITE=1 npm run eval:prompt   # 写入 ziwei/lib/samples/eval-snapshots/latest.json
# 或从仓库根目录：
node scripts/ziwei-samples/eval-prompt-context.mjs
```

固定命例见 `ziwei/lib/samples/eval-fixtures.ts`。

## 微调数据导出（可选，未自动执行）

518k 样本的 `topics` 字段已是倪海厦体系结构化断语，可按 `(chart JSON, topics)` 对导出为 JSONL 供 SFT：

```bash
# 示例：单月导出（需 VPS 上 samples-out）
zcat samples-out/year-1955/1955-03.jsonl.gz | head -5
```

每行结构：`{ birthInfo, chart, system, topics }`。建议：

1. 按主题拆分为 instruction/input/output 三元组
2. 混入 5–10% 人工校对样本防过拟合照抄
3. 保留 `system` 字段标识「倪海厦紫微」口径

本仓库不提交训练数据或模型权重；仅在 VPS 侧按需导出。
