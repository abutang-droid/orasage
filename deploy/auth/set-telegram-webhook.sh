#!/usr/bin/env bash
# 配置 Telegram Bot Webhook → auth.orasage.com（IM 双向桥接）
#
# 用法（VPS）:
#   set -a && source /opt/orasage/.env && set +a
#   bash /opt/orasage/deploy/auth/set-telegram-webhook.sh
#
# 可选:
#   TELEGRAM_WEBHOOK_URL     默认 https://auth.orasage.com/api/telegram/webhook
#   TELEGRAM_WEBHOOK_SECRET  若已配置则写入 secret_token

set -euo pipefail

TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TOKEN="${TOKEN//“/}"
TOKEN="${TOKEN//”/}"
TOKEN="${TOKEN//‘/}"
TOKEN="${TOKEN//’/}"
TOKEN="${TOKEN#\"}"
TOKEN="${TOKEN%\"}"
TOKEN="${TOKEN#\'}"
TOKEN="${TOKEN%\'}"
TOKEN="${TOKEN#bot}"
TOKEN="${TOKEN#Bot}"
TOKEN="$(printf '%s' "$TOKEN" | tr -d '\r\n')"

if [ -z "$TOKEN" ]; then
  echo "缺少 TELEGRAM_BOT_TOKEN" >&2
  exit 1
fi

URL="${TELEGRAM_WEBHOOK_URL:-https://auth.orasage.com/api/telegram/webhook}"
SECRET="${TELEGRAM_WEBHOOK_SECRET:-}"

echo "[tg-webhook] getMe..."
curl -fsS "https://api.telegram.org/bot${TOKEN}/getMe"
echo

python3 - "$URL" "$SECRET" >/tmp/tg-webhook-payload.json <<'PY'
import json, sys
url, secret = sys.argv[1], sys.argv[2]
payload = {
    "url": url,
    "allowed_updates": ["message"],
    "drop_pending_updates": True,
}
if secret.strip():
    payload["secret_token"] = secret.strip()
json.dump(payload, open("/tmp/tg-webhook-payload.json", "w"))
print(json.dumps(payload))
PY

echo "[tg-webhook] setWebhook → $URL"
curl -fsS -X POST "https://api.telegram.org/bot${TOKEN}/setWebhook" \
  -H 'Content-Type: application/json' \
  -d @"/tmp/tg-webhook-payload.json"
echo
echo "[tg-webhook] getWebhookInfo"
curl -fsS "https://api.telegram.org/bot${TOKEN}/getWebhookInfo"
echo
rm -f /tmp/tg-webhook-payload.json
