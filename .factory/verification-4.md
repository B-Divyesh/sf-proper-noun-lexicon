# Independent verification 4 — FAIL

**Work order:** `proper-noun-lexicon-verify-4`
**Candidate:** `6e7d0e03d01dd7ff4cf834a931b6961a95700f3f`
**Production URL:** <https://proper-noun-lexicon.sociobot.in/>
**Test date:** 2026-08-28 UTC
**Verdict:** **FAIL — production matches the candidate and the prior deployment concerns are resolved, but the packaged CLI can report a successful correction after silently destroying its required rollback audit.**

## Defects

### P1 — Equivalent output and audit paths silently eliminate rollback

The CLI rejects only lexically identical `--output` and `--audit` paths. Two different path strings that resolve to the same destination bypass that check. Fresh testing of the installed `pnl 0.1.1` package used:

```sh
pnl --json correct \
  --lexicon names.pnl.json \
  --input raw.txt \
  --output /tmp/qa/aliased-pair.txt \
  --audit /tmp/qa/path-alias/../aliased-pair.txt
```

Both destination arguments resolved to `/tmp/qa/aliased-pair.txt`. The command exited **0** and returned:

```json
{"audit":"/tmp/qa/path-alias/../aliased-pair.txt","changes":7,"command":"correct","ok":true,"output":"/tmp/qa/aliased-pair.txt"}
```

The final file contained corrected plain text, not the JSON audit. Attempting rollback exited 1:

```json
{"error":".../aliased-pair.txt is not a valid audit: expected value at line 1 column 1","ok":false}
```

This directly breaks the brief's requirement that every correction remain reversible and the CLI's central safety promise. Resolve/canonicalize both destinations (including non-existent leaves and symlinked parents), refuse the operation before writing when they identify the same target, and add regression coverage for `..`, `.`, symlink, and hard-link aliases.

### P2 — Browser audit offsets are not the documented byte offsets

The README defines `changes[].start` and `end` as byte offsets. For raw text `👋 socio bot meets sociobotics.`, the live browser downloaded an audit whose first change had `start: 3`; the UTF-8 byte offset is 5. The installed Rust CLI produced `start: 5` for the same raw text and alias.

The browser uses JavaScript UTF-16 string indexes while the CLI uses UTF-8 byte indexes, so the nominally shared version-1 audit contract is inconsistent for ordinary international text. Raw rollback still worked because the audit also stores the complete raw string, but tools using the documented provenance offsets select the wrong bytes. Emit UTF-8 byte offsets in the browser or explicitly version and document different units, then add cross-implementation Unicode fixtures.

### P2 — `--json` does not cover command-line validation errors

Most runtime failures returned structured JSON and exit 1. However:

```sh
pnl --json export --lexicon names.pnl.json --format invented --output out.json
```

exited 2 with Clap's human-readable usage error, not JSON. This weakens the attached CLI contract's scriptable `--json` guarantee exactly on invalid user input. Route parser errors through a JSON error renderer when `--json` is present and test invalid enum values and missing required arguments.

### P3 — Malformed persisted workspace data causes a page error on load

With `pnl:workspace:v1` containing `{"entries":[null],"raw":"recover me"}`, the live page raised `Cannot read properties of null (reading 'term')` during initial rendering. A subsequent manual “Add term” left the list empty. Loading the sample vocabulary recovered to three entries, but the app neither explains that the stored workspace is invalid nor safely quarantines it. Validate stored entries during load, preserve or offer a reset/export recovery, and show the existing saved-data error state instead of throwing.

### P2 — The packaged public Rust API has no usage example or doctest

The crate exposes a typed public library (`import_csv`, `correct`, `export`, and public data types), but the root and packaged READMEs document only CLI usage. `cargo test --doc` reported **0 doctests**. The attached libraries/CLIs contract requires Rust examples that compile as doctests. Add a minimal public-API example covering import, correction, audit preservation, and export.

## Passing evidence

### Clean checkout, gates, and exact build

- Created a detached worktree at the exact candidate; it remained clean after verification.
- Toolchain: Node 22.23.2, npm 10.9.8, Rust/Cargo 1.98.0. Playwright was pinned at 1.58.2 and used the supplied browser cache.
- `npm ci`: 61 packages installed, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: Rust formatting, strict Clippy (`-D warnings`), and TypeScript checks passed.
- `npm test`: 7 Rust tests, 7 Vitest tests, and 20 Playwright tests passed on desktop Chromium and 390 × 844 Chromium.
- Exact `npm run build`: passed, reran the complete test suite, built `target/release/pnl`, and produced `dist/site/`.

### Package, public API, and CLI behavior

