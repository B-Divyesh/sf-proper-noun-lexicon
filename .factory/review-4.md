# Review correcting dictated names from a vocabulary — FAIL

**Work order:** `proper-noun-lexicon-review-4`

**Verdict:** **FAIL**

**Findings:** 1

**Untested public claims:** 1

## Release reviewed

- Product job: correct dictated names using approved spellings, keep the raw transcript, and export speech-tool hints.
- Audience: people who use dictation for work and need names, acronyms, and company terms written exactly.
- Candidate implementation: `c5604acfd82ba448bf84fc0f7be6d89db8e275c5`.
- Documentation baseline: `c2fa87e36124a413f056bff226be4c66d193f9a3`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

Commits after `c5604ac` change only `scripts/verify-live-browser.mjs` and Factory reports. The live landing HTML, demo HTML, JavaScript, and CSS match a fresh `c2fa87e` build byte-for-byte. The deployed service-worker logic also matches; its cache stamp is documentation SHA `473921c…`, while the clean build stamp is `c2fa87e…`.

## Finding

### F-4-1 — Acceptance blocking — the Privacy page falsely says correction audits are stored in browser local storage

**Public claim:** `/privacy/` says: “Your approved terms, aliases, raw transcript draft, correction audit, and license token are stored in browser local storage on your device.”

**Live evidence:** In a fresh phone context, I opened `/demo`, applied all three sample corrections, and confirmed the correction audit was visible. The only local-storage entry was `demo:pnl:workspace:v1`, containing `entries` and `raw`. It contained no audit, corrected text, or changes. After reload, the raw transcript and vocabulary returned, but the correction result and audit were gone.

**Implementation evidence:** `site/src/app.ts` keeps `audit` in an in-memory variable. `save()` writes only `{ entries, raw }` to local storage. No code restores an audit after reload.

**Claim evidence:** `.factory/claims.json` has no claim for audit persistence. `approved-reversible` proves same-session restoration, and `local-privacy` proves request isolation; neither proves that an audit is stored or survives reload.

**Impact:** A visitor can reasonably rely on the Privacy page when deciding whether correction provenance will survive a refresh. The statement is both untested and false in the shipped browser product.

**Required correction:** Either state that audits remain in memory until downloaded, or persist the audit locally and add a claim test that applies a correction, reloads, and recovers the exact audit. The work order forbids product-code changes, so this review reports the defect without changing the product.

Evidence screenshot: `/work/.evidence/review-4/audit-after-reload.png`.

## First screen

Fresh 1440 × 1000 desktop and 390 × 844 phone browsers showed these items before scrolling:

- Job: “Correct dictated names from your vocabulary.”
- Audience and result: “For people who dictate work, it turns chosen aliases into exact names without sending transcripts away.”
- First action: “Try it with sample data.”
- Action result: “Loads three terms and one raw transcript.”
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

The title names the job, and the copy uses plain words without metaphor or mood headings. Screenshots are `/work/.evidence/review-4/verify-url/screenshot-desktop.png` and `/work/.evidence/review-4/verify-url/screenshot-mobile.png`.

## Demo and user paths

The one-click sample opened a populated review desk with Sociobot, Kubernetes, API, and `Ask socio bot whether the cuber netties A P I is ready.` Applying corrections produced `Ask Sociobot whether the Kubernetes API is ready.` and three approved changes.

The fixed label remained visible and said “Demo — sample data, nothing is saved to your workspace.” Reset restored the three terms and original transcript. Start for real removed every `demo:pnl:` key and restored a separately seeded real workspace unchanged.

Normal correction, zero-change input, case-insensitive matching, longest-alias preference, whole-alias boundaries, exact raw restoration, quoted CSV, escaped quotes, Unicode offsets, the 25/26 term boundary, malformed stored-data recovery, invalid license, revoked license, offline fallback, and Retry-After fixtures all passed the automated checks.

## Declared claims

A fresh checkout at `c2fa87e` ran `npm ci`, then every exact command in `.factory/claims.json` separately. Each command selected one tagged test and passed.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `approved-reversible` | PASS |
| `model-exports` | PASS |
| `browser-csv-export` | PASS |
| `quoted-csv-import` | PASS |
| `utf8-audit-parity` | PASS |
| `free-limit` | PASS |
| `pricing` | PASS |
| `cli-demo` | PASS |
| `license-request-policy` | PASS |
| `cli-json` | PASS |
| `typed-library` | PASS |

These passing entries do not cover F-4-1. The public-claim inventory is therefore incomplete, so the untested-claim count is one.

## Clean build and installed CLI

From the clean checkout:

