/** Shared bazi form helpers for browser E2E */

const DEFAULT_BIRTH = {
  year: '1990',
  month: '06',
  day: '15',
  hour: '08',
  minute: '00',
};

async function fillDatePickers(page, birth) {
  const values = [birth.year, birth.month, birth.day, birth.hour, birth.minute];
  const triggers = page.locator('.bazi-date-trigger:visible');
  await triggers.first().waitFor({ state: 'visible', timeout: 20000 });
  const count = await triggers.count();
  if (count < 5) {
    throw new Error(`expected 5 visible date fields, got ${count}`);
  }

  for (let i = 0; i < 5; i++) {
    await triggers.nth(i).click();
    const input = page.locator('.bazi-date-input:visible').first();
    await input.waitFor({ state: 'visible', timeout: 5000 });
    await input.fill(String(values[i]));
    await input.press('Enter');
    await page.waitForTimeout(120);
  }
}

async function fillBirthCity(page, city = '北京') {
  const field = page.getByPlaceholder('请输入出生城市');
  await field.scrollIntoViewIfNeeded();
  await field.waitFor({ state: 'visible', timeout: 20000 });
  await field.fill(city);
  await page.waitForTimeout(600);

  const option = page.locator('.bazi-city-option').first();
  if (await option.isVisible().catch(() => false)) {
    await option.click();
    return;
  }

  const confirm = page.getByRole('button', { name: /确认|使用|确定/i }).first();
  if (await confirm.isVisible().catch(() => false)) {
    await confirm.click();
  }
}

export async function fillBaziPerson(page, {
  name,
  personTab,
  genderLabel = '男',
  birth = DEFAULT_BIRTH,
  city = '北京',
} = {}) {
  if (personTab) {
    await page.getByRole('button', { name: personTab, exact: true }).click();
  }

  await page.locator('input.bazi-field-input:visible').first().fill(name);
  await page.getByRole('button', { name: genderLabel, exact: true }).first().click();
  await fillDatePickers(page, { ...DEFAULT_BIRTH, ...birth });
  await fillBirthCity(page, city);
}
