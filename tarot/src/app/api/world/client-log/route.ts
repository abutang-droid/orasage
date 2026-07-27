import { NextRequest, NextResponse } from 'next/server';

/** Lightweight client → server log for World MiniKit debugging. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.error('[world/client-log]', JSON.stringify(body).slice(0, 2000));
  } catch (err) {
    console.error('[world/client-log] parse failed', err);
  }
  return NextResponse.json({ ok: true });
}
