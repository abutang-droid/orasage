import json, os

path = os.path.join(os.path.dirname(__file__), "..", "fatemaster_tarot_knowledge.json")
with open(path) as f:
    data = json.load(f)

elem_map = {"wands": "火", "cups": "水", "swords": "风", "pentacles": "土"}

for c in data["cards"]:
    suit = c.get("suit", "")
    expected = elem_map.get(suit, "")
    if expected and c.get("element") != expected:
        c["element"] = expected

with open(path, "w") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

# Verify
for c in data["cards"]:
    suit = c.get("suit", "")
    expected = elem_map.get(suit, "")
    if expected and c.get("element") != expected:
        print(f"  MISMATCH: {c['name']} suit={suit} element={c.get('element')} expected={expected}")

print(f"Total: {len(data['cards'])} cards, elements fixed")
