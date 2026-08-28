# Independent verification — FAIL

**Work order:** `proper-noun-lexicon-verify-1`  
**Candidate:** `a7ad177a2cee855aa4702931d6ff89db90664bbc` (`main`)  
**Production URL:** <https://proper-noun-lexicon.sociobot.in/>  
**Test date:** 2026-08-28 UTC  
**Verdict:** **FAIL — not releasable.**

The clean-built product has a working ordinary CLI/review-desk workflow and the live static files exactly match this candidate. Two P1 defects violate the actual release and reversibility contracts.

## Defects

### P1 — Live production billing points to staging

`site/index.html:147` uses `https://pilot-api.sociobot.in/api/v1/products/proper-noun-lexicon/checkout`; `site/src/app.ts:8` uses the matching pilot verify endpoint. The deployed production HTML and JS hash-match the candidate.

Fresh browser evidence from `https://proper-noun-lexicon.sociobot.in/?license=qa-invalid-token` captured:

```
https://pilot-api.sociobot.in/api/v1/products/proper-noun-lexicon/verify?license=qa-invalid-token
```

The test token was removed from the visible URL and stored locally, and the free product stayed usable, but the supplied paid-unlock contract permits `pilot-api` only on staging and requires `https://api.sociobot.in/...` at release. This product is live at its production domain and advertises a $29 purchase. Switch checkout and verify to the production API, register the production product, and test an actual issued production license before release.

### P1 — CLI may emit corrected content without its required audit

`cli/src/main.rs` writes correction output before its audit. Fresh release-binary reproduction with a valid one-term lexicon:

```sh
target/release/pnl correct --lexicon names.json --input raw.txt \
  --output corrected.txt --audit /dev/null/audit.json
```

Result: exit `1`; `corrected.txt` existed and contained `Sociobot`; no audit existed; stderr was `Error: could not create /dev/null: File exists (os error 17)`. The product contract requires every correction to preserve raw text and a local reversible audit. Write both artifacts atomically, or remove output if the audit write fails, and add a regression test.

### P2 — Live hashed assets are not immutably cached

`/assets/main-DRTDppSm.js`, CSS, WebP, and the service worker return `cache-control: public, must-revalidate, max-age=30`. This misses the required long-lived immutable cache policy for hashed assets. Configure immutable long-lived caching for `/assets/*`; leave HTML and `sw.js` short-lived.

### P2 — PWA update cache has no release version

`site/public/sw.js` fixes the cache name at `pnl-shell-v1` and serves cache-first. A later release with unchanged `sw.js` can keep controlled clients on the old cached shell. Offline installation/reload works now, but service-worker update reliability is not demonstrated. Version the cache by build/release and regression-test an upgrade from an already-controlled client.

### P3 — Response hardening is incomplete

Live headers include HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, and DNS-prefetch disablement, but no CSP or Permissions-Policy. Add a restrictive CSP and minimal Permissions Policy; `X-XSS-Protection` is legacy.

## Passing verification evidence

### Clean checkout / tests / build

- Began on a clean checkout at the candidate SHA. `npm ci` installed 59 packages and reported 0 vulnerabilities.
- `npm test` passed: Rust 5 tests plus doc tests, Vitest 4 tests, Playwright 10 tests across desktop Chromium and 390 x 844 mobile.
- The exact production command `npm run build` passed, reran all tests, created `target/release/pnl`, and created `dist/site/`.
- `cargo fmt --all -- --check` and `cargo clippy --workspace --all-targets -- -D warnings` passed. No TypeScript `tsconfig`, typecheck, or lint script exists beyond Vite/Vitest compilation.
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty` succeeded (8 files; 31.7 KiB unpacked, 9.8 KiB compressed) and Cargo verified the package. The crate was extracted, installed into a clean temporary consumer with `cargo install --path ... --root ...`, and the installed `pnl --help` exposed the documented single binary and `--json` option. No package was published.

### CLI and library behavior

- The clean-consumer CLI imported a three-name CSV; listed with `--json`; exported Whisper, Google Speech, and Azure payloads; corrected `socio bot`, `cuber netties`, and `A P I`; and rolled the audit back byte-for-byte. It left the unmatched boundary case `sociobotics` unchanged.
- Invalid CSV headers returned exit 1 and JSON error output on stderr. A generated 100-term CSV imported with `"entries":100`.
- The Rust suite covers documented CSV import, ambiguous aliases, approved/boundary-only corrections, reversible raw text, and all documented export formats.

### Live UI, accessibility, privacy, PWA

- Fresh live checks on desktop and 390 x 844 mobile loaded the sample, applied all three approved aliases, restored raw text with `Ctrl+Z`, and found no horizontal overflow, console errors, or page errors. Each had exactly one `h1` and one `main`.
- Live axe scans found **0 serious/critical** findings on both viewports. Keyboard Tab first focused the skip link with the designed mint `3px` outline. Reduced motion yielded `scroll-behavior: auto` and a `0.01ms` hero animation duration.
- Recovery paths passed: missing raw text announces “Paste a raw transcript first”; duplicate aliases produce a named conflict in the `role="alert"` region without losing existing vocabulary.
- A normal session requested only product-origin assets: no analytics, font CDN, or transcription service appeared. The license-token path produced only the staging billing request identified above. Vocabulary, raw text, and audit data are local browser storage; the CLI has no networking.
- The live service worker registered as `/sw.js`; after setting its context offline, a reload retained title, `h1`, and “Offline — local tools ready”, with no errors. `/privacy/` and `/terms/` each have a main landmark and one `h1`.

### Deployment match and budgets

Fresh SHA-256 comparisons prove the live deployment matches the candidate build:

| File | SHA-256 |
| --- | --- |
| `index.html` | `26d6b04e078a263a99612e1e08ea9c5472aaca58a56b0a6e91caa71eb6b21265` |
| `assets/main-DRTDppSm.js` | `8f920d77731bf010418faf1413267c021561f04d1bfc5412d9eea8f255647c2c` |
| `assets/styles-tJaGYRyS.css` | `f6a9717bcd10d57403ebe599c19858dd547be47c898d58abb1dad852d91d7160` |
| `sw.js` | `8cb609f3e8aebd2b53088242804a2eafb3e0867fd87e6437dce96c24e3c232d8` |

Artifact budgets pass: main JS 11,969 B (4,930 B gzip), CSS 14,703 B (4,250 B gzip), no font payload, and hero WebP 62,510 B. Two Lighthouse 12 attempts could not complete because the supplied headless Chrome tab crashed in this container; no independent Lighthouse score is claimed here. That limitation is not evidence of passing the requested Lighthouse threshold.

## Required retest

1. Use the production Sociobot billing endpoint and verify checkout, return token, restore, daily verify, revocation, and offline cached license with a real production license.
2. Make CLI correction/audit writes transactional and add the unwritable-audit regression test.
3. Add immutable hashed-asset caching and release-versioned service-worker cache/update coverage.
4. Add CSP/Permissions-Policy, then rerun clean install, exact build, package-consumer, live browser/axe/mobile/offline/headers, and Lighthouse verification.
