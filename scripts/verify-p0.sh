#!/usr/bin/env bash
# verify-p0.sh — compliance + SEO smoke (doc 25/26). Uses orasage.com bare host (repo canonical).
set -euo pipefail

declare -A urls=(
  [bazi]="https://bazi.orasage.com/"
  [ziwei]="https://ziwei.orasage.com/chart"
  [tarot]="https://tarot.orasage.com/"
  [home_en]="https://orasage.com/en"
  [faq_zh]="https://orasage.com/zh-CN/faq"
  [making_wood]="https://orasage.com/en/origins/the-making/crystal-wood"
  [pdp_wood]="https://shop.orasage.com/product/crystal-wood"
)

echo "=== visible text / disclaimers ==="
for k in "${!urls[@]}"; do
  h=$(curl -sL -A "Mozilla/5.0" "${urls[$k]}")
  body=$(printf '%s' "$h" | python3 -c "import sys,re;print(re.sub(r'<script[\s\S]*?</script>','',sys.stdin.read()))")
  ent=$(printf '%s' "$h" | tr 'A-Z' 'a-z' | grep -o 'entertainment' | wc -l | tr -d ' ')
  ph=$(printf '%s' "$body" | grep -o 'Placeholder' | wc -l | tr -d ' ')
  h1=$(printf '%s' "$body" | python3 -c "import sys,re,html
s=sys.stdin.read()
m=re.search(r'<h1[^>]*>([\s\S]{0,120}?)</h1>',s)
print(html.unescape(re.sub(r'<[^>]+>','',m.group(1))).strip() if m else '(no h1)')")
  printf '%-12s entertainment=%s placeholder=%s h1=%s\n' "$k" "$ent" "$ph" "$h1"
done

echo
echo "=== https redirect + HSTS ==="
curl -sI http://shop.orasage.com | grep -iE '^(HTTP|location)' || true
curl -sI https://shop.orasage.com | grep -i 'strict-transport-security' || echo "HSTS MISSING on shop"

echo
echo "=== bare domain redirect (www → apex in this repo) ==="
curl -sI http://www.orasage.com | grep -iE '^(HTTP|location)' || true

echo
echo "=== Product JSON-LD (crystal-wood) ==="
curl -sL https://shop.orasage.com/product/crystal-wood | grep -o '"@type":"Product"' | head -1 || echo "Product JSON-LD MISSING"

echo
echo "=== bazi sitemap.xml ==="
curl -sI https://bazi.orasage.com/sitemap.xml | grep -iE '^(HTTP|content-type)' || true
curl -sL https://bazi.orasage.com/sitemap.xml | head -5 || echo "bazi sitemap MISSING"

echo
echo "Expect: bazi/ziwei/tarot entertainment>=1; making_wood placeholder=0; http→https 301; Product JSON-LD present; bazi sitemap Content-Type application/xml"
