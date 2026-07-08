/** Shared checkout helpers for locale-aware shop E2E */

export async function completeShippingIfNeeded(page) {
  const form = page.locator('.shop-shipping-form');
  const visible = await form.isVisible({ timeout: 8000 }).catch(() => false);
  if (!visible) return;

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
  await page.getByTestId('checkout-mock-pay').waitFor({ state: 'visible', timeout: 45000 });
}

export async function clickMockPay(page) {
  await completeShippingIfNeeded(page);
  await page.getByTestId('checkout-mock-pay').click();
}

export const BUY_BUTTON = /购买|Buy|Comprar|購買/;
