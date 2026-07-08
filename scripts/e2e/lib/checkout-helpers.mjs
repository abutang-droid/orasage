/** Shared checkout helpers for locale-aware shop E2E */

export function mockPayButton(page) {
  return page
    .getByTestId('checkout-mock-pay')
    .or(page.getByRole('button', { name: /模拟支付|Mock pay|Pagamento simulado/i }));
}

export async function completeShippingIfNeeded(page) {
  const form = page.locator('.shop-shipping-form');
  const heading = page.getByRole('heading', { name: /填写收货|Shipping|Entrega/i });
  const needsShipping = await Promise.race([
    form.waitFor({ state: 'visible', timeout: 12000 }).then(() => true),
    heading.waitFor({ state: 'visible', timeout: 12000 }).then(() => true),
  ]).catch(() => false);

  if (!needsShipping) return;

  await page.locator('input[autocomplete="name"]').first().fill('E2E Test');
  await page.locator('input[autocomplete="tel"]').first().fill('13800000000');
  const address = page.locator('textarea').first();
  if (await address.isVisible().catch(() => false)) {
    await address.fill('E2E Test Street 1');
  }

  const wrist = page.locator('.shop-shipping-input[inputmode="decimal"]');
  if ((await wrist.count()) > 0) {
    await wrist.first().fill('16');
  }

  await page.locator('.shop-shipping-submit').click();
  await mockPayButton(page).waitFor({ state: 'visible', timeout: 45000 });
}

export async function clickMockPay(page) {
  await completeShippingIfNeeded(page);
  await mockPayButton(page).click();
}

export const BUY_BUTTON = /购买|Buy|Comprar|購買/;
