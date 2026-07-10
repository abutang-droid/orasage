import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  billingSlotKeyForElement,
  buildZiweiChartRecommendSeed,
  wuxingElementFromZiweiJu,
} from '../../../../../shared/recommend-seed/index';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

const chartSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  hour: z.number().int().min(0).max(11),
  gender: z.enum(['male', 'female']),
  name: z.string().max(50).optional(),
  city: z.string().max(80).optional(),
  wuxingJuName: z.string().min(1).max(20),
});

/** 紫微推荐饰品：槽位按五行局结论，seed 按命盘信息（非账号） */
export async function POST(req: NextRequest) {
  try {
    const body = chartSchema.parse(await req.json());
    const locale = req.nextUrl.searchParams.get('locale') ?? 'zh-CN';
    const element = wuxingElementFromZiweiJu(body.wuxingJuName);
    if (!element) {
      return NextResponse.json({ error: '无效五行局' }, { status: 400 });
    }
    const slotKey = billingSlotKeyForElement(element);
    if (!slotKey) {
      return NextResponse.json({ error: '暂无推荐商品' }, { status: 404 });
    }
    const seed = buildZiweiChartRecommendSeed({
      year: body.year,
      month: body.month,
      day: body.day,
      hour: body.hour,
      gender: body.gender,
      name: body.name,
      city: body.city,
      wuxingJuName: body.wuxingJuName,
    });
    const url = new URL(`${AUTH_INTERNAL}/api/billing/slot`);
    url.searchParams.set('app', 'bazi');
    url.searchParams.set('key', slotKey);
    url.searchParams.set('locale', locale);
    url.searchParams.set('seed', seed);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errBody as { error?: string }).error ?? '暂无推荐商品' },
        { status: res.status },
      );
    }
    const data = (await res.json()) as { product?: Record<string, unknown> };
    const p = data.product;
    if (!p || typeof p.sku !== 'string') {
      return NextResponse.json({ error: '暂无推荐商品' }, { status: 404 });
    }
    return NextResponse.json({
      product: {
        sku: p.sku,
        name: typeof p.name === 'string' ? p.name : '',
        desc: typeof p.desc === 'string' ? p.desc : typeof p.description === 'string' ? p.description : '',
        priceDisplay: typeof p.priceDisplay === 'string' ? p.priceDisplay : '',
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[ziwei/recommend/product]', err);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
