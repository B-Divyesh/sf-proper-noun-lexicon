import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { stampServiceWorker } from '../release';

const repo = resolve(import.meta.dirname, '../..');
const site = resolve(repo, 'site');
describe('release delivery contract', () => {
  it('ships restrictive response policy and immutable hashed asset caching rules', () => {
    const config = JSON.parse(readFileSync(resolve(site, 'public/staticwebapp.config.json'), 'utf8')) as {
      globalHeaders: Record<string, string>;
      routes: Array<{ route: string; headers: Record<string, string> }>;
    };
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain('https://api.sociobot.in');
    expect(config.globalHeaders['Permissions-Policy']).toContain('microphone=()');
    expect(config.routes.find(route => route.route === '/assets/*')?.headers['Cache-Control'])
      .toBe('public, max-age=31536000, immutable');
    expect(config.routes.find(route => route.route === '/sw.js')?.headers['Cache-Control'])
      .toBe('no-cache, max-age=0, must-revalidate');
  });

  it('stamps each deployed service-worker release with a distinct cache name', () => {
    const template = readFileSync(resolve(site, 'public/sw.js'), 'utf8');
    const prior = stampServiceWorker(template, 'qa-prior-release');
    const upgraded = stampServiceWorker(template, 'qa-upgraded-release');
    expect(prior).toContain("const CACHE = 'pnl-shell-qa-prior-release'");
    expect(upgraded).toContain("const CACHE = 'pnl-shell-qa-upgraded-release'");
    expect(upgraded).not.toContain('qa-prior-release');
    expect(upgraded).not.toContain('__PNL_RELEASE__');
    expect(upgraded).toContain('self.skipWaiting()');
    expect(upgraded).toContain('caches.delete(key)');
  });

  it('ships explicit demo and designed 404 routes with complete social metadata', () => {
    const config = JSON.parse(readFileSync(resolve(site, 'public/staticwebapp.config.json'), 'utf8')) as {
      routes: Array<{ route: string; rewrite?: string }>;
      responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
    };
    expect(config.routes).toContainEqual(expect.objectContaining({ route: '/demo', rewrite: '/index.html' }));
    expect(config.routes.filter(route => route.route.replace(/\/$/, '') === '/demo')).toHaveLength(1);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    const html = readFileSync(resolve(site, 'index.html'), 'utf8');
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:image"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('rel="apple-touch-icon"');
    const notFound = readFileSync(resolve(site, '404.html'), 'utf8');
    expect((notFound.match(/<h1\b/g) || [])).toHaveLength(1);
    expect(notFound).toContain('This page does not exist.');
  });
});
