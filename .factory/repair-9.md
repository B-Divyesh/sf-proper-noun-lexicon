# Repair 9 verification — Proper Noun Lexicon

**Work order:** `proper-noun-lexicon-repair-9`  
**Implementation candidate:** `fc872f61acba948453db929a6a5a69b697a3a40e`  
**Deployment ID:** `e0d578d9-42b6-4579-ac93-f8050bedbd89`  
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

## Result

**PASS.** Review finding F-5-1 is closed. The Terms page no longer promises that a refund automatically revokes a license, because an authorized refund-to-revocation billing lifecycle is not available in this product's test scope. It still accurately identifies Sociobot/Dodo as merchant of record for checkout and refunds, preserves the $29 one-time non-subscription offer, and leaves the free core intact.

The browser's own revocation behavior has stronger outcome coverage. A valid verifier result permits a 26-term workspace; after an expired cached verdict is refreshed as `revoked`, the browser removes paid state, shows the free-limit notice, and rejects a clean 26-term import. A separate regression confirms that an offline cached valid verdict retains the last verified access.

## Claim inventory

All 15 declared claims remain present exactly once in `.factory/claims.json`. A new clean clone at the implementation SHA ran every exact command independently after `npm ci`; all passed:

- `demo-sandbox`, `local-privacy`, `offline-reload`, `approved-reversible`, and `audit-reload`
- `model-exports`, `browser-csv-export`, `quoted-csv-import`, and `utf8-audit-parity`
- `free-limit`, `pricing`, and `license-request-policy`
- `cli-demo`, `cli-json`, and `typed-library`

No public page, Terms, README, or CLI claim asserts the untested refund lifecycle. The still-public pricing and browser-license behavior are covered by their existing outcome tests.

## Clean verification

From fresh clone `/tmp/pnl-clean.AYxYw1` at `fc872f6`:

```sh
npm ci
# each exact claim command from .factory/claims.json, separately
npm test
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

All commands passed. `npm test` completed 12 Rust unit tests, one Rust doctest, nine Vitest tests, and 64 browser tests, with six intended cross-project duplicates skipped. `npm run build` repeated the test suite, produced `dist/site/`, `target/release/pnl`, 18.85 KB initial JavaScript, and 19.27 KB CSS before gzip. Cargo packaged `proper-noun-lexicon 0.1.3` with 11 files (53.6 KiB unpacked, 14.5 KiB compressed).

The packed crate was extracted into a new consumer directory and installed under a new Cargo root. Installed `pnl --json demo` created eight outputs in a fresh operating-system temporary directory; its audit retained the expected raw text, corrected text, and three changes. Invalid `--json export --format invented` returned exit 2, one JSON error, no prompt, and no output file.

## Live verification

- Live service worker cache name is `pnl-shell-fc872f61acba948453db929a6a5a69b697a3a40e`, matching the implementation candidate.
- `npm run verify:live` passed product identity, public catalog price, hosted checkout 303, invalid verifier contract, headers, and asset references.
- `npm run verify:live:browser` passed fresh 1440 × 1000, 720 × 500, and 390 × 844 sessions. It verified the one-click sample, exact populated correction, persistent demo banner, reset, demo isolation, Start-for-real cleanup, routes, keyboard, 44 px targets, reduced motion, offline reload, same-origin demo traffic, and zero serious/critical Axe findings.
- Fresh desktop and phone visual checks show the job, audience, first action, action result, and three facts before scrolling. The job is correcting dictated names from approved vocabulary; the audience is people who dictate work; the first action is **Try it with sample data**.
- `/opt/fleet/lib/verify-url.sh` passed on the live home page: `200`, title, `lang`, one h1, main landmark, image alternatives, named controls, and no console errors.
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.32 s, total blocking time 65 ms, CLS 0, and transfer 80,300 bytes.
- The designed unknown route remains an expected HTTP 404, not a failure.

## Earlier findings

All earlier verification and review reports were read before this repair. Their existing closures were rechecked by the clean and live matrices: production billing origin and checkout availability; atomic CLI audit safety; immutable assets and release-stamped service worker; CSP and related headers; Google export shape; keyboard CSV import, touch targets, and tabs; path aliases; UTF-8 audit parity; JSON parser errors; saved-data recovery; compiled library example; demos and routes; focus announcements; 404 metadata; plain copy; exact pricing; direct demo metadata; free-limit boundary; complete CLI JSON coverage; CSV and quoted-import claims; offset claim; responsive 720 px layout; and audit reload. F-5-1 is the only new repair in this work order and is closed above.

## External limits

No actual purchase, refund, or issued production license was created. Those are external financial lifecycle actions and are no longer represented as a product promise. The brief's 100-name, 25-point recall result still needs a customer pilot and is not claimed as complete.
