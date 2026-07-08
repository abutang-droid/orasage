-- Product localized name/description (T1: zh-CN, zh-TW, en, pt-BR)
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_i18n jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description_i18n jsonb;
