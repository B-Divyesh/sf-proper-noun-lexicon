# Review correcting dictated names and restoring raw text

**Work order:** `proper-noun-lexicon-review-6`

**Verdict:** **PASS**

**Findings:** **0**

**Untested public claims:** **0**

## Release reviewed

- Implementation candidate: `fc872f61acba948453db929a6a5a69b697a3a40e`.
- Documentation baseline: `20916161ab35fc25316df400f8f3553e6ca9201a`.
- Live service-worker stamp: `5687df981950d33ee330f554d6f86494178de939`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

The commits after `fc872f6` change only Factory reports and handoff documents. Production home, demo, Privacy, Terms, 404, JavaScript, CSS, manifest, social image, and touch icon are byte-identical to a clean build of `fc872f6`. The live worker's executable logic is also identical after normalizing its expected report-only release token. The implementation reviewed is therefore `fc872f6`; the starting documentation SHA for this review is `2091616`.

## Job, audience, and first action

Fresh 1440 × 1000 desktop and 390 × 844 phone browsers showed the required information before scrolling:

- Job: **Correct dictated names from your vocabulary.**
- Audience: people who dictate work and want chosen aliases changed to exact names without sending transcripts away.
- First action: **Try it with sample data**.
- Result: **Loads three terms and one raw transcript.**
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

The title is `Proper Noun Lexicon — correct dictated names`. The first screen uses plain words and contains no metaphor or mood heading.

## Live sample, invalid input, boundaries, and recovery

The one-click sample opened the populated review desk with Sociobot, Kubernetes, API, and:

```text
Ask socio bot whether the cuber netties A P I is ready.
```

Applying corrections produced three approved changes and exactly:

```text
Ask Sociobot whether the Kubernetes API is ready.
```

The audit survived reload. **Restore raw** returned the exact source. `sociobotics` remained unchanged and showed zero approved aliases. Blank input announced **Paste a raw transcript first.** and focused the transcript field.

The fixed **Demo — sample data, nothing is saved to your workspace.** label remained visible after scrolling. **Reset demo** restored all three terms and the original transcript. A separately seeded real workspace remained byte-for-byte unchanged. **Start for real** removed every `demo:pnl:` key and reopened that real workspace.

The live browser accepted exactly 25 terms. A 26-term replacement was rejected without changing the existing 25. Malformed saved vocabulary was quarantined, the raw draft was retained, and recovery controls appeared without a console or page error.

## Declared claims

A detached clean worktree at `fc872f6` ran `npm ci` first; it installed 61 packages with zero reported vulnerabilities. Every exact `test` command in `.factory/claims.json` then ran separately. Each selected exactly one tagged claim test and passed.

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

The landing page, Privacy, Terms, README, packaged README, demo contract, CLI help, and route metadata were cross-checked against the claim list. The automatic refund-revocation statement found in review 5 is absent. The brief's 100-name, 25-point recall target is not presented as an achieved result. No missing, false, incomplete, or untested public claim remains.

## Clean tests, build, package, and installed CLI

These clean-checkout commands passed:

