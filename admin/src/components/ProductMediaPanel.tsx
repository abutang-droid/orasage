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
    if (!file) return;
    setCatalogPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCatalogFileName(file.name);
  };

  return (
    <div className="product-media-panel">
      <div className="product-media-stats">
        <div className={`product-media-stat${catalogImageUrl ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">列表主图</span>
          <strong>{catalogImageUrl ? '已上传' : '未上传'}</strong>
        </div>
        <div className={`product-media-stat${heroCount > 0 ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">详情轮播</span>
          <strong>{heroCount} / 6 张</strong>
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
              <button
                type="button"
                className="btn-secondary"
                onClick={() => catalogInputRef.current?.click()}
              >
                {displayCatalogUrl ? '更换图片' : '选择图片'}
              </button>
              <AdminSubmitButton size="sm">上传列表主图</AdminSubmitButton>
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
          <p className="muted">
            详情页顶部图库 + 视频。轮播 <strong>{heroCount}</strong> / 6 张，视频 <strong>{videoCount}</strong> 个。
          </p>
        </header>

        <div className="product-media-video-fields">
          <ProductVideoUploadField
            name="galleryVideo"
            label="主图视频"
            description="详情页顶部主图区域的视频"
            currentUrl={galleryVideoUrl}
          />
          <ProductVideoUploadField
            name="sceneVideo"
            label="场景视频"
            description="商品使用场景展示视频"
            currentUrl={sceneVideoUrl}
          />
        </div>

        <h4 className="product-content-subhead">轮播图片</h4>
        <ProductHeroGalleryEditor rows={heroRows} />

        <div className="product-media-card-actions">
          <AdminSubmitButton>保存轮播与视频</AdminSubmitButton>
        </div>
      </form>
    </div>
  );
}
