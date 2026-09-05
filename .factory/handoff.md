# Handoff — Proper Noun Lexicon repair 6

**Work order:** `proper-noun-lexicon-repair-6`
**Artifact:** Rust `pnl` CLI/library and static Vite review desk
**Production:** <https://proper-noun-lexicon.sociobot.in/>
**Implementation and deployed SHA:** `068e006bff81c41261b96dd21f9989c8360b96d0`
**Documentation/evidence SHA:** `8db7de64d64fbadcee704cd97f3aaa3b17ce4f85`
**Deployment:** `d96474b3-9c4b-4d2d-861d-eb375353e8de`
**Result:** PASS — the last blocking pricing claim now has an observable tagged test.

## What changed

- Split the original combined `free-limit` promise into two claims. `free-limit` now proves the free 25-term boundary; `pricing` proves the paid offer.
- Added `site/e2e/fixtures/pricing-catalog.json`, a recorded production product-offer fixture. It records USD `price_minor: 2900` and explicit `recurring: false`.
- Added exactly one `@claim:pricing` Playwright test. It reads that fixture, checks the displayed `$29` and no-subscription terms on the landing page and Terms page, checks the checkout target, then shows the 26-term import failing before and succeeding after a recorded valid license-verifier response.
- The pricing test checks a visitor-visible purchase result and a license-unlock result. It is not a source-string-only assertion.

## Current disposition of prior findings

- Review 2 F-2-1 is fixed by the dedicated `pricing` claim above.
- Review 1 F-1-1 through F-1-6 remain covered by current live checks: route focus/announcement, 404 sharing metadata, truthful CLI action, plain export copy, consistent vocabulary wording, and short README verification copy.
- Verification 1 through 6 findings remain fixed: production billing URL, reversible CLI output/audit safety, cache and security headers, documented Google payload, keyboard CSV import/targets/tabs, Unicode audit offsets, JSON CLI errors, stored-data recovery, Rust doctest, isolated web/CLI demos, claims manifest, 404 routing, and license retry handling.

## Verification

From fresh clone `/tmp/pnl-pricing-clean.1C32Qj` at implementation SHA:

- `npm ci`: passed, 0 vulnerabilities.
- Every exact command in `.factory/claims.json` passed independently: `demo-sandbox`, `local-privacy`, `offline-reload`, `approved-reversible`, `model-exports`, `free-limit`, `pricing`, `cli-demo`, `license-request-policy`, `cli-json`, and `typed-library`.
- `npm run lint`: passed.
- `npm run build`: passed. It ran 13 Rust unit/doctests, 9 Vitest tests, and 51 Playwright cases; five deliberately project-guarded duplicate cases skipped. It created `dist/site/` and the release CLI.
- `cargo package --manifest-path cli/Cargo.toml`: passed; 11 files, 53.6 KiB unpacked and 14.5 KiB compressed.
- A packed-crate install into a new Cargo root passed. Installed `pnl --help` described the local, non-interactive workflow. Installed `pnl --json demo` made three corrections and all eight sample outputs. The inspected demo directory was the only removal target; the container disallowed that cleanup command, so it remains as an OS temporary directory only.

## Live HTTPS verification

- `npm run verify:live`: passed. It confirmed the production catalog is USD 29.00, the hosted checkout returns 303, invalid verification works, headers and budgets are present, `/demo` works, and an unknown route returns the designed 404.
- `npm run verify:live:browser`: passed fresh 1440 × 1000 and 390 × 844 contexts. It covered first-screen fit, demo entry, persistent demo label, correction and exact raw rollback, Back/focus announcement, internal links, no console errors, same-origin demo traffic, 44 px targets, reduced motion, offline demo reload, and zero serious/critical Axe violations.
- `/opt/fleet/lib/verify-url.sh`: passed at <https://proper-noun-lexicon.sociobot.in/>: HTTP 200, 628 ms load, one h1, main landmark, language, named controls, alt text, and no errors. Evidence is in `.factory/evidence/repair-6/live-verify/`.
- Fresh desktop and phone reads both began at `scrollY: 0` with the job “Correct dictated names from your vocabulary.”, the audience “For people who dictate work…”, and **Try it with sample data** as the first action. It says that it loads three terms and one raw transcript.
- Live Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1,669 ms, CLS 0, TBT 0 ms. Report: `.factory/evidence/repair-6/lighthouse-live.json`.
- Live `sw.js` contains `pnl-shell-068e006bff81c41261b96dd21f9989c8360b96d0`, matching the implementation SHA.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site
npm run verify:live
npm run verify:live:browser
```

## Known limits and next step

No product defects remain. No actual purchase, refund, or issued production license was created because that would cause an external financial action. The hosted checkout boundary, catalog price, invalid verifier, and recorded valid-license browser outcome were tested. A real issued-license lifecycle remains dependent on Sociobot/Dodo. The brief’s 25-point recall outcome still needs a customer pilot vocabulary and transcription system; this product intentionally does not transmit an audio corpus.
