'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { saveCatalogImageAction } from '@/app/content-actions';
import { AdminSubmitButton } from './AdminButton';
import { ProductCmsLinks } from './ProductCmsLinks';
import { ProductHeroGalleryEditor, type HeroImageRow } from './ProductHeroGalleryEditor';
import { ProductVideoUploadField } from './ProductVideoUploadField';
import type { ProductPageStatus } from '@/lib/cms-product-pages';

type ProductMediaPanelProps = {
  sku: string;
  catalogImageUrl?: string | null;
  pageStatus: ProductPageStatus;
  locale?: string;
  heroRows: HeroImageRow[];
  galleryVideoUrl?: string | null;
  sceneVideoUrl?: string | null;
  saveMediaAction: (formData: FormData) => Promise<void>;
};

function countVideos(gallery?: string | null, scene?: string | null) {
  return [gallery, scene].filter((u) => u?.trim()).length;
}

export function ProductMediaPanel({
  sku,
  catalogImageUrl,
  pageStatus,
  locale = 'zh-CN',
  heroRows,
  galleryVideoUrl,
  sceneVideoUrl,
  saveMediaAction,
}: ProductMediaPanelProps) {
  const catalogInputRef = useRef<HTMLInputElement>(null);
  const [catalogPreview, setCatalogPreview] = useState<string | null>(null);
  const [catalogFileName, setCatalogFileName] = useState<string | null>(null);
  const heroCount = heroRows.length;
  const videoCount = countVideos(galleryVideoUrl, sceneVideoUrl);
  const displayCatalogUrl = catalogPreview ?? catalogImageUrl ?? null;

  useEffect(() => {
    return () => {
      if (catalogPreview) URL.revokeObjectURL(catalogPreview);
    };
  }, [catalogPreview]);

  const onCatalogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCatalogFileName(null);
      return;
    }
    setCatalogPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCatalogFileName(file.name);
  };

  const catalogSaveReady = Boolean(catalogFileName);

  return (
    <div className="product-media-panel">
      <div className="product-media-stats">
        <div className={`product-media-stat${catalogImageUrl ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">列表主图</span>
          <strong>{catalogImageUrl ? '已上传' : '未上传'}</strong>
        </div>
        <div className={`product-media-stat${heroCount > 0 ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">详情轮播</span>
          <strong>
            {heroCount} / 5 张
            {galleryVideoUrl?.trim() ? '（有视频前台≤4图）' : ''}
          </strong>
        </div>
        <div className={`product-media-stat${videoCount > 0 ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">视频</span>
          <strong>{videoCount} 个</strong>
        </div>
        <div className="product-media-stat">
          <span className="product-media-stat-label">详情页</span>
          <strong>{pageStatus === 'published' ? '已发布' : pageStatus === 'draft' ? '草稿' : '未创建'}</strong>
        </div>
      </div>

      <div className="product-media-grid">
        <section className="product-media-card">
          <header className="product-media-card-head">
            <h3>列表主图</h3>
            <p className="muted">商城分类、购物车、订单列表等卡片（建议 1:1 或 4:5）</p>
          </header>
          <form action={saveCatalogImageAction} encType="multipart/form-data" className="product-catalog-image-form">
            <input type="hidden" name="sku" value={sku} />
            <button
              type="button"
              className="product-catalog-image-preview product-catalog-image-preview--clickable"
              onClick={() => catalogInputRef.current?.click()}
            >
              {displayCatalogUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayCatalogUrl} alt="" className="product-catalog-image-img" />
              ) : (
                <div className="product-catalog-image-empty">
                  <span className="hero-image-upload-icon">+</span>
                  <span>点击上传列表主图</span>
                </div>
              )}
            </button>
            {catalogFileName ? (
              <p className="product-media-pending">待保存：{catalogFileName}</p>
            ) : null}
            <input
              ref={catalogInputRef}
              type="file"
              name="image"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="product-media-file-input"
              onChange={onCatalogFileChange}
            />
            <div className="product-media-card-actions">
              <p className="product-media-card-actions-hint muted">
                {catalogSaveReady
                  ? '已选择新图片，请点击保存。'
                  : '选择图片后需点击「保存列表主图」。'}
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => catalogInputRef.current?.click()}
              >
                {displayCatalogUrl ? '更换图片' : '选择图片'}
              </button>
              <AdminSubmitButton size="sm" disabled={!catalogSaveReady}>
                保存列表主图
              </AdminSubmitButton>
            </div>
          </form>
        </section>

        <section className="product-media-card product-media-card--links">
          <header className="product-media-card-head">
            <h3>长文案与多语言</h3>
            <p className="muted">详情区块、SEO、精选评价与其它 3 种语言</p>
          </header>
          <ProductCmsLinks sku={sku} pageStatus={pageStatus} />
          <Link href={`/products/${encodeURIComponent(sku)}/content`} className="admin-cms-link">
            打开详情内容编辑器 →
          </Link>
        </section>
      </div>

      <form action={saveMediaAction} encType="multipart/form-data" className="product-media-card product-media-card--wide">
        <input type="hidden" name="sku" value={sku} />
        <input type="hidden" name="locale" value={locale} />

        <header className="product-media-card-head">
          <h3>详情轮播与视频（{locale}）</h3>
          <p className="muted" style={{ marginBottom: '0.5rem' }}>
            轮播图 <strong>{heroCount}</strong> / 5 张
            {galleryVideoUrl?.trim() ? '（有主图视频时前台取前 4 张）' : ''}
            ，视频位 <strong>{videoCount}</strong> / 2。
          </p>
          <ul className="muted" style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem' }}>
            <li>
              <strong>主图视频</strong>：详情页顶部 Hero 轮播<strong>首帧</strong>自动播放
            </li>
            <li>
              <strong>轮播图</strong>：跟在主图视频之后；无视频时首张为默认主图
            </li>
            <li>
              <strong>场景视频</strong>：购买区下方独立「佩戴场景」区块，勿与主图视频用同一文件
            </li>
          </ul>
        </header>

        <div className="product-media-video-fields">
          <ProductVideoUploadField
            name="galleryVideo"
            label="主图视频（Hero 首帧）"
            description="详情页打开即播；MP4/WebM/MOV，≤ 20 MB。建议 1:1 或 16:9。"
            currentUrl={galleryVideoUrl}
          />
          <ProductVideoUploadField
            name="sceneVideo"
            label="场景视频（购买区下方）"
            description="独立内容区块，建议 16:9；MP4/WebM/MOV，≤ 20 MB。"
            currentUrl={sceneVideoUrl}
          />
        </div>

        <h4 className="product-content-subhead">轮播图片（有主图视频时前台最多 4 张）</h4>
        <ProductHeroGalleryEditor rows={heroRows} />

        <div className="product-media-save-bar">
          <p className="product-media-card-actions-hint muted">
            轮播图、主图视频与场景视频修改后，需单独保存（与上方商品信息保存互不影响）。
          </p>
          <AdminSubmitButton>保存轮播与视频</AdminSubmitButton>
        </div>
      </form>
    </div>
  );
}
