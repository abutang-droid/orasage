#!/usr/bin/env bash
# 在本机已登录 gcloud 的情况下，创建一台新的 OraSage GCE 实例。
#
# 用法:
#   GCP_PROJECT=your-project GCP_ZONE=us-east1-b \
#   SSH_PUBKEY="$(cat ~/.ssh/id_rsa.pub)" \
#   bash deploy/gcp/create-instance.sh
#
# 可选环境变量:
#   GCP_PROJECT     — 必填
#   GCP_ZONE        — 默认 us-east1-b
#   INSTANCE_NAME   — 默认 orasage-prod
#   MACHINE_TYPE    — 默认 e2-standard-2（建议生产 e2-standard-4）
#   DISK_SIZE_GB    — 默认 50
#   SSH_PUBKEY      — 写入实例 metadata 的公钥（推荐）
#   NETWORK_TAGS    — 默认 http-server,https-server,orasage-ssh

set -euo pipefail

GCP_PROJECT="${GCP_PROJECT:?请设置 GCP_PROJECT}"
GCP_ZONE="${GCP_ZONE:-us-east1-b}"
INSTANCE_NAME="${INSTANCE_NAME:-orasage-prod}"
MACHINE_TYPE="${MACHINE_TYPE:-e2-standard-2}"
DISK_SIZE_GB="${DISK_SIZE_GB:-50}"
NETWORK_TAGS="${NETWORK_TAGS:-http-server,https-server,orasage-ssh}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log() { echo "[$(date '+%H:%M:%S')] $*"; }

gcloud config set project "$GCP_PROJECT" >/dev/null

# 防火墙：HTTP/HTTPS（多数项目已有 http-server/https-server 标签规则）
gcloud compute firewall-rules describe allow-orasage-ssh --project="$GCP_PROJECT" >/dev/null 2>&1 \
  || gcloud compute firewall-rules create allow-orasage-ssh \
      --project="$GCP_PROJECT" \
      --direction=INGRESS --priority=1000 --network=default \
      --action=ALLOW --rules=tcp:22 \
      --source-ranges=0.0.0.0/0 \
      --target-tags=orasage-ssh \
      --description="OraSage SSH (tighten source-ranges after bootstrap)"

# IAP SSH 回退通道（GitHub Actions / 管理用）
gcloud compute firewall-rules describe allow-ssh-ingress-from-iap --project="$GCP_PROJECT" >/dev/null 2>&1 \
  || gcloud compute firewall-rules create allow-ssh-ingress-from-iap \
      --project="$GCP_PROJECT" \
      --direction=INGRESS --action=ALLOW --rules=tcp:22 \
      --source-ranges=35.235.240.0/20 \
      --description="Allow SSH via IAP"

META_ARGS=()
if [ -n "${SSH_PUBKEY:-}" ]; then
  META_ARGS+=(--metadata=ssh-keys="ubuntu:${SSH_PUBKEY}")
fi
META_ARGS+=(--metadata-from-file=startup-script="${SCRIPT_DIR}/startup-orasage.sh")

if gcloud compute instances describe "$INSTANCE_NAME" --zone="$GCP_ZONE" --project="$GCP_PROJECT" >/dev/null 2>&1; then
  log "实例已存在: $INSTANCE_NAME ($GCP_ZONE)"
else
  log "创建实例 $INSTANCE_NAME ($MACHINE_TYPE @ $GCP_ZONE)..."
  gcloud compute instances create "$INSTANCE_NAME" \
    --project="$GCP_PROJECT" \
    --zone="$GCP_ZONE" \
    --machine-type="$MACHINE_TYPE" \
    --image-family=ubuntu-2204-lts \
    --image-project=ubuntu-os-cloud \
    --boot-disk-size="${DISK_SIZE_GB}GB" \
    --boot-disk-type=pd-balanced \
    --tags="$NETWORK_TAGS" \
    --scopes=cloud-platform \
    "${META_ARGS[@]}"
fi

EXTERNAL_IP="$(gcloud compute instances describe "$INSTANCE_NAME" \
  --zone="$GCP_ZONE" --project="$GCP_PROJECT" \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')"

log "=== 实例就绪 ==="
log "  name: $INSTANCE_NAME"
log "  zone: $GCP_ZONE"
log "  ip:   $EXTERNAL_IP"
log ""
log "下一步:"
log "  1) DNS：把 orasage.com 及全部子域 A 记录指到 $EXTERNAL_IP"
log "  2) 等 startup 完成（约 5–15 分钟）："
log "       gcloud compute ssh $INSTANCE_NAME --zone=$GCP_ZONE --project=$GCP_PROJECT \\"
log "         --command='sudo journalctl -u google-startup-scripts -n 80 --no-pager'"
log "  3) 按 deploy/GCP-REDEPLOY.md 配置 .env 后执行 bootstrap-all-on-vps.sh"
log "  4) 更新 GitHub / Cursor Secrets: SSH_HOST=$EXTERNAL_IP GCP_INSTANCE=$INSTANCE_NAME"
