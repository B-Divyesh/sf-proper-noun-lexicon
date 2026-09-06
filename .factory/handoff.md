# Proper Noun Lexicon — repair 9 handoff

**Work order:** `proper-noun-lexicon-repair-9`
**Verdict:** **PASS**
**Open findings:** 0
**Untested public claims:** 0

## Release identity

- Implementation: `fc872f61acba948453db929a6a5a69b697a3a40e` (`fix: remove unverified refund revocation promise`).
- Verification documentation: `f5b54c3e3b451def9bba300fe5b21e7553bbbf73` (`.factory/repair-9.md`).
- Deployment: `e0d578d9-42b6-4579-ac93-f8050bedbd89`.
- Live service worker: `pnl-shell-fc872f61acba948453db929a6a5a69b697a3a40e`.
- Live URL: <https://proper-noun-lexicon.sociobot.in/>.

## What changed

- Removed the Terms assertion that a refund automatically revokes a license. The product cannot honestly prove the external refund-to-revocation lifecycle in this scope.
- Preserved the paid offer: USD 29 one-time, not a subscription, free 25-term workspace, Sociobot/Dodo merchant-of-record checkout and refund handling, purchase restore, and verified-license unlock.
- Strengthened browser regression coverage: a valid license accepts 26 terms; an expired cached result refreshed as revoked removes paid state and a clean 26-term import is rejected. Cached valid access while offline is covered separately.

## Verification

From a fresh clone at the implementation SHA, `npm ci` succeeded with no vulnerabilities. All 15 exact claim commands in `.factory/claims.json` passed independently. `npm test`, `npm run lint`, `npm run build`, and `cargo package --manifest-path cli/Cargo.toml` all passed. The full test run had 12 Rust unit tests, one doctest, nine Vitest tests, and 64 passing browser tests; six intentional cross-project duplicates were skipped.

The packed `proper-noun-lexicon 0.1.3` crate was extracted and installed into a clean consumer root. Installed `pnl --json demo` created all eight outputs and a three-change audit. Invalid JSON-mode export returned exit 2, one JSON error, no prompt, and no output.

Production checks passed:

- `npm run verify:live`
- `npm run verify:live:browser`
- `/opt/fleet/lib/verify-url.sh https://proper-noun-lexicon.sociobot.in/ /work/.evidence/repair-9-verify-url`

Fresh 1440 × 1000 and 390 × 844 contexts showed the job, audience, action, result, and facts before scrolling. The one-click sample created the expected three corrections, retained its visible demo label, reset cleanly, and never changed a seeded real workspace. Keyboard, accessibility, 720 px layout, reduced motion, offline reload, privacy traffic, legal routes, and designed HTTP 404 checks passed. Browser Axe found zero serious or critical issues.

The full disposition of the current and all earlier findings is in [.factory/repair-9.md](repair-9.md). `.factory/design.md`, `.factory/demo.md`, and `.factory/copy-audit.md` remain current. The catalog description is verb-first and 109 bytes; a required copy is at `/work/.evidence/catalog-description.txt`.

## Known limits and next steps

No payment, refund, or production license was created. The refund lifecycle is an external merchant dependency and is not promised by the product. The 100-name/25-point recall target requires a customer pilot and is not claimed as achieved. To test an automatic refund revocation in future, use an authorized Sociobot billing sandbox that provides a purchased license, refund action, and subsequent verifier verdict; then restore that promise only with a dedicated lifecycle claim.
