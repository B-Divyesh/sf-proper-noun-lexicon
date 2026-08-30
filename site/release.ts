export function stampServiceWorker(source: string, release: string): string {
  if (!/^[a-zA-Z0-9._-]+$/.test(release)) throw new Error('Release IDs may contain only letters, numbers, dots, underscores, and hyphens.');
  return source.replaceAll('__PNL_RELEASE__', release);
}
