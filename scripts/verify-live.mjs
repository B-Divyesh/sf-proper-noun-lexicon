import assert from 'node:assert/strict';

const siteUrl = process.env.PNL_LIVE_URL || 'https://proper-noun-lexicon.sociobot.in/';
const apiUrl = 'https://api.sociobot.in/api/v1/products/proper-noun-lexicon';

async function request(url, init = {}) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), ...init });
  return response;
}

function requireHeader(response, name, fragment) {
  const value = response.headers.get(name) || '';
  assert.match(value, fragment, `${name} on ${response.url}`);
}

const page = await request(siteUrl);
assert.equal(page.status, 200, 'live site must return HTTP 200');
const html = await page.text();
assert.match(html, /<html[^>]+lang="en"/i, 'live HTML must declare English');
assert.match(html, /<title>[^<]*Proper Noun Lexicon[^<]*<\/title>/i, 'live title must identify the product');
assert.equal((html.match(/<h1\b/gi) || []).length, 1, 'live HTML must have one h1');
assert.equal((html.match(/<main\b/gi) || []).length, 1, 'live HTML must have one main landmark');
assert.match(html, /<link[^>]+rel="canonical"[^>]+proper-noun-lexicon\.sociobot\.in/i, 'live HTML must declare its canonical URL');
assert.match(html, /property="og:image"[^>]+og-preview\.webp/i, 'live HTML must expose the product social image');
assert.match(html, /name="twitter:card"/i, 'live HTML must expose Twitter card metadata');
assert.match(html, /rel="apple-touch-icon"/i, 'live HTML must expose an Apple touch icon');
assert.match(html, /Try it with sample data/i, 'first screen must link to the sample demo');
requireHeader(page, 'content-security-policy', /default-src 'self'/);
requireHeader(page, 'permissions-policy', /microphone=\(\)/);
requireHeader(page, 'strict-transport-security', /max-age=/);

const assetPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+\.(?:js|css))"/g)].map(match => match[1]);
assert.ok(assetPaths.some(path => path.endsWith('.js')), 'live HTML must reference a hashed JavaScript asset');
assert.ok(assetPaths.some(path => path.endsWith('.css')), 'live HTML must reference a hashed CSS asset');
for (const path of assetPaths) {
  const asset = await request(new URL(path, siteUrl));
  assert.equal(asset.status, 200, `${path} must load`);
  requireHeader(asset, 'cache-control', /max-age=31536000/);
  requireHeader(asset, 'cache-control', /immutable/);
  const bytes = (await asset.arrayBuffer()).byteLength;
  assert.ok(bytes <= (path.endsWith('.js') ? 200_000 : 50_000), `${path} exceeds its release budget`);
}

const serviceWorker = await request(new URL('/sw.js', siteUrl));
assert.equal(serviceWorker.status, 200, 'service worker must load');
requireHeader(serviceWorker, 'cache-control', /no-cache/);
assert.match(await serviceWorker.text(), /pnl-shell-[a-f0-9]{40}/, 'service worker cache must be release-stamped');

const demoResponse = await request(new URL('/demo', siteUrl));
assert.equal(demoResponse.status, 200, 'demo route must load directly');
const demoHtml = await demoResponse.text();
assert.match(demoHtml, /sample data, nothing is saved/i, 'demo route must include its persistent sandbox banner');

const missingResponse = await request(new URL('/definitely-not-a-page', siteUrl));
assert.equal(missingResponse.status, 404, 'unknown routes must return HTTP 404');
const missingHtml = await missingResponse.text();
assert.match(missingHtml, /This page does not exist/i, '404 response must use the designed recovery page');
for (const metadata of ['og:type', 'og:title', 'og:description', 'og:url', 'og:image']) {
  assert.match(missingHtml, new RegExp(`property=["']${metadata}["']`, 'i'), `404 response must include ${metadata}`);
}
for (const metadata of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
  assert.match(missingHtml, new RegExp(`name=["']${metadata}["']`, 'i'), `404 response must include ${metadata}`);
}

const catalogResponse = await request('https://api.sociobot.in/api/v1/products');
assert.equal(catalogResponse.status, 200, 'production product catalog must load');
const catalog = await catalogResponse.json();
const product = catalog.data?.find(item => item.slug === 'proper-noun-lexicon');
assert.deepEqual(product, {
  checkout_url: `${apiUrl}/checkout`,
  currency: 'USD',
  name: 'Proper Noun Lexicon',
  price_minor: 2900,
  product_url: siteUrl,
  slug: 'proper-noun-lexicon',
}, 'production catalog must contain the advertised one-time product');

const checkout = await request(`${apiUrl}/checkout`, { redirect: 'manual' });
assert.equal(checkout.status, 303, 'checkout must redirect instead of returning the release-blocking 404');
assert.match(checkout.headers.get('location') || '', /^https:\/\/checkout\.dodopayments\.com\/session\//, 'checkout must use the hosted Dodo flow');

const invalidResponse = await request(`${apiUrl}/verify?license=qa-invalid-token`);
assert.equal(invalidResponse.status, 200, 'license verifier must be reachable');
requireHeader(invalidResponse, 'cache-control', /no-store/);
const invalid = await invalidResponse.json();
assert.deepEqual(invalid, { expires_at: null, reason: 'invalid', valid: false });

console.log(JSON.stringify({
  site: siteUrl,
  catalog: { slug: product.slug, currency: product.currency, price_minor: product.price_minor },
  checkout: { status: checkout.status, host: new URL(checkout.headers.get('location')).host },
  invalid_license: invalid,
  assets: assetPaths,
}, null, 2));
