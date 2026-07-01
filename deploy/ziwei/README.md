# ziwei 紫微斗数应用部署说明

## 快速部署

```bash
# 本地（需 VPS SSH 密钥）
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
| `proxy` | 迁移阶段，3111 代理到 `api2.lilyfunnlove.com`（现有紫微线上服务） |
| `native` | 自托管，需设置 `ZIWEI_REPO_URL` 指向真实的紫微应用源码仓库；该仓库当前尚未创建/提供，**在拿到源码地址前请勿使用 native 模式** |

## 验证

```bash
curl -s https://ziwei.orasage.com/health
```
