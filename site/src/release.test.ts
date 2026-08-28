import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repo = resolve(import.meta.dirname, '../..');
const site = resolve(repo, 'site');
const vite = resolve(repo, 'node_modules/vite/bin/vite.js');

function buildWithRelease(release: string): string {
  execFileSync(process.execPath, [vite, 'build', '--config', 'vite.config.ts'], {
    cwd: site,
    env: { ...process.env, PNL_RELEASE_ID: release },
    stdio: 'pipe',
  });
  return readFileSync(resolve(repo, 'dist/site/sw.js'), 'utf8');
}

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
    const prior = buildWithRelease('qa-prior-release');
    const upgraded = buildWithRelease('qa-upgraded-release');
    expect(prior).toContain("const CACHE = 'pnl-shell-qa-prior-release'");
    expect(upgraded).toContain("const CACHE = 'pnl-shell-qa-upgraded-release'");
    expect(upgraded).not.toContain('qa-prior-release');
    expect(upgraded).not.toContain('__PNL_RELEASE__');
    expect(upgraded).toContain('self.skipWaiting()');
    expect(upgraded).toContain('caches.delete(key)');
  });
});
