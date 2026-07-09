import { saveProductAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';
import { ProductImageField } from './ProductImageField';
import { ProductI18nFields } from './ProductI18nFields';
import { ProductAttributeFields } from './ProductAttributeFields';
import { ProductAttachmentsField } from './ProductAttachmentsField';
import { ProductCmsLinks } from './ProductCmsLinks';
import { ProductEditTabs } from './ProductEditTabs';
import { ProductBasicKindFields } from './ProductBasicKindFields';
import type { AdminCategory, AdminProduct, AdminTag, AdminTagGroup } from '@/lib/api';

type TagData = { groups: AdminTagGroup[]; tags: AdminTag[] };

type ProductEditFormProps = {
  product?: AdminProduct | null;
  imageUrl?: string | null;
  pageStatus?: 'published' | 'draft' | 'none';
  mode: 'create' | 'edit';
  tagData: TagData;
  categories: AdminCategory[];
  catalog: AdminProduct[];
};

function TagCheckboxes({ tagData, product }: { tagData: TagData; product?: AdminProduct | null }) {
  const selected = new Set((product?.tags ?? []).map((t) => t.id));
  if (tagData.tags.length === 0) {
    return <p className="muted">尚无标签，请先在「商城 → 标签」中创建。</p>;
  }
  return (
    <div className="product-tag-picker">
      {tagData.groups.map((group) => {
        const groupTags = tagData.tags.filter((t) => t.groupId === group.id && t.active);
        if (groupTags.length === 0) return null;
        return (
          <fieldset key={group.id} className="product-tag-group">
            <legend>{group.labelI18n['zh-CN'] ?? group.code}</legend>
            <div className="product-tag-options">
              {groupTags.map((tag) => (
                <label key={tag.id} className="product-tag-option">
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={selected.has(tag.id)}
                  />
                  {tag.labelI18n['zh-CN'] ?? tag.code}
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}

export function ProductEditForm({
  product,
  imageUrl,
  pageStatus = 'none',
  mode,
  tagData,
  categories,
  catalog,
}: ProductEditFormProps) {
  const isEdit = mode === 'edit';
  const categoryOptions = categories.length > 0
    ? categories
    : [
      { id: 0, code: 'crystal', labelI18n: { 'zh-CN': '水晶手串' }, sortOrder: 0, active: true },
      { id: 1, code: 'report', labelI18n: { 'zh-CN': '数字报告' }, sortOrder: 1, active: true },
      { id: 2, code: 'service', labelI18n: { 'zh-CN': '能量咨询' }, sortOrder: 2, active: true },
    ];

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
                <select name="category" defaultValue={product?.category ?? categoryOptions[0]?.code}>
                  {categoryOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.labelI18n['zh-CN'] ?? c.code}
                    </option>
                  ))}
                </select>
              </label>
              <ProductBasicKindFields product={product} catalog={catalog} />
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
          tags: <TagCheckboxes tagData={tagData} product={product} />,
          i18n: (
            <ProductI18nFields
              nameI18n={product?.nameI18n}
              descriptionI18n={product?.descriptionI18n}
              materialI18n={product?.materialI18n}
              colorI18n={product?.colorI18n}
              packagingI18n={product?.packagingI18n}
              seoTitleI18n={product?.seoTitleI18n}
              seoDescI18n={product?.seoDescI18n}
              showAttributes
              showSeo
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
