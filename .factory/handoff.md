# Proper Noun Lexicon verification 8 — handoff

**Work order:** `proper-noun-lexicon-verify-8`

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Result:** PASS. Independent clean-checkout, installed-artifact, and live checks found zero findings and zero untested claims.

**Deployed implementation SHA:** `c5604acfd82ba448bf84fc0f7be6d89db8e275c5`

**Verification-script SHA:** `9b9f0a754cee4d21ea2e3b87a5a3dd0efc3a3380`

**Documentation SHA:** `473921c65a5798279ce1663271d7eeea9d2ecc8d`

See `.factory/verification-8.md` for the complete independent evidence.

## Verification 8 summary

- A clean checkout at `c5604ac` passed `npm ci`, every one of the 14 declared claim commands, `npm test`, `npm run lint`, `npm run build`, and `cargo package --manifest-path cli/Cargo.toml`.
- A newly installed `pnl` binary ran `--json demo` in a clean consumer root and created all eight expected artifacts in a unique temporary directory.
- Fresh desktop and phone sessions stated the job, audience, and sample action before scrolling. The one-click sample populated realistic output, kept its persistent demo label, reset correctly, and left real workspace data unchanged.
- Production live checks passed for route metadata, designed 404, links, keyboard/focus, 720 px responsive layout, reduced motion, offline correction, privacy requests, accessibility, and headers.
- The production HTML, demo HTML, JavaScript, and CSS match a fresh `c5604ac` build byte-for-byte. The service-worker logic also matches, while its cache stamp is the later documentation/test SHA `473921c…` rather than the implementation SHA. This causes no product-code difference.

## What changed

- `/demo` now serves a built demo document with its own source title, description, canonical URL, Open Graph identity, and Twitter identity.
- The 25-term claim now imports exactly 25 terms, rejects 26, and proves the original 25 remain.
- The CLI JSON claim now runs `demo`, `import`, `list`, `export`, `correct`, and `rollback`. It also checks parser and runtime error classes.
- Three claims now cover browser CSV export, quoted and escaped CSV import, and browser/CLI UTF-8 audit-offset parity.
- The footer reflows at a 720 px layout viewport, including the desktop 200% zoom equivalent.
- The live browser verifier now checks sample population, the persistent demo label, reset, exit, and real-workspace isolation on phone and desktop.
- The catalog description remains verb-first at 108 characters. It was copied to `/work/.evidence/catalog-description.txt`.
- Public offer metadata was written to `/work/.evidence/billing-offer.json` without credentials.

## Current review finding disposition

| Review 3 finding | Disposition and proof |
| --- | --- |
| F-3-1 demo source metadata | Closed. Direct live `/demo` returns the exact demo title, canonical, Open Graph URL/title, and Twitter title before JavaScript. Its HTML hash matches `dist/site/demo/index.html`. |
| F-3-2 incomplete free-limit test | Closed. `@claim:free-limit` accepts 25, rejects 26, and preserves the accepted terms. |
| F-3-3 incomplete CLI JSON test | Closed. `@claim:cli-json` exercises all six commands and representative parser/runtime errors with one JSON result and no prompt. |
| F-3-4 three absent claims | Closed. The manifest and unique tagged tests now cover browser CSV export, quoted/escaped CSV import, and UTF-8 audit parity. |
| F-3-5 720 px footer overflow | Closed. All five page types have `scrollWidth === clientWidth === 720`; every footer child stays inside the viewport. |

## Earlier finding disposition

Every finding in verification 1–5 and review 1–2 was rechecked by the current full suite, clean claim runs, packaged consumer, or cold live checks.

