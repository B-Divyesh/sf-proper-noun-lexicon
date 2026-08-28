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

test('keyboard path and documented Google export are available', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Load sample vocabulary' }).click();
  await page.getByLabel('Raw transcript').press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  await expect(page.getByLabel('Corrected transcript')).toContainText('Sociobot');

  const whisper = page.getByRole('tab', { name: 'Whisper' });
  const google = page.getByRole('tab', { name: 'Google Speech' });
  await whisper.focus();
  await whisper.press('ArrowRight');
  await expect(google).toBeFocused();
  await expect(google).toHaveAttribute('aria-selected', 'true');
  await expect(whisper).toHaveAttribute('tabindex', '-1');
  const payload = JSON.parse(await page.locator('#export-preview').textContent() || '{}');
  expect(Object.keys(payload)).toEqual(['phrases']);
  expect(payload.phrases[0]).toEqual({ value: 'Sociobot', boost: 15 });
  expect(payload).not.toHaveProperty('phraseSet');
  await expect(page.locator('#export-help')).toContainText('RecognitionConfig.adaptation.phraseSets[]');

  await google.press('End');
  await expect(page.getByRole('tab', { name: 'Azure Speech' })).toBeFocused();
  await page.getByRole('tab', { name: 'Azure Speech' }).press('Home');
  await expect(whisper).toBeFocused();
});

test('CSV import is sequentially keyboard focusable and operable', async ({ page }, testInfo) => {
  await page.goto('/');
  for (let index = 0; index < 20; index += 1) {
    if (await page.evaluate(() => document.activeElement?.id === 'csv-file')) break;
    await page.keyboard.press('Tab');
  }
  await expect(page.locator('#csv-file')).toBeFocused();
  await expect(page.locator('label[for="csv-file"]')).toHaveCSS('outline-style', 'solid');

  const chooser = page.waitForEvent('filechooser');
  await page.keyboard.press(testInfo.project.name === 'mobile-390' ? 'Space' : 'Enter');
  await (await chooser).setFiles({
    name: 'keyboard.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('term,aliases\nSociobot,socio bot\n'),
  });
  await expect(page.locator('#entry-count')).toHaveText('1 term');
  await expect(page.getByText('Sociobot', { exact: true })).toBeVisible();
});

test('every visible landing-page link has a 44 by 44 CSS pixel target', async ({ page }) => {
  await page.goto('/');
  const undersized = await page.locator('a:visible').evaluateAll(links => links.flatMap(link => {
    const box = link.getBoundingClientRect();
    return box.width + 0.01 < 44 || box.height + 0.01 < 44
      ? [{ text: link.textContent?.trim(), width: box.width, height: box.height }]
      : [];
  }));
  expect(undersized).toEqual([]);
});

test('production purchase and license verification use only the production billing API', async ({ page }) => {
  const verifyRequests: string[] = [];
  await page.route('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**', async route => {
    verifyRequests.push(route.request().url());
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) });
  });
  await page.goto('/?license=qa-invalid-token');
  await expect(page).not.toHaveURL(/license=/);
  await expect(page.locator('#buy-link')).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/proper-noun-lexicon/checkout');
  expect(verifyRequests).toEqual(['https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify?license=qa-invalid-token']);
});

test('a returned production license is stored, stripped from the URL, and unlocks after verification', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }),
  );
  await page.goto('/?license=qa-valid-token');

  await expect(page).not.toHaveURL(/license=/);
  await expect(page.locator('#license-status')).toContainText('License verified');
  await expect(page.locator('body')).toHaveClass(/is-pro/);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:proper-noun-lexicon'))).toBe('qa-valid-token');
});

test('restore, daily verification cache, revocation, and offline fallback preserve the license contract', async ({ page }) => {
  let verdict: 'valid' | 'revoked' = 'valid';
  let verifyRequests = 0;
  await page.route('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**', route => {
    verifyRequests += 1;
    const valid = verdict === 'valid';
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid, reason: valid ? 'ok' : 'revoked', expires_at: null }) });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Have a license? Restore it' }).click();
  await page.getByLabel('License token').fill('qa-restored-token');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('body')).toHaveClass(/is-pro/);
  await expect(page.locator('#license-status')).toContainText('License verified');
  expect(verifyRequests).toBe(1);

  await page.reload();
  await expect(page.locator('body')).toHaveClass(/is-pro/);
  expect(verifyRequests).toBe(1);

  await page.evaluate(() => {
    const key = 'sb_license_verdict:proper-noun-lexicon';
    const cached = JSON.parse(localStorage.getItem(key)!);
    cached.checkedAt = 0;
    localStorage.setItem(key, JSON.stringify(cached));
  });
  verdict = 'revoked';
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/is-pro/);
  await expect(page.locator('#license-status')).toContainText('License no longer active');
  expect(verifyRequests).toBe(2);

  await page.evaluate(() => {
    const token = 'qa-offline-token';
    localStorage.setItem('sb_license:proper-noun-lexicon', token);
    localStorage.setItem('sb_license_verdict:proper-noun-lexicon', JSON.stringify({ valid: true, checkedAt: 0, token }));
  });
  await page.unroute('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**');
  await page.route('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**', route => route.abort());
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/is-pro/);
  await expect(page.locator('#license-status')).toContainText('Offline — using the last verified license');
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
