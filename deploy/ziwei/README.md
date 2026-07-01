# ziwei 紫微斗数应用部署说明

源码已 vendor 进本仓库的 [`ziwei/`](../../ziwei)（对应
[abutang-droid/ziwei-doushu](https://github.com/abutang-droid/ziwei-doushu)），
默认 `native` 自托管模式。无数据库依赖；未配置 `JWT_SECRET`/`AUTH_URL` 时保持
纯匿名可用（不影响现有体验）。仍保留 `proxy` 模式作为回滚手段。

## 快速部署

```bash
# 本地（需 VPS SSH 密钥），native 自托管（默认）
SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-ziwei.sh

# 回滚到 proxy 模式
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-ziwei.sh
```

## GitHub Actions 配置

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 必填 | 说明 |
|--------|------|------|
| `SSH_PRIVATE_KEY` | 是 | VPS 私钥，完整 PEM（含 `-----BEGIN ... PRIVATE KEY-----`） |
| `SSH_USER` | 否 | 默认 `ubuntu` |
| `SSH_HOST` | 否 | 默认 `34.75.40.67` |

合并后手动触发 **Deploy Ziwei** workflow，或推送 `deploy/ziwei/**` 变更自动触发。

## 常见问题

排障步骤与 bazi 完全一致（SSH secret 加载、GCP 防火墙 22 端口、IAP 隧道回退），
详见 [`deploy/bazi/README.md`](../bazi/README.md#常见问题)。

## 部署模式

| 模式 | 说明 |
|------|------|
| `native`（默认） | 自托管本仓库 `ziwei/` 源码，systemd 常驻，3111 端口 |
| `proxy` | 回滚：3111 反代到 `api2.lilyfunnlove.com`（迁移前的现有线上服务） |

## 验证

```bash
curl -s https://ziwei.orasage.com/health
```
