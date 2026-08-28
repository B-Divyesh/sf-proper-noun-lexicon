# Independent verification 3 — FAIL

**Work order:** `proper-noun-lexicon-verify-3`
**Candidate:** `e41efea88f09cd2ba56bfe8b8d9151fc353e6143`
**Production URL:** <https://proper-noun-lexicon.sociobot.in/>
**Test date:** 2026-08-28 UTC
**Verdict:** **FAIL — the repaired billing deployment is live, but a model export and a core keyboard workflow do not meet the acceptance contract.**

The previous deployment-only billing failure is resolved. Fresh evidence shows the production catalog, hosted checkout redirect, verifier, deployed artifact identity, response policies, performance, offline shell, local review flow, and packaged crate all working. Independent coverage found two P1 defects outside that earlier billing report.

## Defects

### P1 — The Google Speech export is not a documented Google Speech payload

Both the installed CLI and the deployed review UI emit this root shape for `google-speech`:

```json
{
  "phraseSet": {
    "phrases": [{ "boost": 15.0, "value": "Sociobot" }]
  }
}
```

A fresh read of Google's official Speech v1 discovery document at <https://speech.googleapis.com/$discovery/rest?version=v1> shows:

- a `SpeechAdaptation` accepts `phraseSets` (plural, array), `phraseSetReferences`, `customClasses`, and `abnfGrammar`;
- a standalone `PhraseSet` accepts `phrases` directly (plus fields such as `name` and `boost`);
- neither schema accepts the exported singular `phraseSet` wrapper.

The installed package's five-term export and the live UI sample both had the sole root key `phraseSet`. Unit coverage only asserts that the text contains `Sociobot`, so it does not validate the advertised model interface. This breaks a central brief requirement to emit model-specific files for documented bias interfaces.

Export a documented standalone `PhraseSet` (`{"phrases": [...]}`) or a documented `SpeechAdaptation` snippet (`{"phraseSets": [{"phrases": [...]}]}`), state exactly where it belongs in the request, and validate the schema in regression tests.

### P1 — Keyboard users cannot operate “Import CSV”

The core import control is rendered as a styled `<label for="csv-file">`, while the associated file input has the HTML `hidden` attribute. Fresh sequential-keyboard testing found:

```text
label[for="csv-file"].tabIndex = -1
#csv-file.hidden = true
workspace focus order: Export CSV → Approved spelling → Spoken aliases → Add term
```

“Import CSV” never enters the Tab order and cannot be activated with Enter or Space. This reproduces at the shared desktop/mobile markup. It violates the explicit keyboard baseline and blocks keyboard-only users from the brief's primary CSV-import workflow. Axe does not detect this class of defect, and the repository E2E suite does not exercise file import from the keyboard.

Keep the native file input focusable with a visually-hidden treatment or use a real button with correct keyboard activation, accessible naming, and visible focus. Add desktop and 390 px keyboard regression coverage.

### P2 — Multiple interactive links miss the 44 × 44 CSS px target minimum

Fresh 390 × 844 measurements found nine visible anchor targets with at least one dimension below 44 px. Representative boxes were:

- `Unlock unlimited`: 101 × 14 px
- `View source and install guide`: 288.7 × 35 px
- purchase-card `Privacy`: 39.8 × 13 px; `Terms`: 32.4 × 13 px
- footer `Privacy`: 58 × 21.7 px; `Terms`: 47 × 21.7 px; `GitHub`: 54.7 × 21.7 px
- header and footer brand links: 214.4 × 38 px

Buttons and form controls generally meet the requirement. Increase the clickable padding/minimum block size of the remaining links without changing their visual density.

### P3 — The ARIA tablist does not implement arrow-key behavior

With focus on the selected `Whisper` tab, `ArrowRight` left focus and selection unchanged. `Tab` moved to `Google Speech`, and Enter selected it. The control remains operable, but all three `role="tab"` buttons are separate Tab stops rather than using the expected arrow-key/roving-tabindex pattern required by the keyboard baseline.

## Passing evidence

### Clean checkout, gates, and exact build

- Created a detached clean worktree at the candidate SHA; final worktree status remained clean.
- `npm ci`: 61 packages installed, 0 vulnerabilities.
- `npm run typecheck`: passed.
- `npm run lint`: Rust formatting, strict clippy (`-D warnings`), and TypeScript checking passed.
- `npm test`: 6 Rust tests, 6 Vitest tests, and 16 Playwright 1.58.2 tests passed across desktop Chromium and 390 × 844 mobile.
- Exact `npm run build`: passed, reran all tests, built `target/release/pnl`, and produced `dist/site/`.

### Packaged CLI and library consumer

