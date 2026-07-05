'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchTarotReportProduct, type TarotReportProduct } from '@/lib/tarot-products';
import { useTarotPaymentFlow } from '@/lib/useTarotPaymentFlow';

type Props = {
  freeReadingsRemaining?: number;
  requiresLogin?: boolean;
};

export function TarotPaywallCard({ freeReadingsRemaining = 0, requiresLogin = false }: Props) {
  const [product, setProduct] = useState<TarotReportProduct | null>(null);
  const { loading, error, unlockReading, loginUrl } = useTarotPaymentFlow();

  useEffect(() => {
    void fetchTarotReportProduct().then(setProduct);
  }, []);

  const name = product?.name ?? '塔罗深度解读';
  const desc = product?.desc ?? '牌阵详解 · 行动建议';
  const price = product?.priceDisplay ?? '¥48.00';

  return (
    <div
      className="orasage-fade-in"
      style={{
        maxWidth: 420,
        width: '100%',
        margin: '0 auto',
        borderRadius: 'var(--r-lg, 16px)',
        padding: '20px 18px',
        background: 'linear-gradient(180deg, rgba(184,148,63,0.08) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--border-focus)',
      }}
    >
      <p style={{
        fontSize: 11,
        color: 'var(--gold)',
        letterSpacing: '0.12em',
        textAlign: 'center',
        margin: '0 0 8px',
      }}>
        免费次数已用完
      </p>
      <h2 style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-primary)',
        textAlign: 'center',
        margin: '0 0 8px',
      }}>
        解锁深度解读
      </h2>
      <p style={{
        fontSize: 14,
        lineHeight: 1.6,
        color: 'var(--text-secondary)',
        textAlign: 'center',
        margin: '0 0 16px',
      }}>
        {desc}
        {freeReadingsRemaining <= 0 ? ' · 购买后可立即开始新一轮三张牌解读' : ''}
      </p>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        border: '1px solid var(--gold)',
        background: 'var(--bg-card)',
        marginBottom: 14,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>三张牌 · AI 解读 · 行动建议</div>
        </div>
        <span style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--gold)',
        }}>
          {price}
        </span>
      </div>

      {requiresLogin ? (
        <Link
          href={loginUrl()}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '12px 16px',
            borderRadius: 999,
            background: 'var(--gold)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          登录后购买
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => void unlockReading()}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 999,
            border: 'none',
            background: 'var(--gold)',
            color: '#fff',
            fontWeight: 700,
            fontSize: 15,
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '正在跳转结账…' : '解锁深度解读'}
        </button>
      )}

      {error ? (
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--rose)', textAlign: 'center' }}>{error}</p>
      ) : null}

      <p style={{
        marginTop: 14,
        fontSize: 11,
        lineHeight: 1.5,
        color: 'var(--text-muted)',
        textAlign: 'center',
      }}>
        持光者及以上每月另有免费解读额度 · 拜神满 7 天可获赠 1 次
      </p>
    </div>
  );
}
