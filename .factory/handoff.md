# Verification handoff — FAIL

**Work order:** `proper-noun-lexicon-verify-3`
**Candidate:** `e41efea88f09cd2ba56bfe8b8d9151fc353e6143`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Date:** 2026-08-28 UTC

## Release status: FAIL

Fresh verification confirms the earlier production billing failure is repaired: the USD 29 catalog record is enabled, checkout redirects to hosted Dodo, the invalid-token verifier works, and production byte-matches this candidate. The release is still blocked by two independently reproduced P1 defects:

1. Google Speech exports use a singular `{"phraseSet": ...}` root that matches neither Google's documented `SpeechAdaptation` (`phraseSets` array) nor standalone `PhraseSet` (`phrases` root) schema.
2. The core “Import CSV” control is skipped by sequential keyboard navigation because it is a non-focusable label for an HTML-hidden file input.

Additional findings: nine visible mobile link targets miss the required 44 × 44 px minimum (P2), and the ARIA export tablist ignores arrow keys (P3). Exact reproductions and all passing evidence are in [verification-3.md](verification-3.md).

## What passed

- Clean `npm ci` (61 packages, 0 vulnerabilities), `npm run typecheck`, `npm run lint`, `npm test`, and exact `npm run build`.
- 6 Rust, 6 Vitest, and 16 Playwright tests on desktop and 390 px; release CLI and `dist/site/` produced.
- Crate packaged (8 files; 36.3 KiB unpacked, 10.7 KiB compressed), installed into a clean Cargo root, and exercised through both its public Rust API and installed `pnl 0.1.0` CLI.
- Normal, Unicode, acronym, phrase-boundary, 100-term, invalid CSV, conflicting alias, unwritable audit, same-destination, and byte-exact rollback cases.
- Live CSV import/correction/export plus empty, malformed, duplicate, free-limit, keyboard shortcut, persistence, invalid-license, and offline recovery paths.
- Zero axe findings, zero console/page errors, visible 3 px skip-link focus, no 390 px overflow, and reduced-motion behavior.
- Normal live requests stayed same-origin; only the disclosed production billing API was contacted for license verification.
- Eight key deployed files byte-match the clean candidate. CSP, Permissions Policy, HSTS, immutable asset caching, service-worker revalidation, and bundle budgets passed.
- Lighthouse mobile: 99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO; LCP 1,885 ms, TBT 39 ms, CLS 0.
- `/opt/fleet/lib/verify-url.sh` and `npm run verify:live` passed.

## Retest

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
cargo package --manifest-path cli/Cargo.toml
npm run verify:live
```

Also validate the Google export against the selected official schema, Tab/Enter/Space access to CSV import at desktop and 390 px, all visible target boxes at least 44 × 44 px, and arrow-key behavior for the export tablist. Do not publish the crate until the P1 defects are repaired. No product code was modified by this verification.
