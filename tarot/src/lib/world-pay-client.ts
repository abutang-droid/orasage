import { MiniKit } from '@worldcoin/minikit-js';
import {
  Tokens,
  tokenToDecimals,
  type CommandResultByVia,
  type MiniKitPayOptions,
  type PayResult,
} from '@worldcoin/minikit-js/commands';

export type WorldPayIntent = {
  reference: string;
  to: string;
  wldAmount: number;
  description: string;
  orderNo: string;
  successUrl?: string | null;
};

export type WorldPayConfirmResult = {
  ok: boolean;
  orderNo: string;
  status?: string;
  transactionId?: string;
};

export async function payWithWorldWallet(input: {
  intent: WorldPayIntent;
  confirmUrl: string;
}): Promise<WorldPayConfirmResult> {
  const { intent, confirmUrl } = input;
  if (!intent.to || !intent.reference) {
    throw new Error('Invalid World payment intent');
  }
  if (!(intent.wldAmount > 0)) {
    throw new Error('Invalid World payment amount');
  }

  const payInput = {
    reference: intent.reference,
    to: intent.to,
    tokens: [
      {
        symbol: Tokens.WLD,
        token_amount: tokenToDecimals(intent.wldAmount, Tokens.WLD).toString(),
      },
    ],
    description: intent.description.slice(0, 120),
    fallback: () => {
      throw new Error('WORLD_APP_REQUIRED');
    },
  } satisfies MiniKitPayOptions;

  const result: CommandResultByVia<PayResult, PayResult, 'minikit'> =
    await MiniKit.pay(payInput);

  if (result.executedWith === 'fallback') {
    throw new Error('WORLD_APP_REQUIRED');
  }

  const payload = result.data as {
    transactionId: string;
    reference: string;
    from: string;
    chain: string;
    timestamp: string;
  };

  const confirmRes = await fetch(confirmUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload,
      orderNo: intent.orderNo,
    }),
  });
  const data = await confirmRes.json().catch(() => ({}));
  if (!confirmRes.ok) {
    throw new Error(
      typeof data.error === 'string' ? data.error : `Payment confirm failed (${confirmRes.status})`,
    );
  }
  return data as WorldPayConfirmResult;
}
