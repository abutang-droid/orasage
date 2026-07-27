import { MiniKit } from '@worldcoin/minikit-js';
import {
  Tokens,
  tokenToDecimals,
  type CommandResultByVia,
  type MiniKitPayOptions,
  type PayResult,
} from '@worldcoin/minikit-js/commands';
import { worldAppId } from '../../../shared/world-minikit/config';

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

  const appId = worldAppId();
  const install = appId ? MiniKit.install(appId) : MiniKit.install();
  if (!install.success && install.errorCode !== 'already_installed') {
    throw new Error(
      install.errorMessage || install.errorCode || 'WORLD_APP_REQUIRED',
    );
  }
  if (!MiniKit.isInstalled()) {
    throw new Error('WORLD_APP_REQUIRED');
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

  let result: CommandResultByVia<PayResult, PayResult, 'minikit'>;
  try {
    result = await MiniKit.pay(payInput);
  } catch (err) {
    const code =
      err && typeof err === 'object' && 'code' in err
        ? String((err as { code?: string }).code || '')
        : '';
    if (code === 'user_rejected') {
      throw new Error('Payment was cancelled');
    }
    throw err instanceof Error ? err : new Error('World payment failed');
  }

  if (result.executedWith === 'fallback') {
    throw new Error('WORLD_APP_REQUIRED');
  }

  const payload = result.data as {
    transactionId?: string;
    reference?: string;
    from?: string;
    chain?: string;
    timestamp?: string;
    status?: string;
    error_code?: string;
  };

  if (!payload?.transactionId || !payload.reference) {
    throw new Error(
      payload?.error_code
        ? `World pay error: ${payload.error_code}`
        : 'World pay returned an incomplete payload',
    );
  }

  const confirmRes = await fetch(confirmUrl, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      payload: {
        transactionId: payload.transactionId,
        reference: payload.reference,
        from: payload.from,
        chain: payload.chain,
        timestamp: payload.timestamp,
      },
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
