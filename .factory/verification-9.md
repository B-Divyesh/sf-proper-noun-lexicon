# Verify dictated-name correction and rollback

**Work order:** `proper-noun-lexicon-verify-9`

**Verdict:** **PASS**

**Findings:** **0**

**Untested public claims:** **0**

## Release reviewed

- Implementation candidate: `f2a52e0db1702db7d1371663e79f0fccb5880744`.
- Product-scoped verification script: `dc092271e9ec8ac4bf3a6a8005d5a9c74634c81c`.
- Documentation baseline: `813906aff40b83209cccc1a969e09bad78019372`.
- Deployment ID: `b3ee48ed-cb74-49b1-93f0-7006def0a690`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

The commits after `f2a52e0` change only the product-scoped live verifier and Factory handoff. They do not change the product runtime. Fresh production copies of home, `/demo`, JavaScript, and CSS are byte-identical to a clean `f2a52e0` build. The live service worker has the same executable logic and an expected later release stamp, `pnl-shell-813906a…`.

## Job, audience, and first action

The job is to correct dictated names using spellings the user approved, retain the raw transcript, and export speech-tool hints. The audience is people who dictate work and need names, acronyms, and company vocabulary written exactly without sending a transcript corpus away.

Fresh 1440 × 1000 desktop and 390 × 844 phone browsers showed all required content before scrolling:

- Job: **Correct dictated names from your vocabulary.**
- Audience: **For people who dictate work, it turns chosen aliases into exact names without sending transcripts away.**
- First action: **Try it with sample data**.
- Stated result: **Loads three terms and one raw transcript.**
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

The title is `Proper Noun Lexicon — correct dictated names`. The copy uses plain words and contains no metaphor or mood heading.

## Live sample and recovery paths

The one-click sample loaded Sociobot, Kubernetes, API, and `Ask socio bot whether the cuber netties A P I is ready.` Applying the approved corrections produced exactly:

```text
Ask Sociobot whether the Kubernetes API is ready.
```

The review reported three changes. The correction audit in `demo:pnl:workspace:v1` survived reload byte-for-byte and restored the same corrected text and change list. **Restore raw** cleared that audit, returned the exact source text, and remained cleared after another reload.

The fixed label stayed visible and said **Demo — sample data, nothing is saved to your workspace.** Reset restored all three terms and the original transcript. **Start for real** removed every `demo:pnl:` key and returned to a separately seeded real workspace without changing it.

Normal, invalid, boundary, and recovery behavior passed:

- A blank transcript announced the required next step and focused the transcript field.
- `sociobotics` remained unchanged and reported no approved aliases.
- Malformed saved data was quarantined, recovery controls appeared, and the page did not fail.
- Quoted CSV fields, escaped quotes, exact 25/26-term handling, Unicode offsets, revoked/invalid license fixtures, offline fallback, and `Retry-After` handling passed the clean automated matrix.

## Declared claims

A new clean checkout at `f2a52e0` ran `npm ci` before measurement. All 15 exact commands from `.factory/claims.json` then passed separately. Every claim ID occurs on exactly one tagged test.

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `approved-reversible` | PASS |
| `audit-reload` | PASS |
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

The landing page, Privacy, Terms, README, CLI README, and built demo metadata were cross-checked against the manifest. No missing, false, incomplete, or untested product claim was found.

## Clean checkout and installed artifact

The clean checkout passed:

