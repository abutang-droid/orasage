#!/usr/bin/env bash
# 从本地/Cloud Agent/CI 远程一键部署全部 App 到 VPS
#
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-all.sh
#   ORASAGE_REF=cursor/consolidate-platform-02ec bash deploy/remote-deploy-all.sh
#   FORTUNE_MODE=proxy bash deploy/remote-deploy-all.sh   # 命理 App 先用 proxy
#
# 环境变量:
#   SSH_PRIVATE_KEY / VPS_SSH_KEY / SSH_KEY — SSH 私钥
#   SSH_USER / SSH_HOST / SSH_PORT          — 默认 ubuntu@34.75.40.67:22
#   ORASAGE_REF                             — git 分支（默认 main）
#   FORTUNE_MODE                            — native | proxy（默认 native）
#   SKIP_CMS                                — 1 跳过 cms
#   GCP_IAP_PROXY_COMMAND                   — GCP IAP 隧道（GitHub Actions 用）

#   NGINX_SITE                              — orasage | oricosmos（默认 orasage）

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/ssh-setup.sh"

ORASAGE_REF="${ORASAGE_REF:-main}"
FORTUNE_MODE="${FORTUNE_MODE:-native}"
SKIP_CMS="${SKIP_CMS:-0}"
NGINX_SITE="${NGINX_SITE:-orasage}"

log() { echo "[deploy-all] $*"; }

setup_ssh_key
test_ssh_connection 3

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_PORT="${SSH_PORT:-22}"
configure_ssh_transport

SSH="ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS -P $SSH_PORT"

log "上传 bootstrap 脚本..."
$SCP "$SCRIPT_DIR/bootstrap-all-on-vps.sh" "${SSH_USER}@${SSH_HOST}:/tmp/bootstrap-all-on-vps.sh"

log "在 VPS 上执行全量部署 (ref=$ORASAGE_REF, fortune=$FORTUNE_MODE)..."
$SSH "sudo ORASAGE_REF='$ORASAGE_REF' FORTUNE_MODE='$FORTUNE_MODE' SKIP_CMS='$SKIP_CMS' \
  DEPLOY_DIR='/opt/orasage' bash /tmp/bootstrap-all-on-vps.sh"

log "远程全量部署完成"
log "验证: curl -sI https://orasage.com https://bazi.orasage.com https://admin.orasage.com"
