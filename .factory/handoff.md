# Review correcting dictated names from approved vocabulary — handoff

**Work order:** `proper-noun-lexicon-review-5`

**Verdict:** **FAIL**

**Findings:** **1**

**Untested public claims:** **1**

## Release identity

- Implementation candidate: `f2a52e0db1702db7d1371663e79f0fccb5880744`.
- Documentation baseline reviewed: `8a17538f3ed23a3f5c34ea7ffa5c92214b0f5221`.
- Live service-worker stamp: `813906aff40b83209cccc1a969e09bad78019372`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

Production home, demo, JavaScript, and CSS match the clean build byte-for-byte. The service-worker logic also matches after normalizing its report-only release stamp.

## Result

The product behavior passed, but strict acceptance does not. The live Terms page promises that **“A refund revokes the license automatically.”** There is no refund/revocation entry in `.factory/claims.json`, and no test completes or records an authorized refund-to-revocation billing lifecycle. The existing revocation test starts from a mocked `revoked` verifier response, so it proves only the browser's reaction.

Remove that public promise or add one uniquely tagged claim with authorized Sociobot billing-sandbox evidence for purchase, refund, revocation, and subsequent verification. No product code was changed during this review.

## Verification completed

- Fresh 1440 × 1000 desktop and 390 × 844 phone sessions showed the job, audience, sample action, result, and three facts before scrolling.
- The live sample produced `Ask Sociobot whether the Kubernetes API is ready.` with three changes. Audit reload, exact raw restoration, persistent demo label, reset, storage isolation, blank input, boundary input, and corrupt-storage recovery passed.
- All 15 exact declared claim commands passed independently from a detached clean checkout after `npm ci`; every tag occurs exactly once.
- `npm test`, `npm run lint`, `npm run build`, and `cargo package --manifest-path cli/Cargo.toml` passed.
- The packaged crate was installed in a new Cargo root. Installed `pnl --json demo` created all eight outputs; its audit was exact, and an invalid format returned structured JSON with exit 2 and no prompt.
- Live metadata, headers, checkout redirect, invalid-license response, routes, links, designed HTTP 404, phone/desktop layout, keyboard, focus, 44 px targets, reduced motion, offline reload, cache update, same-origin privacy, and Axe passed.
- Lighthouse mobile scored 99 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.203 s, TBT 93 ms, CLS 0, and transfer 81,795 bytes.
- Every earlier finding was rechecked and remains closed. The prior verification's explicit statement that no refund was tested exposed the new claim-coverage contradiction.

## How to verify

```sh
npm ci
# Run every exact command in .factory/claims.json separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
/opt/fleet/lib/verify-url.sh https://proper-noun-lexicon.sociobot.in/ <evidence-dir>
```

Full evidence and disposition details are in `.factory/review-5.md`. Evidence is under `/work/.evidence/review-5/`.