- `cargo package --manifest-path cli/Cargo.toml`: passed (8 files, 36.3 KiB unpacked, 10.7 KiB compressed). The crate includes its lockfile, MIT license, README, library, and single `pnl` binary. Nothing was published.
- Installed the extracted crate into a fresh Cargo root with `cargo install --path … --root … --locked`; installed version was `pnl 0.1.0`.
- A separate clean Rust consumer compiled against the packaged library and exercised `import_csv`, `correct`, `export`, exact raw preservation, boundary non-matches, and the public typed API.
- The installed binary imported/listed five Unicode/acronym/hyphenated terms; exported all three advertised formats; applied five case-insensitive approved corrections; left `sociobotics` and `myA P Ivalue` unchanged; and rolled back byte-for-byte.
- A generated 100-term CSV imported with `entries: 100`.
- Invalid header, header-only CSV, and alias collision each returned exit 1 with structured JSON on stderr. An audit under a file parent and identical output/audit paths returned exit 1 without emitting a correction.

### Live review UI and recovery paths

- A real three-term CSV imported on the live 390 px UI; correction produced `Sociobot`, `Kubernetes`, and `API`, retained `sociobotics`, and exported `proper-noun-lexicon.csv`.
- An unclosed quoted CSV produced “The CSV has an unclosed quoted field” while preserving the existing three entries. A 26-term free-tier import produced the specific limit/recovery message and retained zero entries.
- Keyboard shortcuts applied three corrections and restored the exact raw draft with Ctrl+Z. Empty input focused the raw field with “Paste a raw transcript first”; a duplicate term produced a named inline error. Workspace data persisted locally across reload.
- Desktop and mobile each had one `h1`, one `main`, `lang="en"`, no missing image alt, no horizontal overflow, and no console/page/request errors.
- First Tab focused “Skip to main content” with `rgb(103, 245, 210) solid 3px` focus styling.
- Axe reported zero violations of any impact on the main live page at desktop and 390 px (therefore zero serious/critical findings).
- Reduced motion matched and set smooth scrolling to `auto` plus animation/transition durations to `0.01ms`.

### Privacy, billing, PWA, and production identity

- A fresh normal browser session requested only `https://proper-noun-lexicon.sociobot.in`; no analytics, CDN font, transcription, vocabulary, or transcript request occurred. Source review found only the disclosed billing verifier fetch.
- An invalid returned token was saved under `sb_license:proper-noun-lexicon`, stripped from the URL, sent only to `https://api.sociobot.in`, and produced the quiet inactive-license recovery state. The verifier returned `Access-Control-Allow-Origin: https://proper-noun-lexicon.sociobot.in` and `Cache-Control: no-store`.
- Production catalog now contains `proper-noun-lexicon` at USD 29.00. Checkout returned HTTP 303 to `checkout.dodopayments.com/session/...`; invalid verification returned HTTP 200 with `valid:false`, `reason:"invalid"`.
- A service-worker-controlled 390 px session used cache `pnl-shell-e41efea88f09cd2ba56bfe8b8d9151fc353e6143` and reloaded offline with the correct title, one `h1`, “Offline — local tools ready,” and no errors. Release tests proved two build IDs produce distinct cache names and old-cache deletion is present.
- Candidate and production SHA-256 values matched byte-for-byte for `index.html`, JS, CSS, `sw.js`, hero WebP, both legal pages, and `manifest.webmanifest`.
- Live HTML/legal pages/service worker use `no-cache, max-age=0, must-revalidate`; hashed JS/CSS and the hero use `public, max-age=31536000, immutable`.
- Response headers include HSTS, `nosniff`, strict referrer policy, a restrictive CSP, and a Permissions Policy disabling microphone, camera, payment, geolocation, and other unused capabilities.

### Budgets and diagnostics

- Initial assets: JS 11,963 B (4,933 B gzip), CSS 14,703 B (about 4.25 kB gzip), no font payload, hero WebP 62,510 B.
- Lighthouse 12.8.2 mobile: Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 1,768 ms, LCP 1,885 ms, TBT 39 ms, CLS 0.
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, 668 ms browser load, no console errors, correct title/lang/main/alt/button naming.
- `npm run verify:live`: passed the live identity markers, policies, budgets, production catalog, hosted checkout redirect, and invalid-license contract.

## Verification limits

No real $29 purchase, refund, or production-license issuance was performed because that would create an external financial transaction. Valid, restored, daily-cached, revoked, and offline license states passed deterministic browser tests; the real production checkout boundary was verified through hosted-session creation. No speech-provider credentials or private audio corpus were used, so the brief's 25-point real-model recall outcome was not independently measured; output structures were checked against the documented interfaces instead.

## Retest gate

Correct and schema-test the Google Speech export; make CSV import keyboard focusable and operable; repair undersized touch targets and the tablist keyboard pattern. Then repeat clean install/tests/build/package-consumer checks plus live byte identity, keyboard-only import, 390 px target measurements, axe, offline reload, response policies, checkout, and Lighthouse.
