# Verify approved-name correction and rollback

**Work order:** `proper-noun-lexicon-verify-8`  
**Verdict:** **PASS**  
**Findings:** 0  
**Untested public claims:** 0

## Release reviewed

- Product job: correct dictated names using an approved vocabulary, retain the raw transcript, and export portable speech-tool hints.
- Audience: people who dictate work and need names, acronyms, and company vocabulary written correctly without sending a transcript corpus away.
- Candidate implementation: `c5604acfd82ba448bf84fc0f7be6d89db8e275c5`.
- Verification-script commit: `9b9f0a754cee4d21ea2e3b87a5a3dd0efc3a3380`.
- Documentation and handoff commit: `473921c65a5798279ce1663271d7eeea9d2ecc8d`.
- Live URL: <https://proper-noun-lexicon.sociobot.in>.

The built landing HTML, demo HTML, JavaScript, and CSS fetched from production match a fresh build of `c5604ac` byte-for-byte. The live service worker differs only in its cache-name stamp: it uses `473921c…`, the later documentation/test commit. Its executable service-worker logic is otherwise identical. This is a release identifier difference, not a product-code difference.

## First screen in fresh browsers

Fresh desktop (1440 × 1000) and phone (390 × 844) contexts both started at scroll position zero and showed, before scrolling:

- Job: “Correct dictated names from your vocabulary.”
- Audience and outcome: “For people who dictate work, it turns chosen aliases into exact names without sending transcripts away.”
- First action: “Try it with sample data.” It says it loads three terms and one raw transcript.
- Facts: stored in this browser, works offline after the first visit, and free for 25 terms.

Screenshots: `/work/.evidence/verify-8/live-desktop.png` and `/work/.evidence/verify-8/live-phone.png`.

## Claims

A new clean checkout at `c5604ac` ran `npm ci`, then every exact command declared by `.factory/claims.json`. All 14 passed separately. Logs are in `/work/.evidence/verify-8-claims/`.

| Claim ID | Result |
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

The one-click demo populated three approved terms and a realistic raw transcript. Applying corrections produced “Ask Sociobot whether the Kubernetes API is ready.” The persistent banner says “Demo — sample data, nothing is saved.” The independent sandbox claim test edits and resets the demo, exits with “Start for real,” and proves the seeded real workspace is unchanged. The reset returns the bundled sample. Demo storage is in the `demo:pnl:` namespace and does not read the real workspace.

## Local artifact checks

From the same clean checkout:

```sh
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

All commands passed. The complete build ran 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 58 Playwright tests; six deliberate duplicate-project cases were skipped. The build produced `target/release/pnl` and `dist/site/`. `cargo package` verified a 0.1.3 crate with 11 files.

I installed the CLI into a new consumer root and ran `pnl --json demo`. It created a unique temporary directory with all eight expected sample, vocabulary, corrected-text, audit, Whisper, Google, and Azure artifacts. The installed binary result is recorded in `/work/.evidence/verify-8-cli-demo.json`.

## Live checks

`npm run verify:live` and `npm run verify:live:browser` passed against production.

- Home, `/demo`, `/privacy/`, `/terms/`, robots, and sitemap return 200. A deliberate unknown route returns the designed recovery page with HTTP 404; this expected 404 is not a defect.
- Each checked route has its own title. Demo source metadata names the demo and canonical `/demo`; Privacy and Terms have their own titles. The designed 404 contains complete Open Graph and Twitter metadata.
- Desktop, phone, and 720 px layout checks found no horizontal overflow. The 720 px check covers home, demo, Privacy, Terms, and 404.
- Keyboard flow works: the first Tab reaches the skip link; the demo heading receives focus and is announced; Back restores home-heading focus; keyboard correction and Restore raw work.
- The browser Axe integration found zero serious or critical issues on desktop and phone. `/opt/fleet/lib/verify-url.sh` confirmed title, `lang`, one `h1`, `main`, alt text, labelled controls, and no console errors.
- Visible controls meet 44 px targets. Reduced motion disables smooth scrolling and reduces entry animation. The offline-controlled demo reloads, visibly reports offline state, and applies correction.
- During normal demo correction, observed requests were product-origin only. Production sends no analytics request. Live headers include CSP, HSTS, strict referrer policy, `nosniff`, and a restrictive Permissions Policy.
- Production catalog evidence lists USD 29.00. Checkout returns the hosted 303 flow, and an invalid license returns the documented invalid result. No financial transaction was performed.

This is a static landing site and local CLI, not a product backend. Tenant isolation, process restart persistence, health endpoint, and a live server-rate-limit exercise do not apply. The client request-policy claim is covered by its recorded 200/429 fixture test, including `Retry-After` handling.

## Earlier findings

All earlier verification and review reports were inspected. Their current dispositions are:

| Earlier finding | Current disposition |
| --- | --- |
| V1 production billing endpoint and rollback safety | Closed: production catalog, checkout redirect, invalid verifier, and atomic correction/audit safety pass. |
| V2 production purchase flow | Closed: the registered production catalog lists USD 29.00 and checkout returns the hosted 303 flow. |
| V3 Google export and keyboard workflow | Closed: model-export claim and keyboard demo checks pass. |
| V4 UTF-16 audit offsets, JSON errors, recovery, and library example | Closed: UTF-8 parity, CLI JSON, storage recovery, and typed-library claims pass. |
| V5 clean-suite reliability, one-click web demo, CLI demo, and claims manifest | Closed: fresh clean build passed, 14 claims pass, and both isolated demos work. |
| V6 and V7 no-finding rounds | Rechecked: their passing route, accessibility, privacy, offline, artifact, and deployment checks were repeated in this verification. |
| F-1-1 through F-1-6 focus, 404 metadata, CLI label, jargon, terminology, and sentence length | Closed: live route focus/announcements and metadata pass; reviewed wording is absent; copy audit is clean. |
| F-2-1 price and non-recurring proof | Closed: `pricing` asserts the recorded USD 2900 non-recurring offer and verified-license effect. |
| F-3-1 through F-3-5 demo metadata, 25-term boundary, full CLI JSON surface, three absent claims, and 720 px overflow | Closed: direct demo metadata, exact boundary, all CLI commands, three added claims, and five-page 720 px checks pass. |

## Limits

The 100-name, 25-point recall measure needs a customer pilot with a real vocabulary and chosen speech provider. The product does not claim that pilot result. No actual payment, refund, or issued production license was performed.

**Final verdict: PASS.** There are zero findings of every severity and zero untested public claims.
