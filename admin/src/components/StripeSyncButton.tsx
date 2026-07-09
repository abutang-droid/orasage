'use client';

import { useState, useTransition } from 'react';
import { syncStripeMirrorAction } from '@/app/finance-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

type Props = {
  days: number;
};

export function StripeSyncButton({ days }: Props) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="finance-sync-actions">
      <AdminSubmitButton
        type="button"
        disabled={pending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await syncStripeMirrorAction(days);
            if (result.ok) {
              setMessage(
                `同步完成：收款 ${result.syncRun.chargesUpserted} · 退款 ${result.syncRun.refundsUpserted} · 提现 ${result.syncRun.payoutsUpserted}`,
              );
            } else {
              setMessage(result.error);
            }
          });
        }}
      >
        {pending ? '同步中…' : '从 Stripe 同步'}
      </AdminSubmitButton>
      {message ? <p className="finance-sync-msg">{message}</p> : null}
    </div>
  );
}
