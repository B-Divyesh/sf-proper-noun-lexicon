import { expect, test } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { Readable } from 'node:stream';

const repo = resolve(import.meta.dirname, '../..');
const sampleRaw = 'Ask socio bot whether the cuber netties A P I is ready.';

async function readDownload(stream: Readable): Promise<string> {
  let contents = '';
  for await (const chunk of stream) contents += chunk;
  return contents;
}

function buildCli(): string {
  const build = spawnSync('cargo', ['build', '--quiet', '--manifest-path', resolve(repo, 'cli/Cargo.toml')], {
    cwd: repo,
    encoding: 'utf8',
    timeout: 60_000,
  });
  expect(build.status, build.stderr).toBe(0);
  return resolve(repo, 'target/debug/pnl');
}

function runJson(binary: string, cwd: string, arguments_: string[]) {
  return spawnSync(binary, ['--json', ...arguments_], {
    cwd,
    encoding: 'utf8',
    input: '',
    timeout: 10_000,
  });
}

function parseJsonLine(value: string): Record<string, unknown> {
  const lines = value.trim().split(/\r?\n/);
  expect(lines).toHaveLength(1);
  return JSON.parse(lines[0]) as Record<string, unknown>;
}

test('@claim:demo-sandbox keeps sample work separate from the real workspace', async ({ page }) => {
  const realWorkspace = JSON.stringify({ entries: [{ term: 'Real term', aliases: ['real alias'] }], raw: 'Real draft' });
  await page.addInitScript(value => localStorage.setItem('pnl:workspace:v1', value), realWorkspace);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Try it with sample data/ })).toBeVisible();
  await page.getByRole('link', { name: /Try it with sample data/ }).click();

  await expect(page).toHaveURL(/\?demo=1$/);
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

test('@claim:audit-reload restores the exact correction audit after reload', async ({ page }) => {
  const raw = '👋 Ask SOCIO BOT whether the cuber netties A P I is ready.';
  await page.goto('/demo');
  await page.getByLabel('Raw transcript').fill(raw);
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();

  await expect(page.getByLabel('Corrected transcript')).toHaveText('👋 Ask Sociobot whether the Kubernetes API is ready.');
  await expect(page.locator('#change-count')).toHaveText('3 approved changes');
  const firstDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download audit' }).click();
  const beforeReload = await readDownload(await (await firstDownload).createReadStream() as Readable);

  await page.reload();
  await expect(page.getByLabel('Corrected transcript')).toHaveText('👋 Ask Sociobot whether the Kubernetes API is ready.');
  await expect(page.locator('#change-count')).toHaveText('3 approved changes');
  await expect(page.locator('#change-list')).toContainText('SOCIO BOT→Sociobot');
  await expect(page.locator('#change-list')).toContainText('cuber netties→Kubernetes');
  await expect(page.locator('#change-list')).toContainText('A P I→API');

  const secondDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download audit' }).click();
  const afterReload = await readDownload(await (await secondDownload).createReadStream() as Readable);
  expect(JSON.parse(afterReload)).toEqual(JSON.parse(beforeReload));

  await page.getByRole('button', { name: 'Restore raw' }).click();
  await expect(page.getByLabel('Raw transcript')).toHaveValue(raw);
  await page.reload();
  await expect(page.locator('#result-wrap')).toBeHidden();
  await expect(page.getByLabel('Raw transcript')).toHaveValue(raw);
});

