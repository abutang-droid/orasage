import { saveProductAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';
import { ProductImageField } from './ProductImageField';
import { ProductI18nFields } from './ProductI18nFields';
import { ProductAttributeFields } from './ProductAttributeFields';
import { ProductAttachmentsField } from './ProductAttachmentsField';
import { ProductCmsLinks } from './ProductCmsLinks';
import { ProductEditTabs } from './ProductEditTabs';
import type { AdminProduct } from '@/lib/api';

const CATEGORIES = [
  { value: 'crystal', label: '水晶手串' },
  { value: 'report', label: '数字报告' },
  { value: 'service', label: '能量咨询' },
] as const;

type ProductEditFormProps = {
  product?: AdminProduct | null;
  imageUrl?: string | null;
  pageStatus?: 'published' | 'draft' | 'none';
  mode: 'create' | 'edit';
};

export function ProductEditForm({ product, imageUrl, pageStatus = 'none', mode }: ProductEditFormProps) {
  const isEdit = mode === 'edit';

  return (
    <form action={saveProductAction} className="product-edit-form" encType="multipart/form-data">
      <input type="hidden" name="isEdit" value={isEdit ? '1' : '0'} />
      {isEdit && product ? <input type="hidden" name="sku" value={product.sku} /> : null}

      <ProductEditTabs
        panels={{
          basic: (
            <div className="form-grid">
              {!isEdit ? (
                <label className="full-width">
                  SKU
                  <input name="sku" required placeholder="crystal-wood" />
                </label>
              ) : (
                <p className="full-width muted">
                  SKU：<code>{product?.sku}</code>
                </p>
              )}
              <label>
                名称
                <input name="name" required defaultValue={product?.name ?? ''} placeholder="绿幽灵手串" />
              </label>
              <label>
                分类
                <select name="category" defaultValue={product?.category ?? 'crystal'}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                价格 CNY（元）
                <input
                  name="priceYuan"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={product ? (product.priceCents / 100).toFixed(2) : ''}
                  placeholder="128"
                />
              </label>
              <label>
                价格 USD
                <input
                  name="priceUsd"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={
                    product?.priceCentsUsd ? (product.priceCentsUsd / 100).toFixed(2) : ''
                  }
                  placeholder="17.99"
                />
              </label>
              <label>
                排序
                <input name="sortOrder" type="number" defaultValue={product?.sortOrder ?? 0} />
              </label>
              <label className="checkbox-label">
                <input name="active" type="checkbox" defaultChecked={product?.active ?? true} /> 上架
              </label>
              <label className="checkbox-label">
                <input
                  name="requiresShipping"
                  type="checkbox"
                  defaultChecked={product?.requiresShipping ?? true}
                />{' '}
                需要收货地址（实体发货）
              </label>
              <label className="full-width">
                短描述（列表 / 卡片）
                <textarea
                  name="description"
                  rows={3}
                  required
                  defaultValue={product?.desc ?? ''}
                  placeholder="招财旺运 · 五行补木"
                />
              </label>
            </div>
          ),
          attributes: <ProductAttributeFields product={product} />,
          i18n: (
            <ProductI18nFields
              nameI18n={product?.nameI18n}
              descriptionI18n={product?.descriptionI18n}
              materialI18n={product?.materialI18n}
              colorI18n={product?.colorI18n}
              packagingI18n={product?.packagingI18n}
              showAttributes
            />
          ),
          media: (
            <div className="form-grid">
              <label className="full-width">
                <ProductImageField imageUrl={imageUrl} />
              </label>
              {isEdit && product ? (
                <div className="full-width">
                  <p className="muted" style={{ marginBottom: '0.5rem' }}>
                    详情轮播、场景视频、长文案与精选评价请在 CMS 维护：
                  </p>
                  <ProductCmsLinks sku={product.sku} pageStatus={pageStatus} />
                </div>
              ) : (
                <p className="full-width muted">保存商品后可配置 CMS 详情页与精选评价。</p>
              )}
            </div>
          ),
          attachments: <ProductAttachmentsField attachments={product?.attachments} />,
        }}
      />

      <div className="product-edit-actions">
        <AdminSubmitButton>{isEdit ? '保存商品' : '添加商品'}</AdminSubmitButton>
      </div>
    </form>
  );
}
