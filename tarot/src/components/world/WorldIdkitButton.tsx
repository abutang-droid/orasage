'use client';

import { useCallback, useState } from 'react';
import {
  IDKitRequestWidget,
  deviceLegacy,
  type IDKitResult,
  type RpContext,
} from '@worldcoin/idkit';
import {
  isWorldIdkitEnabled,
  worldAppId,
  worldIdAction,
} from '@/lib/world-minikit';

type Props = {
  disabled?: boolean;
  className?: string;
  onSuccessLogin: () => void;
  onError?: (message: string) => void;
};

/**
 * Portal action `manto-tarot` — World ID device-legacy verify → orasage_token.
 */
export function WorldIdkitButton({
  disabled,
  className,
  onSuccessLogin,
  onError,
}: Props) {
  const enabled = isWorldIdkitEnabled();
  const appId = worldAppId();
  const action = worldIdAction() || 'manto-tarot';

  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchRpContext = useCallback(async (): Promise<RpContext> => {
    const res = await fetch('/api/world/idkit/rp-context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: '{}',
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => ({}))) as RpContext & {
      error?: string;
      code?: string;
    };
    if (!res.ok) {
      throw new Error(
        typeof data.error === 'string'
          ? data.error
          : `Failed to get RP context (${res.status})`,
      );
    }
    if (!data.rp_id || !data.nonce || !data.signature) {
      throw new Error('Invalid RP context from server');
    }
    return {
      rp_id: data.rp_id,
      nonce: data.nonce,
      created_at: data.created_at,
      expires_at: data.expires_at,
      signature: data.signature,
    };
  }, []);

  const start = useCallback(async () => {
    if (!enabled || !appId.startsWith('app_')) {
      onError?.('World ID is not configured');
      return;
    }
    setBusy(true);
    try {
      const ctx = rpContext || (await fetchRpContext());
      setRpContext(ctx);
      setOpen(true);
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'World ID start failed');
    } finally {
      setBusy(false);
    }
  }, [appId, enabled, fetchRpContext, onError, rpContext]);

  const handleVerify = useCallback(async (result: IDKitResult) => {
    const res = await fetch('/api/world/idkit/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ proof: result }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      throw new Error(
        typeof data.error === 'string' ? data.error : 'Verification failed',
      );
    }
  }, []);

  if (!enabled || !appId.startsWith('app_')) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className={className || 'world-auth-gate-cta os-solid-cta'}
        disabled={disabled || busy}
        onClick={() => void start()}
      >
        {busy ? 'Preparing World ID…' : 'Verify with World ID'}
      </button>

      {rpContext ? (
        <IDKitRequestWidget
          open={open}
          onOpenChange={setOpen}
          app_id={appId as `app_${string}`}
          action={action}
          action_description="Sign in to OriCosmos Tarot"
          rp_context={rpContext}
          allow_legacy_proofs={true}
          preset={deviceLegacy()}
          handleVerify={handleVerify}
          onSuccess={() => {
            setOpen(false);
            onSuccessLogin();
          }}
          onError={(code) => {
            onError?.(
              code === 'user_rejected'
                ? 'World ID was cancelled'
                : `World ID error: ${code}`,
            );
          }}
        />
      ) : null}
    </>
  );
}
