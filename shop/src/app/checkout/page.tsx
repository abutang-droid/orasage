'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, Suspense } from 'react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNo = searchParams.get('order') ?? '';
  const returnUrl = searchParams.get('return');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const payingRef = useRef(false);

  useEffect(() => {
    if (!orderNo) setError('缺少订单号');
  }, [orderNo]);

  function formatPayError(err: unknown): string {
    if (err instanceof TypeError) {
      return '网络异常，请检查连接后重试';
    }
    if (err instanceof Error && /failed to fetch|networkerror|load failed/i.test(err.message)) {
      return '网络异常，请检查连接后重试';
    }
    return err instanceof Error ? err.message : '支付失败';
  }

  async function handlePay() {
    if (!orderNo || payingRef.current || done) return;
    payingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pay?order=${encodeURIComponent(orderNo)}`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '支付失败');
      setDone(true);
      if (returnUrl) {
        setTimeout(() => { window.location.href = returnUrl; }, 800);
      } else {
        setTimeout(() => router.push(`/success?order=${encodeURIComponent(orderNo)}`), 800);
      }
    } catch (err) {
      payingRef.current = false;
      setError(formatPayError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <h1 className="font-serif text-2xl text-amber-200">确认支付</h1>
      <p className="mt-3 text-sm text-stone-400">订单号：{orderNo || '—'}</p>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {done ? (
        <p className="mt-6 text-sm text-green-400">支付成功，正在跳转…</p>
      ) : (
        <button
          type="button"
          disabled={loading || !orderNo}
          onClick={() => void handlePay()}
          className="mt-8 rounded-full border border-amber-500/40 px-8 py-3 text-amber-200 transition hover:bg-amber-500/10 disabled:opacity-50"
        >
          {loading ? '处理中…' : '模拟支付（完成订单）'}
        </button>
      )}
      <p className="mt-6 text-center text-xs text-stone-500">
        当前为模拟支付模式，用于产品流程测试与风控审核。正式上线前将切换至 Stripe。
      </p>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="p-16 text-center text-stone-400">加载中…</main>}>
      <CheckoutContent />
    </Suspense>
  );
}