```sh
npm ci
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

All passed. `npm test` ran 12 Rust unit tests, one doctest, nine Vitest tests, and 58 Playwright tests; six duplicate-project cases were skipped. `npm run build` repeated the suite, built `target/release/pnl`, and produced `dist/site/`. Initial assets are 17,494 bytes of JavaScript and 19,271 bytes of CSS.

The packaged 0.1.3 crate verified with 11 files. I installed it into a new Cargo root and ran its real binary. `pnl --json demo` created a unique temporary directory with all eight sample, vocabulary, corrected-text, audit, Whisper, Google, and Azure files. The audit contained the untouched raw transcript and three replacements. An invalid installed command returned exit 2 and one JSON error without prompting.

## Live site checks

- `npm run verify:live` passed production metadata, security headers, budgets, the USD 29.00 catalog entry, hosted checkout redirect, and invalid-license response.
- The live browser verifier passed four consecutive full reruns after one initial immediate Back-focus assertion sampled too early. The retrying route-focus test also passed in both full clean suites, and direct use observed the home heading focus and announcement. This was verifier timing, not a failed user path.
- `/opt/fleet/lib/verify-url.sh` passed in 548 ms with the correct title, `lang`, one `h1`, one `main`, complete alt text, named controls, and no load errors.
- A fresh Axe scan of home, demo, Privacy, Terms, and the designed 404 found zero violations on desktop and phone. All routes had one `h1`, one `main`, correct titles, and no horizontal overflow.
- The deliberate unknown URL returned the designed recovery page with HTTP 404. The browser's 404 resource message is expected and is not a defect.
- Keyboard correction, CSV import, export-tab arrow keys, skip link, visible focus, Back focus, route announcements, 44 px targets, 720 px layout, and 200% zoom-equivalent layout passed.
- Reduced motion removed smooth scrolling and entry motion. Offline reload showed offline state and still corrected the sample.
- A fresh service-worker reinstall removed an obsolete cache and left only `pnl-shell-473921c…`.
- Normal demo correction made product-origin requests only. No analytics, external fonts, transcription calls, vocabulary, or transcript left the product origin.
- Every link across home, demo, Privacy, Terms, and 404 returned 200, except the expected checkout 303 redirect.
- Lighthouse mobile scored 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.2 s, TBT 0 ms, CLS 0, and transfer 80 KiB.

This product is a static site plus local CLI, not a product backend. Tenant isolation, process restart persistence, and a product health endpoint do not apply. The client license request policy is covered by recorded 200/429 fixtures, including `Retry-After`; the live catalog, checkout boundary, and invalid verifier also passed.

## Earlier finding disposition

Every earlier review and verification report was read. Current evidence gives these dispositions:

| Earlier finding | Current disposition |
| --- | --- |
| V1 production billing used staging | Closed: live links and requests use `api.sociobot.in`. |
| V1 correction could survive a failed audit write | Closed: unwritable and aliased output/audit regression tests pass. |
| V1 hashed assets lacked immutable caching | Closed: live hashed assets use one-year immutable caching. |
| V1 service-worker cache lacked a release version | Closed: the worker is release-stamped and removes obsolete caches. |
| V1 response hardening was incomplete | Closed: CSP, HSTS, referrer policy, `nosniff`, and Permissions Policy pass. |
| V2 production checkout returned 404 | Closed: checkout returns the hosted 303 redirect. |
| V3 Google export used the wrong wrapper | Closed: outputs use the documented inline `phrases` root. |
| V3 keyboard CSV import was unreachable | Closed: keyboard import passes. |
| V3 links missed 44 px targets | Closed: no undersized live target was found. |
| V3 tabs lacked arrow-key behavior | Closed: ArrowLeft, ArrowRight, Home, and End behavior passes. |
| V4 equivalent output/audit paths could erase rollback | Closed: literal, parent, symlink-parent, and hard-link cases pass. |
| V4 browser audit used UTF-16 offsets | Closed: browser and CLI UTF-8 byte offsets match. |
| V4 parser failures ignored `--json` | Closed: installed parser errors return one JSON line and non-zero status. |
| V4 malformed saved data crashed the page | Closed: invalid data is quarantined with recovery controls. |
| V4 public Rust API lacked an example | Closed: the packaged doctest compiles and runs. |
| V5 candidate mismatch | Closed: implementation and later documentation SHAs are present and identified above. |
| V5 claim manifest was absent | Closed for the prior surface: all 14 entries pass. F-4-1 is a newly identified missing claim. |
| V5 first screen lacked the sample action | Closed: both fresh viewports show it before scrolling. |
| V5 web and CLI demos were not isolated | Closed: browser prefixes and CLI temporary output are isolated. |
| V5 request allowance was undocumented | Closed: the client policy and 429 fixture are documented and tested. |
| V5 fresh suite was flaky | Closed for product gates: both current full suites passed. |
| V5 demo/404/metadata routes were incomplete | Closed: direct demo metadata and designed HTTP 404 pass. |
| F-1-1 route focus and announcement | Closed on desktop and phone. |
| F-1-2 missing 404 sharing metadata | Closed: Open Graph and Twitter metadata are complete. |
| F-1-3 misleading CLI action | Closed: “View CLI install steps” opens install commands. |
| F-1-4 export jargon | Closed: the page uses prompt and phrase-list wording. |
| F-1-5 mixed collection terminology | Closed: user copy consistently says vocabulary. |
| F-1-6 overlong README sentence | Closed: the sentence remains split. |
| F-2-1 unproved price and recurring terms | Closed: the pricing claim checks USD 2900 and `recurring: false`. |
| F-3-1 home metadata on `/demo` | Closed: demo source metadata is route-specific. |
| F-3-2 incomplete 25-term boundary | Closed: exactly 25 are accepted; 26 are rejected without data loss. |
| F-3-3 incomplete CLI JSON coverage | Closed: every command and representative error class run in JSON mode. |
| F-3-4 missing CSV/import/offset claims | Closed: three dedicated claim entries pass. |
| F-3-5 720 px overflow | Closed across home, demo, Privacy, Terms, and 404. |

Verification 6, 7, and 8 reported no findings. Their relevant pass claims were rerun rather than accepted from status labels. F-4-1 is new and is not contradicted by those reports.

## Limits

No payment, refund, or production license was created. The brief's 100-name, 25-point recall measure still needs a customer pilot and is not claimed by the product.

**Final verdict: FAIL. One finding remains, and one public claim is untested and false.**
