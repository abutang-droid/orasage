'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { persistCatalogImageByMediaIdAction } from '@/app/content-actions';
import { formatBytes, uploadMediaWithProgress } from '@/lib/client-media-upload';
import type { ProductPageStatus } from '@/lib/cms-product-pages';
import { AdminSubmitButton } from './AdminButton';
import { ProductCmsLinks } from './ProductCmsLinks';
import { ProductHeroGalleryEditor, type HeroImageRow } from './ProductHeroGalleryEditor';
import { ProductVideoUploadField } from './ProductVideoUploadField';
import { UploadProgressBar } from './UploadProgressBar';

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
  const router = useRouter();
  const catalogInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [catalogPreview, setCatalogPreview] = useState<string | null>(null);
  const [catalogSavedUrl, setCatalogSavedUrl] = useState<string | null>(catalogImageUrl?.trim() || null);
  const [catalogFileName, setCatalogFileName] = useState<string | null>(null);
  const [catalogPercent, setCatalogPercent] = useState(0);
  const [catalogPhase, setCatalogPhase] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle');
  const [catalogStatusMsg, setCatalogStatusMsg] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [liveHeroCount, setLiveHeroCount] = useState(heroRows.length);

  const videoCount = countVideos(galleryVideoUrl, sceneVideoUrl);
  const displayCatalogUrl = catalogPreview ?? catalogSavedUrl ?? null;

  useEffect(() => {
    setCatalogSavedUrl(catalogImageUrl?.trim() || null);
  }, [catalogImageUrl]);

  useEffect(() => {
    setLiveHeroCount(heroRows.length);
  }, [heroRows]);

  // Revoke object URLs when preview changes; abort in-flight upload only on unmount.
  useEffect(() => {
    return () => {
      if (catalogPreview) URL.revokeObjectURL(catalogPreview);
    };
  }, [catalogPreview]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const onCatalogFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCatalogPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCatalogFileName(file.name);
    setCatalogError(null);
    setCatalogStatusMsg(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setCatalogPhase('uploading');
    setCatalogPercent(0);

    void (async () => {
      try {
        const uploaded = await uploadMediaWithProgress(
          file,
          `${sku} catalog`,
          (p) => setCatalogPercent(p.percent),
          controller.signal,
        );
        setCatalogPhase('saving');
        setCatalogStatusMsg('正在写入列表主图…');
        const result = await persistCatalogImageByMediaIdAction({
          sku,
          mediaId: uploaded.id,
          publicUrl: uploaded.publicUrl,
        });
        if (!result.ok) throw new Error(result.error);
        setCatalogSavedUrl(uploaded.publicUrl);
        setCatalogPhase('done');
        setCatalogStatusMsg(`已保存 · ${file.name}（${formatBytes(file.size)}）`);
        setCatalogPercent(100);
        if (catalogInputRef.current) catalogInputRef.current.value = '';
        router.refresh();
      } catch (err) {
        if (controller.signal.aborted) return;
        setCatalogPhase('error');
        setCatalogError(err instanceof Error ? err.message : '上传失败');
        setCatalogStatusMsg(null);
      }
    })();
  };

  return (
    <div className="product-media-panel">
      <div className="product-media-stats">
        <div className={`product-media-stat${catalogSavedUrl ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">列表主图</span>
          <strong>{catalogSavedUrl ? '已上传' : '未上传'}</strong>
        </div>
        <div className={`product-media-stat${liveHeroCount > 0 ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">详情轮播</span>
          <strong>{liveHeroCount} / 6 张</strong>
        </div>
        <div className={`product-media-stat${videoCount > 0 ? ' is-ok' : ''}`}>
          <span className="product-media-stat-label">视频</span>
          <strong>{videoCount} 个</strong>
        </div>
        <div className="product-media-stat">
          <span className="product-media-stat-label">详情页</span>
          <strong>
            {pageStatus === 'published' ? '已发布' : pageStatus === 'draft' ? '草稿' : '未创建'}
          </strong>
        </div>
      </div>

      <p className="product-media-hint muted" style={{ margin: 0 }}>
        选择视频或图片后会显示上传进度，并<strong>立即保存到 CMS</strong>，不必等整页点保存。下方「保存轮播与视频」仅用于调整轮播顺序、删除项或改替代文字。
      </p>

      <div className="product-media-grid">
        <section className="product-media-card">
          <header className="product-media-card-head">
            <h3>列表主图</h3>
            <p className="muted">商城分类、购物车、订单列表等卡片（建议 1:1 或 4:5）</p>
          </header>
          <div className="product-catalog-image-form">
            <button
              type="button"
              className="product-catalog-image-preview product-catalog-image-preview--clickable"
              onClick={() => catalogInputRef.current?.click()}
              disabled={catalogPhase === 'uploading' || catalogPhase === 'saving'}
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
            {catalogPhase === 'uploading' || catalogPhase === 'saving' ? (
              <UploadProgressBar
                percent={catalogPhase === 'saving' ? 100 : catalogPercent}
                label={
                  catalogPhase === 'saving'
                    ? '上传完成，正在保存…'
                    : `上传中… ${catalogFileName ?? ''}`
                }
              />
            ) : null}
            {catalogPhase === 'done' && catalogStatusMsg ? (
              <UploadProgressBar percent={100} success={catalogStatusMsg} />
            ) : null}
            {catalogPhase === 'error' && catalogError ? (
              <UploadProgressBar percent={catalogPercent} error={catalogError} />
            ) : null}
            {catalogPhase === 'idle' ? (
              <p className="product-media-hint muted">选择后立即上传并保存 · JPG / PNG / WebP / GIF</p>
            ) : null}
            <input
              ref={catalogInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="product-media-file-input"
              onChange={onCatalogFileChange}
            />
            <div className="product-media-card-actions">
              <p className="product-media-card-actions-hint muted">
                选择图片后立即上传并写入商品主图，无需再点保存。
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => catalogInputRef.current?.click()}
                disabled={catalogPhase === 'uploading' || catalogPhase === 'saving'}
              >
                {displayCatalogUrl ? '更换图片' : '选择图片'}
              </button>
            </div>
          </div>
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
            详情页顶部图库 + 视频。轮播 <strong>{liveHeroCount}</strong> / 6 张，视频{' '}
            <strong>{videoCount}</strong> 个。
          </p>
        </header>

        <div className="product-media-video-fields">
          <ProductVideoUploadField
            name="galleryVideo"
            label="主图视频"
            description="详情页顶部主图区域的视频"
            currentUrl={galleryVideoUrl}
            sku={sku}
            locale={locale}
          />
          <ProductVideoUploadField
            name="sceneVideo"
            label="场景视频"
            description="商品使用场景展示视频"
            currentUrl={sceneVideoUrl}
            sku={sku}
            locale={locale}
          />
        </div>

        <h4 className="product-content-subhead">轮播图片</h4>
        <ProductHeroGalleryEditor
          rows={heroRows}
          sku={sku}
          locale={locale}
          onHeroCountChange={setLiveHeroCount}
        />

        <div className="product-media-save-bar">
          <p className="product-media-card-actions-hint muted">
            新视频/新图已在选择时立即保存。此处「保存」用于轮播排序、删除项与改替代文字。
          </p>
          <AdminSubmitButton>保存轮播与视频</AdminSubmitButton>
        </div>
      </form>
    </div>
  );
}
