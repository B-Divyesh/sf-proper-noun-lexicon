# Independent verification 5 — FAIL

**Requested candidate:** `8f32bb8d7afc7895496f16c010cdf3f4a4ddfd4c`
**Available source / deployed build:** `8f32bb20e1d8d6c8580bdce6905ab09279439299`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Verified:** 2026-08-30 UTC

## Decision

**FAIL.** The supplied candidate object cannot be fetched or checked out, `.factory/claims.json` is absent, and the product misses the mandatory one-click isolated demo for both its landing page and CLI. Any one of those is release-blocking under this work order.

## Release-blocking findings

### P0 — The requested candidate cannot be verified and is not what is deployed

`git show 8f32bb8d7afc7895496f16c010cdf3f4a4ddfd4c` reported `bad object`; `git fetch --no-tags origin 8f32bb8d7afc7895496f16c010cdf3f4a4ddfd4c` reported `upload-pack: not our ref`. The clean clone's `main` is `8f32bb20e1d8d6c8580bdce6905ab09279439299`.

Freshly built `dist/site/assets/main-nYp4NDHX.js` and `styles-D5toSGNS.css` SHA-256 matched the two live assets byte-for-byte. The live `sw.js` explicitly says `pnl-shell-8f32bb20e1d8d6c8580bdce6905ab09279439299`. Thus the deployment matches the available base, not the unavailable requested SHA.

### P0 — Required claim manifest and claim tests are missing

No `.factory/claims.json` exists in the clean checkout. Consequently there are no declared claim test commands that can be run from the demo entry point. This violates the non-negotiable claims contract and is explicitly release-blocking.

### P0 — Cold first screen has no mandatory sample-demo action

Cold live-page evidence: the title is `Proper Noun Lexicon — approved names, correctly written`; h1 is `Names in. Guesswork out.`; the actions visible in the hero are `Open the review desk` and `Use the CLI`. There is no `Try it with sample data` control (`getByRole('button', {name: /try it with sample data/i})` found 0 elements). `Load sample vocabulary` appears only later inside the workspace, after using the first CTA. The first screen therefore fails the required plain-words/sample-demo gate.

### P0 — No isolated demo sandbox for the web product or CLI

`https://proper-noun-lexicon.sociobot.in/demo` returns the ordinary landing page (200) with no `Demo — sample data, nothing is saved` banner, Reset/Start-for-real controls, sample CTA, or `demo:` storage namespace. There is no `.factory/demo.md`.

The CLI has only `import`, `list`, `export`, `correct`, and `rollback`; neither `pnl demo` nor `--demo` exists. It ships no `examples/` sample input. This fails the CLI demo-sandbox contract, which requires a bundled sample and a temp-directory demo command.

## Other findings

### P1 — Billing verifier has no documented/testable request allowance

The only server-side call is `GET https://api.sociobot.in/api/v1/products/proper-noun-lexicon/verify`. An invalid-token request returned 200, `Cache-Control: no-store`, and `{"expires_at":null,"reason":"invalid","valid":false}`, with no rate-limit headers. Repository docs/config contain no documented allowance or retry interval. Without an allowance, the required single-client over-limit 429 / `Retry-After` test cannot be targeted or confirmed.

### P2 — Fresh-suite flake observed

Immediately after `npm ci`, the first `npm test` failed: Vitest's `release delivery contract > stamps each deployed service-worker release with a distinct cache name` took 6697 ms and exceeded its 5000 ms limit. A later standalone Vitest run passed in 3.01 s, and a later exact `npm run build` passed. The five-second cold-path budget is therefore not reliable enough to claim the clean-suite gate is deterministic.

### P2 — Required site/demo routing is incomplete

`/demo` is an unconfigured fallback rather than a demo route; `/404.html` and `/definitely-not-a-page` both return the normal landing page with HTTP 200. There is no designed 404 response. The HTML also lacks the required canonical, Open Graph/Twitter card, and Apple-touch icon metadata.

## Evidence that passed

- `npm ci`: passed, 61 packages, 0 vulnerabilities.
- `npm run typecheck` and `npm run lint`: passed.
- The later exact `npm run build`: passed: 11 Rust unit tests, 1 doctest, 8 Vitest tests, 24 Playwright tests (desktop plus 390×844), release CLI build, and Vite production build. `dist/site` has JS 14.12 KB (5.62 KB gzip) and CSS 15.73 KB (4.40 KB gzip).
- `cargo package --manifest-path cli/Cargo.toml --allow-dirty`: passed; the packed 0.1.2 crate installed into a clean Cargo root. A separate clean Rust consumer imported CSV, corrected only approved aliases, preserved raw text, and emitted a Google payload with sole root key `phrases`. The installed `pnl` completed import → correct → audit → byte-identical rollback; a missing file produced exit 1 and structured JSON error.
- Live desktop flow: the bundled three terms changed `socio bot`, `cuber netties`, and `A P I` to `Sociobot`, `Kubernetes`, and `API`; Restore raw returned the exact source. An unmatched transcript reported `No approved aliases found`; blank input said `Paste a raw transcript first.` No console/page errors occurred.
- Live 390×844: no horizontal overflow; ArrowRight selects Google Speech; the reduced-motion image has `1e-05s` animation/transition. Fresh service-worker control reloaded offline and showed `Offline — local tools ready`.
- Axe 4.10.3 through Playwright reported zero violations, including zero serious/critical, at desktop and 390px. The standalone Axe CLI could not start the supplied headless-shell Chrome, so it is not used as evidence.
- Ordinary fresh live use requested only `https://proper-noun-lexicon.sociobot.in`. A deliberate invalid-license flow contacted only that origin plus the disclosed `https://api.sociobot.in`, stripped the token from the URL, stayed free-tier, and had no console errors. Live HTML/assets use HSTS, nosniff, strict referrer policy, restrictive CSP, no-cache HTML/SW, and immutable hashed-asset caching.

## Retest required

1. Publish or provide the exact requested Git object, then deploy it and expose its build identity.
2. Add `.factory/claims.json`, one executable demo-entry-point test per claim, and remove/cover every visitor-facing claim.
3. Make the hero's primary control `Try it with sample data`; implement `/demo` with separate demo storage, persistent banner, Reset demo, Start for real, and `.factory/demo.md`.
4. Add `pnl demo` (or `pnl --demo`) plus bundled `examples/` input, and test it from a clean temp directory.
5. Document the billing verifier allowance and demonstrate 429 plus `Retry-After` once one client exceeds it.
6. Stabilize the cold Vitest release test and implement real demo/404/metadata routes.
