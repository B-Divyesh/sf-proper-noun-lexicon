# Review correcting dictated names from a vocabulary — handoff

**Work order:** `proper-noun-lexicon-review-4`

**Verdict:** **FAIL**

**Findings:** 1

**Untested public claims:** 1

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

The complete review is in `.factory/review-4.md`.

## Release identity

- Implementation reviewed: `c5604acfd82ba448bf84fc0f7be6d89db8e275c5`.
- Documentation baseline: `c2fa87e36124a413f056bff226be4c66d193f9a3`.
- Live HTML, demo HTML, JavaScript, and CSS match the fresh build byte-for-byte.
- The live worker has documentation stamp `473921c…`; its executable logic matches the clean build after replacing only the stamp.

## Finding to repair

The live Privacy page says a correction audit is stored in browser local storage. The application stores only vocabulary and the raw draft. A live correction showed an audit, but local storage contained only `entries` and `raw`; reload removed the audit.

Repair this in one of two ways:

1. Change the Privacy copy to say audits stay in memory until downloaded.
2. Persist audits locally and add a claim test that proves exact recovery after reload.

The current manifest does not list this persistence statement, so the finding and untested-claim counts are both one. Product code was not changed because this review explicitly forbids it.

## Verification completed

From a clean checkout at `c2fa87e`:

```sh
npm ci
# every exact command in .factory/claims.json, separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
/opt/fleet/lib/verify-url.sh https://proper-noun-lexicon.sociobot.in/ /work/.evidence/review-4/verify-url
```

- All 14 declared claim commands passed.
- `npm test`: 12 Rust unit tests, one doctest, nine Vitest tests, and 58 Playwright tests passed; six duplicate-project cases were skipped.
- `npm run lint` and `npm run build` passed. The build produced `target/release/pnl` and `dist/site/`.
- `cargo package` verified the 0.1.3 crate with 11 files.
- The packaged CLI installed into a fresh Cargo root. Its demo produced all eight expected files, and its JSON parser error was non-interactive with exit 2.
- Static live checks, four consecutive full browser-verifier reruns, offline/update, reduced motion, keyboard/focus, links, route titles, designed 404, security headers, and same-origin privacy traffic passed.
- Fresh desktop and phone Axe scans found zero violations on home, demo, Privacy, Terms, and 404.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.2 s, TBT 0 ms, CLS 0, transfer 80 KiB.

The first browser-verifier invocation hit its non-retrying immediate Back-focus assertion. Four consecutive reruns passed, and the retrying route regression passed in both full clean suites. The live focus path itself is working; no product finding was recorded for that timing sample.

## Evidence

- Report copy: `/work/.evidence/qa-report.md`
- Result JSON: `/work/.evidence/qa-result.json`
- Live reload proof: `/work/.evidence/review-4/audit-after-reload.png`
- Desktop and phone captures: `/work/.evidence/review-4/verify-url/`
- Lighthouse JSON: `/work/.evidence/review-4/lighthouse.json`

No backend-specific tenant, restart, or health tests apply to this static site and local CLI. No payment, refund, or production license was created.
