#!/usr/bin/env bash
# 安全加载 .env（避免 JWT_SECRET / 密码中的 $ 触发 set -u 报错）
load_dotenv() {
  local file="${1:-.env}"
  [ -f "$file" ] || return 0
  set -a
  set +u
  # shellcheck disable=SC1090
  source "$file"
  set -u
  set +a
}
