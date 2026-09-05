# Review dictated-name correction and rollback — FAIL

**Work order:** `proper-noun-lexicon-review-3`

**Reviewed:** 2026-09-05 UTC

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Implementation candidate:** `068e006bff81c41261b96dd21f9989c8360b96d0`

**Documentation SHA reviewed:** `db7b4d1ac3291b1fe8dc2e88460a222dfc683a31`

**Live build stamp:** `7f831bd11aaaaf0eb70ed309f61f84f19d81ba2c`

## Verdict

**FAIL — 5 findings and 5 claims without complete mandatory claim coverage.**

The correction, rollback, demo isolation, packaged CLI, privacy, offline, pricing boundary, and recovery paths worked. This is still not a PASS because the claim manifest is incomplete, the direct demo route publishes the wrong source metadata, and a responsive boundary overflows.

## Cold first screen

Fresh Chromium contexts at 1440 × 1000 and 390 × 844 showed all required information before scrolling.

- **Job:** “Correct dictated names from your vocabulary.”
- **Audience:** people who dictate work and need chosen aliases changed to exact names without sending transcripts away.
- **First action:** **Try it with sample data**.
- **Stated result:** “Loads three terms and one raw transcript.”
- **Facts:** stored in this browser, works offline after the first visit, and free for 25 terms.

The page uses plain headings and action labels. No metaphor heading, mixed collection term, banned marketing word, or first-screen overflow was found.

## Findings

### F-3-1 — Minor — `/demo` publishes home-page canonical and sharing metadata

The live `/demo` route becomes `Demo — Proper Noun Lexicon` after JavaScript runs, and the demo itself works. Its server response still contains:

```text
<title>Proper Noun Lexicon — correct dictated names</title>
<link rel="canonical" href="https://proper-noun-lexicon.sociobot.in/">
<meta property="og:title" content="Proper Noun Lexicon — correct dictated names">
<meta property="og:url" content="https://proper-noun-lexicon.sociobot.in/">
```

The sitemap treats `/demo` as a separate route. A crawler or link preview therefore receives the home identity instead of the required demo title and URL. Give `/demo` its own source title, canonical URL, Open Graph URL/title, and Twitter title. Tighten the route-metadata test to assert exact route values rather than only non-empty metadata.

### F-3-2 — Acceptance blocking — the 25-term claim test never proves that 25 terms are accepted

The public claim is “The browser workspace supports 25 terms for free.” Its tagged test builds only a 26-term CSV, expects rejection, and checks that the workspace remains at 0 terms. An implementation that rejected every import would pass this test.

The independent live check did prove the behavior: 25 terms imported, a later 26-term import failed, and the existing 25 terms remained. The mandatory `@claim:free-limit` test is still incomplete. It must assert both sides of the exact boundary.

### F-3-3 — Acceptance blocking — the every-command JSON claim tests only one command error

The public claim says every CLI command supports machine-readable JSON, including validation errors, without prompting. The sole `@claim:cli-json` test runs one invalid `export` command. It does not exercise successful JSON output from `demo`, `import`, `list`, `export`, `correct`, and `rollback`, or validation failures across the command surface.

The installed package passed an independent six-command JSON matrix in this review. The tagged test nevertheless does not enforce the wording on every build. Add a table-driven claim test for all six commands plus representative parser and runtime errors.

### F-3-4 — Acceptance blocking — three public data promises are missing from the claim manifest

These public promises have no entry and no uniquely tagged test in `.factory/claims.json`:

1. The browser **Export CSV** control and Privacy statement “Export your vocabulary as CSV at any time.”
2. The README statement that quoted CSV fields and escaped quotes are supported.
3. The README audit contract that browser and CLI changes use the same UTF-8 byte offsets.

The full suite contains partial coverage for CSV parsing and Unicode offsets, and this review successfully downloaded the live CSV and audit. That does not meet the contract requiring every public claim to be declared with exactly one tagged sandbox test.

### F-3-5 — Minor — the page overflows horizontally at a 720 px layout viewport

At a 720 × 500 CSS viewport, which is also the effective layout width of a 1440 px desktop at 200% zoom, the live page measured `scrollWidth: 783` and `clientWidth: 720`. The only element extending past the viewport was the footer’s **Built by Param Factory** credit, whose right edge was 782.8 px. The demo route reproduced the overflow.

