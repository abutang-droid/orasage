import { saveProductAction } from '@/app/actions';
import { ProductImageField } from './ProductImageField';
import { ProductI18nFields } from './ProductI18nFields';
import { AdminSubmitButton } from './AdminButton';

const CATEGORIES = [
  { value: 'crystal', label: '水晶手串' },
  { value: 'report', label: '数字报告' },
  { value: 'service', label: '能量咨询' },
] as const;

type ProductInlineEditFormProps = {
  product: {
    sku: string;
    name: string;
    element?: string | null;
    category: string;
    priceCents: number;
    priceCentsUsd?: number | null;
    sortOrder: number;
    active: boolean;
    requiresShipping: boolean;
    desc?: string;
    nameI18n?: Record<string, string> | null;
    descriptionI18n?: Record<string, string> | null;
  };
  imageUrl?: string | null;
  showDescription?: boolean;
  showRequiresShipping?: boolean;
};

export function ProductInlineEditForm({
  product,
  imageUrl,
  showDescription = true,
  showRequiresShipping = true,
}: ProductInlineEditFormProps) {
  return (
    <form action={saveProductAction} className="inline-form" encType="multipart/form-data">
      <input type="hidden" name="isEdit" value="1" />
      <input type="hidden" name="sku" value={product.sku} />
      {/* 行内编辑不改可见性/形态；显式不提交这两项，避免被解析默认成 public/standard */}
      <input type="hidden" name="active_present" value="1" />
      <ProductImageField imageUrl={imageUrl} />
      <input name="name" defaultValue={product.name} required />
      <input name="element" defaultValue={product.element ?? ''} placeholder="五行" />
      <select name="category" defaultValue={product.category}>
        {CATEGORIES.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>
      <input
        name="priceUsdt"
        type="number"
        step="0.01"
        defaultValue={
          product.priceCentsUsd != null
            ? (product.priceCentsUsd / 100).toFixed(2)
            : (product.priceCents / 100 / 7.2).toFixed(2)
        }
        placeholder="价格"
        required
        title="价格（单位见商城→计价）"
      />
      <input name="sortOrder" type="number" defaultValue={product.sortOrder} />
      <label>
        <input name="active" type="checkbox" defaultChecked={product.active} /> 上架
      </label>
      {showRequiresShipping ? (
        <label>
          <input name="requiresShipping" type="checkbox" defaultChecked={product.requiresShipping} /> 需要收货
        </label>
      ) : null}
      {showDescription ? (
        <textarea name="description" rows={2} defaultValue={product.desc ?? ''} required />
      ) : null}
      <ProductI18nFields
        nameI18n={product.nameI18n}
        descriptionI18n={product.descriptionI18n}
      />
      <AdminSubmitButton size="sm">
        保存
      </AdminSubmitButton>
    </form>
  );
}
