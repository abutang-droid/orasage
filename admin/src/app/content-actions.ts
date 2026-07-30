'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminToken, getStaffBase, loginUrl } from '@/lib/auth';
import {
  deleteCmsTestimonial,
  getCmsProductPageDoc,
  normalizeHeroImages,
  patchCmsProductPageMedia,
  upsertCmsProductPage,
  upsertCmsTestimonial,
  uploadCmsMedia,
  uploadCmsMediaFile,
  type CmsSectionRow,
} from '@/lib/cms-content-api';
import { upsertProductImage, upsertProductImageByMediaId } from '@/lib/cms-api';
import type { EditorSection } from '@/components/PdpSectionsEditor';

const LOCALES = new Set(['zh-CN', 'en', 'pt-BR']);
const HERO_ROWS = 6;

async function staffCmsToken(): Promise<string> {
  // Use cookie JWT role only — avoid /me outages turning saves into Application error.
  if (!(await getStaffBase(['admin', 'shop_ops', 'content_ops']))) {
    throw new Error('未登录或无权限');
  }
  const token = await getAdminToken();
  if (!token) throw new Error('未登录或无权限');
  return token;
}

/** 商城运营编辑商品媒体/主图（需 CMS 商城+媒体写权限） */
async function shopProductCmsToken(): Promise<string> {
  if (!(await getStaffBase(['admin', 'shop_ops']))) {
    throw new Error('未登录或无权限');
  }
  const token = await getAdminToken();
  if (!token) throw new Error('未登录或无权限');
  return token;
}

/** Form actions: never throw auth errors (Next shows opaque Application error). */
async function staffCmsTokenOrLogin(): Promise<string> {
  try {
    return await staffCmsToken();
  } catch {
    redirect(loginUrl());
  }
}

function contentPath(sku: string, locale: string): string {
  return `/products/${encodeURIComponent(sku)}/content?locale=${encodeURIComponent(locale)}`;
}