The 390 px phone layout and 1440 px desktop layout both fit, so this is a responsive boundary gap rather than a general mobile failure. Let the footer wrap before 720 px or remove the fixed horizontal competition so 200% zoom does not require horizontal scrolling.

## Declared claim commands

The repository was cloned into a new temporary directory at `db7b4d1…`; `npm ci` completed with 0 vulnerabilities. Every exact command in `.factory/claims.json` was run separately and selected one tagged test.

| Claim | Command result | Coverage decision |
| --- | --- | --- |
| `demo-sandbox` | PASS | Complete |
| `local-privacy` | PASS | Complete |
| `offline-reload` | PASS | Complete |
| `approved-reversible` | PASS | Complete |
| `model-exports` | PASS | Complete |
| `free-limit` | PASS | Incomplete; F-3-2 |
| `pricing` | PASS | Complete |
| `cli-demo` | PASS | Complete |
| `license-request-policy` | PASS | Complete |
| `cli-json` | PASS | Incomplete; F-3-3 |
| `typed-library` | PASS | Complete |

The untested-claim count is **5**: two incomplete declared claims and the three unlisted public claims in F-3-4.

## Demo and user paths

The one-click sample loaded Sociobot, Kubernetes, API, and this raw text:

```text
Ask socio bot whether the cuber netties A P I is ready.
```

Applying corrections produced:

```text
Ask Sociobot whether the Kubernetes API is ready.
```

The page reported three approved changes. The fixed demo label stayed visible after scrolling. Removing a term and changing the transcript, then choosing **Reset demo**, restored all three terms and the original text. A separately seeded real workspace remained byte-for-byte unchanged; **Start for real** removed the demo keys and reopened that real workspace.

Normal and recovery checks passed:

- `sociobotics` stayed unchanged and reported no approved alias.
- Blank input announced the error and focused the raw transcript.
- An invalid CSV named the required columns and preserved the existing vocabulary.
- Malformed saved data was quarantined, retained the raw draft, showed recovery controls, and caused no page error.
- Exactly 25 terms imported; 26 were rejected without replacing the 25.
- Live CSV, audit, and Google PhraseSet downloads contained the expected data; clipboard copy returned the corrected text.

## Packaged CLI and library

`cargo package --manifest-path cli/Cargo.toml` passed for `proper-noun-lexicon 0.1.3`: 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. The package was extracted and installed into a new Cargo root.

The installed `pnl --json demo` created eight files in a unique temporary directory. The audit kept exact raw and corrected text plus three ordered changes; rollback matched the raw file byte-for-byte. An invalid format returned exit 2, empty stdout, one JSON error on stderr, and no output file. All six commands produced valid JSON in a separate consumer matrix. A separate Rust consumer compiled and ran the documented typed import, correction, raw-audit, boundary, and Google PhraseSet workflow. Nothing was published.

## Accessibility, privacy, offline, routes, and performance

- `npm run verify:live:browser` passed fresh desktop and phone contexts with no overflow or console/page errors.
- Axe found zero violations of any impact on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html` at both viewports.
- First Tab reached the visible skip link. Keyboard-only CSV import, `Ctrl+Enter` correction, `Ctrl+Z` rollback, and ArrowRight tab selection passed live.
- Every measured visible control met the 44 px target rule. Reduced motion disabled smooth scrolling and entry motion.
- Offline installation, reload, correction, release-stamped cache replacement, and old-cache removal passed.
- Normal demo use contacted only `https://proper-noun-lexicon.sociobot.in`; there were no analytics, external fonts/scripts, or transcript/vocabulary requests.
- Privacy and Terms returned 200 with their own runtime titles, one `h1`, one `main`, and working links. F-3-1 is the direct demo source-metadata exception.
- A deliberate unknown URL returned HTTP 404 with the designed recovery page and complete sharing metadata. This expected 404 is not a defect.
- `/opt/fleet/lib/verify-url.sh` passed in 627 ms with title, language, main, image alternatives, button names, and no console errors.
- Fresh Lighthouse mobile scores were 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.20 s, TBT 0 ms, CLS 0, total transfer 81,401 bytes.
- Built initial assets were 17.49 KiB JavaScript and 19.05 KiB CSS before gzip, with no font payload and a 62.51 KiB hero image.

## Pricing and request handling

The production catalog returned USD 2900 for this product. The checkout endpoint returned 303 to hosted Dodo checkout, and an invalid license returned the documented invalid response with `Cache-Control: no-store`. A bounded probe returned 429 on request 31 with `Retry-After: 4`; a request after that interval returned 200. The tagged request-policy test proved that the browser caches a successful check for 24 hours and does not retry a 429 before the stated delay.

