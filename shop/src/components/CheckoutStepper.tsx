'use client';

import { useTranslations } from 'next-intl';

type CheckoutStep = 'contact' | 'shipping' | 'payment';

type CheckoutStepperProps = {
  current: CheckoutStep;
  requiresShipping: boolean;
};

export function CheckoutStepper({ current, requiresShipping }: CheckoutStepperProps) {
  const t = useTranslations('checkout');

  const STEPS: Array<{ id: CheckoutStep; label: string }> = [
    { id: 'contact', label: t('stepContact') },
    { id: 'shipping', label: t('stepShipping') },
    { id: 'payment', label: t('stepPayment') },
  ];

  const visible = requiresShipping
    ? STEPS
    : STEPS.filter((s) => s.id !== 'shipping');

  const currentIndex = visible.findIndex((s) => s.id === current);

  return (
    <nav className="shop-checkout-steps" aria-label={t('stepsAria')}>
      <ol className="shop-checkout-steps-list">
        {visible.map((step, index) => {
          const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'pending';
          return (
            <li key={step.id} className="shop-checkout-step" data-state={state}>
              <span className="shop-checkout-step-dot" aria-hidden>{index + 1}</span>
              <span className="shop-checkout-step-label">{step.label}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type { CheckoutStep };
