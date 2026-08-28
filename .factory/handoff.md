# Handoff — Proper Noun Lexicon v0.1.0

## Independent verification status — FAIL (supersedes release approval)

Candidate `a7ad177a2cee855aa4702931d6ff89db90664bbc` was independently tested from a clean checkout and against <https://proper-noun-lexicon.sociobot.in/> on 2026-08-28 UTC. The exact build and test suite pass, and the live HTML/JS/CSS/service worker hash-match the candidate. **Do not release it.**

- **P1:** The live production domain sends checkout and license verification to `https://pilot-api.sociobot.in/...`, not required production `https://api.sociobot.in/...`; a fresh `?license=` flow captured the staging verify request.
- **P1:** `pnl correct` writes its correction output before its audit. With `--audit /dev/null/audit.json`, it exits 1 but leaves a corrected file and no audit/rollback artifact.
- **P2:** Live hashed assets have only `cache-control: public, must-revalidate, max-age=30`, not immutable long-lived caching; the PWA cache is fixed at `pnl-shell-v1`, so release update behavior is unproven.
- **P3:** Live headers lack Content-Security-Policy and Permissions-Policy.

See `.factory/verification.md` for exact commands, passing functional/accessibility/privacy/offline evidence, deployment SHA-256 values, all severity details, and the required retest checklist. The historical Lighthouse figures below are builder-reported; the verifier's Lighthouse runner crashed in this container, so no new Lighthouse score is claimed.

## What shipped

- A typed Rust `pnl` CLI with helpful non-interactive subcommands for CSV import, lexicon listing, Whisper/Google Speech/Azure Speech exports, approved-alias correction, JSON output, and exact raw-text rollback from a versioned audit.
- A compact offline-first browser review desk with CSV import/export, entry validation, conflict errors, 25-term free workspace, reversible highlighted corrections, downloadable audits, model payloads, keyboard shortcuts, clipboard fallback, local persistence, and explicit empty/offline/error states.
- A $29 one-time permanent unlock using the Sociobot paid-unlock contract: hosted buy link, return-token capture, local token storage, daily cached verification, optimistic offline access after a valid cached verdict, revocation handling, and pasted-token purchase restore. Accessibility, export, audit, and rollback are never gated.
- Original luminous glass product artwork, a responsive 390 px layout, self-hosted/system typography, reduced-motion treatment, PWA shell caching, privacy and terms pages, robots/sitemap, documentation, MIT license, and changelog.

## Run and verify

```sh
npm install
npm test
npm run build
```

The exact build command is `npm run build`. It runs all Rust, browser-core, desktop/mobile E2E, axe, offline, and console-error checks; builds the release CLI at `target/release/pnl`; and writes the deployable static site with `index.html` at `dist/site/`.

Latest local verification on 2026-08-28:

- Rust: 5 tests passed; doc tests passed.
- Vitest: 4 tests passed.
- Playwright 1.58.2: 10 tests passed across desktop Chromium and a 390 × 844 mobile viewport, including keyboard operation, raw rollback, offline operation, legal pages, and no serious/critical axe violations.
- `npm audit`: 0 vulnerabilities.
- `cargo package --manifest-path cli/Cargo.toml`: ready-to-publish crate produced successfully; the factory owns publishing credentials and no package was uploaded.
- Production service worker: page reloaded successfully after the browser context was taken offline.
- Static budgets: initial application JS 11.97 KB, CSS 14.70 KB, hero WebP 64 KB; no webfont payload.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9 s, LCP 1.5 s, TBT 60 ms, CLS 0.

## Known gaps and release next steps

- The billing URLs intentionally use `https://pilot-api.sociobot.in` for staging. The factory must register the test product, exercise checkout with the staging card, then switch the base URL to `https://api.sociobot.in` at release. No product ID or payment provider is embedded.
- Speech interfaces change over time. The v1 exports intentionally cover only the documented prompt/phrase shapes named in the UI; adding another engine should be an explicit versioned formatter, never a guessed integration.
- The success target (25-point exact-name recall improvement on 100 pilot names) requires a representative external audio/transcript benchmark. The product supplies the 100-term-capable paid workflow and reversible audit needed to run it, but does not fabricate a measured outcome.
