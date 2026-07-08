/**
 * WordPress legacyHtml 清洗与摘要生成（脚本侧）。
 * 逻辑与 `main/src/lib/cms.ts` 的 sanitizeLegacyHtml / stripHtml 保持一致，
 * 用于入库时预生成 `excerpt`，前台渲染仍保留同款清洗作兜底。
 */

export function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function sanitizeLegacyHtml(html) {
  let out = String(html || '');

  out = out
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[^>]*>/gi, '')
    .replace(/<img[^>]*(qr|qrcode|weixin|wechat|wx\.|mp\.weixin|公众号|扫码)[^>]*>/gi, '')
    .replace(/<img[^>]*(wp-content\/uploads\/[^"']*qr[^"']*|barcode)[^>]*>/gi, '')
    .replace(/<a[^>]*(weixin|wechat|mp\.weixin|javascript:)[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<div[^>]*(qr|qrcode|wechat|weixin|related|share|social|promo|广告)[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<p[^>]*(qr|qrcode|wechat|weixin|扫码|关注公众号)[^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<p[^>]*>[\s\S]*?(手机阅读|扫码下载|问真八字|在手机上继续阅读)[\s\S]*?<\/p>/gi, '')
    .replace(/目录\s*手机阅读[\s\S]*?在手机上继续阅读本书/gi, '');

  out = out.replace(/<img[^>]*width=["']?\d{2,3}["']?[^>]*height=["']?\d{2,3}["']?[^>]*>/gi, (tag) => {
    if (/qr|qrcode|weixin|wechat|扫码/i.test(tag)) return '';
    return tag;
  });

  // WordPress 正文用 <p><font class='gold'>…</font></p> 标记章节标题，短文本转为语义化 h3
  out = out.replace(
    /<p[^>]*>\s*<font[^>]*class=["']gold["'][^>]*>([\s\S]*?)<\/font>\s*<\/p>/gi,
    (match, inner) => {
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (!text || text.length > 32 || /[。；：!？]/.test(text)) return match;
      return `<h3>${inner}</h3>`;
    },
  );

  if (/Ã.|Â.|â./.test(out)) {
    try {
      const bytes = Uint8Array.from([...out].map((c) => c.charCodeAt(0) & 0xff));
      const fixed = new TextDecoder('utf-8').decode(bytes);
      if (fixed && !fixed.includes('\uFFFD')) out = fixed;
    } catch {
      // keep original
    }
  }

  return out.replace(/\n{3,}/g, '\n\n').trim();
}

/** 生成列表页摘要：清洗 → 去标签 → 去推广行 → 截断 */
export function makeExcerpt(html, title = '', max = 140) {
  let plain = decodeHtmlEntities(
    sanitizeLegacyHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  )
    .replace(/目录\s*/g, '')
    .replace(/手机阅读\s*/g, '')
    .replace(/扫码下载\/打开问真八字\s*/g, '')
    .replace(/在手机上继续阅读本书\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 正文开头常重复标题（如「易筋经 易筋经共计十二势…」），去掉冗余前缀
  const cleanTitle = decodeHtmlEntities(title).trim();
  if (cleanTitle && plain.startsWith(`${cleanTitle} `)) {
    plain = plain.slice(cleanTitle.length + 1).trim();
  }

  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}
