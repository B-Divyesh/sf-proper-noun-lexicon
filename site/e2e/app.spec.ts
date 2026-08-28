import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('review flow corrects and restores only approved terms', async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on('console', message => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Proper Noun Lexicon/);
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByLabel('Approved spelling').fill('Sociobot');
  await page.getByLabel('Spoken aliases').fill('socio bot | soshio bot');
  await page.getByRole('button', { name: 'Add term' }).click();
  await page.getByLabel('Raw transcript').fill('Ask socio bot about sociobotics.');
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();
  await expect(page.getByLabel('Corrected transcript')).toContainText('Ask Sociobot about sociobotics.');
  await expect(page.getByText('1 approved change')).toBeVisible();
  await page.getByRole('button', { name: 'Restore raw' }).click();
  await expect(page.getByLabel('Raw transcript')).toHaveValue('Ask socio bot about sociobotics.');
  expect(runtimeErrors).toEqual([]);
});

test('keyboard path and export are available', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Load sample vocabulary' }).click();
  await page.getByLabel('Raw transcript').press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(page.getByLabel('Corrected transcript')).toContainText('Sociobot');
  await page.getByRole('tab', { name: 'Google Speech' }).click();
  await expect(page.locator('#export-preview')).toContainText('phraseSet');
});

test('has no serious or critical accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
});

test('legal pages expose one main heading', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
  }
});

test('local correction remains available when connection drops', async ({ page, context }) => {
  await page.goto('/');
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.locator('#connection-status')).toContainText('Offline');
  await page.getByRole('button', { name: 'Load sample vocabulary' }).click();
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();
  await expect(page.getByLabel('Corrected transcript')).toContainText('Sociobot');
});
