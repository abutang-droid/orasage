const ELEMENTS = ['木', '火', '土', '金', '水'] as const;

type ProductAttributeFieldsProps = {
  product?: {
    element?: string | null;
    material?: string | null;
    color?: string | null;
    weightGrams?: number | null;
    beadDiameterMm?: number | null;
    wristCmMin?: number | null;
    wristCmMax?: number | null;
    lengthMm?: number | null;
    packaging?: string | null;
    category?: string;
  } | null;
};

export function ProductAttributeFields({ product }: ProductAttributeFieldsProps) {
  const isCrystal = !product?.category || product.category === 'crystal';

  return (
    <fieldset className="product-attribute-fields">
      <legend>属性与规格（公制存储，商城按语言自动换算展示）</legend>
      <div className="form-grid">
        <label>
          材质
          <input name="material" defaultValue={product?.material ?? ''} placeholder="天然绿幽灵" />
        </label>
        <label>
          颜色
          <input name="color" defaultValue={product?.color ?? ''} placeholder="绿色 / Green" />
        </label>
        <label>
          五行
          <input
            name="element"
            list="product-element-options"
            defaultValue={product?.element ?? ''}
            placeholder="木（水晶类填写）"
          />
          <datalist id="product-element-options">
            {ELEMENTS.map((el) => (
              <option key={el} value={el} />
            ))}
          </datalist>
        </label>
        <label>
          重量（克）
          <input
            name="weightGrams"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.weightGrams ?? ''}
            placeholder="28"
          />
        </label>
        {isCrystal ? (
          <>
            <label>
              珠径（mm）
              <input
                name="beadDiameterMm"
                type="number"
                min="0"
                step="0.1"
                defaultValue={product?.beadDiameterMm ?? ''}
                placeholder="10"
              />
            </label>
            <label>
              适合腕围最小（cm）
              <input
                name="wristCmMin"
                type="number"
                min="0"
                step="0.1"
                defaultValue={product?.wristCmMin ?? ''}
                placeholder="15"
              />
            </label>
            <label>
              适合腕围最大（cm）
              <input
                name="wristCmMax"
                type="number"
                min="0"
                step="0.1"
                defaultValue={product?.wristCmMax ?? ''}
                placeholder="19"
              />
            </label>
            <label>
              链长（mm）
              <input
                name="lengthMm"
                type="number"
                min="0"
                step="1"
                defaultValue={product?.lengthMm ?? ''}
                placeholder="180"
              />
            </label>
          </>
        ) : null}
        <label className="full-width">
          包装说明
          <textarea
            name="packaging"
            rows={2}
            defaultValue={product?.packaging ?? ''}
            placeholder="绒布袋 + 能量卡 + 礼盒（可选）"
          />
        </label>
      </div>
    </fieldset>
  );
}
