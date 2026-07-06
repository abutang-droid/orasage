# GitHub Actions 部署 Secrets 配置

Cloud Agent / 本地脚本可直连 VPS，但 **GitHub Actions runner 默认无法访问 `34.75.40.67:22`**（防火墙未对公网开放）。推荐用 **GCP IAP 隧道** 部署。

## 一、在 GitHub 添加 Secrets

打开：**https://github.com/abutang-droid/orasage/settings/secrets/actions**

点击 **New repository secret**，逐项添加：

| Secret 名称 | 必填 | 值 |
|-------------|------|-----|
| `SSH_PRIVATE_KEY` | **是** | 完整 PEM 私钥（含 `-----BEGIN ... PRIVATE KEY-----` 行）。与 VPS `ubuntu` 用户 `authorized_keys` 中公钥配对。公钥指纹应为 `SHA256:J2ZVz9rHVIkEDqRiTTpErlXOtQAKcIyNfyccs4om6cs`（`orasage-deploy`） |
| `SSH_HOST` | 否 | `34.75.40.67`（默认已是此值，可不填） |
| `SSH_USER` | 否 | `ubuntu` |
| `GCP_PROJECT` | IAP 时必填 | `cloudpc-p-f58ae6f00b5c` |
| `GCP_ZONE` | IAP 时必填 | `us-east1-b` |
| `GCP_INSTANCE` | IAP 时必填 | `cloud-pc-cknotproylkasckrer1aejq45` |
| `GCP_SA_KEY` | IAP 时必填 | 见下方「创建 GCP 服务账号」生成的 JSON 全文 |

> **注意**：Cursor Cloud Agent 的 token **无法代写** GitHub Secrets，需仓库管理员在网页上粘贴一次。

## 二、创建 GCP 服务账号（仅需一次）

在 [GCP Cloud Shell](https://console.cloud.google.com/cloudshell) 执行：

```bash
PROJECT=cloudpc-p-f58ae6f00b5c
SA_NAME=github-actions-deploy
SA_EMAIL="${SA_NAME}@${PROJECT}.iam.gserviceaccount.com"

gcloud config set project "$PROJECT"

gcloud iam service-accounts create "$SA_NAME" \
  --display-name="GitHub Actions OraSage Deploy"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iap.tunnelResourceAccessor"

gcloud projects add-iam-policy-binding "$PROJECT" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/compute.viewer"

gcloud compute firewall-rules create allow-ssh-ingress-from-iap \
  --direction=INGRESS --action=allow --rules=tcp:22 \
  --source-ranges=35.235.240.0/20 \
  2>/dev/null || echo "防火墙规则可能已存在"

gcloud iam service-accounts keys create /tmp/gcp-sa-key.json \
  --iam-account="$SA_EMAIL"

echo "===== 将下面 JSON 全文复制为 GitHub Secret: GCP_SA_KEY ====="
cat /tmp/gcp-sa-key.json
```

将输出的 JSON **完整**粘贴到 GitHub Secret `GCP_SA_KEY`。

## 三、验证

1. Actions → **Deploy Core Apps** → **Run workflow**（分支 `main`）
2. 日志应出现 `IAP_SSH_OK` 或 `SSH_OK`，随后 `=== 部署完成 ===`

全量部署：Actions → **Deploy All Apps** → Run workflow。

## 四、Cursor Cloud Agent（可选）

在 [Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents) 添加同名 `SSH_PRIVATE_KEY`（Runtime Secret），新开会话后可直接：

```bash
bash deploy/remote-deploy-all.sh
```

无需 GCP IAP（Agent 网络可直连 VPS）。
