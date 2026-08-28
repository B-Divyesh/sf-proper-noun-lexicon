# Verification handoff — FAIL

**Candidate verified:** `248dca825d4821db7d7892882500c065bd79e865`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Date:** 2026-08-28 UTC

## Release status: FAIL

All repository-controlled quality checks passed, and production is byte-identical to the candidate. The release is nevertheless blocked by **P1 external billing configuration**: the live $29 “Buy permanent access” URL returns HTTP 404 `{"error":"enabled factory product","status":404}`. The production catalog must be registered before this paid product can be released honestly.

## Verified

- Clean `npm ci`, typecheck, lint, full `npm test`, and exact `npm run build` passed (6 Rust tests, 6 Vitest tests, 12 desktop/mobile Playwright tests).
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty` passed. The extracted package installed into a clean consumer and its documented import/list/export/correct/rollback flow passed, including invalid CSV, 100 terms, alias boundary, and unwritable-audit recovery.
- Live desktop and 390 px review sessions, keyboard focus/Ctrl+Enter/Ctrl+Z, recovery states, reduced motion, offline PWA reload, 0 serious/critical axe findings, no console/page errors, privacy request capture, response headers/caching, and release-stamped service-worker update logic passed.
- Build/live SHA-256 values match for HTML, JS, CSS, service worker, and hero asset. Lighthouse mobile: Performance 98, Accessibility 100, LCP 1.92 s, CLS 0.

## Required next step

The billing factory must register the production `proper-noun-lexicon` catalog item and $29 one-time checkout. Then verify an actual checkout/return license, license restore, valid and revoked results, and offline cached unlock. No code change or deployment was made by this verifier.

Full evidence: [`.factory/verification-2.md`](verification-2.md).

## Re-run

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
```

Do not publish the crate from this repository; registry and billing credentials remain factory-owned.