function editPath(sku: string): string {
  return `/products/${encodeURIComponent(sku)}/edit`;
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
    const alt = String(formData.get(`hero_new_alt_${i}`) ?? '').trim();
    const sort = Number(formData.get(`hero_new_sort_${i}`) ?? 100 + i);
    // Prefer already-uploaded media id (immediate upload); else upload file on save.
    const preId = Number(formData.get(`hero_new_media_id_${i}`) ?? 0);
    if (Number.isFinite(preId) && preId > 0) {
      heroImages.push({ image: preId, alt: alt || null, sort });
      continue;
    }
    const file = formData.get(`hero_new_${i}`);
    if (!(file instanceof File) || file.size === 0) continue;
    const mediaId = await uploadCmsMedia(file, alt || `${sku} 详情图`, token);
    heroImages.push({
      image: mediaId,
      alt: alt || null,
      sort,
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
  if (!sku || !LOCALES.has(locale)) {
    redirect('/products?save_err=' + encodeURIComponent('缺少 SKU 或语言无效'));
  }

  const token = await staffCmsTokenOrLogin();

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

  revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
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
  revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
  if (errorMsg) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${editPath(sku)}?media_ok=1`);
}

export type MediaPersistResult =
  | { ok: true; publicUrl?: string | null; mediaId?: number; heroRows?: Array<{ mediaId: number; url?: string | null; alt?: string; sort?: number }> }
  | { ok: false; error: string };

/** Immediate save: video URL after client upload (or clear). */
export async function persistProductVideoAction(input: {
  sku: string;
  locale: string;
  field: 'galleryVideo' | 'sceneVideo';
  url: string | null;
}): Promise<MediaPersistResult> {
  const sku = input.sku.trim();
  const locale = input.locale.trim();
  if (!sku || !LOCALES.has(locale)) return { ok: false, error: '缺少 SKU 或语言无效' };
  try {
    // content_ops may edit PDP content page media; shop_ops edits product media tab.
    const token = await staffCmsToken();
    const patch =
      input.field === 'galleryVideo'
        ? { galleryVideoUrl: input.url }
        : { sceneVideoUrl: input.url };
    await patchCmsProductPageMedia(sku, locale, patch, token);
    revalidatePath(editPath(sku));
    revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
    return { ok: true, publicUrl: input.url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : '保存失败' };
  }
}

/** Immediate save: append one hero image after client upload. */
export async function persistHeroImageAppendAction(input: {
  sku: string;
  locale: string;
  mediaId: number;
  alt?: string;
}): Promise<MediaPersistResult> {
  const sku = input.sku.trim();
  const locale = input.locale.trim();
  if (!sku || !LOCALES.has(locale)) return { ok: false, error: '缺少 SKU 或语言无效' };
  if (!Number.isFinite(input.mediaId) || input.mediaId <= 0) {
    return { ok: false, error: '无效媒体 ID' };
  }
  try {
    const token = await staffCmsToken();
    const existing = await getCmsProductPageDoc(sku, locale, token);
    const heroes = normalizeHeroImages(existing?.heroImages);
    if (heroes.length >= HERO_ROWS) {
      return { ok: false, error: `轮播图最多 ${HERO_ROWS} 张` };
    }
    const nextSort = heroes.length > 0 ? Math.max(...heroes.map((h) => h.sort)) + 1 : 0;
    heroes.push({
      image: input.mediaId,
      alt: input.alt?.trim() || null,
      sort: nextSort,
    });
    const saved = await patchCmsProductPageMedia(sku, locale, { heroImages: heroes }, token);
    revalidatePath(editPath(sku));
    revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
    const heroRows = (saved.heroImages ?? []).map((row, i) => {
      const id = typeof row.image === 'number' ? row.image : row.image?.id;
      const url = typeof row.image === 'object' && row.image ? row.image.url : null;
      return {
        mediaId: id ?? 0,
        url: url ?? null,
        alt: row.alt ?? undefined,
        sort: typeof row.sort === 'number' ? row.sort : i,
      };
    }).filter((r) => r.mediaId > 0);
    return { ok: true, mediaId: input.mediaId, heroRows };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : '保存失败' };
  }
}

/** Immediate save: catalog image by already-uploaded media id. */
export async function persistCatalogImageByMediaIdAction(input: {
  sku: string;
  mediaId: number;
  publicUrl?: string | null;
}): Promise<MediaPersistResult> {
  const sku = input.sku.trim();
  if (!sku) return { ok: false, error: '缺少 SKU' };
  if (!Number.isFinite(input.mediaId) || input.mediaId <= 0) {
    return { ok: false, error: '无效媒体 ID' };
  }
  try {
    const token = await shopProductCmsToken();
    await upsertProductImageByMediaId(sku, input.mediaId, token);
    revalidatePath(editPath(sku));
    revalidatePath('/products');
    return { ok: true, mediaId: input.mediaId, publicUrl: input.publicUrl ?? null };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : '保存失败' };
  }
}

/** 商品编辑页：仅上传列表主图 */
export async function saveCatalogImageAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  if (!sku) {
    redirect('/products?save_err=' + encodeURIComponent('缺少 SKU'));
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
  revalidatePath('/products');
  if (errorMsg) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${editPath(sku)}?media_ok=1`);
}

export async function saveTestimonialAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const locale = String(formData.get('locale') ?? '').trim();
  if (!sku || !LOCALES.has(locale)) {
    redirect(loginUrl());
  }

  const token = await staffCmsTokenOrLogin();

  const idRaw = Number(formData.get('id') ?? 0);
  const author = String(formData.get('author') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const rating = Math.min(5, Math.max(1, Number(formData.get('rating') ?? 5)));
  const sort = Number(formData.get('sort') ?? 0);
  const enabled = formData.get('enabled') === 'on';
  if (!author || !body) {
    redirect(`${contentPath(sku, locale)}&err=${encodeURIComponent('请填写展示名与评价正文')}`);
  }

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

  revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
  if (errorMsg) {
    redirect(`${contentPath(sku, locale)}&err=${encodeURIComponent(errorMsg)}`);
  }
  redirect(`${contentPath(sku, locale)}&saved=ok`);
}

export async function deleteTestimonialAction(formData: FormData) {
  const sku = String(formData.get('sku') ?? '').trim();
  const locale = String(formData.get('locale') ?? '').trim();
  const id = Number(formData.get('id') ?? 0);
  if (!sku || !id) {
    redirect(loginUrl());
  }

  const token = await staffCmsTokenOrLogin();

  try {
    await deleteCmsTestimonial(id, token);
  } catch (err) {
    const msg = err instanceof Error ? err.message : '删除失败';
    redirect(`${contentPath(sku, locale)}&err=${encodeURIComponent(msg)}`);
  }
  revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
  redirect(`${contentPath(sku, locale)}&saved=ok`);
}
