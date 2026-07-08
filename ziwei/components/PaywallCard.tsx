'use client';

import type { PlanType } from '@/lib/plan-types';
import { PLAN_PRICES } from '@/lib/plan-types';
import { useT } from '@/lib/i18n';
import { useMemo } from 'react';
import { Badge } from '@orasage/ui/badge';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';

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
    <Card
      className="orasage-fade-in rounded-[var(--r-lg)] border-[var(--orasage-gold-border,var(--gold-border))] p-5 shadow-none"
      style={{
        background: 'linear-gradient(180deg, var(--orasage-gold-pale, rgba(184,148,63,0.08)) 0%, var(--bg-card) 100%)',
      }}
    >
      <p
        className="mb-3 text-center text-xs tracking-[var(--orasage-letter-wide,0.05em)]"
        style={{ color: 'var(--tx-3)', fontFamily: 'var(--font)' }}
      >
        {t('paywall.subtitle')}
      </p>
      <div className="flex flex-col gap-2">
        {plans.map((plan) => {
          const price = PLAN_PRICES[plan.type][mode];
          return (
            <Button
              key={plan.type}
              type="button"
              variant="outline"
              onClick={() => onPay(plan.type)}
              className="h-auto w-full justify-between rounded-[var(--r-md)] px-4 py-3 text-left font-normal"
              style={{
                background: plan.highlight ? 'var(--bg-card)' : 'var(--bg-0)',
                borderColor: plan.highlight ? 'var(--gold)' : 'var(--bdr)',
              }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: plan.highlight ? 'var(--gold)' : 'var(--tx-0)',
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {t(plan.nameKey)}
                  </span>
                  {plan.highlight ? (
                    <Badge
                      className="border-0 px-2 py-0 text-[10px] font-semibold"
                      style={{ background: 'var(--gold)', color: '#fff' }}
                    >
                      {t('plan.popular')}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-xs" style={{ color: 'var(--tx-3)' }}>
                  {t(plan.descKey)}
                </p>
              </div>
              <span
                className="text-base font-bold"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-serif)' }}
              >
                {price}
              </span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
