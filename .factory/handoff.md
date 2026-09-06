# Proper Noun Lexicon — review 6 handoff

**Work order:** `proper-noun-lexicon-review-6`
**Verdict:** **PASS**
**Open findings:** 0
**Untested public claims:** 0

## Release identity

- Implementation: `fc872f61acba948453db929a6a5a69b697a3a40e`.
- Documentation baseline reviewed: `20916161ab35fc25316df400f8f3553e6ca9201a`.
- Live worker stamp: `5687df981950d33ee330f554d6f86494178de939`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

The commits after the implementation contain only Factory reports and handoff documents. Production pages and assets are byte-identical to the clean implementation build. The service worker also matches after normalizing its report-only release token.

## What was verified

- Fresh desktop and phone browsers showed the job, audience, sample action, result, and three facts before scrolling.
- The one-click sample produced the exact three-name correction. Its audit survived reload, raw rollback was exact, the demo label stayed visible, reset restored the sample, and real data remained unchanged.
- Live blank, unapproved-boundary, 25/26-limit, malformed-storage, invalid-license, offline, update, and recovery paths passed.
- All 15 claim commands passed separately from a clean checkout after `npm ci`.
- `npm test`, `npm run lint`, `npm run build`, and `cargo package --manifest-path cli/Cargo.toml` passed.
- The packaged crate installed in a new consumer root. Installed demo and invalid JSON-mode behavior passed.
- Headers, privacy traffic, links, titles, metadata, keyboard use, focus, 44 px targets, reduced motion, legal pages, and deliberate HTTP 404 behavior passed.
- Axe reported zero violations on five routes at desktop and phone sizes.
- Mobile and desktop Lighthouse each scored 100/100/100/100. Mobile LCP was 1.202 seconds, TBT was 0 ms, CLS was 0, and transfer was 81,795 bytes.
- Every earlier finding, including review 5's unproved refund wording, remains closed.

## Commands

```sh
npm ci
# Run every command in .factory/claims.json separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
```

The detailed report is [.factory/review-6.md](review-6.md). Evidence is under `/work/.evidence/review-6/`. Required copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

## Known limits

No real purchase, refund, or production license was created. The product does not claim automatic refund revocation. The brief's pilot recall target is not claimed as achieved.
