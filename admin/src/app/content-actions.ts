'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getAdminToken } from '@/lib/auth';
import {
  deleteCmsTestimonial,
  upsertCmsProductPage,
  upsertCmsTestimonial,
  uploadCmsMedia,
  type CmsSectionRow,
} from '@/lib/cms-content-api';
import type { EditorSection } from '@/components/PdpSectionsEditor';

const LOCALES = new Set(['zh-CN', 'zh-TW', 'en', 'pt-BR']);
const HERO_ROWS = 6;

function contentPath(sku: string, locale: string): string {
  return `/products/${encodeURIComponent(sku)}/content?locale=${encodeURIComponent(locale)}`;
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
    // 现有轮播图：保留未勾选删除的行
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
    // 新上传
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

    await upsertCmsProductPage(sku, locale, {
      status: formData.get('status') === 'published' ? 'published' : 'draft',
      subtitle: String(formData.get('subtitle') ?? '').trim() || null,
      seoTitle: String(formData.get('seoTitle') ?? '').trim() || null,
      seoDescription: String(formData.get('seoDescription') ?? '').trim() || null,
      galleryVideoUrl: String(formData.get('galleryVideoUrl') ?? '').trim() || null,
      sceneVideoUrl: String(formData.get('sceneVideoUrl') ?? '').trim() || null,
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
