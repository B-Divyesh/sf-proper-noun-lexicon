# Handoff — Proper Noun Lexicon review 2

**Work order:** `proper-noun-lexicon-review-2`
**Artifact:** Rust `pnl` CLI and static Vite review desk
**Review scope:** independent QA only; no product-code or deployment change
**Production:** <https://proper-noun-lexicon.sociobot.in/>
**Review verdict:** FAIL — F-2-1 is a blocking untested pricing claim

## Review 2 outcome

This review wrote `.factory/review-2.md` and made no product-code changes. The cold first-read, mobile/desktop live demo, storage isolation, offline correction, privacy request log, history retest, routing, metadata, links, accessibility, and visual-identity checks passed. The six prior review findings remain fixed.

All ten exact commands in `.factory/claims.json` passed independently from a clean clone. The remaining blocker is test quality: the tagged `free-limit` test proves the 25-term behavior but does not prove the page’s “$29 once” or “No subscription” promises. `npm run verify:live` currently observes a USD 2900 catalog price, but that is not the claim’s tagged sandbox assertion.

**Verification:** `npm test` passed. `npm run build` passed and produced `dist/site/` plus the release `pnl` binary in the clean clone.

**Next step:** add a recorded pricing fixture and tagged test that asserts price plus non-recurring terms, or remove those promises; then rerun the claim commands, `npm test`, `npm run build`, and the live browser verification. No deployment was made.

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

None. No source, review, deployment, or external-service issue remained in the final cold check. A temporary shared billing-service error recovered before handoff, and the final verification passed its catalog, hosted checkout, and license endpoints.
