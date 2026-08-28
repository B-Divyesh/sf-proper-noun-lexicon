# Verification handoff — FAIL

**Work order:** `proper-noun-lexicon-verify-4`
**Candidate:** `6e7d0e03d01dd7ff4cf834a931b6961a95700f3f`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Date:** 2026-08-28 UTC

## Release status

**FAIL.** Production byte-matches the candidate and the prior deployment/billing concern is resolved, but the packaged CLI can silently destroy the rollback audit while exiting successfully.

The release blocker is reproduced by passing different `--output` and `--audit` strings that resolve to the same file, such as `out.txt` and `path-alias/../out.txt`. `pnl correct` exits 0, writes corrected plain text over the audit, and the advertised `pnl rollback` then exits 1. This violates the brief's core requirement that every correction remain reversible.

Secondary findings:

- Browser audit offsets use UTF-16 indexes while the documented/version-1 CLI contract uses UTF-8 byte offsets (`3` versus `5` after `👋 `).
- `--json` parser/argument failures still emit human-readable Clap text instead of JSON.
- Structurally invalid persisted workspace entries cause a page error and block manual add until a replacing import/sample recovers the workspace.
- The packaged public Rust library has no documented API example and `cargo test --doc` runs 0 doctests.

Full reproductions and all passing evidence are in [verification-4.md](verification-4.md).

## What passed

- Clean detached candidate: `npm ci`, typecheck, strict lint/Clippy, `npm test`, and exact `npm run build` all passed; 7 Rust + 7 Vitest + 20 Playwright tests passed.
- `cargo package` verified an 8-file, 10.9 KiB compressed crate; a clean external install and separate Rust API consumer worked.
- Normal CLI import/list/export/correct/rollback, 100-term input, Unicode/acronym/punctuation cases, boundary non-matches, and ordinary error recovery passed.
- The live desktop and 390 px product passed normal correction/rollback, malformed/duplicate/free-limit recovery, local persistence, keyboard focus/navigation, all 44 px target checks, reduced motion, and visual inspection.
- Axe found zero violations on the main page at both sizes and zero serious/critical findings on legal pages. Normal workflows produced no console/page/request errors.
- Normal browser work stayed same-origin. Billing used only the disclosed production API; catalog, hosted checkout redirect, invalid verification, CORS, and no-store policy passed.
- Eight production files matched the candidate byte-for-byte; the service worker carried the full candidate SHA, removed an obsolete cache, and reloaded offline.
- CSP, Permissions Policy, HSTS, referrer policy, MIME hardening, revalidation, and immutable asset caching passed.
- Payloads: 12.5 KB JS, 15.4 KB CSS, zero fonts, 62.5 KB hero. Lighthouse mobile: 95 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1.20 s and CLS 0.

## Reproduce

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
```

Install the extracted crate into a clean Cargo root, then run `pnl correct` with two path strings resolving to one destination and confirm it refuses the operation without changing either visible artifact. Do not publish the crate until that retest passes.

No product code was modified by this verification. No package was published and no real financial transaction was made.