test('@claim:cli-json returns machine-readable results for every command and representative errors without prompting', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The CLI claim runs once.');
  test.setTimeout(90_000);
  const binary = buildCli();
  const directory = mkdtempSync(resolve(tmpdir(), 'pnl-json-'));
  const demoDirectories: string[] = [];
  try {
    const csv = resolve(directory, 'names.csv');
    const vocabulary = resolve(directory, 'names.pnl.json');
    const raw = resolve(directory, 'raw.txt');
    const corrected = resolve(directory, 'corrected.txt');
    const audit = resolve(directory, 'audit.json');
    const restored = resolve(directory, 'restored.txt');
    const phraseSet = resolve(directory, 'google.json');
    writeFileSync(csv, 'term,aliases\nSociobot,socio bot\nKubernetes,cuber netties\n');
    writeFileSync(raw, 'Ask socio bot about cuber netties.');

    const successfulCommands = [
      ['demo'],
      ['import', csv, '--output', vocabulary],
      ['list', '--lexicon', vocabulary],
      ['export', '--lexicon', vocabulary, '--format', 'google-speech', '--output', phraseSet],
      ['correct', '--lexicon', vocabulary, '--input', raw, '--output', corrected, '--audit', audit],
      ['rollback', audit, '--output', restored],
    ];
    for (const arguments_ of successfulCommands) {
      const run = runJson(binary, directory, arguments_);
      expect(run.status, `${arguments_[0]}: ${run.stderr}`).toBe(0);
      expect(run.stderr, arguments_[0]).toBe('');
      const result = parseJsonLine(run.stdout);
      expect(result).toMatchObject({ ok: true, command: arguments_[0] });
      if (arguments_[0] === 'demo') demoDirectories.push(String(result.directory));
    }
    expect(JSON.parse(readFileSync(phraseSet, 'utf8'))).toEqual({
      phrases: [
        { value: 'Sociobot', boost: 15 },
        { value: 'Kubernetes', boost: 15 },
      ],
    });
    expect(readFileSync(corrected, 'utf8')).toBe('Ask Sociobot about Kubernetes.');
    expect(readFileSync(restored, 'utf8')).toBe(readFileSync(raw, 'utf8'));

    const failures = [
      { arguments: ['export', '--lexicon', vocabulary, '--format', 'invented', '--output', 'unused.json'], status: 2, message: 'invalid value' },
      { arguments: ['import', csv], status: 2, message: 'required' },
      { arguments: ['list', '--lexicon', 'missing.json'], status: 1, message: 'could not read' },
    ];
    for (const failure of failures) {
      const run = runJson(binary, directory, failure.arguments);
      expect(run.status).toBe(failure.status);
      expect(run.stdout).toBe('');
      const error = parseJsonLine(run.stderr);
      expect(error.ok).toBe(false);
      expect(String(error.error).toLocaleLowerCase()).toContain(failure.message);
    }
  } finally {
    for (const demoDirectory of demoDirectories) rmSync(demoDirectory, { recursive: true, force: true });
    rmSync(directory, { recursive: true, force: true });
  }
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

test('@claim:browser-csv-export downloads every vocabulary row as reusable CSV', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const downloaded = await downloadPromise;
  expect(downloaded.suggestedFilename()).toBe('proper-noun-lexicon.csv');
  const csv = await readDownload(await downloaded.createReadStream() as Readable);
  expect(csv).toBe([
    'term,aliases',
    '"Sociobot","socio bot|soshio bot"',
    '"Kubernetes","cuber netties|kube er net ease"',
    '"API","A P I"',
    '',
  ].join('\n'));

  await page.getByRole('link', { name: 'Start for real' }).click();
  await page.locator('#csv-file').setInputFiles({ name: 'exported.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#entry-count')).toHaveText('3 terms');
  await expect(page.getByText('Kubernetes', { exact: true })).toBeVisible();
});

