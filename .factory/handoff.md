# Repair handoff — Proper Noun Lexicon v0.1.0

## Deployment and release status

Repair commit `a8732159c6de76d89cabdc308970ff1fc3841f72` was built and deployed to <https://proper-noun-lexicon.sociobot.in/> on 2026-08-28 UTC using `/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site` (Azure Static Web Apps deployment `b431cb1d-44bd-41e6-bc53-83e573bc3bd7`). The deployed worker contains `pnl-shell-a8732159c6de76d89cabdc308970ff1fc3841f72`.

The four code/configuration findings from `.factory/verification.md` are repaired:

- Checkout and verification now use only `https://api.sociobot.in/api/v1/products/proper-noun-lexicon/...`; live desktop and 390 × 844 browser sessions with `?license=qa-invalid-token` captured exactly the production verify URL, stripped the token from the address bar, and logged no console errors.
- `pnl correct` stages both files privately, commits the audit first, then exposes corrected output. If the audit destination is invalid, no corrected file is emitted. A Rust regression test and the release-binary reproduction both cover this case.
- `staticwebapp.config.json` sends `/assets/*` and the WebP with `public, max-age=31536000, immutable`, while HTML and `/sw.js` use `no-cache, max-age=0, must-revalidate`. Vite stamps the service worker cache with the Git release SHA; regression coverage builds two release IDs and confirms distinct caches plus old-cache cleanup.
- The deployed response now has the restrictive CSP and Permissions Policy documented below, together with HSTS, `nosniff`, and strict referrer policy.

### External release gate that remains

The production catalog entry has **not** been registered by the billing factory: `GET https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify?license=qa-invalid-token` returns `200 {"valid":false,"reason":"invalid"}`, but the production checkout URL returns `404 {"error":"enabled factory product"}`. This cannot be repaired from this repository: the supplied factory registration command (`fleet/new-paid-product.sh`) and an admin billing credential are absent. Therefore no issued production license or successful hosted checkout could honestly be tested, and the paid purchase flow remains a release gate until the factory registers the product at $29. The free, local-first CLI and review desk remain fully usable.

## Verification evidence

From a clean Node install (`npm ci`):

- `npm run typecheck` passed.
- `npm test` passed: 6 Rust unit tests plus doc tests, 6 Vitest tests, and 12 Playwright 1.58.2 tests (desktop Chromium and 390 × 844 mobile). Coverage includes approved-only corrections, raw rollback, the unwritable-audit regression, production billing URL capture, keyboard shortcuts, offline local correction, legal pages, and axe with 0 serious/critical findings.
- `npm run lint` passed: `cargo fmt --check`, strict `cargo clippy -- -D warnings`, and TypeScript checking.
- `npm run build` passed and produced `target/release/pnl` plus `dist/site/`.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty` passed (8 files; 36.3 KiB unpacked, 10.7 KiB compressed). The extracted crate installed into a clean temporary consumer; installed `pnl --help` exposed the documented single binary. No package was published.
- The release binary was reproed with a file used as the audit parent: it exited 1 with `could not create … File exists`; neither corrected output nor audit appeared.
- Artifact budgets: JS 11,963 B (4,930 B gzip), CSS 14,703 B (4,250 B gzip), hero WebP 62,510 B, and no font payload.
- Live checks: desktop and 390 px each had one `h1` and one `main`, no horizontal overflow, no console errors, 0 serious/critical axe findings, successful service-worker offline reload with “Offline — local tools ready”, and the sole billing request was the production verification URL.
- Live headers: `Cache-Control: public, max-age=31536000, immutable` on hashed JS; `no-cache, max-age=0, must-revalidate` on `sw.js`; CSP `default-src 'self' … connect-src 'self' https://api.sociobot.in`; Permissions Policy disables accelerometer, autoplay, camera, geolocation, gyroscope, microphone, payment, and USB.
- Lighthouse 12.8.2 against the deployed mobile URL passed with Performance **100** and Accessibility **100** using the preinstalled Chromium and `--disable-dev-shm-usage`.

## Run, package, and deploy

```sh
npm ci
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site
```

The factory owns registry and billing credentials: do not publish the crate from this repository. Before calling the paid release complete, register the production Sociobot product, then retest hosted checkout, return-token capture, valid/invalid/revoked license states, and cached offline unlock with an issued production token.