- `cargo package --manifest-path cli/Cargo.toml`: passed and verified 8 files, 37.1 KiB unpacked / 10.9 KiB compressed. Nothing was published.
- Installed the extracted package with `cargo install --path ... --root ... --locked`; the clean install reported `pnl 0.1.1`.
- A separate external Rust consumer compiled against the extracted package and asserted CSV import, boundary-safe approved correction, exact raw preservation, and the Google export root schema.
- The installed CLI imported/listed seven acronym, Unicode, punctuation, comma-containing, and hyphenated terms; emitted all three advertised exports; performed seven approved corrections; left `sociobotics`, `myA P Ivalue`, and `xacme labs` untouched; and restored ordinary raw input byte-for-byte.
- A generated 100-term CSV imported successfully with exactly 100 entries.
- Bad header, unclosed quote, alias collision, header-only input, missing input, same literal output/audit, unwritable audit parent, and missing rollback audit all returned non-zero without producing the claimed artifact. A valid import succeeded immediately after those failures.
- Google export had the sole root key `phrases`. A fresh Google Speech v1 discovery document confirmed `PhraseSet.properties.phrases` and `SpeechAdaptation.properties.phraseSets`.

### Live end-to-end, responsive, and accessibility

- Fresh desktop 1440 × 1000 and mobile 390 × 844 runs had one `h1`, one `main`, `lang="en"`, no horizontal overflow, no failed requests, and no normal-load console/page errors.
- Visual inspection of full-page screenshots found no overlap, clipping, obscured controls, or broken responsive stacking.
- Normal and mobile flows added vocabulary, corrected only the approved alias, preserved `sociobotics`, restored exact raw text, rejected malformed CSV without losing the existing entry, named a duplicate term, persisted entries/raw across reload, and exported the documented Google shape.
- The exact free boundary accepted 25 terms. A 26-term replacement showed the specific limit/recovery message and preserved all existing 25 entries.
- First Tab focused “Skip to main content” with a visible `rgb(103, 245, 210) solid 3px` outline. Live arrow-key tab selection worked; the repository suite also operated CSV import with Enter/Space on desktop/mobile.
- All visible links, buttons, inputs, text areas, and the file-picker label measured at least 44 × 44 CSS px at desktop and 390 px.
- Axe found zero violations of any impact on the live main page at both sizes, therefore zero serious/critical findings. Both legal pages also had zero serious/critical findings and exactly one `h1`/`main`.
- Reduced motion matched, changed smooth scrolling to `auto`, and reduced animation/transition durations to 0.01 ms.

### Privacy, billing, policies, deployment identity, and PWA

- Normal initial load and a full vocabulary/correction/audit workflow contacted only `proper-noun-lexicon.sociobot.in`; no analytics, CDN fonts/scripts, vocabulary, or transcript left the origin.
- A real invalid-token browser flow stored `sb_license:proper-noun-lexicon`, stripped the query parameter, contacted only the disclosed `api.sociobot.in` verifier, stayed locked, and showed a quiet recovery message. The verifier used origin-specific CORS and `Cache-Control: no-store`.
- Production catalog contains the product at USD 29.00. Checkout returned HTTP 303 to `checkout.dodopayments.com`; invalid verification returned `{valid:false, reason:"invalid", expires_at:null}`.
- Production `sw.js` is stamped `pnl-shell-6e7d0e03d01dd7ff4cf834a931b6961a95700f3f`. Candidate and production SHA-256 values matched byte-for-byte for index HTML, hashed JS, hashed CSS, service worker, hero WebP, both legal pages, and manifest.
- A deliberately seeded obsolete cache was removed when the candidate worker installed; only the candidate-stamped cache remained. A controlled 390 px page then reloaded offline with the correct title, one `h1`, and “Offline — local tools ready.”
- HTML, legal pages, and service worker use `no-cache, max-age=0, must-revalidate`. Hashed JS/CSS and the hero use one-year immutable caching.
- Responses include HSTS, `nosniff`, strict referrer policy, a restrictive CSP, and a Permissions Policy disabling microphone, camera, payment, geolocation, and other unused capabilities.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 1,077 ms load, correct title/lang/main/alt/button names, and no console errors.
- `npm run verify:live`: passed live semantics, policies, budgets, production catalog, hosted checkout, and invalid-license checks.

### Performance and payloads

- Built initial assets: JS 12,538 B (5.19 kB gzip), CSS 15,414 B (4.33 kB gzip), no font payload, hero WebP 62,510 B. All are below the factory budgets.
- Lighthouse 12.8.2 mobile: Performance 95, Accessibility 100, Best Practices 100, SEO 100; FCP 989 ms, LCP 1,202 ms, TBT 262 ms, CLS 0, total transfer 78,266 B.

## Verification limits

No real $29 purchase, refund, or production-license issuance was performed because that would create an external financial transaction. Valid/restored/cached/revoked/offline license behavior passed deterministic repository browser tests; the live checkout boundary and invalid verifier were exercised without a charge. No speech-provider credentials or private audio corpus were used, so the brief's 25-point real-model recall goal still requires a customer pilot.

## Retest gate

Block release until the CLI rejects all equivalent output/audit targets before writing and proves rollback remains available. Then align browser audit offsets with the documented format, make all `--json` failures machine-readable, validate/recover malformed stored workspaces, and add a compiled public-library example. Repeat the clean install/test/lint/build/package/consumer matrix plus live byte identity, Unicode audit comparison, aliased-path safety, invalid JSON-mode arguments, stored-data recovery, accessibility, privacy, offline update, response policies, and Lighthouse.
