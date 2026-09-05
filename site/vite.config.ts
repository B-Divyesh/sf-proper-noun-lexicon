import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { stampServiceWorker } from './release';

const root = resolve(__dirname);
const output = resolve(__dirname, '../dist/site');

function releaseId(): string {
  const supplied = process.env.PNL_RELEASE_ID;
  if (supplied && /^[a-zA-Z0-9._-]+$/.test(supplied)) return supplied;
  try {
    return execFileSync('git', ['rev-parse', '--verify', 'HEAD'], { cwd: resolve(__dirname, '..'), encoding: 'utf8' }).trim();
  } catch {
    return 'local-development';
  }
}

function releaseVersionedServiceWorker() {
  return {
    name: 'release-versioned-service-worker',
    closeBundle() {
      const template = resolve(root, 'public/sw.js');
      const destination = resolve(output, 'sw.js');
      if (!existsSync(destination)) return;
      const source = readFileSync(template, 'utf8');
      writeFileSync(destination, stampServiceWorker(source, releaseId()));
    },
  };
}

const HOME_TITLE = 'Proper Noun Lexicon — correct dictated names';
const DEMO_TITLE = 'Demo — Proper Noun Lexicon';
const HOME_URL = 'https://proper-noun-lexicon.sociobot.in/';
const DEMO_URL = 'https://proper-noun-lexicon.sociobot.in/demo';
const HOME_DESCRIPTION = 'Correct dictated names with approved spellings. Review every local change, restore raw text, and export speech-model hints.';
const DEMO_DESCRIPTION = 'Try Proper Noun Lexicon with three sample names and a raw transcript. Demo changes stay separate from your workspace.';
const HOME_SOCIAL_DESCRIPTION = 'Correct dictated names with approved spellings and keep every review on your device.';

export function demoDocument(source: string): string {
  return source
    .replace(`<title>${HOME_TITLE}</title>`, `<title>${DEMO_TITLE}</title>`)
    .replace(`content="${HOME_DESCRIPTION}"`, `content="${DEMO_DESCRIPTION}"`)
    .replaceAll(`content="${HOME_SOCIAL_DESCRIPTION}"`, `content="${DEMO_DESCRIPTION}"`)
    .replaceAll(`content="${HOME_TITLE}"`, `content="${DEMO_TITLE}"`)
    .replaceAll(`content="${HOME_URL}"`, `content="${DEMO_URL}"`)
    .replace(`href="${HOME_URL}"`, `href="${DEMO_URL}"`);
}

function demoRouteDocument() {
  const serveBuiltDemo = (requestUrl: string | undefined, response: { statusCode: number; setHeader(name: string, value: string): void; end(value: string): void }, next: () => void) => {
    if ((requestUrl || '').split('?')[0] !== '/demo') return next();
    const destination = resolve(output, 'demo/index.html');
    if (!existsSync(destination)) return next();
    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(readFileSync(destination, 'utf8'));
  };
  return {
    name: 'demo-route-document',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string, context: { path?: string }) {
        return /^\/demo(?:\/|$)/.test(context.path || '') ? demoDocument(html) : html;
      },
    },
    closeBundle() {
      const source = resolve(output, 'index.html');
      if (!existsSync(source)) return;
      const directory = resolve(output, 'demo');
      mkdirSync(directory, { recursive: true });
      writeFileSync(resolve(directory, 'index.html'), demoDocument(readFileSync(source, 'utf8')));
    },
    configurePreviewServer(server: { middlewares: { use(handler: (request: { url?: string }, response: { statusCode: number; setHeader(name: string, value: string): void; end(value: string): void }, next: () => void) => void): void } }) {
      server.middlewares.use((request, response, next) => serveBuiltDemo(request.url, response, next));
    },
  };
}

export default defineConfig({
  root,
  publicDir: resolve(root, 'public'),
  build: {
    outDir: output,
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        notFound: resolve(__dirname, '404.html'),
        privacy: resolve(__dirname, 'privacy/index.html'),
        terms: resolve(__dirname, 'terms/index.html'),
      },
    },
  },
  plugins: [releaseVersionedServiceWorker(), demoRouteDocument()],
  test: {
    include: [resolve(__dirname, 'src/**/*.test.ts')],
  },
});
