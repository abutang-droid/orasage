#!/usr/bin/env bash
# 从本地/CI 远程部署到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa SSH_USER=root SSH_HOST=ssh.orasage.com bash deploy/remote-deploy.sh
#
# 生产走 Cloudflare Tunnel（ssh.orasage.com）；GCP 仍可用 SSH_HOST=34.75.40.67。

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/ssh-setup.sh"

setup_ssh_key
test_ssh_connection 3
configure_ssh_transport

SSH="ssh $SSH_OPTS ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS"

log() { echo "[deploy] $*"; }

log "上传部署脚本..."
$SCP "$SCRIPT_DIR/vps-setup.sh" "${SSH_USER}@${SSH_HOST}:/tmp/vps-setup.sh"
$SCP "$SCRIPT_DIR/nginx/orasage.conf" "${SSH_USER}@${SSH_HOST}:/tmp/orasage.conf"

log "在 VPS 上执行部署..."
$SSH "sudo bash /tmp/vps-setup.sh"

log "远程部署完成"
log "验证: curl -I https://auth.orasage.com/health"