test('@claim:quoted-csv-import imports commas and escaped quotes without changing their text', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  const csv = [
    'term,aliases',
    '"Acme, Inc.","acme company|the ""acme"" group"',
    '"José ""Pepe"" Núñez","jose nunez|pepe"',
    '',
  ].join('\r\n');
  await page.locator('#csv-file').setInputFiles({ name: 'quoted.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await expect(page.locator('#entry-count')).toHaveText('2 terms');
  await expect(page.getByText('Acme, Inc.', { exact: true })).toBeVisible();
  await expect(page.getByText('José "Pepe" Núñez', { exact: true })).toBeVisible();
  await expect(page.locator('#term-list')).toContainText('the "acme" group');

  await page.getByLabel('Raw transcript').fill('Send this to the "acme" group and jose nunez.');
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();
  await expect(page.getByLabel('Corrected transcript')).toHaveText('Send this to Acme, Inc. and José "Pepe" Núñez.');
});

test('@claim:utf8-audit-parity emits the same UTF-8 byte offsets in the browser and CLI', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium', 'The browser/CLI parity claim runs once.');
  test.setTimeout(90_000);
  const raw = '👋 socio bot met cuber netties.';
  await page.goto('/demo');
  await page.getByLabel('Raw transcript').fill(raw);
  await page.getByRole('button', { name: /Apply approved corrections/ }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download audit' }).click();
  const browserAudit = JSON.parse(await readDownload(await (await downloadPromise).createReadStream() as Readable)) as {
    raw: string;
    corrected: string;
    changes: Array<{ start: number; end: number; original: string; replacement: string; term: string }>;
  };

  const binary = buildCli();
  const directory = mkdtempSync(resolve(tmpdir(), 'pnl-offsets-'));
  try {
    const csv = resolve(directory, 'names.csv');
    const vocabulary = resolve(directory, 'names.pnl.json');
    const rawPath = resolve(directory, 'raw.txt');
    const corrected = resolve(directory, 'corrected.txt');
    const audit = resolve(directory, 'audit.json');
    writeFileSync(csv, 'term,aliases\nSociobot,socio bot\nKubernetes,cuber netties\n');
    writeFileSync(rawPath, raw);
    expect(runJson(binary, directory, ['import', csv, '--output', vocabulary]).status).toBe(0);
    expect(runJson(binary, directory, ['correct', '--lexicon', vocabulary, '--input', rawPath, '--output', corrected, '--audit', audit]).status).toBe(0);
    const cliAudit = JSON.parse(readFileSync(audit, 'utf8')) as typeof browserAudit;
    const expectedChanges = [
      { start: 5, end: 14, original: 'socio bot', replacement: 'Sociobot', term: 'Sociobot' },
      { start: 19, end: 32, original: 'cuber netties', replacement: 'Kubernetes', term: 'Kubernetes' },
    ];
    expect(browserAudit).toMatchObject({ raw, corrected: '👋 Sociobot met Kubernetes.', changes: expectedChanges });
    expect(cliAudit).toMatchObject({ raw, corrected: browserAudit.corrected, changes: browserAudit.changes });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('@claim:free-limit enforces the 25-term browser workspace limit', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('link', { name: 'Start for real' }).click();
  const csv25 = `term,aliases\n${Array.from({ length: 25 }, (_, index) => `Term ${index + 1},alias ${index + 1}`).join('\n')}\n`;
  await page.locator('#csv-file').setInputFiles({ name: '25-terms.csv', mimeType: 'text/csv', buffer: Buffer.from(csv25) });
  await expect(page.locator('#entry-count')).toHaveText('25 terms');
  await expect(page.getByText('Term 25', { exact: true })).toBeVisible();

  const csv26 = `term,aliases\n${Array.from({ length: 26 }, (_, index) => `Replacement ${index + 1},replacement alias ${index + 1}`).join('\n')}\n`;
  await page.locator('#csv-file').setInputFiles({ name: '26-terms.csv', mimeType: 'text/csv', buffer: Buffer.from(csv26) });
  await expect(page.getByRole('alert')).toContainText('free workspace holds 25 terms');
  await expect(page.locator('#entry-count')).toHaveText('25 terms');
  await expect(page.getByText('Term 25', { exact: true })).toBeVisible();
  await expect(page.getByText('Replacement 1', { exact: true })).toHaveCount(0);
});

test('@claim:pricing shows the recorded $29 USD non-recurring offer and unlocks the term limit', async ({ page }) => {
  const catalog = JSON.parse(readFileSync(resolve(repo, 'site/e2e/fixtures/pricing-catalog.json'), 'utf8')) as {
    data: Array<{ checkout_url: string; currency: string; price_minor: number; recurring: boolean; slug: string }>;
  };
  const offer = catalog.data.find(product => product.slug === 'proper-noun-lexicon');
  expect(offer).toMatchObject({
    checkout_url: 'https://api.sociobot.in/api/v1/products/proper-noun-lexicon/checkout',
    currency: 'USD',
    price_minor: 2900,
    recurring: false,
  });
  const visibleAmount = `$${(offer!.price_minor / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

  await page.route('https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify**', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) }),
  );
  await page.goto('/');
  const pricing = page.locator('#pricing');
  await expect(pricing).toContainText(visibleAmount);
  await expect(pricing).toContainText('No subscription');
  await expect(page.locator('#buy-link')).toHaveAttribute('href', offer!.checkout_url);
  await page.goto('/terms/');
  await expect(page.locator('main')).toContainText(`${visibleAmount} one-time purchase`);
  await expect(page.locator('main')).toContainText('not a subscription');

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
