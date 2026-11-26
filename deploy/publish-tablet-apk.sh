#!/usr/bin/env bash
# Publish /orasagetablet.apk on the home server (run on the VPS or via SSH).
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
APK_SRC="${1:-$DEPLOY_DIR/android-tablet/releases/orasagetablet.apk}"
WEB_DIR=/var/www/orasage-downloads
SPLIT=/etc/nginx/sites-enabled/orasage-main-tunnel-split

if [ ! -f "$APK_SRC" ]; then
  echo "missing APK: $APK_SRC" >&2
  exit 1
fi

mkdir -p "$WEB_DIR"
cp -f "$APK_SRC" "$WEB_DIR/orasagetablet.apk"
cp -f "$APK_SRC" "$DEPLOY_DIR/main/public/orasagetablet.apk"

if [ -f "$SPLIT" ] && ! grep -q 'location = /orasagetablet.apk' "$SPLIT"; then
  python3 - <<PY
from pathlib import Path
p = Path("$SPLIT")
text = p.read_text()
if "absolute_redirect off" not in text:
    text = text.replace("client_max_body_size 20m;", "client_max_body_size 20m;\n    absolute_redirect off;")
import re
text = re.sub(r"\n\s*# Tablet APK[\s\S]*?(?=\n\s*location / \{)", "\n", text, count=1)
block = """
    # Tablet APK — before Next locale middleware
    location = /orasagetablet.apk {
        alias /var/www/orasage-downloads/orasagetablet.apk;
        default_type application/vnd.android.package-archive;
        add_header Content-Type application/vnd.android.package-archive always;
        add_header Content-Disposition "attachment; filename=\\"orasagetablet.apk\\"" always;
        add_header Cache-Control "no-store" always;
    }
"""
idx = text.find("location / {")
if idx < 0:
    raise SystemExit("missing location / in tunnel-split")
p.write_text(text[:idx] + block + "\n    " + text[idx:])
print("patched", p)
PY
  nginx -t && systemctl reload nginx
fi

echo "LOCAL=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 http://127.0.0.1:3100/orasagetablet.apk || true)"
echo "Ready: https://orasage.com/orasagetablet.apk"