```sh
npm ci
# Every exact command from .factory/claims.json, separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

`npm test` passed 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 62 Playwright tests. Six intentional cross-project duplicates were skipped. `npm run build` repeated that suite, built `target/release/pnl`, and produced `dist/site/`. The built initial assets are 18.85 KB JavaScript and 19.27 KB CSS before gzip, with no font payload.

The crate packaged as `proper-noun-lexicon 0.1.3` with 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. It was extracted and installed into a new Cargo root. Installed `pnl 0.1.3` ran `--json demo` in a unique temporary directory and created all eight expected files. Its audit retained exact raw and corrected text with three ordered changes. An invalid export format returned exit 2, empty stdout, one JSON error on stderr, and no prompt. Nothing was published.

## Accessibility, privacy, offline use, and routes

- `/opt/fleet/lib/verify-url.sh` passed with the correct title, `lang`, one `h1`, one `main`, complete image alternatives, named buttons, and no console errors.
- The live browser verifier passed at 1440 × 1000, 720 × 500, and 390 × 844. It covered keyboard correction and rollback, route focus and announcements, skip link, 44 px targets, 200% equivalent layout, reduced motion, offline reload, and same-origin demo requests.
- Axe integration found zero serious or critical issues on home, demo, Privacy, Terms, and 404 at desktop and phone sizes.
- Home, `/demo`, `/privacy/`, `/terms/`, robots, sitemap, manifest, and internal links worked. Each page had the required title and structure. The deliberate unknown route returned the designed page with HTTP 404 and a way back; this expected 404 is not a defect.
- Normal desktop and phone demo use requested only `https://proper-noun-lexicon.sociobot.in`. There were no analytics, third-party fonts/scripts, transcription calls, vocabulary requests, or transcript requests. The disclosed license path uses only this product's `api.sociobot.in` endpoint.
- Offline installation, controlled reload, local correction, release-stamped cache replacement, and reduced-motion behavior passed. HTML and `sw.js` revalidate; hashed assets use one-year immutable caching.
- The production offer is recorded as USD 29.00 and non-recurring. The live page and Terms match it. This product's checkout returned a hosted Dodo 303 redirect, and this product's invalid-license verifier returned the documented result with `no-store`.

The first live-browser-verifier run sampled the Back-navigation focus assertion before the page's animation-frame focus update. The same unchanged command passed on rerun, and the independent wait-based desktop and phone check observed the heading focus and announcement. This was test timing, not a failed user path.

Fresh Lighthouse mobile scores were performance 98, accessibility 100, best practices 100, and SEO 100. LCP was 1.221 s, total blocking time 155 ms, CLS 0, and transfer 81,804 bytes. These pass the stated budgets.

This is a static site plus a local CLI. Product-backend tenant isolation, restart persistence, health, and live server rate-limit checks do not apply. The browser's license request policy has recorded 200/429 coverage and proves that it honors `Retry-After` without retrying early.

## Earlier finding disposition

All earlier review and verification reports, including minor findings, were inspected. Current evidence establishes these dispositions:

| Earlier finding | Current proof |
| --- | --- |
| V1 staging billing endpoint | Closed: live purchase and verification targets use this product's production API. |
| V1 correction could survive a failed audit write | Closed: unwritable, literal-alias, parent-alias, symlink-parent, and hard-link tests pass. |
| V1 cache policy, stale worker, and missing hardening | Closed: immutable hashed assets, release-stamped worker cleanup, CSP, HSTS, referrer policy, `nosniff`, and Permissions Policy pass. |
| V2 checkout returned 404 | Closed: this product's checkout returns the hosted 303 flow. |
| V3 invalid Google export | Closed: browser, CLI, claim, and unit evidence use the documented inline `phrases` root. |
| V3 keyboard import, undersized links, and tab keys | Closed: keyboard CSV import, 44 px target checks, and Arrow/Home/End tab behavior pass. |
| V4 output/audit path aliases | Closed: all path-equivalence regressions pass without exposing a correction. |
| V4 UTF-16 browser offsets | Closed: browser and CLI match the shared UTF-8 byte-offset fixture. |
| V4 parser errors, malformed storage, and missing library example | Closed: installed JSON errors, live recovery, and the compiled doctest pass. |
| V5 missing candidate, claims, demos, request policy, and routes | Closed: candidate is available; all 15 claims, both isolated demos, request-policy fixture, direct routes, and designed 404 pass. |
| R1 focus, 404 metadata, CLI label, jargon, terminology, and sentence length | Closed: live navigation/metadata and current copy audit pass every item. |
| R2 unproved one-time price | Closed: dedicated pricing claim checks USD 2900, non-recurring terms, checkout target, and the recorded verified-license result. |
| R3 demo metadata, exact free boundary, CLI JSON breadth, missing claim entries, and 720 px overflow | Closed: direct metadata, 25/26 behavior, all command JSON paths, added claims, and five-route layout checks pass. |
| R4 correction audit disappeared on reload | Closed: `audit-reload` passed independently and the live desktop/phone audit survived reload exactly. |
| V6, V7, and V8 no-finding rounds | Rechecked: their route, accessibility, privacy, offline, packaging, and deployment outcomes passed again. |

## External limits

No real purchase, refund, or production license was created. The external payment lifecycle remains untested. The 100-name, 25-point recall target requires a customer pilot and is not claimed as a completed result by the product.

Evidence is under `/work/.evidence/verify-9/`. The required copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

**Final verdict: PASS. Zero findings of every severity and zero untested public claims.**
