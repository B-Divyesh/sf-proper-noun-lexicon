# Independent verification 2 — FAIL

**Work order:** `proper-noun-lexicon-verify-2`
**Candidate:** `248dca825d4821db7d7892882500c065bd79e865`
**Production URL:** <https://proper-noun-lexicon.sociobot.in/>
**Test date:** 2026-08-28 UTC
**Verdict:** **FAIL — release blocked by a broken production purchase flow.**

The deployed product exactly matches the clean candidate build and its free/local-first workflow, CLI, PWA behavior, accessibility, privacy behavior, and performance all passed the checks below. The paid one-time unlock advertised in production cannot be purchased because the production catalog has not been registered. This is an external factory configuration failure, not a source-code defect, but it blocks this release as sold.

## Defects

### P1 — Production checkout is unavailable

The live Buy permanent access link correctly points to:

```text
https://api.sociobot.in/api/v1/products/proper-noun-lexicon/checkout
```

Fresh `GET` evidence on 2026-08-28 returned **HTTP 404**:

```json
{"error":"enabled factory product","status":404}
```

The live verifier endpoint is reachable and returned the expected invalid-token result (`200 {"expires_at":null,"reason":"invalid","valid":false}`), and a browser test confirmed it strips a returned token and calls only the production API. However, no real purchaser can reach hosted checkout, so no issued production license, successful return-token flow, revocation, or valid-license offline cache behavior can be verified.

Register the production `proper-noun-lexicon` product with the Sociobot billing factory at the advertised $29 one-time price, then retest checkout, a valid returned license, restore, daily verification, revocation, and an offline cached unlock. No repository edit can resolve the 404.

## Passing evidence

### Clean checkout, quality gates, and build

- Created a detached clean worktree at the candidate SHA and ran `npm ci`: 61 packages installed, 0 vulnerabilities.
- `npm run typecheck` passed.
- `npm run lint` passed: `cargo fmt --all -- --check`, strict `cargo clippy --workspace --all-targets -- -D warnings`, and TypeScript checking.
- `npm test` passed: 6 Rust unit tests, 0 doctests, 6 Vitest tests, and 12 Playwright 1.58.2 tests across desktop Chromium and 390 × 844 mobile.
- The exact production command `npm run build` passed, reran all tests, compiled `target/release/pnl`, and produced `dist/site/`.

### CLI package and end-to-end behavior

- `cargo package --manifest-path cli/Cargo.toml --allow-dirty` passed and verified a ready-to-publish crate (8 files, 36.3 KiB unpacked, 10.7 KiB compressed). Nothing was published.
- Extracted the crate into a fresh temporary consumer, installed it using `cargo install --path … --root …`, and exercised installed `pnl 0.1.0`. `--help` documents one binary, subcommands, `--json`, no network access, and no prompts.
- The installed consumer imported a three-term CSV, listed JSON, exported Whisper/Google Speech/Azure payloads, corrected `socio bot`, `cuber netties`, and `A P I`, and rolled the audit back byte-for-byte. The boundary case `sociobotics` stayed unchanged.
- Invalid CSV header returned exit 1 and `{"ok":false,"error":"CSV needs a 'term' column"}` on stderr. A generated 100-term CSV imported with `"entries":100`.
- A release-binary correction whose audit parent was an existing file returned exit 1 and emitted neither corrected output nor audit, preserving the reversible-correction contract.

### Live browser, accessibility, privacy, and PWA

- Fresh desktop live session: one `h1`, one `main`, `lang="en"`, no console/page errors. The first Tab reaches “Skip to main content” with a visible `rgb(103, 245, 210) solid 3px` focus outline.
- The live review flow loaded the sample, corrected all three approved aliases, restored exact raw text by button and `Ctrl+Z`, and kept unmatched text unchanged. Recovery messages were specific: empty transcript says “Paste a raw transcript first”; duplicate `socio bot` says it already maps to Sociobot.
- Axe found **0 serious/critical** issues on desktop and 390 px mobile. The 390 px page has one `h1`, one `main`, and no horizontal overflow.
- Reduced motion sets `scroll-behavior: auto` and the hero animation duration to `0.01ms`.
- A fresh service-worker-controlled context reloaded offline with the title, one `h1`, and “Offline — local tools ready”. The worker is release-stamped `pnl-shell-248dca825d4821db7d7892882500c065bd79e865`, deletes old caches on activation, and the release test builds two distinct cache versions.
- A normal browser session requested only same-origin HTML, JS, CSS, and hero image. With a deliberately invalid license it additionally made exactly one request to the documented production verifier; no analytics, fonts, transcription, or other third-party requests appeared. CLI source contains no networking. Vocabulary/transcript/audit data stay in browser local storage or local CLI files.

### Deployment identity, policies, and budget

Fresh SHA-256 comparisons of clean build against production were identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `aea1073e6cd4d2a559516be6f9e482b5c2aebf669018eefe3e2fed95d94105ec` |
| `assets/main-_ruvFPgo.js` | `27527add0bf905e86d9ebbd762677f5bcb769dec3291ce0c037a3a0019269f2f` |
| `assets/styles-tJaGYRyS.css` | `f6a9717bcd10d57403ebe599c19858dd547be47c898d58abb1dad852d91d7160` |
| `sw.js` | `6940bc9baeacac5458f73aeee196e6b2d71e03267b87d18606f9c6d99a7b70ad` |
| `lexical-landscape.webp` | `4700ee91d222aed10e5044d593691e9e564f0c4c78ef1f446cabf2b2fd03a859` |

- Live HTML and `sw.js` use `no-cache, max-age=0, must-revalidate`; hashed JS uses `public, max-age=31536000, immutable`.
- Live headers include HSTS, `nosniff`, strict referrer policy, restrictive CSP (only same origin plus the production billing API for connections), and a Permissions Policy disabling camera, microphone, geolocation, payment, and other unused APIs.
- Budget: initial JS 11,963 B (4,933 B gzip), CSS 14,703 B (4,261 B gzip), no font payload, hero WebP 62,510 B.
- Lighthouse 12.8.2 mobile/preset=perf, using Chrome 145, scored **Performance 98** and **Accessibility 100**; LCP 1,920 ms, CLS 0, total blocking time 68 ms.

## Retest gate

After the billing factory registers the production product, retest a real $29 checkout through the hosted flow and record valid, invalid, revoked, restored, and offline-cached license behavior. With that P1 resolved, this candidate’s locally verifiable product checks are passing.