No real purchase, refund, or production license was created. That external financial action remains an explicit test limit.

## Earlier finding disposition

Every finding in verification 1–5 and review 1–2 was inspected. Verification 6 and 7 reported no findings.

| Earlier finding | Current proof |
| --- | --- |
| V1 production billing used staging | Live links and requests use `api.sociobot.in`; checkout returns 303. |
| V1 correction could survive a failed audit write | Rust tests reject unwritable and equivalent destinations before exposing output. |
| V1 hashed assets were not immutable | Live hashed JS/CSS have one-year immutable caching. |
| V1 service-worker cache was not release-versioned | The worker has the live `7f831bd…` stamp; update tests remove old caches. |
| V1 response hardening was incomplete | CSP, Permissions Policy, HSTS, referrer policy, and `nosniff` are live. |
| V2 checkout returned 404 | The production endpoint now returns hosted-checkout 303. |
| V3 Google export used an invalid wrapper | Web, CLI, claim, and consumer outputs use a sole `phrases` root. |
| V3 CSV import was unreachable by keyboard | Live Enter opened the native chooser and imported a term. |
| V3 links missed 44 px targets | Fresh desktop and phone measurements found none. |
| V3 export tabs lacked arrow keys | Live ArrowRight selected and focused Google Speech. |
| V4 equivalent output/audit paths erased rollback | Literal, parent, symlink-parent, and hard-link regressions pass. |
| V4 browser audit used UTF-16 offsets | Unicode browser and Rust tests expect UTF-8 byte offsets; F-3-4 concerns claim registration, not runtime behavior. |
| V4 parser failures ignored `--json` | Installed invalid format returned one JSON error and exit 2. |
| V4 malformed saved state crashed | Fresh live malformed data entered recovery with no page error. |
| V4 public Rust API lacked an example | The doctest and external consumer both passed. |
| V5 candidate object was unavailable | Current candidate and documentation commits exist locally and on `origin/main`. |
| V5 claim manifest was absent | Eleven entries now exist and execute; F-3-2 through F-3-4 are new completeness findings. |
| V5 first screen lacked the sample action | Both fresh viewports show the action and result before scrolling. |
| V5 web and CLI demos were not isolated | Browser demo keys and CLI temporary output are isolated. |
| V5 billing allowance was undocumented | README and the request-policy claim document it; live request 31 returned 429 with `Retry-After`. |
| V5 clean-suite flake | Independent claim runs, `npm test`, and the repeated build suite passed. |
| V5 demo/404/metadata routing was incomplete | Demo and designed 404 routes exist; F-3-1 is the remaining demo-specific metadata detail. |
| R1 route changes did not focus or announce | `/ → demo → Back` focus and polite announcements passed live. |
| R1 404 lacked sharing metadata | The designed 404 has complete Open Graph and Twitter metadata. |
| R1 CLI action overstated its target | **View CLI install steps** opens the install commands. |
| R1 export copy used jargon | The page says prompt or phrase list for supported speech tools. |
| R1 mixed “lexicon” and “vocabulary” | User-facing collection copy consistently says vocabulary. |
| R1 README sentence exceeded 22 words | The verification sentence remains split into 18 and 6 words. |
| R2 price/no-subscription test was incomplete | The dedicated pricing claim checks the recorded USD 2900 non-recurring offer, visible terms, target, and 26-term verified result. |

## Build and deployment identity

- `npm test`: PASS — 13 Rust unit/doc tests, 9 Vitest tests, 51 Playwright tests; 5 intentional cross-project cases skipped.
- `npm run lint`: PASS.
- `npm run build`: PASS — repeated all tests, built the release CLI, and produced `dist/site/`.
- `npm run verify:live`: PASS.
- `npm run verify:live:browser`: PASS.

No product file differs between implementation commit `068e006…` and documentation commit `db7b4d1…`. Live `index.html`, JavaScript, and CSS match the clean documentation build byte-for-byte. Live `sw.js` matches that build after substituting the expected report-only `7f831bd…` release stamp. The later commits contain only `.factory` reports and evidence, so the implementation candidate remains `068e006…`.

## Result

**FAIL — 5 findings; 5 claims lack complete mandatory claim coverage.**

Evidence is under `/work/.evidence/review-3/`. No product code was changed.
