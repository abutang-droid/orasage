# tarot 塔罗应用部署说明

源码已 vendor 进本仓库的 [`tarot/`](../../tarot)（对应
[abutang-droid/tarot-mind](https://github.com/abutang-droid/tarot-mind)），
默认 `native` 自托管模式，不再需要单独拉取外部仓库或反代到未知上游。

`proxy` 模式仅作为历史遗留的回滚选项保留：塔罗此前从未真正上线过反代版本
（一直没有确认过真实上游地址），如果确实需要用这个模式，必须先设置
`TAROT_UPSTREAM_URL`，否则反代服务会拒绝启动。

## 快速部署

```bash
# 本地（需 VPS SSH 密钥），native 自托管（默认）
SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-tarot.sh
```

native 模式部署前，需在 VPS 上准备 `/opt/orasage/tarot/.env`
（参考 [`tarot/.env.example`](../../tarot/.env.example)），至少配置
`DATABASE_URL`（PostgreSQL，`orasage_tarot`）与 `JWT_SECRET`（与 auth-service 共用同一个值）。

## GitHub Actions 配置

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 必填 | 说明 |
|--------|------|------|
| `SSH_PRIVATE_KEY` | 是 | VPS 私钥，完整 PEM |
| `TAROT_UPSTREAM_URL` | 是 | 塔罗现有线上服务真实地址 |
| `SSH_USER` / `SSH_HOST` | 否 | 默认 `ubuntu` / `34.75.40.67` |

排障步骤与 bazi 一致，详见 [`deploy/bazi/README.md`](../bazi/README.md#常见问题)。

## 部署模式

| 模式 | 说明 |
|------|------|
| `native`（默认） | 自托管本仓库 `tarot/` 源码，systemd 常驻，3112 端口 |
| `proxy` | 历史遗留回滚选项，需设置 `TAROT_UPSTREAM_URL` |

## 验证

```bash
curl -s https://tarot.orasage.com/health
```
