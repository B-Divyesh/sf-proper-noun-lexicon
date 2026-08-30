import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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
  plugins: [releaseVersionedServiceWorker()],
  test: {
    include: [resolve(__dirname, 'src/**/*.test.ts')],
  },
});