```sh
npm ci
# Every exact command in .factory/claims.json, separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

`npm test` passed 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 64 browser tests; six intended cross-project duplicates were skipped. `npm run lint` passed Rust formatting, Clippy with warnings denied, and TypeScript checks. `npm run build` repeated the tests, built the release CLI, and produced `dist/site/`. Initial JavaScript is 18,847 bytes and CSS is 19,271 bytes before gzip. There is no font payload.

Cargo packaged `proper-noun-lexicon 0.1.3` with 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. The packaged crate was installed into a new consumer root. The installed `pnl --json demo` created all eight expected files in a unique temporary directory. Its audit held the exact raw and corrected text with three ordered changes. An installed invalid export returned exit 2, empty stdout, one JSON error on stderr, and no prompt. Nothing was published.

## Accessibility, privacy, offline use, routes, and performance

- `/opt/fleet/lib/verify-url.sh`, `npm run verify:live`, and `npm run verify:live:browser` passed. They covered the live title, language, one `h1`, one `main`, image alternatives, named controls, headers, asset budgets, pricing, checkout, invalid-license response, desktop, phone, 720 px layout, and console errors.
- Independent Axe runs reported zero violations on home, demo, Privacy, Terms, and the designed 404 at both desktop and phone sizes.
- Keyboard checks covered the skip link, correction and rollback shortcuts, arrow and End navigation in export tabs, route focus, and announcements. The focused skip link had a visible 3 px mint outline. All visible controls met the 44 px target check.
- Reduced motion disabled smooth scrolling and entry movement. The 720 px layout used for 200% text-resize coverage had no horizontal overflow.
- Normal demo correction requested only the product origin. No analytics, tracking pixels, third-party scripts or fonts, vocabulary requests, transcript requests, or transcription calls occurred. An invalid-license flow made one disclosed GET to this product's Sociobot verifier, sent no body, removed the token from the address bar, and kept the free state.
- A fresh worker controlled the demo, removed an injected obsolete cache, retained only `pnl-shell-5687df9…`, reloaded offline, showed its offline state, and corrected the sample offline.
- Home, `/demo`, `/privacy/`, `/terms/`, `robots.txt`, `sitemap.xml`, the manifest, internal links, GitHub links, and the hosted checkout target worked. An unknown route returned the designed page with deliberate HTTP 404 and a way home; this is expected behavior, not a defect.
- Fresh mobile Lighthouse scores were 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.202 seconds, total blocking time was 0 ms, CLS was 0, and transfer was 81,795 bytes. A separate desktop run was also 100/100/100/100.

This product is a static site plus a local CLI. Product-backend tenant isolation, restart persistence, health, and server-side rate limiting do not apply. The browser billing client's 24-hour cache and `429`/`Retry-After` behavior passed its dedicated recorded-response claim test; the live invalid verifier returned the documented response with `no-store`.

## Earlier finding disposition

Every earlier verification, review, repair, and polish report was read. All findings, including minor ones, remain closed:

| Earlier finding | Current proof |
| --- | --- |
| V1 used the staging billing endpoint | Live purchase and verification targets use this product's production `api.sociobot.in` routes. |
| V1 corrected output could survive a failed audit | Unwritable, literal, parent, symlink-parent, and hard-link safety tests pass. |
| V1 lacked immutable caching, worker versioning, and response hardening | Hashed assets are immutable; stale-cache cleanup, CSP, HSTS, referrer policy, `nosniff`, and Permissions Policy pass. |
| V2 production checkout returned 404 | The product checkout returns the expected hosted 303 redirect. |
| V3 Google export used the wrong wrapper | Browser, CLI, claim, and unit outputs use the documented inline `phrases` root. |
| V3 keyboard CSV import, undersized links, and missing tab keys | Browser tests and live checks cover keyboard import, 44 px targets, and Arrow/Home/End tab behavior. |
| V4 aliased output and audit paths could erase rollback | All literal and filesystem-alias regressions reject unsafe destinations before exposing a correction. |
| V4 browser audit used UTF-16 offsets | Browser and CLI match the shared UTF-8 byte-offset fixture. |
| V4 parser errors, malformed storage, and missing library example | Installed JSON errors, live recovery, and the packaged doctest pass. |
| V5 lacked a usable candidate and claim manifest | The candidate and documentation SHAs are identified; all 15 exact claim commands pass. |
| V5 lacked the first-screen action and isolated demos | Both fresh viewports show the action; browser and CLI demos use separate storage and temporary output. |
| V5 request policy, clean-suite reliability, and routes were incomplete | Recorded 200/429 behavior, two full test runs, direct demo/legal routes, metadata, and designed 404 pass. |
| R1 route focus and announcement were missing | Desktop and phone route headings receive focus and are announced, including Back navigation. |
| R1 404 sharing metadata was incomplete | The designed 404 has complete Open Graph and Twitter metadata. |
| R1 CLI action, jargon, terminology, and sentence length were unclear | The link names install steps; current copy uses prompt and phrase-list wording, consistently says vocabulary, and the copy audit is clean. |
| R2 price and non-recurring terms were unproved | The pricing claim checks USD 2900, `recurring: false`, visible terms, checkout target, and verified term-limit removal. |
| R3 demo metadata was wrong | Direct `/demo` has its own title, canonical URL, and sharing metadata. |
| R3 25-term and CLI JSON claims were incomplete | The exact 25/26 boundary and every CLI command plus representative JSON errors pass. |
| R3 CSV/export/offset claims were missing and 720 px overflowed | All three dedicated claims pass; all five routes fit at 720 px. |
| R4 browser audit disappeared on reload | The dedicated claim and fresh live desktop and phone checks preserve the exact audit. |
| R5 automatic refund revocation was unproved | The sentence is absent from Terms and all public copy. Tested revoked-license client behavior remains available without claiming the external refund lifecycle. |
| V6–V10 had no findings | Their demo, artifact, accessibility, privacy, offline, route, deployment, and claim outcomes were rerun from the clean candidate and live product. |

## Limits

No real purchase, refund, or production license was created. The product does not claim that a refund automatically revokes a license. The brief's pilot recall target still requires a customer trial and is not claimed as achieved.

Evidence is under `/work/.evidence/review-6/`. Required copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

**Final verdict: PASS. Zero findings of every severity and zero untested public claims.**
