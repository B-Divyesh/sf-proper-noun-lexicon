import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.PNL_LIVE_URL || 'https://proper-noun-lexicon.sociobot.in/';
const browser = await chromium.launch();

async function checkViewport(name, viewport) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));

  await page.goto(base, { waitUntil: 'networkidle' });
  assert.equal(await page.locator('h1').count(), 1, `${name}: one h1`);
  assert.equal(await page.locator('main').count(), 1, `${name}: one main`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), true, `${name}: no horizontal overflow`);
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Skip to main content', `${name}: first Tab reaches skip link`);

  const requiredFirstScreen = await page.locator('#hero-title, .lede, #try-demo, .action-note, .proof').evaluateAll(elements => elements.map(element => {
    const box = element.getBoundingClientRect();
    return { selector: element.id || element.className, bottom: box.bottom, visible: box.width > 0 && box.height > 0 };
  }));
  assert.deepEqual(requiredFirstScreen.filter(item => !item.visible || item.bottom > viewport.height), [], `${name}: required first-screen copy fits the viewport`);

  await page.getByRole('link', { name: /Try it with sample data/ }).click();
  assert.match(page.url(), /\?demo=1$/, `${name}: one-click demo query route`);
  assert.equal(await page.locator('#workspace-title').evaluate(element => element === document.activeElement), true, `${name}: demo heading receives focus`);
  assert.match(await page.locator('#route-status').innerText(), /Demo loaded.*ready/i, `${name}: demo route is announced`);
  await page.goBack();
  assert.equal(await page.locator('#hero-title').evaluate(element => element === document.activeElement), true, `${name}: Back restores heading focus`);
  assert.match(await page.locator('#route-status').innerText(), /Home loaded/i, `${name}: Back route is announced`);

  await page.goto(new URL('/demo', base).href, { waitUntil: 'networkidle' });
  assert.equal(await page.title(), 'Demo — Proper Noun Lexicon', `${name}: demo title`);
  assert.match(await page.locator('#demo-banner').innerText(), /sample data, nothing is saved/i, `${name}: demo banner`);
  assert.equal(await page.locator('#entry-count').innerText(), '3 terms', `${name}: seeded demo`);
  await page.getByLabel('Raw transcript').press(process.platform === 'darwin' ? 'Meta+Enter' : 'Control+Enter');
  assert.match(await page.getByLabel('Corrected transcript').innerText(), /Sociobot.*Kubernetes.*API/s, `${name}: keyboard correction`);
  await page.getByRole('button', { name: 'Restore raw' }).click();
  assert.equal(await page.getByLabel('Raw transcript').inputValue(), 'Ask socio bot whether the cuber netties A P I is ready.', `${name}: raw rollback`);
  const serious = (await new AxeBuilder({ page }).analyze()).violations.filter(item => ['serious', 'critical'].includes(item.impact || ''));
  assert.deepEqual(serious, [], `${name}: no serious or critical axe findings`);

  const undersized = await page.locator('a:visible, button:visible, input:visible, textarea:visible').evaluateAll(elements => elements.flatMap(element => {
    const target = element instanceof HTMLInputElement && element.type === 'file'
      ? document.querySelector(`label[for="${element.id}"]`) || element
      : element;
    const box = target.getBoundingClientRect();
    return box.width + 0.01 < 44 || box.height + 0.01 < 44
      ? [`${target.textContent?.trim() || target.getAttribute('aria-label')}: ${box.width}x${box.height}`]
      : [];
  }));
  assert.deepEqual(undersized, [], `${name}: 44px targets`);
  assert.deepEqual(errors, [], `${name}: console/page errors`);
  assert.deepEqual([...new Set(requests.map(url => new URL(url).origin))], [new URL(base).origin], `${name}: demo requests stay same-origin`);
  await context.close();
}

await checkViewport('desktop', { width: 1440, height: 1000 });
await checkViewport('mobile', { width: 390, height: 844 });

const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
await reducedPage.goto(new URL('/demo', base).href);
assert.equal(await reducedPage.locator('html').evaluate(element => getComputedStyle(element).scrollBehavior), 'auto', 'reduced motion disables smooth scrolling');
const reducedDuration = await reducedPage.locator('.term-row').first().evaluate(element => Number.parseFloat(getComputedStyle(element).animationDuration));
assert.ok(reducedDuration <= 0.00001, 'reduced motion shortens entry animation');
await reduced.close();

const offline = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offline.newPage();
await offlinePage.goto(new URL('/demo', base).href);
await offlinePage.evaluate(() => navigator.serviceWorker.ready);
if (!await offlinePage.evaluate(() => Boolean(navigator.serviceWorker.controller))) await offlinePage.reload();
await offlinePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
await offlinePage.reload({ waitUntil: 'networkidle' });
await offline.setOffline(true);
await offlinePage.reload();
assert.equal(await offlinePage.title(), 'Demo — Proper Noun Lexicon', 'offline demo title');
assert.match(await offlinePage.locator('#connection-status').innerText(), /Offline/, 'offline state is visible');
await offlinePage.getByRole('button', { name: /Apply approved corrections/ }).click();
assert.match(await offlinePage.getByLabel('Corrected transcript').innerText(), /Sociobot/, 'offline correction works');
await offline.setOffline(false);
await offline.close();

const missing = await browser.newPage();
await missing.goto(new URL('/does-not-exist', base).href);
for (const selector of [
  'meta[property="og:type"]', 'meta[property="og:title"]', 'meta[property="og:description"]',
  'meta[property="og:url"]', 'meta[property="og:image"]', 'meta[name="twitter:card"]',
  'meta[name="twitter:title"]', 'meta[name="twitter:description"]', 'meta[name="twitter:image"]',
]) assert.equal(await missing.locator(selector).count(), 1, `404 metadata: ${selector}`);
await missing.close();

await browser.close();
console.log(JSON.stringify({ site: base, viewports: ['1440x1000', '390x844'], axe: '0 serious/critical', offline: true, reducedMotion: true, privacy: 'same-origin demo requests only' }, null, 2));
