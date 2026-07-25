-- DIY beads: multi-language name / material (mirrors products *_i18n jsonb)
ALTER TABLE diy_beads ADD COLUMN IF NOT EXISTS name_i18n jsonb;
ALTER TABLE diy_beads ADD COLUMN IF NOT EXISTS material_i18n jsonb;

UPDATE diy_beads SET
  name_i18n = jsonb_build_object('zh-CN', name),
  material_i18n = jsonb_build_object('zh-CN', material)
WHERE name_i18n IS NULL;
