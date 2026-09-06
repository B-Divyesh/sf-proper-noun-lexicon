# Verify dictated-name correction and rollback

**Work order:** `proper-noun-lexicon-verify-10`

**Verdict:** **PASS**

**Findings:** **0**

**Untested public claims:** **0**

## Release reviewed

- Implementation candidate: `fc872f61acba948453db929a6a5a69b697a3a40e`.
- Documentation baseline: `5687df981950d33ee330f554d6f86494178de939`.
- Deployment ID supplied for the implementation: `e0d578d9-42b6-4579-ac93-f8050bedbd89`.
- Live service-worker stamp: `5687df981950d33ee330f554d6f86494178de939`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

The three commits after `fc872f6` change only Factory reports. Production home, demo, Privacy, Terms, 404, manifest, JavaScript, CSS, social image, and touch icon are byte-identical to a clean `fc872f6` build. The live worker differs only in its expected documentation-tip release token; its executable logic matches after normalizing that token. The implementation under review is therefore `fc872f6`, while `5687df9` is the documentation baseline and live release stamp.

## Job, audience, and first action

The job is to correct dictated names from approved spellings, keep the exact raw transcript, and export speech-tool hints. The audience is people who dictate work and need names, acronyms, and company vocabulary written correctly without sharing a transcript corpus.

Fresh 1440 × 1000 desktop and 390 × 844 phone browsers showed this before scrolling:

- Job: **Correct dictated names from your vocabulary.**
- Audience: people who dictate work and want chosen aliases changed to exact names without sending transcripts away.
- First action: **Try it with sample data**.
- Result: **Loads three terms and one raw transcript.**
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

The title is `Proper Noun Lexicon — correct dictated names`. The first screen uses plain words and no metaphor or mood heading.

## Live sample, boundaries, and recovery

The one-click sample loaded Sociobot, Kubernetes, API, and `Ask socio bot whether the cuber netties A P I is ready.` Applying corrections produced three changes and exactly:

```text
Ask Sociobot whether the Kubernetes API is ready.
```

The fixed label remained visible and said **Demo — sample data, nothing is saved to your workspace.** The latest audit survived reload exactly. **Restore raw** returned the source text. **Reset demo** restored all three terms and the original transcript. **Start for real** removed the demo keys and returned to a separately seeded real workspace without changing it.

Normal, invalid, boundary, and recovery checks passed on the live implementation and in the clean automated matrix:

- Blank input announced the next step and focused the raw transcript field.
- Unapproved boundary text remained unchanged; longest, case-insensitive whole aliases won.
- Exactly 25 terms were accepted. A 26-term replacement was rejected while all 25 existing terms remained.
- Malformed saved data was quarantined with recovery controls and no page error.
- Quoted CSV, escaped quotes, Unicode byte offsets, audit reload, invalid and revoked licenses, offline cached access, and `Retry-After` behavior passed.
- A recorded revoked response returned the live static client to its free limit. No payment, license, or real user data was used.

## Declared claims

A clean clone at `fc872f6` ran `npm ci` before measurement. Every exact command in `.factory/claims.json` then ran separately and passed. Each ID selects exactly one tagged claim test.

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

The landing page, Privacy, Terms, README, packaged README, demo documentation, CLI help, and built route metadata were cross-checked against the manifest. The automatic refund-revocation promise identified by review 5 is absent. No missing, false, incomplete, or untested public claim remains.

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

`npm test` passed 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 64 browser tests; six intended cross-project duplicates were skipped. `npm run build` repeated the suite, built `target/release/pnl`, and produced `dist/site/`. Initial assets are 18.85 KB JavaScript and 19.27 KB CSS before gzip, with no font payload.

Cargo packaged `proper-noun-lexicon 0.1.3` with 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. The crate was extracted and installed into a new consumer root. Installed `pnl --json demo` created eight expected files in a unique operating-system temporary directory. Its audit retained exact raw and corrected text with three changes. Invalid JSON-mode export returned exit 2, empty stdout, one JSON error on stderr, and no prompt. Nothing was published.

## Accessibility, privacy, offline use, routes, and performance

