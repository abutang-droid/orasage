import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { interpretReadingWithLlm } from '@/lib/llm/reading-interpret';

const bodySchema = z.object({
  question: z.string().max(500).optional(),
  spreadType: z.enum(['single', 'three']).default('three'),
  language: z.string().max(10).optional(),
  cards: z
    .array(
      z.object({
        position: z.string(),
        positionLabel: z.string(),
        cardName: z.string(),
        cardNameEn: z.string().optional(),
        cardId: z.number().int(),
        orientation: z.enum(['正位', '逆位']),
        element: z.string(),
      }),
    )
    .min(1)
    .max(7),
});

/** POST /api/reading/interpret — DeepSeek 塔罗解读（无 key 时回退模板） */
export async function POST(req: NextRequest) {
  try {
    const body = bodySchema.parse(await req.json());
    const result = await interpretReadingWithLlm({
      question: body.question ?? '',
      spreadType: body.spreadType,
      cards: body.cards,
      language: body.language ?? req.headers.get('accept-language')?.split(',')[0] ?? 'zh-CN',
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '参数错误' }, { status: 400 });
    }
    console.error('[api/reading/interpret]', err);
    return NextResponse.json({ error: '解读失败' }, { status: 500 });
  }
}
