import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminUser, getAdminToken, loginUrl } from '@/lib/auth';
import { getProducts } from '@/lib/api';
import {
  getCmsProductPageDoc,
  listCmsTestimonials,
  type CmsProductPageDoc,
  type CmsTestimonialDoc,
} from '@/lib/cms-content-api';
import {
  saveProductPageContentAction,
  saveTestimonialAction,
  deleteTestimonialAction,
} from '@/app/content-actions';
import { PdpSectionsEditor, type EditorSection } from '@/components/PdpSectionsEditor';
import { ProductHeroGalleryEditor } from '@/components/ProductHeroGalleryEditor';
import { ProductVideoUploadField } from '@/components/ProductVideoUploadField';
import { AdminSubmitButton } from '@/components/AdminButton';
import { resolveCmsMediaUrl } from '@/lib/cms-media-utils';

const LOCALES = [
  { code: 'zh-CN', label: '简体' },
  { code: 'zh-TW', label: '繁體' },
  { code: 'en', label: 'English' },
  { code: 'pt-BR', label: 'Português' },
] as const;

const HERO_ROWS = 6;

function docSections(doc: CmsProductPageDoc | null): EditorSection[] {
  return (doc?.sections ?? []).map((s) => ({
    type: s.type,
    title: s.title ?? undefined,
    body: s.body ?? undefined,
    quote: s.quote ?? undefined,
    attribution: s.attribution ?? undefined,
    specItems: s.specItems ?? undefined,
    faqItems: s.faqItems ?? undefined,
    relatedSkus: s.relatedSkus?.map((r) => r.sku) ?? undefined,
  }));
}

type PageProps = {
  params: Promise<{ sku: string }>;
  searchParams?: Promise<{ locale?: string; saved?: string; err?: string }>;
};

