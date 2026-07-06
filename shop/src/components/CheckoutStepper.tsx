type CheckoutStep = 'contact' | 'shipping' | 'payment';

type CheckoutStepperProps = {
  current: CheckoutStep;
  requiresShipping: boolean;
};

const STEPS: Array<{ id: CheckoutStep; label: string }> = [
  { id: 'contact', label: '联系' },
  { id: 'shipping', label: '配送' },
  { id: 'payment', label: '支付' },
];

export function CheckoutStepper({ current, requiresShipping }: CheckoutStepperProps) {
  const visible = requiresShipping
    ? STEPS
    : STEPS.filter((s) => s.id !== 'shipping');

  const currentIndex = visible.findIndex((s) => s.id === current);

  return (
    <nav className="shop-checkout-steps" aria-label="结账步骤">
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
