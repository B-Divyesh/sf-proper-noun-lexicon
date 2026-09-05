# Review dictated-name correction and rollback — handoff

**Work order:** `proper-noun-lexicon-review-3`

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Implementation reviewed:** `068e006bff81c41261b96dd21f9989c8360b96d0`

**Documentation SHA reviewed:** `db7b4d1ac3291b1fe8dc2e88460a222dfc683a31`

**Result:** **FAIL — 5 findings and 5 claims without complete mandatory claim coverage.**

## What was done

- Reviewed the live product without changing product code.
- Ran all 11 exact claim commands separately from a fresh clone.
- Ran tests, lint, the release build, crate packaging, clean CLI installation, and an external Rust consumer.
- Exercised fresh desktop and phone live sessions, the one-click sample, fixed demo label, reset, real-data isolation, correction, rollback, boundary, invalid, recovery, export, clipboard, keyboard, reduced-motion, offline, route, legal, privacy, 404, price, checkout, and rate-limit paths.
- Rechecked every finding from verification 1–5 and review 1–2.
- Compared the live runtime with the implementation and documentation commits.

## Verification result

- All 11 declared commands passed, but `free-limit` and `cli-json` do not prove their complete wording.
- Three public data promises are absent from `.factory/claims.json`: browser vocabulary CSV export, quoted/escaped CSV import, and CLI/browser UTF-8 audit-offset parity.
- The direct `/demo` source response uses the home title, canonical URL, and sharing identity.
- The footer causes 63 px of horizontal overflow at a 720 px layout viewport, including the 200% desktop-zoom equivalent.
- `npm test`, `npm run lint`, and `npm run build` passed. The build produced `dist/site/` and the release binary.
- The packaged crate installed cleanly; demo, rollback, errors, all six JSON command paths, and an external typed consumer passed.
- Live desktop and phone checks had no console/page errors, no Axe violations, no overflow, and no undersized measured controls.
- Lighthouse mobile scored 100/100/100/100 with LCP 1.20 s, TBT 0 ms, and CLS 0.
- Live request 31 returned 429 with `Retry-After: 4`; the next request after the interval returned 200.

The full finding evidence and earlier-history disposition are in [review-3.md](review-3.md). External evidence is under `/work/.evidence/review-3/`.

## Required next steps

1. Give `/demo` exact source title, canonical, Open Graph, and Twitter metadata.
2. Make `@claim:free-limit` accept 25, reject 26, and prove preservation.
3. Make `@claim:cli-json` exercise valid JSON for every command and representative error classes.
4. Add tagged claims for browser CSV export, quoted/escaped CSV import, and shared UTF-8 audit offsets.
5. Make the footer reflow without horizontal overflow at 720 px and the 200% desktop-zoom equivalent.
6. Repeat every claim command, full gates, package consumer, live metadata, desktop/phone, accessibility, privacy, offline, and pricing checks.

## Known test limit

No real purchase, refund, or production license was created. The catalog, checkout redirect, invalid verifier, recorded valid/revoked states, client cache policy, and live rate limit were checked without a financial transaction.

## Run again

```sh
npm ci
# Run every exact command in .factory/claims.json separately.
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
```