- `npm run verify:live` and `npm run verify:live:browser` passed production identity, pricing, checkout, invalid-license contract, headers, desktop, phone, 720 px layout, keyboard, focus, touch targets, reduced motion, offline correction, privacy traffic, links, and route checks.
- `/opt/fleet/lib/verify-url.sh` passed with title, `lang`, one `h1`, one `main`, image alternatives, named controls, and no console errors. Its first launch lacked the required output directory; after creating that directory, the unchanged check passed.
- A fresh Axe scan found zero violations on home, demo, Privacy, Terms, and the designed 404 at both desktop and phone sizes.
- Keyboard checks covered the skip link, CSV import, correction, rollback, tabs, route focus, and announcements. All visible controls met the 44 px target rule. The 720 px layout used for 200% text-resize coverage had no horizontal overflow.
- Demo correction requested only the product origin. There were no analytics, tracking pixels, third-party scripts or fonts, transcription requests, vocabulary requests, or transcript requests. License verification uses only this product's disclosed Sociobot endpoint.
- Offline installation, controlled reload, correction, release-stamped cache replacement, and reduced-motion behavior passed. HTML and the worker revalidate; hashed assets use immutable one-year caching.
- Home, `/demo`, `/privacy/`, `/terms/`, robots, sitemap, manifest, and every discovered link worked. An unknown route returned the designed page with deliberate HTTP 404 and a way home; this is expected behavior, not a defect.
- Fresh mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.203 s, total blocking time 0 ms, CLS 0, and transfer was 81,804 bytes.

This product is a static site plus a local CLI. Product-backend tenant isolation, restart persistence, health, and server-side request allowances do not apply. The browser billing client has recorded 200/429 coverage and does not retry before `Retry-After`.

## Earlier finding disposition

Every earlier verification, review, and polish report was read. All findings, including minor ones, remain closed:

| Earlier finding | Current proof |
| --- | --- |
| V1 staging billing endpoint | Production purchase and verification targets use this product's `api.sociobot.in` routes. |
| V1 corrected output could survive a failed audit | Unwritable, literal, parent, symlink-parent, and hard-link safety tests pass. |
| V1 immutable caching, worker versioning, and response hardening | Hashed assets are immutable; update cleanup, CSP, HSTS, referrer policy, `nosniff`, and Permissions Policy pass. |
| V2 production checkout returned 404 | The product checkout returns the hosted Dodo 303 flow. |
| V3 Google export used the wrong wrapper | Browser, CLI, claim, and unit output use the documented inline `phrases` root. |
| V3 keyboard CSV import, undersized links, and missing tab keys | Keyboard import, 44 px targets, and Arrow/Home/End tab behavior pass. |
| V4 aliased output/audit paths could erase rollback | All literal and filesystem-alias regressions reject unsafe destinations. |
| V4 UTF-16 browser offsets | Browser and CLI match the UTF-8 byte-offset fixture. |
| V4 JSON parser errors, malformed storage, and missing library example | Installed JSON errors, live recovery, and the compiled doctest pass. |
| V5 missing candidate and claim manifest | Candidate and documentation SHAs are identified; all 15 exact claim commands pass. |
| V5 missing first-screen action and isolated demos | Both viewports show the action; browser and CLI demos use separate storage and temporary output. |
| V5 request policy, flaky clean suite, and incomplete routes | The 200/429 policy, repeated clean suites, direct demo, legal routes, metadata, and designed 404 pass. |
| R1 route focus and missing announcement | Desktop and phone route headings receive focus and are announced, including Back. |
| R1 incomplete 404 sharing metadata | The designed 404 has complete Open Graph and Twitter metadata. |
| R1 misleading CLI label | **View CLI install steps** opens the install command. |
| R1 jargon, mixed collection terms, and long README sentence | Current copy uses prompt/phrase-list wording, consistently says vocabulary, and passes the copy audit. |
| R2 unproved price and recurring terms | The pricing claim checks USD 2900, `recurring: false`, visible terms, checkout target, and verified unlock. |
| R3 demo source metadata | Direct `/demo` has exact demo title, canonical URL, and sharing metadata. |
| R3 incomplete 25-term and CLI JSON claims | The exact 25/26 boundary and every command plus representative JSON errors pass. |
| R3 missing CSV/export/offset claims and 720 px overflow | Dedicated claims pass; all five routes fit the 720 px layout. |
| R4 browser audit disappeared on reload | `audit-reload` and fresh live phone reload checks preserve the exact audit. |
| R5 automatic refund revocation was unproved | The sentence was removed from Terms and is absent from all public copy. Revoked-license behavior remains tested. |
| V6–V9 no-finding rounds | Their demo, artifact, accessibility, privacy, offline, route, and deployment results were independently rechecked. |

## Limits

No real purchase, refund, or production license was created. The external refund lifecycle is not claimed. The brief's 100-name, 25-point recall target still needs a customer pilot and is not claimed as achieved.

Evidence is in `/work/.evidence/verify-10-url/` and `/work/.evidence/verify-10-lighthouse.json`. Required report copies are `/work/.evidence/qa-report.md` and `/work/.evidence/qa-result.json`.

**Final verdict: PASS. Zero findings of every severity and zero untested public claims.**
