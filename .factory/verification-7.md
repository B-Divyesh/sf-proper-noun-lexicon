# Verify dictated-name correction and rollback — PASS

**Work order:** `proper-noun-lexicon-verify-7`

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Verified:** 2026-09-05 UTC

**Implementation reviewed:** `068e006bff81c41261b96dd21f9989c8360b96d0`

**Documentation baseline:** `7f831bd11aaaaf0eb70ed309f61f84f19d81ba2c`

**Verdict:** **PASS**

**Findings:** **0**

**Untested declared claims:** **0**

The product corrects only approved aliases, keeps the raw transcript for rollback, exports the documented speech-tool formats, and provides the same workflow through an installable local CLI. No finding of any severity remains.

## Cold first screen

Fresh browser contexts at 1440 × 1000 and 390 × 844 started at `scrollY: 0`. Both showed all required text and the primary action before scrolling:

- Job: **Correct dictated names from your vocabulary.**
- Audience: **For people who dictate work, it turns chosen aliases into exact names without sending transcripts away.**
- First action: **Try it with sample data**.
- Stated result: **Loads three terms and one raw transcript.**
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

The title is `Proper Noun Lexicon — correct dictated names`. The page has `lang="en"`, one `h1`, one `main`, a skip link, named controls, complete image alternatives, and no load errors.

## Declared claims

I cloned the repository into a new temporary directory, checked out documentation baseline `7f831bd…`, ran `npm ci`, and then ran every exact `test` command from `.factory/claims.json` separately. Each command selected exactly one tagged test and passed.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-sandbox` | PASS | Seeded real workspace stayed unchanged through demo edit, reset, and exit. |
| `local-privacy` | PASS | Demo correction used only product-origin requests and `demo:pnl:` storage. |
| `offline-reload` | PASS | A dedicated context reloaded `/demo` offline and corrected the sample. |
| `approved-reversible` | PASS | Case-insensitive, longest whole-alias correction and exact raw restore passed. |
| `model-exports` | PASS | Whisper, Google inline `PhraseSet`, and Azure phrase-list outputs matched their contracts. |
| `free-limit` | PASS | A 26-term import was rejected without changing the free workspace. |
| `pricing` | PASS | The recorded catalog fixture says USD 2900 and `recurring: false`; visible no-subscription copy, checkout target, and recorded verified-license 26-term import passed. |
| `cli-demo` | PASS | `pnl demo` created all eight expected files in a new temporary directory. |
| `license-request-policy` | PASS | Recorded 200 and 429 responses proved the 24-hour cache and `Retry-After` suppression. |
| `cli-json` | PASS | Invalid command-line input returned exit 2, empty stdout, and one JSON error on stderr. |
| `typed-library` | PASS | The public Rust import, correction, audit, and Google export example compiled and ran as a doctest. |

Claim logs are under `/work/.evidence/verify-7/claims/`. No public claim missing from the manifest was found. The landing page, README, CLI README, Privacy page, and Terms page use the tested local-storage, offline, correction, export, free-limit, pricing, and license behaviors without adding an unsupported product promise.

## Demo and user paths

The live sample opens in one click with Sociobot, Kubernetes, API, and `Ask socio bot whether the cuber netties A P I is ready.` already loaded. Applying corrections produced:

```text
Ask Sociobot whether the Kubernetes API is ready.
```

The page reported three approved changes. The fixed label remained visible after scrolling and said `Demo — sample data, nothing is saved to your workspace.` Removing a term and choosing **Reset demo** restored all three terms and the original transcript. A separately seeded real workspace remained byte-for-byte unchanged, and **Start for real** deleted the demo keys before reopening that real workspace.

Normal, invalid, boundary, and recovery checks passed:

- Exact sample correction and Restore raw worked.
- `sociobotics` remained unchanged and reported no approved aliases.
- Blank input focused the raw field and said to paste a raw transcript.
- Invalid saved vocabulary was quarantined, the raw draft was retained, and a recovery download/discard choice appeared.
- The 25-term boundary passed; 26 terms failed without replacing existing data; a recorded verified license admitted 26 terms.

## CLI and library

`cargo package --manifest-path cli/Cargo.toml` passed for `proper-noun-lexicon 0.1.3`: 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. I extracted that crate into a new consumer directory and installed it into a new Cargo root with `cargo install --path … --root … --locked`.

The installed `pnl --help` described the local, non-interactive workflow. Installed `pnl --json demo` made three corrections and wrote the CSV, raw transcript, vocabulary, corrected text, rollback audit, Whisper prompt, Google PhraseSet, and Azure phrase list. The audit retained exact raw and corrected text plus three ordered changes. An invalid installed command returned exit 2, no stdout, and a parseable JSON error. Nothing was published.

## Accessibility, privacy, routes, and performance

- `npm run verify:live:browser` passed fresh desktop and phone contexts: no overflow or console/page errors, visible focus, 44 px controls, route focus/announcement, same-origin demo traffic, reduced motion, offline reload, and zero serious/critical Axe findings.
- Independent keyboard use passed: first Tab reached the skip link, Space opened and completed CSV import, `Ctrl+Enter` applied corrections, and ArrowRight moved the export tab selection.
- Axe integration ran on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html` in the full test matrix. No serious or critical violation was found.
- `/opt/fleet/lib/verify-url.sh` passed in 811 ms with no console errors. Its desktop and phone screenshots are in `/work/.evidence/verify-7/verify-url/`.
- The demo contacted only `https://proper-noun-lexicon.sociobot.in`. There were no analytics, external fonts/scripts, or vocabulary/transcript requests. License checks use only the disclosed product verifier.
- Offline installation, offline `/demo` reload/correction, release-stamped cache cleanup, and reduced-motion behavior passed. HTML and `sw.js` revalidate; hashed JS/CSS use one-year immutable caching.
- Privacy and Terms returned 200 with their own titles, one `h1`, one `main`, and working links. Robots, sitemap, manifest, repository, and issue-tracker links returned 200.
- A deliberate unknown URL returned HTTP 404 with the designed recovery page and complete sharing metadata. This expected 404 is not a defect.
- Response headers include HSTS, `nosniff`, strict referrer policy, a restrictive CSP, and a permissions policy.
- Fresh Lighthouse mobile scores: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1,201 ms, TBT 57.5 ms, CLS 0, total transfer 81,410 bytes.
- Built initial assets were 17.49 KiB JS and 19.05 KiB CSS before gzip, with no font payload and a 62.51 KiB hero WebP. They are below the product budgets.

