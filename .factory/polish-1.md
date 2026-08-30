# Perfection loop — polish round 1

**Work order:** `proper-noun-lexicon-polish-1`
**Reviewed candidate:** `f48acd403523d20edf1c7a5996b911b718827fa2`
**Review commit:** `b9a4c16d98e82e18b118852ec6608bfd27204c99`
**Repair commit deployed:** `b80226ffb209c1a3cec8a03aa0b7db5a2c0a4437`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>

The repository contained `.factory/review-1.md` and no earlier `.factory/review-*.md` or `.factory/polish-*.md`. Every finding in that cumulative review is closed below.

## Finding closure

| Finding | Change made | Automated evidence | Screenshot | Cold live check |
| --- | --- | --- | --- | --- |
| F-1-1 | Route arrivals now focus the visible destination heading, keep it visible below the demo banner, and announce it through `#route-status`. Session navigation state handles `/ → ?demo=1 → Back`, including bfcache restores. | Playwright: `route changes move focus, announce the destination, and restore focus on Back`; live script checks both directions at 1440×1000 and 390×844. | [`live-demo-mobile.png`](evidence/polish-1/live-demo-mobile.png) shows the focused, visible workspace heading. | `npm run verify:live:browser` passed the production click, focus, announcement, and Back sequence. |
| F-1-2 | Added `og:type`, title, description, URL, image details, and complete Twitter card metadata to the designed 404. | Playwright: `every route has its own title and complete sharing metadata`; `scripts/verify-live.mjs` asserts HTTP 404 and all tags; live browser checks all nine selectors. | [`live-404-desktop.png`](evidence/polish-1/live-404-desktop.png) | Cold `/does-not-exist` returned 404 with the designed page and complete metadata. |
| F-1-3 | Renamed the control to **View CLI install steps**. It still links to `#cli`, whose first command is `cargo install --path cli`. | Playwright: `the CLI action names the install steps it reveals`; live script asserts the label, `#cli` target, and install command. | [`live-cli-desktop.png`](evidence/polish-1/live-cli-desktop.png) | The production action and destination matched at both viewports. |
| F-1-4 | Replaced “phrase-bias interfaces” with “Create a prompt or phrase list for supported speech tools.” The follow-up sentence names the shared vocabulary and offline CLI. | Live browser regression rejects the removed jargon. The updated sentences are counted in `.factory/copy-audit.md`. | [`live-exports-desktop.png`](evidence/polish-1/live-exports-desktop.png) | Production main text contained the plain rewrite and no old jargon. |
| F-1-5 | Reserved Proper Noun Lexicon for the product name. User-facing collection copy now consistently says **vocabulary**, including workspace, recovery, placeholder, exports, README, CLI README, and demo documentation. | Live browser regression rejects “My lexicon” and “Your lexicon”. `.factory/copy-audit.md` records `vocabulary` as the single collection term. | [`live-demo-mobile.png`](evidence/polish-1/live-demo-mobile.png) shows “My vocabulary”. | Production main text contained no reviewed mixed-terminology phrases. |
| F-1-6 | Split the 23-word README verification sentence into an 18-word sentence and “It does not make a purchase.” | `.factory/copy-audit.md` records counts of 18 and 6. | [`live-landing-mobile.png`](evidence/polish-1/live-landing-mobile.png) records the shipped product surface; this finding is repository documentation. | The deployed verification command described by the README passed without purchasing. |

## Additional required acceptance work

- The first action now enters the isolated sample at `/?demo=1`; `/demo` remains a direct route alias.
- Demo storage remains limited to `demo:pnl:*`; Reset restores the sample and Start for real deletes demo keys without changing real data.
- The fixed demo banner remains visible. The 390px demo layout keeps the focused heading and first sample term within the initial viewport.
- Route-specific titles, canonical URLs, descriptions, Open Graph/Twitter tags, legal routes, internal legal links, and real 404 behavior have regression coverage.
- `.factory/claims.json` has 10 entries and exactly one `@claim:<id>` test for each entry.
- `.factory/catalog-description.txt` is verb-first and 108 characters.

## Claim evidence from a clean clone

Clean clone: `/tmp/pnl-polish-clean.uerxEu`, commit `b80226ffb209c1a3cec8a03aa0b7db5a2c0a4437`. `npm ci` completed with zero vulnerabilities. Every exact command in `.factory/claims.json` passed independently:

| Claim id | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `approved-reversible` | PASS |
| `model-exports` | PASS |
| `free-limit` | PASS |
| `cli-demo` | PASS |
| `license-request-policy` | PASS |
| `cli-json` | PASS |
| `typed-library` | PASS |

## Full verification

- `npm run lint`: PASS.
- `npm run build`: PASS from the clean clone; 13 Rust unit/doc tests, 9 Vitest tests, and 49 Playwright tests passed. Five duplicate cross-project claim cases were skipped by their explicit project guards.
- `cargo package --manifest-path cli/Cargo.toml`: PASS; 11 files, 53.6 KiB unpacked and 14.5 KiB compressed. Nothing was published.
- Playwright axe integration: zero serious or critical violations on `/`, `/demo`, `/privacy/`, `/terms/`, and `/404.html`.
- Privacy/offline: same-origin demo request log, separate demo storage, dedicated offline browser context, successful offline reload and correction.
- Local Lighthouse JSON: [`lighthouse-local.json`](evidence/polish-1/lighthouse-local.json). Scores were 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.4 s, CLS 0, TBT 20 ms.
- Live Lighthouse: 100 performance, 100 accessibility, 100 best practices, and 100 SEO; LCP 1.2 s, CLS 0, TBT 0 ms.
- Production assets: JS 17,489 bytes, CSS 19,050 bytes, hero WebP 62,510 bytes.
- `/opt/fleet/lib/verify-url.sh`: PASS on production; [`verify.json`](evidence/polish-1/live-verify/verify.json), [`desktop screenshot`](evidence/polish-1/live-verify/screenshot-desktop.png), [`mobile screenshot`](evidence/polish-1/live-verify/screenshot-mobile.png).

## Deployment

`/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site` completed successfully. Final Azure deployment ID: `c763b059-9235-4dbf-822c-e479e503397a`. The live service worker reports `pnl-shell-b80226ffb209c1a3cec8a03aa0b7db5a2c0a4437`, matching the repair source exactly. Both `npm run verify:live` and `npm run verify:live:browser` passed immediately after the first deployment; the final browser check passed again after the identity-corrected deployment.

**Unresolved findings:** none.

**Latest external status:** the complete production check passed immediately after deployment. Beginning at 04:36 UTC, the shared Sociobot billing service returned HTTP 500 for its catalog and hosted-checkout routes across repeated cold probes. Its health route and invalid-license verifier continued returning 200, and the product site/browser checks remained green. This repository cannot change that shared service; the work order also forbids infrastructure or billing changes.
