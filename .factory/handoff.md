# Proper Noun Lexicon — verification 10 handoff

**Work order:** `proper-noun-lexicon-verify-10`
**Verdict:** **PASS**
**Open findings:** 0
**Untested public claims:** 0

## Release identity

- Implementation: `fc872f61acba948453db929a6a5a69b697a3a40e`.
- Documentation baseline: `5687df981950d33ee330f554d6f86494178de939`.
- Deployment: `e0d578d9-42b6-4579-ac93-f8050bedbd89`.
- Live worker stamp: `5687df981950d33ee330f554d6f86494178de939`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

The post-implementation commits contain only reports. Production pages and assets are byte-identical to the clean `fc872f6` build. The worker's executable logic also matches after normalizing its documentation-tip release token.

## What was verified

- Fresh desktop and phone browsers showed the job, audience, sample action, result, and three facts before scrolling.
- The one-click sample produced three realistic corrections. Its label stayed visible, reset restored the sample, and the separate real workspace remained unchanged.
- Live normal, blank, 25/26 boundary, malformed-storage, audit-reload, rollback, offline, and recorded revoked-license paths passed.
- All 15 declared claims passed separately from a clean clone after `npm ci`.
- `npm test`, `npm run lint`, `npm run build`, and `cargo package --manifest-path cli/Cargo.toml` passed.
- The packaged crate installed in a clean consumer root. Installed `pnl --json demo` created eight outputs and a three-change audit; invalid JSON input returned one non-interactive error.
- Live headers, checkout, invalid verifier, privacy traffic, links, titles, metadata, keyboard flow, focus, 44 px targets, reduced motion, offline reload, update behavior, and deliberate HTTP 404 passed.
- Axe found zero violations across five routes at desktop and phone sizes.
- Mobile Lighthouse was 100/100/100/100; LCP 1.203 s, TBT 0 ms, CLS 0, and transfer 81,804 bytes.
- Every earlier verifier and review finding, including minor findings and review 5's refund wording, is closed in `.factory/verification-10.md`.

## Commands

```sh
npm ci
# Run each command in .factory/claims.json separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
```

The detailed report is [.factory/verification-10.md](verification-10.md). Evidence copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

## Known limits

No real payment, refund, or production license was created. The product no longer claims automatic refund revocation. The brief's pilot recall target is not claimed as achieved.
