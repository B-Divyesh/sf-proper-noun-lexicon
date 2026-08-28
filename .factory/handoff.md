# Repair handoff — PASS

**Work order:** `proper-noun-lexicon-repair-3`

**Verifier report repaired:** commit `18005aa48a98fc253d87a0b54def08db9a2652e5`, candidate `e41efea88f09cd2ba56bfe8b8d9151fc353e6143`

**Repair implementation:** `8d1bd05abb296bd0c2536bca1df2a28c7cdbd8c0`

**Production:** <https://proper-noun-lexicon.sociobot.in/>

**Date:** 2026-08-28 UTC

## Release status

PASS. All four independent-verifier findings are repaired without changing the
CLI/static-site artifact classes, free-tier behavior, local-first data model,
or Sociobot billing integration.

## Findings repaired

1. **Google Speech schema (P1):** Rust and browser exports now emit one
   documented inline `PhraseSet`, with `phrases` as the sole root key. The UI,
   root README, and packaged crate README say to insert it at
   `RecognitionConfig.adaptation.phraseSets[]`. A fresh Google Speech v1
   discovery-document check confirmed `PhraseSet.properties.phrases` and
   `SpeechAdaptation.properties.phraseSets`; neither permits the old singular
   `phraseSet` wrapper.
2. **Keyboard CSV import (P1):** the native file input remains in the sequential
   focus order under a visually compact picker, has the accessible name
   “Import CSV,” and paints a 3 px signal-color focus ring on its visible
   control. Desktop Enter and 390 px Space both opened the native chooser and
   imported a real CSV.
3. **Touch targets (P2):** header/footer brands, navigation, inline legal,
   limit, source, and prose links now expose at least 44×44 CSS px targets.
4. **ARIA tabs (P3):** export tabs use roving `tabindex`, keep selection and the
   tabpanel label synchronized, and support Left/Right, Home, and End.

Exact regressions live in `cli/src/lib.rs`, `site/src/core.test.ts`, and
`site/e2e/app.spec.ts`. The Google tests assert exact root keys and reject both
`phraseSet` and an unintended `phraseSets` wrapper. Browser regressions run in
desktop Chromium and a 390×844 Chromium project.

## Verification evidence

Clean local gates:

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml --allow-dirty
```

- `npm ci`: 61 packages, 0 vulnerabilities.
- TypeScript check, Rust formatting, and strict clippy (`-D warnings`) passed.
- Tests: 7 Rust, 7 Vitest, and 20 Playwright tests passed.
- `npm run build` produced `target/release/pnl` and `dist/site/`.
- Production payload: 12.54 KB JS (5.19 KB gzip), 15.41 KB CSS (4.33 KB
  gzip), no font payload, 62.51 KB hero WebP.
- `cargo package`: 8 files, 37.1 KiB unpacked, 10.9 KiB compressed. Nothing was
  published. A fresh external Rust consumer compiled against the extracted
  package and asserted the Google schema. A separate `cargo install --locked`
  produced `pnl 0.1.1`; its two-term Google export passed the same exact-schema
  assertion.
- Desktop and 390 px browser runs covered import, correction, rollback,
  downloads, errors, local persistence, keyboard shortcuts, keyboard file
  choice, roving tabs, link geometry, billing states, and offline correction.
  Both viewports had zero serious/critical axe violations and no console errors.
- Visual inspection at 1440×1000 and 390×844 found no overlap, clipping, or
  horizontal overflow. Reduced-motion behavior remains covered.

Production checks:

- `npm run verify:live`: product catalog is enabled at USD 29.00, checkout
  returns 303 to `checkout.dodopayments.com`, and an invalid license returns the
  documented non-valid verdict.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 868 ms load, correct title/lang,
  one `h1`, one `main`, no missing alt text or unnamed buttons, and no console
  errors.
- Fresh desktop and 390 px live sessions passed the repaired keyboard, schema,
  target-size, and axe checks. A normal session requested only
  `https://proper-noun-lexicon.sociobot.in`; no analytics, fonts, vocabulary,
  or transcript left the origin.
- A service-worker-controlled 390 px session reloaded offline with the correct
  title, one `h1`, “Offline — local tools ready,” and no errors. Release tests
  confirm distinct cache names and old-cache deletion across updates.
- Eight key files (`index.html`, JS, CSS, service worker, illustration, both
  legal pages, and manifest) matched the built artifacts byte-for-byte.
- HTML/legal/service-worker responses use `no-cache, max-age=0,
  must-revalidate`; hashed JS/CSS use one-year immutable caching. HSTS,
  `nosniff`, strict referrer policy, restrictive CSP, and restrictive
  Permissions Policy are present.
- Lighthouse 12.8.2 mobile on production: Performance 99, Accessibility 100,
  Best Practices 100, SEO 100; FCP 875 ms, LCP 1,208 ms, TBT 105 ms, CLS 0.

## Deploy and reproduce

The static deployment completed with:

```sh
npm run build:site
/opt/fleet/lib/deploy-static.sh proper-noun-lexicon /work/repo/dist/site
npm run verify:live
```

For a publishable CLI artifact, run:

```sh
cargo package --manifest-path cli/Cargo.toml
```

The factory owns registry credentials; this repair did not publish the crate.

## Known limits

No real $29 purchase, refund, or production-license issuance was performed,
because that would create an external financial transaction. Catalog,
checkout-boundary, invalid, valid, restored, daily-cache, revoked, and offline
license behavior were verified without a charge. No provider credentials or
private audio corpus were used, so the brief's 25-point real-model recall goal
still requires a customer pilot; the exported Google interface itself is now
validated against the provider's documented schema.
