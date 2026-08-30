import { expect, test } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '../..');
const sampleRaw = 'Ask socio bot whether the cuber netties A P I is ready.';

test('@claim:demo-sandbox keeps sample work separate from the real workspace', async ({ page }) => {
  const realWorkspace = JSON.stringify({ entries: [{ term: 'Real term', aliases: ['real alias'] }], raw: 'Real draft' });
  await page.addInitScript(value => localStorage.setItem('pnl:workspace:v1', value), realWorkspace);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  await page.getByRole('link', { name: /Try it with sample data/ }).click();

  await expect(page).toHaveTitle('Demo — Proper Noun Lexicon');
  await expect(page.getByLabel('Demo controls')).toContainText('Demo — sample data, nothing is saved');
  await expect(page.locator('#entry-count')).toHaveText('3 terms');
  await expect(page.getByLabel('Raw transcript')).toHaveValue(sampleRaw);
  const firstSample = await page.getByRole('button', { name: 'Remove Sociobot' }).boundingBox();
  expect(firstSample?.y).toBeLessThan((page.viewportSize()?.height || 0) + 1);
  expect(await page.evaluate(() => localStorage.getItem('pnl:workspace:v1'))).toBe(realWorkspace);

  await page.getByRole('button', { name: 'Remove Sociobot' }).click();
  await expect(page.locator('#entry-count')).toHaveText('2 terms');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#entry-count')).toHaveText('3 terms');

  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/#workspace$/);
  await expect(page.getByText('Real term', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('demo:pnl:')))).toEqual([]);
});

test('@claim:local-privacy sends no vocabulary or transcript during the demo flow', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('/demo');
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();
  await expect(page.getByLabel('Corrected transcript')).toContainText('Sociobot');

  const origin = new URL(page.url()).origin;
  expect([...new Set(requests.map(url => new URL(url).origin))]).toEqual([origin]);
  expect(await page.evaluate(() => ({
    real: localStorage.getItem('pnl:workspace:v1'),
    demo: localStorage.getItem('demo:pnl:workspace:v1'),
  }))).toEqual({ real: null, demo: expect.any(String) });
});

test('@claim:offline-reload reopens the demo and corrects text offline', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The claim uses one dedicated browser context.');
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/demo');
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    await page.reload();
    await context.setOffline(true);
    await page.reload();
    await expect(page).toHaveTitle('Demo — Proper Noun Lexicon');
    await expect(page.locator('#connection-status')).toContainText('Offline');
    await page.getByRole('button', { name: /Apply approved corrections/ }).click();
    await expect(page.getByLabel('Corrected transcript')).toContainText('Sociobot');
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test('@claim:approved-reversible changes approved aliases and restores the exact raw text', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Approved spelling').fill('Bot');
  await page.getByLabel('Spoken aliases').fill('bot');
  await page.getByRole('button', { name: 'Add term' }).click();
  const raw = 'Ask SOCIO BOT whether the cuber netties A P I is ready. Keep sociobotics unchanged.';
  await page.getByLabel('Raw transcript').fill(raw);
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();
  await expect(page.getByLabel('Corrected transcript')).toHaveText('Ask Sociobot whether the Kubernetes API is ready. Keep sociobotics unchanged.');
  await expect(page.locator('#change-count')).toHaveText('3 approved changes');
  await page.getByRole('button', { name: 'Restore raw' }).click();
  await expect(page.getByLabel('Raw transcript')).toHaveValue(raw);
});

test('@claim:cli-json returns machine-readable command errors without prompting', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The CLI claim runs once.');
  const run = spawnSync('cargo', [
    'run', '--quiet', '--manifest-path', resolve(repo, 'cli/Cargo.toml'), '--', '--json', 'export',
    '--lexicon', 'missing.json', '--format', 'invented', '--output', 'unused.json',
  ], { cwd: repo, encoding: 'utf8' });
  expect(run.status).toBe(2);
  const error = JSON.parse(run.stderr) as { ok: boolean; error: string };
  expect(error.ok).toBe(false);
  expect(error.error).toContain('invalid value');
  expect(run.stdout).toBe('');
});

test('@claim:typed-library compiles the documented Rust API example', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The library claim runs once.');
  const run = spawnSync('cargo', ['test', '--doc', '--manifest-path', resolve(repo, 'cli/Cargo.toml')], { cwd: repo, encoding: 'utf8' });
  expect(run.status, run.stderr).toBe(0);
  expect(`${run.stdout}\n${run.stderr}`).toContain('1 passed');
});

test('@claim:model-exports emits each documented model payload from sample data', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#export-preview')).toContainText('Sociobot, Kubernetes, API');

  await page.getByRole('tab', { name: 'Google Speech' }).click();
  const google = JSON.parse(await page.locator('#export-preview').textContent() || '{}');
  expect(Object.keys(google)).toEqual(['phrases']);
  expect(google.phrases).toEqual([
    { value: 'Sociobot', boost: 15 },
    { value: 'Kubernetes', boost: 15 },
    { value: 'API', boost: 15 },
  ]);

  await page.getByRole('tab', { name: 'Azure Speech' }).click();
  expect(JSON.parse(await page.locator('#export-preview').textContent() || '{}')).toEqual({ phrases: ['Sociobot', 'Kubernetes', 'API'] });
});

test('@claim:free-limit enforces 25 terms and a verified license removes that limit', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }),
  );
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  const csv = `term,aliases\n${Array.from({ length: 26 }, (_, index) => `Term ${index + 1},alias ${index + 1}`).join('\n')}\n`;
  await page.locator('#csv-file').setInputFiles({ name: '26-terms.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.getByRole('alert')).toContainText('free workspace holds 25 terms');
  await expect(page.locator('#entry-count')).toHaveText('0 terms');

  await page.getByRole('button', { name: 'Have a license? Restore it' }).click();
  await page.getByLabel('License token').fill('recorded-valid-license');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('#license-status')).toContainText('License verified');
  await page.locator('#csv-file').setInputFiles({ name: '26-terms.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#entry-count')).toHaveText('26 terms');
  await expect(page.locator('#buy-link')).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/proper-noun-lexicon/checkout');
});

test('@claim:cli-demo runs bundled data in a temporary directory with every output', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The CLI claim runs once.');
  const result = JSON.parse(execFileSync('cargo', [
    'run', '--quiet', '--manifest-path', resolve(repo, 'cli/Cargo.toml'), '--', '--json', 'demo',
  ], { cwd: repo, encoding: 'utf8' })) as { directory: string; corrected: string; entries: number; changes: number; files: string[] };
  try {
    expect(resolve(result.directory).startsWith(resolve(tmpdir()))).toBe(true);
    expect(result.entries).toBe(3);
    expect(result.changes).toBe(3);
    expect(result.corrected).toBe('Ask Sociobot whether the Kubernetes API is ready.\n');
    expect(result.files).toHaveLength(8);
    const audit = JSON.parse(readFileSync(resolve(result.directory, 'review.pnl-audit.json'), 'utf8')) as { raw: string; corrected: string };
    expect(audit.raw).toBe('Ask socio bot whether the cuber netties A P I is ready.\n');
    expect(audit.corrected).toBe(result.corrected);
  } finally {
    rmSync(result.directory, { recursive: true, force: true });
  }
});