export default async function ProductContentPage({ params, searchParams }: PageProps) {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const { sku: rawSku } = await params;
  const sku = decodeURIComponent(rawSku);
  const sp = (await searchParams) ?? {};
  const locale = LOCALES.some((l) => l.code === sp.locale) ? sp.locale! : 'zh-CN';

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/products/content]', err);
  }
  const product = products.find((p) => p.sku === sku);
  if (!product) notFound();

  let doc: CmsProductPageDoc | null = null;
  let testimonials: CmsTestimonialDoc[] = [];
  try {
    [doc, testimonials] = await Promise.all([
      getCmsProductPageDoc(sku, locale, token),
      listCmsTestimonials(sku, locale, token),
    ]);
  } catch (err) {
    console.error('[admin/products/content cms]', err);
  }

  const heroRows = (doc?.heroImages ?? []).slice(0, HERO_ROWS).map((row) => ({
    mediaId: typeof row.image === 'number' ? row.image : row.image?.id,
    url: resolveCmsMediaUrl(row.image),
    alt: row.alt ?? '',
    sort: row.sort ?? 0,
  }));

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted">
          <Link href="/products">← 商品列表</Link>
          {' · '}
          <Link href={`/products/${encodeURIComponent(sku)}/edit`}>基础信息编辑</Link>
        </p>
        <h1>详情内容 · {product.name}</h1>
        <p className="muted">
          SKU <code>{sku}</code> · 每个语言独立一份文档，前台缺失语言自动回退简体。
          发布后约 30 秒内商城生效。
          <a
            href={`https://shop.orasage.com/product/${encodeURIComponent(sku)}`}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: '0.5rem' }}
          >
            预览前台 →
          </a>
        </p>
      </header>

      <nav className="product-content-locale-tabs" aria-label="语言">
        {LOCALES.map((l) => (
          <Link
            key={l.code}
            href={`/products/${encodeURIComponent(sku)}/content?locale=${l.code}`}
            className={`product-edit-tab${l.code === locale ? ' is-active' : ''}`}
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">保存失败：{decodeURIComponent(sp.err)}</p>
      ) : null}

      <section className="panel">
        <h2>详情页（{locale}）{doc ? '' : ' · 尚未创建，保存后生成'}</h2>
        <form action={saveProductPageContentAction} encType="multipart/form-data">
          <input type="hidden" name="sku" value={sku} />
          <input type="hidden" name="locale" value={locale} />

          <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
            <label>
              发布状态
              <select name="status" defaultValue={doc?.status ?? 'draft'}>
                <option value="draft">草稿（前台降级简版）</option>
                <option value="published">已发布</option>
              </select>
            </label>
            <label>
              副标题 / 一句话卖点
              <input name="subtitle" defaultValue={doc?.subtitle ?? ''} />
            </label>
            <label>
              SEO 标题
              <input name="seoTitle" defaultValue={doc?.seoTitle ?? ''} placeholder="留空用商品名" />
            </label>
            <label className="full-width">
              SEO 描述
              <textarea name="seoDescription" rows={2} defaultValue={doc?.seoDescription ?? ''} />
            </label>
          </div>

          <h3 className="product-content-subhead">详情视频</h3>
          <div className="product-media-video-fields" style={{ marginBottom: '1rem' }}>
            <ProductVideoUploadField
              name="galleryVideo"
              label="主图视频"
              description="详情页顶部主图区域的视频"
              currentUrl={doc?.galleryVideoUrl}
            />
            <ProductVideoUploadField
              name="sceneVideo"
              label="场景视频"
              description="商品使用场景展示视频"
              currentUrl={doc?.sceneVideoUrl}
            />
          </div>

          <h3 className="product-content-subhead">详情轮播图（建议 1:1 或 4:5，首张为默认主图）</h3>
          <ProductHeroGalleryEditor rows={heroRows} />

          <h3 className="product-content-subhead">详情区块（按顺序渲染在购买区下方）</h3>
          <PdpSectionsEditor initial={docSections(doc)} />

          <div className="product-edit-actions">
            <AdminSubmitButton>保存详情页（{locale}）</AdminSubmitButton>
          </div>
        </form>
      </section>

      <section className="panel">
        <h2>精选评价（{locale} · {testimonials.length} 条）</h2>
        <div className="table-wrap" style={{ marginBottom: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>展示名</th>
                <th>星级</th>
                <th>正文</th>
                <th>排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {testimonials.length === 0 ? (
                <tr><td colSpan={6} className="muted">暂无评价</td></tr>
              ) : testimonials.map((t) => (
                <tr key={t.id}>
                  <td>{t.author}</td>
                  <td>{'★'.repeat(t.rating)}</td>
                  <td className="testimonial-body-cell">{t.body}</td>
                  <td>{t.sort ?? 0}</td>
                  <td>{t.enabled !== false ? <span className="badge ok">启用</span> : <span className="badge off">停用</span>}</td>
                  <td>
                    <details>
                      <summary>编辑</summary>
                      <form action={saveTestimonialAction} className="inline-form">
                        <input type="hidden" name="sku" value={sku} />
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={t.id} />
                        <input name="author" defaultValue={t.author} required />
                        <input name="rating" type="number" min={1} max={5} defaultValue={t.rating} />
                        <textarea name="body" rows={3} defaultValue={t.body} required />
                        <input name="sort" type="number" defaultValue={t.sort ?? 0} />
                        <label className="checkbox-label">
                          <input name="enabled" type="checkbox" defaultChecked={t.enabled !== false} /> 启用
                        </label>
                        <AdminSubmitButton size="sm">保存</AdminSubmitButton>
                      </form>
                      <form action={deleteTestimonialAction} style={{ marginTop: '0.35rem' }}>
                        <input type="hidden" name="sku" value={sku} />
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={t.id} />
                        <AdminSubmitButton size="sm" variant="ghost">删除</AdminSubmitButton>
                      </form>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details>
          <summary>＋ 新增评价</summary>
          <form action={saveTestimonialAction} className="form-grid" style={{ marginTop: '0.75rem' }}>
            <input type="hidden" name="sku" value={sku} />
            <input type="hidden" name="locale" value={locale} />
            <label>展示名<input name="author" required placeholder="李**" /></label>
            <label>星级<input name="rating" type="number" min={1} max={5} defaultValue={5} /></label>
            <label>排序<input name="sort" type="number" defaultValue={0} /></label>
            <label className="checkbox-label"><input name="enabled" type="checkbox" defaultChecked /> 启用</label>
            <label className="full-width">评价正文<textarea name="body" rows={3} required /></label>
            <AdminSubmitButton>添加评价</AdminSubmitButton>
          </form>
        </details>
      </section>
    </div>
  );
}
