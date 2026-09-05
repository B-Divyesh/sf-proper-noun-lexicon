# Persist correction audits across reload — handoff

**Work order:** `proper-noun-lexicon-repair-8`

**Verdict:** **PASS**

**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

**Findings remaining:** 0

**Untested public claims:** 0

## Product and first action

Proper Noun Lexicon corrects dictated names using spellings that the user approves. It is for people who dictate work and need names, acronyms, and company terms written exactly. The first action is **Try it with sample data**, which loads three terms and one raw transcript.

Fresh desktop and phone checks showed the job, audience, first action, stated result, and three facts before scrolling.

## Repair completed

The browser now stores the latest correction audit with its vocabulary and raw draft. On reload, it validates and restores the exact corrected text, change count, change list, UTF-8 offsets, and raw rollback source.

Editing or restoring the raw transcript clears the saved audit. Reset demo also clears the sample audit. A malformed saved audit is removed without losing valid vocabulary or raw text. Existing workspace records without an `audit` field remain compatible.

The new `audit-reload` claim starts in the isolated demo, applies three Unicode-safe corrections, downloads the audit, reloads, and compares the downloaded audit exactly. It then restores the raw transcript and proves that the cleared review stays cleared after another reload.

The live verifier was also narrowed to this product. It checks the recorded one-time offer, live pricing and Terms copy, this product's checkout, and this product's verifier without reading the shared product catalog.

## Release identity

- Deployed implementation SHA: `f2a52e0db1702db7d1371663e79f0fccb5880744`.
- Verification-script SHA: `dc092271e9ec8ac4bf3a6a8005d5a9c74634c81c`.
- Deployment ID: `b3ee48ed-cb74-49b1-93f0-7006def0a690`.
- Live service-worker cache: `pnl-shell-f2a52e0db1702db7d1371663e79f0fccb5880744`.
- Live home, demo, JavaScript, CSS, and service worker match the deployed local artifact byte-for-byte.
- Any commit after `dc09227` is documentation-only and does not require another product deployment.

## Clean verification

A separate clean clone of `f2a52e0` ran `npm ci` with zero vulnerabilities. Every exact command in `.factory/claims.json` then ran separately. All 15 claims passed, with one tagged test for each claim:

- demo isolation, same-origin privacy, offline reload, and reversible correction;
- correction-audit persistence across reload;
- model exports, browser CSV export, quoted CSV import, and UTF-8 audit parity;
- the 25-term limit and recorded $29 USD non-recurring offer;
- CLI demo, JSON output, typed library API, and license request policy.

The same clean clone passed:

```sh
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

`npm test` passed 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 62 Playwright tests. Six intentional cross-project duplicates were skipped. `npm run build` repeated the suite, built `target/release/pnl`, and produced `dist/site/`.

The site build contains 18.85 KB JavaScript and 19.27 KB CSS before gzip. The package verified as `proper-noun-lexicon 0.1.3` with 11 files and 14.5 KiB compressed.

## Installed artifact

The packaged crate was extracted and installed into a new Cargo root. Installed `pnl 0.1.3` ran the bundled demo in a unique temporary directory and produced all eight files with three expected corrections. Its audit preserved the exact raw and corrected text. An invalid format returned exit 2, empty stdout, one JSON error on stderr, and no prompt. Nothing was published.

## Live verification

- `npm run verify:live`: PASS for identity, headers, budgets, route metadata, recorded offer, live price and Terms, hosted checkout redirect, and invalid-license response.
- `npm run verify:live:browser`: PASS at 1440×1000, 720×500, and 390×844. It covered keyboard use, focus, route announcements, 44 px targets, reduced motion, offline reload, same-origin traffic, and Axe.
- `/opt/fleet/lib/verify-url.sh`: PASS in 563 ms with the correct title, `lang`, one `h1`, one `main`, complete image alternatives, named controls, and no console errors.
- Fresh Axe integration found zero serious or critical issues across home, demo, Privacy, Terms, and 404 on desktop and phone.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.206 s, TBT 66 ms, CLS 0, total transfer 81,783 bytes.
- The designed unknown route returns an intentional HTTP 404. All required routes, titles, metadata, links, legal pages, security headers, and offline/update behavior passed.

The live sample produced `Ask Sociobot whether the Kubernetes API is ready.` with three approved changes. After reload, the same result and audit remained. The fixed demo label stayed visible. Reset restored the original sample and cleared the audit. Start for real removed every `demo:pnl:` key and returned to a seeded real workspace unchanged. Both fresh browsers recorded product-origin requests only and no console or page errors.

## Earlier finding disposition

All earlier review and verification files were read. Their findings remain closed:

- Production billing uses only `api.sociobot.in`; checkout returns the hosted 303 flow.
- CLI correction and audit writes remain rollback-safe for unwritable and aliased paths.
- Hashed caching, service-worker release updates, CSP, Permissions Policy, HSTS, referrer policy, and `nosniff` remain correct.
- Google PhraseSet output, keyboard CSV import, touch targets, export-tab keys, route focus, and 720 px layout remain covered.
- UTF-8 offsets, JSON parser errors, saved-workspace recovery, typed Rust usage, route metadata, and designed 404 remain covered.
- The first screen, web demo, CLI demo, storage isolation, exact free limit, one-time pricing, CSV round trip, and claim inventory remain covered.
- Review 4's false audit-persistence statement is now true in the live product and has a dedicated outcome-based claim.

## Evidence and limits

Evidence is under `/work/.evidence/repair-8/`. The catalog description was copied to `/work/.evidence/catalog-description.txt`. The actual public one-time offer metadata is in `/work/.evidence/billing-offer.json`.

No product defect is known. No payment, refund, or production license was created. The 100-name, 25-point recall target still requires a customer pilot and is not claimed by the product. This is a static site plus a local CLI, so backend tenant, restart, health, and SQLite checks do not apply.
