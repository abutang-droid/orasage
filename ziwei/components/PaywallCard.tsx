'use client';

import type { PlanType } from '@/lib/plan-types';
import { PLAN_PRICES } from '@/lib/plan-types';
import { useT } from '@/lib/i18n';
import { useMemo } from 'react';

interface PlanConfig {
  type: PlanType;
  nameKey: string;
  descKey: string;
  highlight?: boolean;
}

const SINGLE_PLANS: PlanConfig[] = [
  { type: 'basic', nameKey: 'plan.basic.name', descKey: 'plan.basic.desc' },
  { type: 'advanced', nameKey: 'plan.advanced.name', descKey: 'plan.advanced.desc', highlight: true },
  { type: 'premium', nameKey: 'plan.premium.name', descKey: 'plan.premium.desc' },
];

const COUPLE_PLANS: PlanConfig[] = [
  { type: 'basic', nameKey: 'plan.couple.basic.name', descKey: 'plan.couple.basic.desc' },
  { type: 'advanced', nameKey: 'plan.couple.advanced.name', descKey: 'plan.couple.advanced.desc', highlight: true },
  { type: 'premium', nameKey: 'plan.couple.premium.name', descKey: 'plan.couple.premium.desc' },
];

interface PaywallCardProps {
  onPay: (plan: PlanType) => void;
  mode?: 'single' | 'couple';
}

export default function PaywallCard({ onPay, mode = 'single' }: PaywallCardProps) {
  const t = useT();
  const plans = useMemo(() => (mode === 'couple' ? COUPLE_PLANS : SINGLE_PLANS), [mode]);

  return (
    <div
      className="orasage-fade-in"
      style={{
        borderRadius: 'var(--r-lg)',
        padding: '1.25rem',
        background: 'linear-gradient(180deg, var(--orasage-gold-pale, rgba(184,148,63,0.08)) 0%, var(--bg-card) 100%)',
        border: '1px solid var(--orasage-gold-border, var(--gold-border))',
      }}
    >
      <p style={{
        color: 'var(--tx-3)',
        fontSize: '0.75rem',
        textAlign: 'center',
        marginBottom: '0.75rem',
        fontFamily: 'var(--font)',
        letterSpacing: 'var(--orasage-letter-wide, 0.05em)',
      }}>
        {t('paywall.subtitle')}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {plans.map((plan) => {
          const price = PLAN_PRICES[plan.type][mode];
          return (
            <button
              key={plan.type}
              type="button"
              onClick={() => onPay(plan.type)}
              style={{
                width: '100%',
                borderRadius: 'var(--r-md)',
                padding: '0.75rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: plan.highlight ? 'var(--bg-card)' : 'var(--bg-0)',
                border: plan.highlight ? '1px solid var(--gold)' : '1px solid var(--bdr)',
                cursor: 'pointer',
                transition: 'transform 0.15s var(--orasage-ease-organic, ease), border-color 0.15s',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    color: plan.highlight ? 'var(--gold)' : 'var(--tx-0)',
                    fontFamily: 'var(--font)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}>
                    {t(plan.nameKey)}
                  </span>
                  {plan.highlight && (
                    <span style={{
                      background: 'var(--gold)',
                      color: '#fff',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      padding: '0.125rem 0.5rem',
                      borderRadius: 999,
                    }}>
                      {t('plan.popular')}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--tx-3)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {t(plan.descKey)}
                </p>
              </div>
              <span style={{
                color: 'var(--gold)',
                fontFamily: 'var(--font-serif)',
                fontSize: '1rem',
                fontWeight: 700,
              }}>
                {price}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
