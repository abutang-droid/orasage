#!/usr/bin/env bash
# 从本地/CI 远程部署 bazi 到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-bazi.sh
#   DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh
#   DEPLOY_MODE=native BAZI_REPO_URL=https://github.com/... bash deploy/remote-deploy-bazi.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/ssh-setup.sh"

DEPLOY_MODE="${DEPLOY_MODE:-native}"
ORASAGE_REF="${ORASAGE_REF:-main}"

log() { echo "[deploy-bazi] $*"; }

setup_ssh_key
test_ssh_connection 3
configure_ssh_transport

SSH="ssh $SSH_OPTS ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS"

# deploy-bazi.sh 会自行 clone/pull 完整 orasage 仓库到 VPS 上的 $DEPLOY_DIR，
# 这里只需把脚本本体传上去启动即可（native 模式不再依赖单独打包的 deploy/bazi 目录）。
log "上传 bazi 部署脚本..."
$SCP "$SCRIPT_DIR/bazi/deploy-bazi.sh" "${SSH_USER}@${SSH_HOST}:/tmp/deploy-bazi.sh"

log "在 VPS 上执行部署（模式: $DEPLOY_MODE）..."
$SSH "sudo DEPLOY_MODE='$DEPLOY_MODE' ORASAGE_REF='$ORASAGE_REF' BAZI_UPSTREAM_URL='${BAZI_UPSTREAM_URL:-https://api1.lilyfunnlove.com}' bash /tmp/deploy-bazi.sh"

log "远程部署完成"
log "验证: curl -sI https://bazi.orasage.com"
