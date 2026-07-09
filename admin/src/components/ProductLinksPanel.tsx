import { saveProductLinksAction } from '@/app/actions';
import { AdminSubmitButton } from './AdminButton';
import type { AdminProductLink } from '@/lib/api';

const LINK_KINDS = [
  { value: 'media', label: '媒体报道' },
  { value: 'review', label: '用户测评' },
  { value: 'article', label: '站内文章' },
  { value: 'internal', label: '站内页面' },
] as const;

const LINK_ROWS = 8;

/** R5：商品关联站内/站外页面（媒体报道、用户测评等） */
export function ProductLinksPanel({ sku, links }: { sku: string; links: AdminProductLink[] }) {
  return (
    <form action={saveProductLinksAction} className="product-links-form">
      <input type="hidden" name="sku" value={sku} />
      <p className="muted" style={{ marginBottom: '0.75rem' }}>
        媒体介绍、用户测评、站内文章等，展示在商品详情页「媒体与用户报道」区块。整体保存（最多 {LINK_ROWS} 条）。
      </p>
      <div className="product-links-grid">
        {Array.from({ length: LINK_ROWS }, (_, i) => {
          const link = links[i];
          return (
            <div key={i} className="product-link-row">
              <label>
                类型
                <select name={`link_kind_${i}`} defaultValue={link?.kind ?? 'media'}>
                  {LINK_KINDS.map((k) => (
                    <option key={k.value} value={k.value}>{k.label}</option>
                  ))}
                </select>
              </label>
              <label>
                标题
                <input name={`link_title_${i}`} defaultValue={link?.title ?? ''} placeholder="XX 杂志：水晶能量指南" />
              </label>
              <label>
                URL
                <input name={`link_url_${i}`} type="url" defaultValue={link?.url ?? ''} placeholder="https://..." />
              </label>
              <label>
                来源（可选）
                <input name={`link_source_${i}`} defaultValue={link?.sourceName ?? ''} placeholder="媒体/作者名" />
              </label>
              <label>
                语言（空=全部）
                <select name={`link_locale_${i}`} defaultValue={link?.locale ?? ''}>
                  <option value="">全部</option>
                  <option value="zh-CN">zh-CN</option>
                  <option value="zh-TW">zh-TW</option>
                  <option value="en">en</option>
                  <option value="pt-BR">pt-BR</option>
                </select>
              </label>
            </div>
          );
        })}
      </div>
      <AdminSubmitButton size="sm">保存关联页面</AdminSubmitButton>
    </form>
  );
}
