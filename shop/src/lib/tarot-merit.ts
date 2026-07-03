/** Notify tarot app to award offer merit after shop payment */
export async function notifyTarotOfferMerit(opts: {
  recommendationContext?: string | null;
  orderNo: string;
  amountCents: number;
  sku?: string | null;
}) {
  const ctx = opts.recommendationContext ?? '';
  const match = ctx.match(/tarotUser:([^|]+)/);
  if (!match) return;

  const tarotUserId = match[1];
  const sku = (opts.sku ?? '').toLowerCase();
  const kind =
    sku.includes('crystal') && sku.includes('gift')
      ? 'crystal_gift'
      : sku.includes('crystal')
        ? 'crystal_purchase'
        : 'paid_reading';

  const base = process.env.TAROT_INTERNAL_URL || 'http://127.0.0.1:3112';
  const secret = process.env.TAROT_INTERNAL_SECRET || process.env.JWT_SECRET || '';
  if (!secret) return;

  try {
    await fetch(`${base}/api/internal/merit/offer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tarot-internal-key': secret,
      },
      body: JSON.stringify({
        tarotUserId,
        kind,
        orderNo: opts.orderNo,
        amountCents: opts.amountCents,
      }),
    });
  } catch (err) {
    console.warn('[tarot-merit] notify failed:', err);
  }
}
