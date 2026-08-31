#!/usr/bin/env bash
# verify-p0.sh — strip <script>, count visible Entertainment / Placeholder, sample H1
# Doc 20 §7. Domains use orasage.com (no www) to match this repo.
set -euo pipefail

declare -A urls=(
  [bazi]="https://bazi.orasage.com/"
  [ziwei]="https://ziwei.orasage.com/chart"
  [tarot]="https://tarot.orasage.com/"
  [home_en]="https://orasage.com/en"
  [making_wood]="https://orasage.com/en/origins/the-making/crystal-wood"
)

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
echo "Expect: bazi/ziwei/tarot entertainment>=1; making_wood placeholder=0; home_en h1 English"
