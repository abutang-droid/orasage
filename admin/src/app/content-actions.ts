'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminToken, getAdminUser, getStaffUser, staffCan } from '@/lib/auth';
import {
  deleteCmsFaith,
  deleteCmsFeedItem,
  deleteCmsPage,
  deleteCmsTestimonial,
  getCmsHeroGlobal,
  getCmsProductPageDoc,
  isHeroAppId,
  updateCmsHeroGlobal,
  updateCmsMediaAlt,
  upsertCmsFaith,
  upsertCmsFeedItem,
  upsertCmsPage,
  upsertCmsProductPage,
  upsertCmsTestimonial,
  uploadCmsMedia,
  uploadCmsMediaFile,
  type CmsSectionRow,
  type FeedCollectionSlug,
  type HeroAppId,
} from '@/lib/cms-content-api';
import { upsertProductImage } from '@/lib/cms-api';
import type { EditorSection } from '@/components/PdpSectionsEditor';
import type { AnyStaffPermission } from '../../../shared/staff-permissions/index';

const LOCALES = new Set(['zh-CN', 'en', 'pt-BR', 'zh-TW']);
const HERO_ROWS = 6;

async function requireCmsToken(permission: AnyStaffPermission): Promise<string> {
  const user = await getAdminUser();
  if (!user || !staffCan(user, permission)) {
    throw new Error('未登录或无权限');
  }
  const token = await getAdminToken();
  if (!token) throw new Error('未登录或无权限');
  return token;
}

async function staffCmsToken(): Promise<string> {
  return requireCmsToken('content.product');
}

/** 商城运营编辑商品媒体/主图（需 CMS 商城+媒体写权限） */
async function shopProductCmsToken(): Promise<string> {
  if (!(await getStaffUser(['admin', 'shop_ops']))) {
    throw new Error('未登录或无权限');
  }
  const token = await getAdminToken();
  if (!token) throw new Error('未登录或无权限');
  return token;
}

