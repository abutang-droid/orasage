-- P0-3 / Q7: keep Wishing Well entry; disable paid temple donation SKU.

UPDATE products
SET
  active = false,
  name = '祈愿池 · 支持项目（已停用收款）',
  description = '入口保留，线上收款已关闭。感谢支持。',
  updated_at = NOW()
WHERE sku = 'temple-donation';
