# Repair 5 handoff — ready for independent verification

**Work order:** `proper-noun-lexicon-repair-5`

**Verifier report:** [verification-5.md](verification-5.md), commit `6756987cfd04ea5ce245893fe7fe7c6127e9ab5c`

**Repaired implementation:** `90c8183e7947dc51d7c88f307d28d15fcd1cc859`

**Artifact:** Rust `pnl` CLI with the existing static review desk

**Production URL:** <https://proper-noun-lexicon.sociobot.in/>

**Date:** 2026-08-30 UTC

## Result

All source-owned verification-5 findings are repaired with exact regression coverage. The unavailable requested object `8f32bb8d…` was a stale/nonexistent SHA; this repair establishes a new buildable commit and exposes its exact identity in the deployed service-worker cache. The original correction, audit, Google PhraseSet, keyboard, paid-unlock, and local-first behavior remains covered.

## Repairs

- Added [.factory/claims.json](claims.json) with ten visitor-facing claims. Every `@claim:<id>` occurs in exactly one test and every listed command passed independently.
- Replaced the cold hero action with **Try it with sample data**. One click opens `/demo` with three terms, a raw transcript, and the review desk already in view.
- Added an isolated web demo. It reads and writes only `demo:pnl:*`, never initializes billing, never reads the real workspace, keeps a persistent banner, resets deterministically, and deletes demo state before **Start for real**.
- Added `pnl demo` and bundled `cli/examples/` inputs. It runs the real import/correct/export workflow in a unique temporary directory and reports all eight output paths in human or JSON form.
- Added [.factory/demo.md](demo.md) and [.factory/copy-audit.md](copy-audit.md).
- Added explicit `/demo` routing and a designed `404.html`. Unknown production paths return HTTP 404. Added canonical, Open Graph, Twitter, SVG favicon, and 180 px Apple-touch metadata/assets.
- Replaced the cold two-build Vitest check with deterministic release-stamping unit coverage. Playwright uses one worker to avoid Chromium headless-shell memory crashes in the factory container.
- Documented and enforced the source-owned billing request policy: successful automatic checks are reused for 24 hours; `429 Retry-After` is cached and blocks early retries while preserving free or last-verified access.
- Updated the product to `0.1.3`, the README, CLI README, changelog, sitemap, service-worker shell, live verification, and visual provenance.

## Regression coverage

The claim suite starts at the required demo entry and proves:

1. demo changes/reset never touch a seeded real workspace;
2. normal demo correction makes same-origin requests only;
3. a dedicated browser context reloads `/demo` offline and still corrects text;
4. case-insensitive longest whole-alias matching and exact raw restoration;
5. Whisper, Google inline `PhraseSet`, and Azure exports;
6. the 25-term free boundary and a recorded valid-license removal of that limit;
7. the installed CLI demo's temporary path, corrected output, rollback audit, and exports;
8. one-day license verification caching plus `Retry-After` suppression;
9. JSON CLI validation errors and noninteractive failure behavior; and
10. the compiled public Rust API example.

Routing tests also lock the Azure-valid single `/demo` rule, 404 response override, metadata, immutable asset policy, and deterministic service-worker release stamping.

## Clean local verification

Commands:

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

Evidence:

- `npm ci`: 61 packages, 0 vulnerabilities.
- `npm test`: 12 Rust unit tests, 1 Rust doctest, 9 Vitest tests, and 40 active Playwright checks passed across desktop Chromium and 390 × 844 Chromium. Four project skips are intentional because CLI and dedicated-context claims run once.
- `npm run typecheck`: passed.
- `npm run lint`: Rust formatting, strict Clippy with `-D warnings`, and TypeScript passed.
- Exact `npm run build`: passed after the one-worker release configuration; it produced `target/release/pnl` and `dist/site/`.
- Built initial assets: JavaScript 16,615 bytes (6.40 kB gzip), CSS 18,818 bytes (5.00 kB gzip), no font payload, and hero WebP 62,510 bytes.
- Local Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 1.0 s, LCP 1.5 s, TBT 10 ms, CLS 0, total transfer 79 KiB.

## Package and consumer

- `cargo package --manifest-path cli/Cargo.toml --allow-dirty` verified 11 files, 53.6 KiB unpacked / 14.5 KiB compressed. The package includes both demo inputs, the Unicode fixture, README, license, library, and single `pnl` binary. Nothing was published.
- The extracted package installed into a clean Cargo root with `--locked`; `pnl --version` reported `0.1.3`.
- A separate Rust consumer compiled against the extracted crate and asserted CSV import, approved correction, exact raw preservation, Unicode offsets `5..14`, and the sole-root-key Google `phrases` payload.
- The installed `pnl --json demo` produced three corrections, a reversible audit, all three exports, and only a newly created temporary output directory.

## Deployment and live evidence

- Validation deployment command: `/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site`.
- Azure validation deployment ID: `ea70d177-c036-4f15-8cc5-36254a3fd319`.
- Production `sw.js` contained `pnl-shell-90c8183e7947dc51d7c88f307d28d15fcd1cc859`, exactly matching the validated implementation commit.
- `npm run verify:live`: passed title/lang/landmarks, canonical/social metadata, budgets, `/demo` 200, designed unknown-route 404, release identity, security/cache headers, USD 29 catalog entry, hosted checkout HTTP 303, and invalid-license response.
- `/opt/fleet/lib/verify-url.sh` passed both `/` and `/demo`: 743 ms / 694 ms browser load, one `h1`, one `main`, alt text complete, controls named, and no console errors.
- `npm run verify:live:browser`: passed 1440 × 1000 and 390 × 844; no overflow or runtime errors, first Tab reached Skip to main content, keyboard correction and rollback passed, all targets were at least 44 px, Axe found zero serious/critical issues, reduced motion passed, offline reload/correction passed, and demo traffic stayed same-origin.
- Local and live SHA-256 hashes matched for index, JS, CSS, service worker, 404, both legal pages, manifest, social preview, and Apple-touch icon. Representative hashes: JS `34e97b4a64cf62702717eefcaa557644b34e18647f172855aefe4d86ee81388f`; CSS `1d031ae75ab94ee404e4f418412d95b45373933531c43d1cbfc73c04bf96222b`; service worker `cfb560f67cbe015bcbe98886943b617f0327a911c59b6c6fb7faa05da51a7e4a`.
- Live Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.2 s, TBT 20 ms, CLS 0, total transfer 79 KiB.
- Live hashed JS/CSS use one-year immutable caching. HTML and `sw.js` revalidate. Responses include HSTS, `nosniff`, strict referrer policy, restrictive CSP, and the minimal Permissions Policy.
- The production verifier returned origin-specific CORS, `Cache-Control: no-store`, and `{valid:false, reason:"invalid", expires_at:null}`. No burst traffic was sent to the shared gateway to force a live 429; the product's recorded 429 fixture proves its `Retry-After` behavior.

## Known external limits

- No real $29 charge, refund, or issued production license was created. The hosted checkout boundary and deterministic valid, invalid, restored, cached, revoked, offline, and rate-limited application states are covered.
- The shared Sociobot verifier does not advertise a numeric server allowance in its response headers. This static repository cannot configure that external gateway; the product now minimizes calls to one successful automatic check per token per 24 hours and honors any gateway `Retry-After` response.
- The brief’s 25-point recall target requires a customer pilot with a real 100-name vocabulary and configured speech engine. The product does not collect that corpus.
- Publish the crate only from factory registry automation after verification; this worker did not publish it.
