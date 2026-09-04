#!/usr/bin/env bash
# 共享 SSH 密钥加载逻辑（Cloud Agent / GitHub Actions / 本地）
# 用法: source deploy/lib/ssh-setup.sh && setup_ssh_key
#
# Cloudflare Tunnel（家用生产机）:
#   SSH_HOST=ssh.orasage.com 且 SSH_USER=root 时，使用
#   `cloudflared access ssh --hostname` 作为 ProxyCommand，勿直连 hostname:22。
#   ProxyCommand 写进 ~/.ssh/config.orasage-deploy，避免 `ssh $SSH_OPTS`
#   词法切分把带空格的 -o ProxyCommand=... 拆碎。
#   详见 docs/AGENT-RULES.md § 生产环境与 SSH。

resolve_ssh_key_material() {
  if [ -n "${SSH_PRIVATE_KEY:-}" ]; then
    printf '%s' "$SSH_PRIVATE_KEY"
  elif [ -n "${VPS_SSH_KEY:-}" ]; then
    printf '%s' "$VPS_SSH_KEY"
  elif [ -n "${SSH_KEY:-}" ] && [ -f "${SSH_KEY}" ]; then
    cat "$SSH_KEY"
  elif [ -n "${SSH_KEY:-}" ] && grep -q 'BEGIN.*PRIVATE KEY' <<<"$SSH_KEY"; then
    printf '%s' "$SSH_KEY"
  else
    return 1
  fi
}

wait_for_ssh_secret() {
  local i=0
  while [ "$i" -lt 30 ]; do
    resolve_ssh_key_material >/dev/null 2>&1 && return 0
    sleep 1
    i=$((i + 1))
  done
  return 1
}

setup_ssh_key() {
  if [ -n "${SSH_KEY:-}" ] && [ -f "${SSH_KEY}" ]; then
    return 0
  fi

  wait_for_ssh_secret || true
  local key_material
  key_material="$(resolve_ssh_key_material)" || {
    echo "[ssh] ERROR: 未找到 SSH 私钥" >&2
    echo "[ssh]   Cloud Agent: Dashboard → Secrets 添加 SSH_PRIVATE_KEY（Runtime Secret）后重新启动 Agent" >&2
    echo "[ssh]   GitHub Actions: 仓库 Secrets 添加 SSH_PRIVATE_KEY" >&2
    echo "[ssh]   本地: SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-all.sh" >&2
    return 1
  }

  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  printf '%s\n' "$key_material" | tr -d '\r' > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key
  if ! grep -q 'BEGIN.*PRIVATE KEY' ~/.ssh/deploy_key; then
    echo "[ssh] ERROR: SSH 私钥格式不正确，需包含 -----BEGIN ... PRIVATE KEY-----" >&2
    return 1
  fi
  SSH_KEY=~/.ssh/deploy_key
  echo "[ssh] key loaded ($(wc -c < ~/.ssh/deploy_key) bytes)"
  return 0
}

# 是否走 Cloudflare Tunnel（cloudflared access ssh，非直连 :22）
ssh_should_use_cloudflare_tunnel() {
  if [ "${SSH_USE_CLOUDFLARE_TUNNEL:-}" = "1" ]; then
    return 0
  fi
  if [ "${SSH_USE_CLOUDFLARE_TUNNEL:-}" = "0" ]; then
    return 1
  fi
  case "${SSH_HOST:-}" in
    ssh.*)
      return 0
      ;;
  esac
  return 1
}

ensure_cloudflared() {
  if command -v cloudflared >/dev/null 2>&1; then
    return 0
  fi
  local candidate
  for candidate in "${HOME}/.local/bin/cloudflared" /tmp/cloudflared; do
    if [ -x "$candidate" ]; then
      export PATH="$(dirname "$candidate"):${PATH}"
      return 0
    fi
  done
  local dest="${HOME}/.local/bin/cloudflared"
  echo "[ssh] installing cloudflared to ${dest}"
  mkdir -p "${HOME}/.local/bin"
  curl -fsSL -o "$dest" https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
  chmod +x "$dest"
  export PATH="${HOME}/.local/bin:$PATH"
  command -v cloudflared >/dev/null 2>&1
}

configure_ssh_transport() {
  SSH_USER="${SSH_USER:-ubuntu}"
  SSH_HOST="${SSH_HOST:-34.75.40.67}"
  SSH_PORT="${SSH_PORT:-22}"

  mkdir -p ~/.ssh
  chmod 700 ~/.ssh

  local use_tunnel=0
  local cf_bin=""
  if ssh_should_use_cloudflare_tunnel; then
    ensure_cloudflared || {
      echo "[ssh] ERROR: 需要 cloudflared 才能经 Cloudflare Tunnel SSH（${SSH_HOST}）" >&2
      return 1
    }
    cf_bin="$(command -v cloudflared)"
    use_tunnel=1
  fi

  local cfg="${HOME}/.ssh/config.orasage-deploy"
  {
    echo "Host ${SSH_HOST}"
    echo "  HostName ${SSH_HOST}"
    echo "  User ${SSH_USER}"
    echo "  Port ${SSH_PORT}"
    echo "  StrictHostKeyChecking no"
    echo "  UserKnownHostsFile ${HOME}/.ssh/known_hosts"
    echo "  BatchMode yes"
    echo "  ConnectTimeout 20"
    echo "  IdentitiesOnly yes"
    if [ -n "${SSH_KEY:-}" ]; then
      echo "  IdentityFile ${SSH_KEY}"
    fi
    if [ "$use_tunnel" = "1" ]; then
      echo "  AddressFamily inet"
      echo "  ProxyCommand ${cf_bin} access ssh --hostname %h"
    elif [ -n "${GCP_IAP_PROXY_COMMAND:-}" ]; then
      echo "  ProxyCommand ${GCP_IAP_PROXY_COMMAND}"
    fi
  } > "$cfg" || return 1
  chmod 600 "$cfg"

  if ssh_should_use_cloudflare_tunnel; then
    echo "[ssh] Cloudflare Tunnel mode: cloudflared access ssh → ${SSH_USER}@${SSH_HOST}"
  elif [ -n "${GCP_IAP_PROXY_COMMAND:-}" ]; then
    echo "[ssh] GCP IAP ProxyCommand enabled"
  else
    ssh-keyscan -H "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true
  fi

  # 单 token -F <file>：调用方用 `ssh $SSH_OPTS` 时不会把 ProxyCommand 拆碎。
  SSH_OPTS="-F ${cfg}"
}

test_ssh_connection() {
  local max_attempts="${1:-3}"
  local attempt
  configure_ssh_transport || return 1
  for attempt in $(seq 1 "$max_attempts"); do
    if ssh $SSH_OPTS "${SSH_USER}@${SSH_HOST}" "echo SSH_OK"; then
      return 0
    fi
    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "[ssh] ERROR: 无法 SSH 到 ${SSH_USER}@${SSH_HOST}:${SSH_PORT}" >&2
      return 1
    fi
    echo "[ssh] 连接失败，${attempt}/${max_attempts} 次重试..."
    sleep 5
  done
}
