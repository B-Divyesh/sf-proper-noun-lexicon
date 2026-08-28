# Repair handoff — PASS

**Work order:** `proper-noun-lexicon-repair-2`

**Verifier report:** `7e0f08e85c66c6203316f318a6a42dcc563b1c12`

**Repaired candidate:** `248dca825d4821db7d7892882500c065bd79e865`

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Date:** 2026-08-28 UTC

## Release status: PASS

The verifier's only remaining P1 is repaired. Before repair, the production
checkout returned HTTP 404 with `{"error":"enabled factory product","status":404}`
and the public production catalog omitted `proper-noun-lexicon`.

The factory production catalog and Dodo Live now contain one enabled,
non-recurring `Proper Noun Lexicon` product at USD 29.00, returning buyers to
`https://proper-noun-lexicon.sociobot.in/`. The public catalog reports
`price_minor: 2900`, and the product checkout returns HTTP 303 to an HTTPS
`checkout.dodopayments.com/session/...` URL. The invalid-token verifier remains
reachable and returns HTTP 200 with `valid: false` and `reason: "invalid"`.

No passing product behavior was changed. The site remains a static Vite
artifact and the primary product remains the single `pnl` Rust CLI.

## Regression coverage added

- `npm run verify:live` fails on the verifier's original checkout 404. It checks
  the exact production catalog slug, USD 29.00 price, product URL, checkout URL,
  303 hosted-Dodo redirect, invalid-license contract, live identity, CSP,
  Permissions Policy, HSTS, immutable assets, service-worker policy, and JS/CSS
  budgets without completing a purchase.
- Playwright now covers returned-token storage and URL stripping, successful
  verification, restore by pasted token, the once-per-day verification cache,
  revocation relocking, and optimistic offline access from a previously valid
  cache on both desktop Chromium and a 390 × 844 mobile viewport.

## Verification evidence

- Clean `npm ci`: 61 packages installed, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: Rust formatting, strict clippy (`-D warnings`), and TypeScript
  checking passed.
- `npm test`: 6 Rust tests, 6 Vitest tests, and 16 Playwright 1.58.2 tests passed
  across desktop and 390 px mobile.
- `npm run build`: passed and produced `target/release/pnl` plus `dist/site/`.
  Initial assets are 11,963 B JS (4,933 B gzip), 14,703 B CSS (4.25 kB gzip),
  no fonts, and a 62,510 B hero WebP.
- `cargo package --manifest-path cli/Cargo.toml`: passed (8 files, 36.3 KiB
  unpacked, 10.7 KiB compressed). The extracted crate installed into a clean
  Cargo root and its installed `pnl 0.1.0` completed import/list, all three
  exports, approved correction, byte-exact rollback, invalid CSV, 100-term
  import, alias-boundary, JSON-output, and unwritable-audit atomicity checks.
- Live browser: no console or page errors; one `h1`, one `main`, `lang="en"`,
  all images have alt attributes, first Tab focuses the skip link with a mint
  3 px outline, keyboard correction works, and 390 px has no horizontal
  overflow. Axe reports 0 serious/critical findings on desktop and mobile.
- Privacy: an ordinary live session requested only same-origin resources; the
  invalid-license path added only `https://api.sociobot.in`. No analytics,
  third-party fonts, audio, or vocabulary transmission was observed.
- PWA/motion: a service-worker-controlled session reloaded offline with the
  local-ready state and one `h1`; release-version tests cover cache replacement.
  Reduced motion uses `scroll-behavior: auto` and a 0.01 ms entrance duration.
- Live identity: `index.html`, hashed JS, hashed CSS, `sw.js`, and the hero WebP
  matched the deployed artifact byte-for-byte after deployment.
- Lighthouse 12.8.2 mobile: Performance 98, Accessibility 100, Best Practices
  100, SEO 100; FCP 973 ms, LCP 1,210 ms, TBT 156 ms, CLS 0.
- `/opt/fleet/lib/verify-url.sh` passed against production: HTTP 200, 710 ms
  browser load, no console errors, correct title/language/landmarks/alt text.

## Run and deploy

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh proper-noun-lexicon /work/repo/dist/site
```

The crate is ready to publish, but was not uploaded because registry publishing
belongs to the factory. No real customer purchase or refund was made during QA;
the live catalog and hosted checkout were exercised through session creation,
while valid, cached, restored, revoked, and offline license states were covered
deterministically in browser regression tests. There are no known
release-blocking gaps.