- Production checkout and verification use `api.sociobot.in`; checkout returns hosted 303 and the catalog lists USD 29.00.
- Correction and audit writes remain rollback-safe for unwritable, identical, parent-alias, symlink-parent, and hard-link destinations.
- Hashed assets remain immutable; HTML and the service worker revalidate; the current service-worker cache name uses the documentation/test SHA while its logic matches the implementation build.
- CSP, Permissions Policy, HSTS, strict referrer policy, and `nosniff` remain live.
- Google export remains a documented inline `PhraseSet` with the sole `phrases` root.
- Keyboard CSV import, arrow-key tabs, visible focus, 44 px controls, route focus, and route announcements pass.
- Browser and CLI Unicode audits now have a dedicated parity claim with exact known UTF-8 byte offsets.
- Parser failures remain JSON in `--json` mode; malformed saved browser state still enters recovery without a page error.
- The packaged Rust API example still compiles and runs.
- The web and CLI demos remain isolated; the designed 404 still returns HTTP 404 with complete sharing metadata.
- The one-time USD 29.00 price, non-recurring fixture, free limit, verified-license result, and request policy remain covered.

## Verification completed

From the repository:

```sh
npm ci
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
/opt/fleet/lib/verify-url.sh https://proper-noun-lexicon.sociobot.in/ /work/.evidence/repair-7/verify-url
```

Results:

- `npm test`: 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 58 Playwright tests passed. Six duplicate-project cases were intentionally skipped.
- `npm run lint`: Rust formatting, strict Clippy, and TypeScript passed.
- `npm run build`: passed and produced `dist/site/` plus `target/release/pnl`.
- All 14 exact commands in `.factory/claims.json` passed separately after `npm ci` in clean checkout `/tmp/pnl-repair7-clean.oQfouS` at the implementation SHA.
- `cargo package`: `proper-noun-lexicon 0.1.3`, 11 files, 53.6 KiB unpacked and 14.5 KiB compressed.
- The packaged crate installed in a new Cargo root. Installed `pnl --json demo` produced all eight expected files.
- A separate Rust consumer compiled and ran import, Unicode correction, raw preservation, boundary behavior, exact offsets, and Google export.
- Local initial assets are 17,494 bytes JavaScript and 19,271 bytes CSS. The hero WebP is 62,510 bytes.

## Cold live verification

- Azure deployment ID: `8b5c61a1-616c-45d1-b4a3-6a0c51edeb5b`.
- Home, demo, hashed JS, hashed CSS, and service-worker SHA-256 values match the deployed files byte-for-byte.
- Fresh 1440 × 1000 and 390 × 844 sessions show the job, audience, sample action, expected result, and three facts before scrolling.
- The one-click demo loads three names and a realistic transcript. Correction produces `Ask Sociobot whether the Kubernetes API is ready.`
- The fixed sample label stays present after scrolling. Reset restores the sample, and Start for real returns the seeded real workspace unchanged.
- The 720 × 500 layout has no overflow on home, demo, Privacy, Terms, or 404 pages.
- Live browser checks found no console/page errors, no undersized controls, and no serious or critical Axe findings.
- Keyboard, focus, reduced motion, offline reload/correction, privacy request logging, legal links, and the deliberate designed 404 pass.
- `/opt/fleet/lib/verify-url.sh`: 200 in 796 ms, correct title/lang/h1/main/alts/control names, no console errors.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.2 s, TBT 50 ms, CLS 0, transfer 80 KiB.
- The product verifier returned 429 on request 31 with `Retry-After: 4`; the first request after that interval returned 200.

## Deployment identity

The deployed runtime source assets are implementation `c5604acfd82ba448bf84fc0f7be6d89db8e275c5`. Commit `9b9f0a7…` changes only the external live-verification script. Documentation commit `473921c…` does not alter product source, but the deployed service-worker cache name carries that later SHA. The implementation and documentation identities are both recorded above; no new product deployment is required.

## Known limits and next step

No real purchase, refund, or production-license issuance was performed. Checkout availability, invalid verification, recorded valid/revoked states, client caching, and live rate limiting were checked without a financial transaction.

The brief’s 25-point recall target still needs a customer pilot with a real 100-name vocabulary and a chosen speech provider. The product does not claim that unmeasured outcome.
