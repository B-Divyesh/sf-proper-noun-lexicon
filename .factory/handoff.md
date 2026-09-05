# Verify dictated-name correction and rollback — handoff

**Work order:** `proper-noun-lexicon-verify-7`

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Implementation reviewed:** `068e006bff81c41261b96dd21f9989c8360b96d0`

**Documentation baseline:** `7f831bd11aaaaf0eb70ed309f61f84f19d81ba2c`

**Result:** **PASS — 0 findings and 0 untested declared claims.**

## What was done

- Performed independent QA without changing product code.
- Ran all 11 exact claim commands separately from a fresh clone.
- Ran `npm test`, lint/typecheck, the full release build, and `cargo package`.
- Installed the packed crate into a new Cargo root and exercised installed help, sample output, audits, all three exports, and JSON error behavior.
- Opened the live page in fresh desktop and phone contexts and checked the cold first screen, one-click sample, persistent label, reset, real-data isolation, normal correction, invalid input, boundary matching, recovery, keyboard use, focus, reduced motion, offline behavior, links, legal routes, privacy traffic, and the designed 404.
- Checked production catalog price, hosted checkout redirect, invalid verification, and live 429/`Retry-After` behavior without making a purchase.
- Rechecked every earlier verification and review finding.

## Verification result

- Claims: 11 passed; 0 failed; 0 untested.
- Full tests: 13 Rust unit/doc tests, 9 Vitest tests, and 51 Playwright cases passed; 5 intentional cross-project duplicates skipped.
- Build: `dist/site/` and the release `pnl` binary produced successfully.
- Package: `proper-noun-lexicon 0.1.3`, 11 files, 53.6 KiB unpacked / 14.5 KiB compressed.
- Live browser: desktop 1440 × 1000 and phone 390 × 844 passed with no console/page errors and no serious/critical Axe findings.
- Fresh Lighthouse mobile: 100 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.20 s, TBT 57.5 ms, CLS 0.
- Deployment: live `index.html` and `sw.js` match the clean documentation-baseline build. The `7f831bd…` worker stamp comes from a report-only deployment; runtime implementation changes stop at `068e006…`.

Full evidence and all earlier finding dispositions are in [verification-7.md](verification-7.md). External worker evidence is under `/work/.evidence/verify-7/`.

## Known limit

No real paid purchase, refund, or issued production license was created. The production catalog, checkout boundary, invalid verifier, live rate limit, and deterministic recorded valid/revoked/cache outcomes were checked. This is an explicit financial-test limit, not an untested declared claim.

The brief's 25-point recall outcome still needs a customer pilot vocabulary and a transcription system. The product intentionally does not upload an audio corpus.

## Run again

```sh
npm ci
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
```
