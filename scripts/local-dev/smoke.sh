#!/usr/bin/env bash
set -euo pipefail

check() {
  local name="$1" url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" || echo "000")
  if [[ "$code" =~ ^[23] ]]; then
    echo "  OK  $name ($code) $url"
  else
    echo "  FAIL $name ($code) $url"
    return 1
  fi
}

echo "OraSage 本地 smoke test"
fail=0
check auth  "http://127.0.0.1:3101/health" || fail=1
check shop  "http://127.0.0.1:3102/api/health" || fail=1
check main  "http://127.0.0.1:3100/" || fail=1
check admin "http://127.0.0.1:3103/" || fail=1
check cms   "http://127.0.0.1:3120/admin" || fail=1
check bazi  "http://127.0.0.1:3110/" || fail=1
check ziwei "http://127.0.0.1:3111/" || fail=1
check tarot "http://127.0.0.1:3112/" || fail=1

if [ "$fail" -eq 0 ]; then
  echo ""
  echo "全部通过"
else
  echo ""
  echo "部分服务未就绪，请检查 tmux 窗口日志"
  exit 1
fi
