# Handoff — Proper Noun Lexicon polish round 1

**Work order:** `proper-noun-lexicon-polish-1`
**Artifact:** Rust `pnl` CLI and static Vite review desk
**Repair commit deployed:** `b80226ffb209c1a3cec8a03aa0b7db5a2c0a4437`
**Production:** <https://proper-noun-lexicon.sociobot.in/>
**Deployment ID:** `c763b059-9235-4dbf-822c-e479e503397a`

## What changed

All six findings in `.factory/review-1.md` are fixed. Route changes now focus and announce the destination. The 404 has complete sharing metadata. The first-screen CLI action names the install instructions it opens. Technical jargon and mixed “lexicon/vocabulary” collection copy were removed. The long README sentence was split.

The primary sample action now uses the required isolated `/?demo=1` path. Its persistent banner, Reset, Start for real, separate `demo:pnl:*` storage, `/demo` alias, direct reload, and offline behavior remain intact. Mobile demo spacing now keeps the destination heading and populated sample visible together.

Regression coverage now checks route focus and Back behavior, route titles and metadata, 404 recovery, CLI-action truthfulness, legal links, reviewed wording, and the complete 390px first screen. The product-specific luminous lexical observatory design was preserved.

The verb-first catalog description is in `.factory/catalog-description.txt`. Finding-by-finding evidence is in `.factory/polish-1.md`.

## How it was verified

From a fresh clone of repair commit `b80226ffb209c1a3cec8a03aa0b7db5a2c0a4437`:

- `npm ci`: PASS, zero vulnerabilities.
- Every exact test command in `.factory/claims.json`: PASS independently, all 10 claims.
- `npm run lint`: PASS.
- `npm run build`: PASS and produced `dist/site/` plus the release CLI.
- Full suite: 13 Rust unit/doc tests, 9 Vitest tests, 49 Playwright tests passed; 5 duplicate project-guarded cases skipped.
- `cargo package --manifest-path cli/Cargo.toml`: PASS, 11 files, 14.5 KiB compressed.

Production checks after deployment:

- `npm run verify:live`: PASS, including HTTP status, headers, static asset budgets, service-worker release stamp, 404, catalog, checkout redirect, and invalid-license response.
- `npm run verify:live:browser`: PASS at 1440×1000 and 390×844, including focus/Back announcements, first-screen fit, sample correction/rollback, same-origin privacy, route copy, legal links, offline reload, reduced motion, and zero serious/critical axe findings.
- `/opt/fleet/lib/verify-url.sh https://proper-noun-lexicon.sociobot.in/ .factory/evidence/polish-1/live-verify`: PASS with no console errors, one h1, one main, English language, and complete alt/button names.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.2 s, CLS 0, TBT 0 ms.
- Built assets: JS 17,489 bytes, CSS 19,050 bytes, hero WebP 62,510 bytes.
- Live service-worker cache: `pnl-shell-b80226ffb209c1a3cec8a03aa0b7db5a2c0a4437`, exactly matching the repair commit.

## Run and deploy

```sh
npm ci
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site
npm run verify:live
npm run verify:live:browser
```

## Known gaps and next steps

No source or review finding remains. The full production verification passed immediately after deployment.

Beginning at 04:36 UTC, a later cold check found the shared Sociobot catalog and checkout routes returning HTTP 500. The gateway health route and license verifier still returned 200, and every product-site browser check stayed green. Repeated probes through 04:40 UTC produced the same result. The work order forbids infrastructure and billing changes, so no repository repair applies. The platform operator should restore the shared catalog/checkout service and rerun `npm run verify:live`; no product redeploy is indicated.
