# Review correcting dictated names from approved vocabulary

**Work order:** `proper-noun-lexicon-review-5`

**Verdict:** **FAIL**

**Findings:** **1**

**Untested public claims:** **1**

## Release reviewed

- Implementation candidate: `f2a52e0db1702db7d1371663e79f0fccb5880744`.
- Documentation baseline: `8a17538f3ed23a3f5c34ea7ffa5c92214b0f5221`.
- Live service-worker stamp: `813906aff40b83209cccc1a969e09bad78019372`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

The commits after `f2a52e0` change only the product-scoped live verifier and Factory reports. A clean `8a17538` build has no product-file difference from `f2a52e0`. Production home, `/demo`, JavaScript, and CSS match that clean build byte-for-byte. The production service worker has the same executable logic and the expected earlier documentation release stamp.

## Finding

### F-5-1 — Acceptance blocking — automatic refund revocation is a public claim without claim coverage

The live Terms page says: **“A refund revokes the license automatically.”** A visitor can rely on this statement when deciding whether to buy.

`.factory/claims.json` has no refund or refund-revocation entry. The `pricing` claim checks the recorded USD 29.00 non-recurring offer and a mocked valid verifier response. The untagged revocation test begins with a mocked verifier response whose reason is already `revoked`; it proves that the browser locks paid features when told a license is revoked, but it does not prove that a refund causes the Sociobot billing system to revoke that license.

The live verifier checks only the hosted checkout redirect and an invalid token. Verification 9 also states that no purchase or refund was performed and that the payment lifecycle remains untested. Its simultaneous conclusion of zero untested public claims is therefore not supported for this sentence.

Remove the automatic-refund statement, or add a uniquely tagged claim test backed by recorded evidence from an authorized Sociobot billing sandbox that completes purchase, refund, revocation, and subsequent verification. The work order forbids product-code changes, so this review records the gap without changing the product.

## Job, audience, and first action

Fresh 1440 × 1000 desktop and 390 × 844 phone contexts showed all required information before scrolling.

- Job: **Correct dictated names from your vocabulary.**
- Audience: people who dictate work and need chosen aliases changed to exact names without sending transcripts away.
- First action: **Try it with sample data**.
- Stated result: **Loads three terms and one raw transcript.**
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

The title is `Proper Noun Lexicon — correct dictated names`. The copy uses plain words and has no metaphor or mood heading.

## Live sample, isolation, and recovery

The one-click sample loaded Sociobot, Kubernetes, API, and:

```text
Ask socio bot whether the cuber netties A P I is ready.
```

Applying corrections produced three changes and:

```text
Ask Sociobot whether the Kubernetes API is ready.
```

The audit survived reload exactly. **Restore raw** returned the exact source, cleared the audit, and remained cleared after another reload. `sociobotics` stayed unchanged. Blank input announced **Paste a raw transcript first.** and focused the transcript field. Malformed saved vocabulary was quarantined, retained the raw draft, and exposed recovery controls without a page error.

The fixed label stayed visible and said **Demo — sample data, nothing is saved to your workspace.** Reset restored the three terms and original transcript. Start for real removed every `demo:pnl:` key and returned to a separately seeded real workspace without changing one byte of that workspace. Desktop and phone demo traffic stayed on `https://proper-noun-lexicon.sociobot.in` and produced no console or page errors.

## Declared claims

A detached clean checkout at `8a17538` ran `npm ci`, then every exact command from `.factory/claims.json` separately. All 15 commands passed, and every claim ID appears on exactly one tagged test.

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

Passing the declared list does not close F-5-1 because the public claim inventory is incomplete.

## Clean build and installed artifact

The clean checkout passed:

