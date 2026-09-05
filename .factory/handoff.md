# Verify dictated-name correction and rollback — handoff

**Work order:** `proper-noun-lexicon-verify-9`

**Verdict:** **PASS**

**Findings:** **0**

**Untested public claims:** **0**

## Product and first action

Proper Noun Lexicon corrects dictated names using approved spellings, retains the raw transcript, and exports speech-tool hints. It is for people who dictate work and need names, acronyms, and company terms written exactly. The first action is **Try it with sample data**, which loads three terms and one raw transcript.

Fresh desktop and phone checks showed the job, audience, action, expected result, and three facts before scrolling.

## Release identity

- Implementation candidate: `f2a52e0db1702db7d1371663e79f0fccb5880744`.
- Product-scoped verification script: `dc092271e9ec8ac4bf3a6a8005d5a9c74634c81c`.
- Documentation baseline: `813906aff40b83209cccc1a969e09bad78019372`.
- Deployment ID: `b3ee48ed-cb74-49b1-93f0-7006def0a690`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

Production home, demo, JavaScript, and CSS are byte-identical to a clean `f2a52e0` build. The service-worker logic also matches; production carries the later documentation release stamp `pnl-shell-813906a…`.

## Verification completed

A new clean checkout ran `npm ci`, every exact command in `.factory/claims.json`, `npm test`, `npm run lint`, `npm run build`, and `cargo package --manifest-path cli/Cargo.toml`. All 15 claims passed independently. The full suite passed 12 Rust unit tests, one doctest, nine Vitest tests, and 62 Playwright tests, with six intentional duplicate-project skips. The build produced the release CLI and `dist/site/`.

The packaged 0.1.3 crate was installed into a new Cargo root. Installed `pnl --json demo` created all eight expected files in a unique temporary directory. Its audit preserved exact raw and corrected text with three changes. An invalid format returned one JSON error, exit 2, no stdout, and no prompt.

Fresh live desktop and phone sessions passed the full sample flow. They produced `Ask Sociobot whether the Kubernetes API is ready.`, retained the exact correction audit after reload, restored raw text after reload, kept the demo label visible, reset the sample, removed demo keys on exit, and left seeded real data unchanged. Blank input, a whole-word boundary, and malformed stored data recovery also passed.

The product-scoped live verifier passed price, checkout, invalid-license, security-header, metadata, route, cache, and size checks. The browser verifier passed desktop, 720 px, and phone layouts, keyboard operation, focus, route announcements, 44 px targets, reduced motion, offline reload, same-origin traffic, and Axe. `/opt/fleet/lib/verify-url.sh` passed with no console errors.

Lighthouse mobile scored 98 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.221 s, TBT 155 ms, CLS 0, and total transfer 81,804 bytes.

## Earlier findings

Every finding in verification 1–5 and review 1–4 was rechecked. Production billing, atomic CLI audit writes, cache/update policy, headers, Google output, keyboard paths, target sizes, tab keys, UTF-8 offsets, JSON errors, corrupt-storage recovery, typed library use, demos, routes, metadata, pricing coverage, claim completeness, 720 px layout, and correction-audit persistence are closed. Verification 6–8 had no findings; their outcomes passed again.

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

## Limits

No real purchase, refund, or production license was created. The payment lifecycle remains an external limit. The 100-name, 25-point recall measure still needs a customer pilot and is not a completed product claim.

Full evidence and finding dispositions are in `.factory/verification-9.md`. Evidence is under `/work/.evidence/verify-9/`.
