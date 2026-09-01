#!/usr/bin/env bash
# 共享 SSH 密钥加载逻辑（Cloud Agent / GitHub Actions / 本地）
# 用法: source deploy/lib/ssh-setup.sh && setup_ssh_key
#
# Cloudflare Tunnel（家用生产机）:
#   设置 SSH_HOST=ssh.orasage.com（或 SSH_TUNNEL_HOSTNAME）且 SSH_USER=root；
#   脚本会自动 cloudflared access tcp → localhost:2222，勿直连 hostname:22。
#   详见 docs/AGENT-RULES.md § 生产部署与 SSH。

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

# 是否走 Cloudflare Tunnel（cloudflared access tcp，非直连 :22）
ssh_should_use_cloudflare_tunnel() {
  if [ "${SSH_USE_CLOUDFLARE_TUNNEL:-}" = "1" ]; then
    return 0
  fi
  if [ "${SSH_USE_CLOUDFLARE_TUNNEL:-}" = "0" ]; then
    return 1
  fi
  if [ -n "${SSH_TUNNEL_HOSTNAME:-}" ]; then
    return 0
  fi
  case "${SSH_HOST:-}" in
    ssh.*|*.cf-tunnel|*.cloudflare-tunnel)
      return 0
      ;;
  esac
  return 1
}

resolve_tunnel_hostname() {
  if [ -n "${SSH_TUNNEL_HOSTNAME:-}" ]; then
    printf '%s' "$SSH_TUNNEL_HOSTNAME"
    return 0
  fi
  case "${SSH_HOST:-}" in
    ssh.*|*.cf-tunnel|*.cloudflare-tunnel)
      printf '%s' "$SSH_HOST"
      return 0
      ;;
  esac
  return 1
}

_cf_tunnel_port_listening() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn 2>/dev/null | grep -q ":${port} "
    return $?
  fi
  (echo >/dev/tcp/127.0.0.1/"$port") >/dev/null 2>&1
}

ensure_cloudflared_tunnel() {
  local hostname="$1"
  local port="${CF_TUNNEL_LOCAL_PORT:-2222}"
  local pid_file="${HOME}/.ssh/cf-tunnel.pid"
  local log_file="${HOME}/.ssh/cf-tunnel.log"

  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "[ssh] ERROR: 需要 cloudflared 才能通过 Cloudflare Tunnel SSH（${hostname}）" >&2
    echo "[ssh]   安装 cloudflared，或设置 SSH_USE_CLOUDFLARE_TUNNEL=0 并改用直连 IP" >&2
    return 1
  fi

  if _cf_tunnel_port_listening "$port"; then
    echo "[ssh] cloudflared listener already on localhost:${port}"
    return 0
  fi

  if [ -f "$pid_file" ]; then
    local old_pid
    old_pid="$(cat "$pid_file" 2>/dev/null || true)"
    if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
      echo "[ssh] waiting for cloudflared (pid ${old_pid}) on localhost:${port}..."
      local i=0
      while [ "$i" -lt 15 ]; do
        if _cf_tunnel_port_listening "$port"; then
          return 0
        fi
        sleep 1
        i=$((i + 1))
      done
    fi
  fi

  echo "[ssh] starting cloudflared access tcp --hostname ${hostname} -> localhost:${port}"
  nohup cloudflared access tcp \
    --hostname "$hostname" \
    --url "localhost:${port}" \
    >>"$log_file" 2>&1 &
  echo $! >"$pid_file"

  local i=0
  while [ "$i" -lt 20 ]; do
    if _cf_tunnel_port_listening "$port"; then
      echo "[ssh] cloudflared tunnel ready (${hostname} -> 127.0.0.1:${port})"
      return 0
    fi
    sleep 1
    i=$((i + 1))
  done

  echo "[ssh] ERROR: cloudflared 未在 localhost:${port} 就绪，见 ${log_file}" >&2
  return 1
}

configure_ssh_transport() {
  SSH_USER="${SSH_USER:-ubuntu}"
  SSH_HOST="${SSH_HOST:-34.75.40.67}"
  SSH_PORT="${SSH_PORT:-22}"
  SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=20 -o BatchMode=yes"

  if [ -n "${SSH_KEY:-}" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
  fi

  if ssh_should_use_cloudflare_tunnel; then
    local tunnel_hostname
    tunnel_hostname="$(resolve_tunnel_hostname)" || {
      echo "[ssh] ERROR: Cloudflare Tunnel 已启用但未找到 SSH_TUNNEL_HOSTNAME 或 ssh.* 形式的 SSH_HOST" >&2
      return 1
    }
    SSH_TUNNEL_ENDPOINT="${tunnel_hostname}"
    ensure_cloudflared_tunnel "$tunnel_hostname" || return 1
    SSH_REAL_HOST="${SSH_HOST}"
    SSH_HOST="127.0.0.1"
    SSH_PORT="${CF_TUNNEL_LOCAL_PORT:-2222}"
    echo "[ssh] Cloudflare Tunnel mode: ${SSH_TUNNEL_ENDPOINT} -> ${SSH_HOST}:${SSH_PORT} (user=${SSH_USER})"
  fi

  if [ -n "${GCP_IAP_PROXY_COMMAND:-}" ]; then
    SSH_OPTS="$SSH_OPTS -o ProxyCommand='$GCP_IAP_PROXY_COMMAND'"
  fi

  ssh-keyscan -H "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true
}

test_ssh_connection() {
  local max_attempts="${1:-3}"
  local attempt
  configure_ssh_transport
  for attempt in $(seq 1 "$max_attempts"); do
    if ssh $SSH_OPTS -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "echo SSH_OK"; then
      return 0
    fi
    if [ "$attempt" -eq "$max_attempts" ]; then
      if [ -n "${SSH_TUNNEL_ENDPOINT:-}" ]; then
        echo "[ssh] ERROR: 无法经 Cloudflare Tunnel SSH 到 ${SSH_TUNNEL_ENDPOINT}（${SSH_USER}@${SSH_HOST}:${SSH_PORT}）" >&2
      else
        echo "[ssh] ERROR: 无法 SSH 到 ${SSH_HOST}:${SSH_PORT}" >&2
      fi
      return 1
    fi
    echo "[ssh] 连接失败，${attempt}/${max_attempts} 次重试..."
    sleep 5
  done
}
