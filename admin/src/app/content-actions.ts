'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminToken } from '@/lib/auth';
import {
  deleteCmsTestimonial,
  getCmsProductPageDoc,
  upsertCmsProductPage,
  upsertCmsTestimonial,
  uploadCmsMedia,
  uploadCmsMediaFile,
  type CmsSectionRow,
} from '@/lib/cms-content-api';
import { upsertProductImage } from '@/lib/cms-api';
import type { EditorSection } from '@/components/PdpSectionsEditor';

const LOCALES = new Set(['zh-CN', 'zh-TW', 'en', 'pt-BR']);
const HERO_ROWS = 6;

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
  return heroImages;
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

  const token = await getAdminToken();
  if (!token) throw new Error('未登录');

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

  const token = await getAdminToken();
  if (!token) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent('未登录')}`);
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

  const token = await getAdminToken();
  if (!token) {
    redirect(`${editPath(sku)}?media_err=${encodeURIComponent('未登录')}`);
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
  if (!sku || !LOCALES.has(locale)) throw new Error('缺少 SKU 或语言无效');

  const token = await getAdminToken();
  if (!token) throw new Error('未登录');

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
  if (!sku || !id) throw new Error('参数不完整');

  const token = await getAdminToken();
  if (!token) throw new Error('未登录');

  await deleteCmsTestimonial(id, token);
  revalidatePath(`/products/${encodeURIComponent(sku)}/content`);
  redirect(`${contentPath(sku, locale)}&saved=ok`);
}
