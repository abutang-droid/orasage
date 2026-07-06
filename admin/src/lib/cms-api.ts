import { ENV } from './env';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

function authCookie(token: string) {
  return `${ENV.jwtCookieName}=${token}`;
}

async function cmsRequest(
  path: string,
  token: string,
  init?: RequestInit & { json?: unknown },
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('Cookie', authCookie(token));
  let body = init?.body;
  if (init?.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  return fetch(`${CMS_INTERNAL_URL}${path}`, { ...init, headers, body, cache: 'no-store' });
}

/** 上传媒体并关联 SKU 主图（创建或更新 shop-product-images） */
export async function upsertProductImage(sku: string, file: File, token: string): Promise<void> {
  const mediaForm = new FormData();
  mediaForm.append('file', file);
  mediaForm.append('alt', sku);

  const mediaRes = await cmsRequest('/api/media', token, { method: 'POST', body: mediaForm });
  if (!mediaRes.ok) {
    const err = await mediaRes.text().catch(() => '');
    throw new Error(`媒体上传失败 (${mediaRes.status}): ${err.slice(0, 200)}`);
  }
  const mediaJson = (await mediaRes.json()) as { doc?: { id: number }; id?: number };
  const mediaId = mediaJson.doc?.id ?? mediaJson.id;
  if (!mediaId) throw new Error('媒体上传成功但未返回 ID');

  const findRes = await cmsRequest(
    `/api/shop-product-images?where[sku][equals]=${encodeURIComponent(sku)}&limit=1`,
    token,
  );
  if (!findRes.ok) {
    throw new Error(`查询商品主图失败 (${findRes.status})`);
  }
  const findJson = (await findRes.json()) as { docs?: Array<{ id: number }> };
  const existing = findJson.docs?.[0];

  if (existing) {
    const patchRes = await cmsRequest(`/api/shop-product-images/${existing.id}`, token, {
      method: 'PATCH',
      json: { image: mediaId },
    });
    if (!patchRes.ok) {
      const err = await patchRes.text().catch(() => '');
      throw new Error(`更新商品主图失败 (${patchRes.status}): ${err.slice(0, 200)}`);
    }
  } else {
    const postRes = await cmsRequest('/api/shop-product-images', token, {
      method: 'POST',
      json: { sku, image: mediaId },
    });
    if (!postRes.ok) {
      const err = await postRes.text().catch(() => '');
      throw new Error(`创建商品主图失败 (${postRes.status}): ${err.slice(0, 200)}`);
    }
  }
}