function mediaId(value: unknown): number | null {
  if (typeof value === 'number' && value > 0) return value;
  if (value && typeof value === 'object' && 'id' in value) {
    const id = Number((value as { id: unknown }).id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
  return null;
}

function contentPath(sku: string, locale: string): string {
  return `/content/products/${encodeURIComponent(sku)}?locale=${encodeURIComponent(locale)}`;
}

function editPath(sku: string): string {
  return `/shop/products/${encodeURIComponent(sku)}`;
}

async function parseHeroImagesFromForm(
  formData: FormData,
  sku: string,
  token: string,
): Promise<Array<{ image: number; alt?: string | null; sort: number }>> {
  const heroImages: Array<{ image: number; alt?: string | null; sort: number }> = [];
  for (let i = 0; i < HERO_ROWS; i += 1) {
    const mediaId = Number(formData.get(`hero_existing_id_${i}`) ?? 0);
    if (!mediaId) continue;
    if (formData.get(`hero_remove_${i}`) === 'on') continue;
    heroImages.push({
      image: mediaId,
      alt: String(formData.get(`hero_alt_${i}`) ?? '').trim() || null,
      sort: Number(formData.get(`hero_sort_${i}`) ?? i),
    });
  }
  for (let i = 0; i < HERO_ROWS; i += 1) {
    const file = formData.get(`hero_new_${i}`);
    if (!(file instanceof File) || file.size === 0) continue;
    const alt = String(formData.get(`hero_new_alt_${i}`) ?? '').trim();
    const mediaId = await uploadCmsMedia(file, alt || `${sku} 详情图`, token);
    heroImages.push({
      image: mediaId,
      alt: alt || null,
      sort: Number(formData.get(`hero_new_sort_${i}`) ?? 100 + i),
    });
  }
  return heroImages.sort((a, b) => a.sort - b.sort);
}

/** 解析视频：优先新上传文件，其次保留已有 URL；勾选删除则清空 */
async function parseVideoUrlFromForm(
  formData: FormData,
  prefix: string,
  existingUrl: string | null | undefined,
  alt: string,
  token: string,
): Promise<string | null> {
  if (formData.get(`${prefix}Clear`) === 'on') return null;

  const file = formData.get(`${prefix}File`);
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadCmsMediaFile(file, alt, token);
    return uploaded.publicUrl;
  }

  const urlFromForm = String(formData.get(`${prefix}Url`) ?? '').trim();
  if (urlFromForm) return urlFromForm;

  return existingUrl?.trim() || null;
}

function parseSections(raw: string): CmsSectionRow[] {
  let parsed: EditorSection[];
  try {
    parsed = JSON.parse(raw) as EditorSection[];
  } catch {
    throw new Error('区块数据解析失败');
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((s) => s && typeof s.type === 'string')
    .map((s) => ({
      type: s.type,
      title: s.title?.trim() || null,
      body: s.body?.trim() || null,
      quote: s.quote?.trim() || null,
      attribution: s.attribution?.trim() || null,
      specItems: (s.specItems ?? [])
        .filter((i) => i.label.trim() && i.value.trim())
        .map((i) => ({ label: i.label.trim(), value: i.value.trim() })),
      faqItems: (s.faqItems ?? [])
        .filter((i) => i.question.trim() && i.answer.trim())
        .map((i) => ({ question: i.question.trim(), answer: i.answer.trim() })),
      relatedSkus: (s.relatedSkus ?? [])
        .filter((sku) => sku.trim())
        .map((sku) => ({ sku: sku.trim() })),
    }))
    .filter((s) => {
      if (s.type === 'specList') return (s.specItems?.length ?? 0) > 0;
      if (s.type === 'faq') return (s.faqItems?.length ?? 0) > 0;
      if (s.type === 'relatedSkus') return (s.relatedSkus?.length ?? 0) > 0;
      if (s.type === 'quote') return Boolean(s.quote);
      return Boolean(s.body || s.title);
    });
}

export async function saveProductPageContentAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const locale = String(formData.get('locale') ?? '').trim();
  if (!sku || !LOCALES.has(locale)) throw new Error('缺少 SKU 或语言无效');

  const token = await staffCmsToken();

  let errorMsg: string | null = null;
  try {
    const existing = await getCmsProductPageDoc(sku, locale, token);
    const heroImages = await parseHeroImagesFromForm(formData, sku, token);
    const [galleryVideoUrl, sceneVideoUrl] = await Promise.all([
      parseVideoUrlFromForm(
        formData,
        'galleryVideo',
        existing?.galleryVideoUrl,
        `${sku} 主图视频`,
        token,
      ),
      parseVideoUrlFromForm(
        formData,
        'sceneVideo',
        existing?.sceneVideoUrl,
        `${sku} 场景视频`,
        token,
      ),
    ]);

    await upsertCmsProductPage(sku, locale, {
      status: formData.get('status') === 'published' ? 'published' : 'draft',
      subtitle: String(formData.get('subtitle') ?? '').trim() || null,
      seoTitle: String(formData.get('seoTitle') ?? '').trim() || null,
      seoDescription: String(formData.get('seoDescription') ?? '').trim() || null,
      galleryVideoUrl,
      sceneVideoUrl,
      heroImages,
      sections: parseSections(String(formData.get('sections_json') ?? '[]')),
    }, token);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath(`/content/products/${encodeURIComponent(sku)}`);
  if (errorMsg) {
    redirect(`${contentPath(sku, locale)}&err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${contentPath(sku, locale)}&saved=ok`);
}

/** 商品编辑页：仅保存轮播图 + 视频（保留已有详情区块与 SEO） */
export async function saveProductMediaAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-CN').trim();
  if (!sku || !LOCALES.has(locale)) {
    redirect(`${editPath(sku || 'unknown')}?media_err=${encodeURIComponent('缺少 SKU 或语言无效')}`);
  }

  let token: string;
  try {
    token = await shopProductCmsToken();
  } catch {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent('未登录或无权限')}`);
    return;
  }

  let errorMsg: string | null = null;
  try {
    const existing = await getCmsProductPageDoc(sku, locale, token);
    const heroImages = await parseHeroImagesFromForm(formData, sku, token);
    const [galleryVideoUrl, sceneVideoUrl] = await Promise.all([
      parseVideoUrlFromForm(
        formData,
        'galleryVideo',
        existing?.galleryVideoUrl,
        `${sku} 主图视频`,
        token,
      ),
      parseVideoUrlFromForm(
        formData,
        'sceneVideo',
        existing?.sceneVideoUrl,
        `${sku} 场景视频`,
        token,
      ),
    ]);

    await upsertCmsProductPage(sku, locale, {
      status: existing?.status ?? 'draft',
      subtitle: existing?.subtitle ?? null,
      seoTitle: existing?.seoTitle ?? null,
      seoDescription: existing?.seoDescription ?? null,
      galleryVideoUrl,
      sceneVideoUrl,
      heroImages,
      sections: (existing?.sections ?? []) as CmsSectionRow[],
    }, token);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath(editPath(sku));
  revalidatePath(`/content/products/${encodeURIComponent(sku)}`);
  if (errorMsg) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${editPath(sku)}?media_ok=1`);
}

/** 商品编辑页：仅上传列表主图 */
export async function saveCatalogImageAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  if (!sku) {
    redirect('/shop/products?save_err=' + encodeURIComponent('缺少 SKU'));
  }

  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent('请选择图片文件')}`);
  }

  let token: string;
  try {
    token = await shopProductCmsToken();
  } catch {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent('未登录或无权限')}`);
    return;
  }

  let errorMsg: string | null = null;
  try {
    await upsertProductImage(sku, file, token);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '上传失败';
  }

  revalidatePath(editPath(sku));
  revalidatePath('/shop/products');
  if (errorMsg) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${editPath(sku)}?media_ok=1`);
}

export async function saveTestimonialAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const locale = String(formData.get('locale') ?? '').trim();
  if (!sku || !LOCALES.has(locale)) throw new Error('缺少 SKU 或语言无效');

  const token = await staffCmsToken();

  const idRaw = Number(formData.get('id') ?? 0);
  const author = String(formData.get('author') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get('rating') ?? 5)));
  const sort = Number(formData.get('sort') ?? 0);
  const enabled = formData.get('enabled') === 'on';
  if (!author || !body) throw new Error('请填写展示名与评价正文');

  let errorMsg: string | null = null;
  try {
    await upsertCmsTestimonial(
      sku,
      locale,
      { author, rating, body, sort: Number.isFinite(sort) ? sort : 0, enabled },
      token,
      idRaw > 0 ? idRaw : undefined,
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath(`/content/products/${encodeURIComponent(sku)}`);
  if (errorMsg) {
    redirect(`${contentPath(sku, locale)}&err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${contentPath(sku, locale)}&saved=ok`);
}

export async function deleteTestimonialAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const locale = String(formData.get('locale') ?? '').trim();
  const id = Number(formData.get('id') ?? 0);
  if (!sku || !id) throw new Error('参数不完整');

  const token = await staffCmsToken();

  await deleteCmsTestimonial(id, token);
  revalidatePath(`/content/products/${encodeURIComponent(sku)}`);
  redirect(`${contentPath(sku, locale)}&saved=ok`);
}

/* ── Hero / 信息流 / 信仰 / 页面 / 媒体 ───────────────── */

function heroEditPath(app: HeroAppId, qs?: string): string {
  return `/content/heroes/${app}${qs ? `?${qs}` : ''}`;
}

export async function saveHeroGlobalAction(formData: FormData) {
  const appRaw = String(formData.get('app') ?? '').trim();
  if (!isHeroAppId(appRaw)) {
    redirect('/content/heroes?err=' + encodeURIComponent('无效站点'));
  }
  const app = appRaw;
  const token = await requireCmsToken('content.heroes');

  let errorMsg: string | null = null;
  try {
    const existing = await getCmsHeroGlobal(app, token);
    const displayModeRaw = String(formData.get('displayMode') ?? 'text');
    const displayMode =
      displayModeRaw === 'image' || displayModeRaw === 'video' ? displayModeRaw : 'text';

    let heroImage = mediaId(existing?.heroImage);
    let heroVideo = mediaId(existing?.heroVideo);

    if (formData.get('heroImageClear') === 'on') heroImage = null;
    if (formData.get('heroVideoClear') === 'on') heroVideo = null;

    const imageFile = formData.get('heroImageFile');
    if (imageFile instanceof File && imageFile.size > 0) {
      heroImage = await uploadCmsMedia(imageFile, `${app} hero`, token);
    }
    const videoFile = formData.get('heroVideoFile');
    if (videoFile instanceof File && videoFile.size > 0) {
      heroVideo = await uploadCmsMedia(videoFile, `${app} hero video`, token);
    }

    await updateCmsHeroGlobal(
      app,
      {
        enabled: formData.get('enabled') === 'on',
        eyebrow: String(formData.get('eyebrow') ?? '').trim() || null,
        headline: String(formData.get('headline') ?? '').trim() || null,
        subtitle: String(formData.get('subtitle') ?? '').trim() || null,
        displayMode,
        heroImage,
        heroVideo,
        videoExternalUrl: String(formData.get('videoExternalUrl') ?? '').trim() || null,
        videoAutoplay: formData.get('videoAutoplay') === 'on',
        bodyText: String(formData.get('bodyText') ?? '').trim() || null,
      },
      token,
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath('/content/heroes');
  revalidatePath(`/content/heroes/${app}`);
  if (errorMsg) {
    redirect(heroEditPath(app, `err=${encodeURIComponent(errorMsg)}`));
  }
  redirect(heroEditPath(app, 'saved=ok'));
}

function feedCollection(app: string): FeedCollectionSlug | null {
  if (app === 'bazi') return 'bazi-feed';
  if (app === 'ziwei') return 'ziwei-feed';
  return null;
}

function feedPath(app: string, qs?: string): string {
  return `/content/feeds?app=${encodeURIComponent(app)}${qs ? `&${qs}` : ''}`;
}

export async function saveFeedItemAction(formData: FormData) {
  const app = String(formData.get('app') ?? '').trim();
  const collection = feedCollection(app);
  if (!collection) {
    redirect('/content/feeds?err=' + encodeURIComponent('无效应用'));
  }
  const token = await requireCmsToken('content.feed');

  const idRaw = Number(formData.get('id') ?? 0);
  const kindRaw = String(formData.get('kind') ?? 'order');
  const kind = kindRaw === 'review' ? 'review' : 'order';
  const message = String(formData.get('message') ?? '').trim();
  const locale = String(formData.get('locale') ?? 'zh-CN').trim();
  const sort = Number(formData.get('sort') ?? 0);
  const enabled = formData.get('enabled') === 'on';
  if (!message) {
    redirect(feedPath(app, `err=${encodeURIComponent('请填写展示文案')}`));
  }

  let errorMsg: string | null = null;
  try {
    await upsertCmsFeedItem(
      collection,
      {
        kind,
        message,
        locale: LOCALES.has(locale) ? locale : 'zh-CN',
        sort: Number.isFinite(sort) ? sort : 0,
        enabled,
      },
      token,
      idRaw > 0 ? idRaw : undefined,
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath('/content/feeds');
  if (errorMsg) {
    redirect(feedPath(app, `err=${encodeURIComponent(errorMsg)}`));
  }
  redirect(feedPath(app, 'saved=ok'));
}

export async function deleteFeedItemAction(formData: FormData) {
  const app = String(formData.get('app') ?? '').trim();
  const collection = feedCollection(app);
  const id = Number(formData.get('id') ?? 0);
  if (!collection || !id) {
    redirect('/content/feeds?err=' + encodeURIComponent('参数不完整'));
  }
  const token = await requireCmsToken('content.feed');
  await deleteCmsFeedItem(collection, id, token);
  revalidatePath('/content/feeds');
  redirect(feedPath(app, 'saved=ok'));
}

function faithListPath(qs?: string): string {
  return `/content/faith${qs ? `?${qs}` : ''}`;
}

export async function saveFaithAction(formData: FormData) {
  const token = await requireCmsToken('content.faith');
  const idRaw = Number(formData.get('id') ?? 0);
  const code = String(formData.get('code') ?? '').trim().toLowerCase();
  const nameZh = String(formData.get('nameZh') ?? '').trim();
  const nameEn = String(formData.get('nameEn') ?? '').trim();
  if (!code || !nameZh || !nameEn) {
    redirect(faithListPath(`err=${encodeURIComponent('请填写代码与中英文名称')}`));
  }

  const facingRaw = String(formData.get('worshipFacing') ?? 'none');
  const worshipFacing =
    facingRaw === 'qibla' || facingRaw === 'east' || facingRaw === 'jerusalem'
      ? facingRaw
      : 'none';
  const adherentsRaw = String(formData.get('adherentsM') ?? '').trim();
  const bearingRaw = String(formData.get('facingBearing') ?? '').trim();

  let errorMsg: string | null = null;
  let savedId = idRaw;
  try {
    savedId = await upsertCmsFaith(
      {
        code,
        nameZh,
        nameEn,
        emoji: String(formData.get('emoji') ?? '').trim() || null,
        rank: Number(formData.get('rank') ?? 50) || 50,
        adherentsM: adherentsRaw ? Number(adherentsRaw) : null,
        worshipFacing,
        facingLabelZh: String(formData.get('facingLabelZh') ?? '').trim() || null,
        facingLabelEn: String(formData.get('facingLabelEn') ?? '').trim() || null,
        facingBearing: bearingRaw ? Number(bearingRaw) : null,
        wpStatus: formData.get('wpStatus') === 'draft' ? 'draft' : 'publish',
      },
      token,
      idRaw > 0 ? idRaw : undefined,
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath('/content/faith');
  if (errorMsg) {
    const target = idRaw > 0
      ? `/content/faith/${idRaw}?err=${encodeURIComponent(errorMsg)}`
      : faithListPath(`err=${encodeURIComponent(errorMsg)}`);
    redirect(target);
  }
  redirect(
    savedId > 0
      ? `/content/faith/${savedId}?saved=ok`
      : faithListPath('saved=ok'),
  );
}

export async function deleteFaithAction(formData: FormData) {
  const id = Number(formData.get('id') ?? 0);
  if (!id) redirect(faithListPath(`err=${encodeURIComponent('缺少 ID')}`));
  const token = await requireCmsToken('content.faith');
  await deleteCmsFaith(id, token);
  revalidatePath('/content/faith');
  redirect(faithListPath('saved=ok'));
}

function pageListPath(qs?: string): string {
  return `/content/pages${qs ? `?${qs}` : ''}`;
}

export async function savePageMetaAction(formData: FormData) {
  const token = await requireCmsToken('content.pages');
  const idRaw = Number(formData.get('id') ?? 0);
  const title = String(formData.get('title') ?? '').trim();
  const slug = String(formData.get('slug') ?? '').trim().toLowerCase();
  const appSource = String(formData.get('appSource') ?? 'main').trim() || 'main';
  if (!title || !slug) {
    redirect(
      idRaw > 0
        ? `/content/pages/${idRaw}?err=${encodeURIComponent('请填写标题与 slug')}`
        : pageListPath(`err=${encodeURIComponent('请填写标题与 slug')}`),
    );
  }

  const sortRaw = String(formData.get('sortWeight') ?? '').trim();
  let errorMsg: string | null = null;
  let savedId = idRaw;
  try {
    savedId = await upsertCmsPage(
      {
        title,
        slug,
        appSource,
        wpStatus: formData.get('wpStatus') === 'draft' ? 'draft' : 'publish',
        daozangCategory: String(formData.get('daozangCategory') ?? '').trim() || null,
        sortWeight: sortRaw ? Number(sortRaw) : null,
        daozangVolume: String(formData.get('daozangVolume') ?? '').trim() || null,
        excerpt: String(formData.get('excerpt') ?? '').trim() || null,
        legacyHtml: String(formData.get('legacyHtml') ?? ''),
      },
      token,
      idRaw > 0 ? idRaw : undefined,
    );
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }

  revalidatePath('/content/pages');
  if (errorMsg) {
    redirect(
      idRaw > 0
        ? `/content/pages/${idRaw}?err=${encodeURIComponent(errorMsg)}`
        : pageListPath(`err=${encodeURIComponent(errorMsg)}`),
    );
  }
  redirect(`/content/pages/${savedId}?saved=ok`);
}

export async function deletePageAction(formData: FormData) {
  const id = Number(formData.get('id') ?? 0);
  if (!id) redirect(pageListPath(`err=${encodeURIComponent('缺少 ID')}`));
  const token = await requireCmsToken('content.pages');
  await deleteCmsPage(id, token);
  revalidatePath('/content/pages');
  redirect(pageListPath('saved=ok'));
}

export async function uploadMediaAction(formData: FormData) {
  const token = await requireCmsToken('content.media');
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    redirect('/content/media?err=' + encodeURIComponent('请选择文件'));
  }
  const alt = String(formData.get('alt') ?? '').trim();
  let errorMsg: string | null = null;
  try {
    await uploadCmsMedia(file, alt || file.name, token);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '上传失败';
  }
  revalidatePath('/content/media');
  if (errorMsg) {
    redirect(`/content/media?err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/content/media?saved=ok');
}

export async function saveMediaAltAction(formData: FormData) {
  const token = await requireCmsToken('content.media');
  const id = Number(formData.get('id') ?? 0);
  if (!id) redirect('/content/media?err=' + encodeURIComponent('缺少 ID'));
  const alt = String(formData.get('alt') ?? '').trim();
  let errorMsg: string | null = null;
  try {
    await updateCmsMediaAlt(id, alt, token);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : '保存失败';
  }
  revalidatePath('/content/media');
  if (errorMsg) {
    redirect(`/content/media?err=${encodeURIComponent(errorMsg)}`);
  }
  redirect('/content/media?saved=ok');
}