## Pricing and request handling

Live evidence confirms the production catalog entry at USD 29.00, the production checkout target, a 303 redirect to hosted Dodo checkout, and the invalid-license response. The visible landing and Terms copy says one-time purchase and no subscription. The valid-license unlock is deterministic recorded-fixture evidence; it is not presented as a live purchase.

A bounded live probe of this product's verifier returned 200 for requests 1–30, then 429 on request 31 with `Retry-After: 4`. The matching claim proves that the browser does not retry before that delay and keeps the free or last verified state.

No real paid purchase, refund, or production license was created. That external financial lifecycle is an explicit verification limit, not an untested declared claim. Checkout availability, invalid verification, recorded valid/revoked/cache behavior, and the user-visible paid result were tested.

## Earlier finding disposition

Every finding in verification 1–5 and review 1–2 was inspected. Verification 6 had no findings.

| Earlier finding | Current proof |
| --- | --- |
| V1 production billing used staging | Live links and requests use only `api.sociobot.in`; checkout returns 303. |
| V1 corrected CLI output could outlive a failed audit | Rust regression tests reject unwritable or equivalent destinations before exposing a correction. |
| V1 hashed assets lacked immutable caching | Live hashed JS/CSS return one-year immutable caching. |
| V1 service-worker cache lacked a release version | The worker is release-stamped and the update test removes obsolete caches. |
| V1 response hardening was incomplete | Live CSP, Permissions Policy, HSTS, referrer policy, and `nosniff` passed. |
| V2 production checkout returned 404 | Live checkout now returns 303 to hosted checkout. |
| V3 Google export used an invalid wrapper | Web, CLI, unit, claim, and consumer evidence show the sole root key `phrases`. |
| V3 keyboard CSV import was unreachable | Fresh live keyboard use focused the input and imported with Space. |
| V3 links missed 44 px targets | Fresh desktop/phone measurement found no undersized visible target. |
| V3 tabs lacked arrow-key behavior | Fresh live ArrowRight use selected and focused Google Speech. |
| V4 equivalent output/audit paths could erase rollback | Current tests cover literal, parent, symlink-parent, and hard-link aliases. |
| V4 browser audit used UTF-16 offsets | Shared Unicode fixtures and the browser download test prove UTF-8 byte offsets. |
| V4 `--json` missed parser errors | The installed invalid-format command returned one JSON error and exit 2. |
| V4 malformed saved data crashed the page | Fresh live malformed data was quarantined with recovery controls and no page error. |
| V4 packaged Rust API lacked a compiled example | The crate-level public example passes as a doctest. |
| V5 requested candidate was unavailable or mismatched | `068e006…` exists; changes through `7f831bd…` are report/evidence only. Live runtime matches a clean build at `7f831bd…`; see deployment identity below. |
| V5 claim manifest was absent | The manifest now has 11 claims; every exact command passed independently. |
| V5 first screen lacked the sample action | Both fresh viewports show the job, audience, sample action, result, and facts before scrolling. |
| V5 web and CLI demos were not isolated | `/demo` uses `demo:pnl:` keys; installed `pnl demo` uses a unique temporary directory. |
| V5 billing allowance was undocumented/untested | README and claim cover the client policy; live request 31 returned 429 with `Retry-After`. |
| V5 fresh suite was flaky | Independent claim runs, `npm test`, and the repeated suite inside `npm run build` all passed. |
| V5 demo/404/metadata routing was incomplete | Direct `/demo`, legal routes, route metadata, and designed HTTP 404 all passed live. |
| R1 route changes did not focus or announce | `/ → demo → Back` focused each destination heading and updated the live region. |
| R1 404 lacked sharing metadata | The designed 404 has complete Open Graph and Twitter metadata. |
| R1 CLI action overstated its target | The action says **View CLI install steps** and opens the install commands. |
| R1 export copy used unexplained jargon | The page says prompt or phrase list for supported speech tools. |
| R1 one collection had two names | User-facing collection copy consistently says vocabulary. |
| R1 README had an overlong sentence | The checked verification copy is split into 18-word and 6-word sentences. |
| R2 $29/no-subscription promise was not proved | Dedicated `pricing` claim verifies the recorded offer, visible terms, checkout target, and 26-term unlock. |

## Deployment identity and verification commands

The implementation under review is `068e006…`. Commits `8db7de…` and `7f831bd…` add only handoff/evidence material. A later report-only deployment stamped `sw.js` with `7f831bd…`; this does not represent a later product implementation. The live `index.html` and `sw.js` match the clean `7f831bd…` build byte-for-byte, and `git diff 068e006…7f831bd…` contains only `.factory` documentation/evidence files.

Commands completed successfully:

```sh
npm ci
# Every exact command in .factory/claims.json, separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
npm run verify:live:browser
/opt/fleet/lib/verify-url.sh https://proper-noun-lexicon.sociobot.in/ /work/.evidence/verify-7/verify-url
```

The report evidence is under `/work/.evidence/verify-7/`. The required copied report and result JSON are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.
