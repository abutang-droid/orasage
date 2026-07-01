# bazi 八字应用部署说明

## 快速部署

```bash
# 本地（需 VPS SSH 密钥）
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh
```

## GitHub Actions 配置

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 必填 | 说明 |
|--------|------|------|
| `SSH_PRIVATE_KEY` | 是 | VPS 私钥，完整 PEM（含 `-----BEGIN ... PRIVATE KEY-----`） |
| `SSH_USER` | 否 | 默认 `ubuntu` |
| `SSH_HOST` | 否 | 默认 `34.75.40.67` |

合并后手动触发 **Deploy Bazi** workflow，或推送 `deploy/bazi/**` 变更自动触发。

## 常见问题

### 0. Cloud Agent Secrets 不生效

在 [Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents) 添加 `SSH_PRIVATE_KEY`（类型选 **Runtime Secret**）后，需要 **重新启动 Cloud Agent**（新开一次任务），当前会话不会自动加载新 Secret。

验证（新会话中执行）：

```bash
DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh
```

若 Cloud Agent 网络有限制，需在 Security → Network 中允许访问 `34.75.40.67:22`。

### 1. SSH_PRIVATE_KEY 为空

日志出现 `echo ""` 表示 Secret 未正确配置。检查：
- Secret 名称必须是 `SSH_PRIVATE_KEY`（也支持 `SSH_KEY`、`VPS_SSH_KEY`）
- 值需包含完整私钥，不要加引号
- 确认添加在 **Repository secrets**，不是 Environment

### 2. Connection timed out（GitHub Actions 连不上 22 端口）

GCP 防火墙默认可能只允许特定 IP 访问 SSH。GitHub Actions runner IP 不在白名单内。

**方案 A：临时开放 SSH（最快）**

```bash
gcloud compute firewall-rules create allow-ssh-deploy \
  --direction=INGRESS --action=allow --rules=tcp:22 \
  --source-ranges=0.0.0.0/0 --target-tags=http-server
```

**方案 B：仅允许 IAP 隧道（更安全）**

```bash
gcloud compute firewall-rules create allow-ssh-ingress-from-iap \
  --direction=INGRESS --action=allow --rules=tcp:22 \
  --source-ranges=35.235.240.0/20
```

然后配置 `GCP_SA_KEY` 并使用 IAP 部署（见下方）。

### 3. Permission denied

- 确认 VPS `~/.ssh/authorized_keys` 包含对应公钥
- 公钥：`ssh-keygen -y -f your_private_key`

## 部署模式

| 模式 | 说明 |
|------|------|
| `proxy` | 迁移阶段，3110 代理到 `api1.lilyfunnlove.com` |
| `native` | 自托管，需设置 `BAZI_REPO_URL` |

## 验证: curl -s https://bazi.orasage.com/health
