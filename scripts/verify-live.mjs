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
const invalid = await invalidResponse.json();
assert.deepEqual(invalid, { expires_at: null, reason: 'invalid', valid: false });

console.log(JSON.stringify({
  site: siteUrl,
  catalog: { slug: product.slug, currency: product.currency, price_minor: product.price_minor },
  checkout: { status: checkout.status, host: new URL(checkout.headers.get('location')).host },
  invalid_license: invalid,
  assets: assetPaths,
}, null, 2));