```sh
npm ci
# Every exact command from .factory/claims.json, separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

`npm test` passed 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 62 Playwright tests; six intentional cross-project duplicates were skipped. `npm run build` repeated the suite, built `target/release/pnl`, and produced `dist/site/`. Initial assets are 18.85 KB JavaScript and 19.27 KB CSS before gzip.

The packaged `proper-noun-lexicon 0.1.3` crate contained 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. It was extracted and installed into a new Cargo root. Installed `pnl 0.1.3` ran `--json demo` in a unique temporary directory and created all eight advertised files. Its audit retained the exact raw and corrected text with three ordered changes. An invalid export format returned exit 2 and one JSON error without prompting. Nothing was published.

## Accessibility, routes, privacy, offline use, and performance

- `/opt/fleet/lib/verify-url.sh` passed with the correct title, language, one `h1`, one `main`, complete image alternatives, named controls, and no console errors.
- The live browser verifier passed desktop, 720 px, and phone layouts; keyboard correction and rollback; route focus and announcements; skip link; 44 px targets; 200% equivalent layout; reduced motion; offline reload; same-origin traffic; and Axe.
- One immediate Back-focus assertion sampled before the animation-frame focus update on its first run. The unchanged command passed on rerun, and the retrying Playwright route test passed in both full clean suites. This is verifier timing, not a failed user path.
- Fresh Axe checks found zero serious or critical findings on home, demo, Privacy, Terms, and the designed 404. All routes have `lang="en"`, one `h1`, one `main`, their required title, and no horizontal overflow.
- All crawled links worked. The checkout returned the expected hosted 303. The unknown route returned the designed page with HTTP 404 and a way home; that deliberate 404 is not a defect.
- Offline installation, controlled reload, local correction, cache replacement, and reduced-motion behavior passed. Normal demo use sent no transcript or vocabulary away and loaded no analytics or third-party fonts/scripts.
- The live production offer is USD 29.00 and non-recurring. The invalid-license endpoint returned the documented result with `no-store`. Recorded 200/429 tests prove 24-hour caching and `Retry-After` handling.
- Fresh Lighthouse mobile scores were 99 performance, 100 accessibility, 100 best practices, and 100 SEO. LCP was 1.203 s, total blocking time 93 ms, CLS 0, and transfer 81,795 bytes.

This is a static site plus a local CLI. Product-backend tenant isolation, process restart persistence, health, and product-server rate-limit checks do not apply.

## Earlier finding disposition

Every earlier review and verification report, including minor findings, was inspected. Current evidence establishes these dispositions:

| Earlier finding | Current proof |
| --- | --- |
| V1 staging billing endpoint | Closed: live purchase and verification targets use this product's production API. |
| V1 correction could survive a failed audit write | Closed: unwritable, equivalent-path, symlink-parent, and hard-link regressions pass. |
| V1 cache policy, stale worker, and missing headers | Closed: immutable hashed assets, release-stamped cleanup, CSP, HSTS, referrer policy, `nosniff`, and Permissions Policy pass. |
| V2 checkout returned 404 | Closed: this product's checkout returns the hosted 303 flow. |
| V3 invalid Google export | Closed: browser, CLI, claim, and unit evidence use the documented inline `phrases` root. |
| V3 keyboard import, undersized links, and tab keys | Closed: keyboard CSV import, 44 px checks, and Arrow/Home/End behavior pass. |
| V4 output/audit path aliases | Closed: all path-equivalence regressions pass without exposing a correction. |
| V4 UTF-16 browser offsets | Closed: browser and CLI match the shared UTF-8 byte-offset fixture. |
| V4 parser errors, malformed storage, and missing library example | Closed: installed JSON errors, live recovery, and the compiled doctest pass. |
| V5 missing candidate, claims, demos, request policy, and routes | Closed: candidate identity, 15 declared claims, both demos, request fixtures, direct routes, and designed 404 pass. |
| R1 focus, 404 metadata, CLI label, jargon, terminology, and sentence length | Closed: live navigation, metadata, labels, copy, and copy audit pass. |
| R2 unproved one-time price | Closed: the pricing claim checks USD 2900 and `recurring: false`. |
| R3 demo metadata, free boundary, CLI JSON breadth, claim entries, and 720 px overflow | Closed: direct metadata, 25/26 behavior, all command JSON paths, dedicated claims, and five-route layout checks pass. |
| R4 correction audit disappeared on reload | Closed: `audit-reload` passed independently and the live desktop and phone audit survived reload exactly. |
| V6, V7, V8, and V9 no-finding rounds | Their product checks pass again. V9's untested-refund limit conflicts with its zero-untested-claims verdict and is the basis of F-5-1. |

## Missed leverage and limits

No missed-leverage finding was found. The brief calls for deterministic, approved-alias correction, import/export, and rollback. The product supplies those paths; an AI action would not improve this trust-sensitive job.

No real purchase, refund, or production license was created. The 100-name, 25-point recall target still needs a customer pilot and is not claimed as completed. The untested refund lifecycle is not merely a stated limit because Terms makes it a public promise; it is F-5-1.

Evidence is under `/work/.evidence/review-5/`.

**Final verdict: FAIL. One finding and one untested public claim remain.**
