#!/usr/bin/env bash
# 从本地/CI 远程部署 ziwei 到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-ziwei.sh
#   DEPLOY_MODE=proxy bash deploy/remote-deploy-ziwei.sh
#   DEPLOY_MODE=native ZIWEI_REPO_URL=https://github.com/... bash deploy/remote-deploy-ziwei.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/ssh-setup.sh"

DEPLOY_MODE="${DEPLOY_MODE:-native}"
ORASAGE_REF="${ORASAGE_REF:-main}"

log() { echo "[deploy-ziwei] $*"; }

setup_ssh_key
test_ssh_connection 3
configure_ssh_transport

SSH="ssh $SSH_OPTS ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS"

# deploy-ziwei.sh 会自行 clone/pull 完整 orasage 仓库到 VPS 上的 $DEPLOY_DIR，
# 这里只需把脚本本体传上去启动即可（native 模式不再依赖单独打包的 deploy/ziwei 目录）。
log "上传 ziwei 部署脚本..."
$SCP "$SCRIPT_DIR/ziwei/deploy-ziwei.sh" "${SSH_USER}@${SSH_HOST}:/tmp/deploy-ziwei.sh"

log "在 VPS 上执行部署（模式: $DEPLOY_MODE）..."
$SSH "sudo DEPLOY_MODE='$DEPLOY_MODE' ORASAGE_REF='$ORASAGE_REF' ZIWEI_UPSTREAM_URL='${ZIWEI_UPSTREAM_URL:-https://api2.lilyfunnlove.com}' bash /tmp/deploy-ziwei.sh"

log "远程部署完成"
log "验证: curl -sI https://ziwei.orasage.com"
