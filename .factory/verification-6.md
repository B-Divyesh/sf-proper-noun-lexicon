# Independent verification 6 — PASS

**Candidate and deployed commit:** `f48acd403523d20edf1c7a5996b911b718827fa2`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Verified:** 2026-08-30 UTC
**Result:** **PASS**

## Cold first read

The cold landing screen plainly says: “Correct dictated names from your vocabulary.” It says it is for people who dictate work and that it turns chosen aliases into exact names without sending transcripts away. Its visible primary action is **Try it with sample data**, immediately explained as loading three terms and one raw transcript. It is one click to `/demo`, which opens an already-seeded review desk with the persistent “Demo — sample data, nothing is saved” banner, Reset demo, and Start for real controls. This meets the plain-words and demo-entry acceptance gate.

## Required claim tests — all passed

`npm ci` completed from the clean candidate checkout (61 packages; no vulnerabilities). Every exact command in `.factory/claims.json` was run separately against the Playwright demo entry point and passed (one test each):

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS — demo storage/edit/reset/exit does not touch a seeded real workspace. |
| `local-privacy` | PASS — correction traffic remained local product-origin traffic. |
| `offline-reload` | PASS — dedicated context reloaded `/demo` offline and corrected sample text. |
| `approved-reversible` | PASS — case-insensitive longest whole alias and exact raw restoration. |
| `model-exports` | PASS — Whisper, Google inline PhraseSet, and Azure phrase list shapes. |
| `free-limit` | PASS — 25-term limit, 26-term rejection, recorded verified-license unlock. |
| `cli-demo` | PASS — compiled `pnl demo` creates its temporary review and all eight outputs. |
| `license-request-policy` | PASS — 24-hour success cache and `Retry-After` suppression fixture. |
| `cli-json` | PASS — machine-readable validation error without prompting. |
| `typed-library` | PASS — documented Rust import/correct/audit/export API example. |

## Clean local release verification

- `npm test`: PASS — 12 Rust unit tests, 1 Rust doctest, 9 Vitest tests, and 44 Playwright checks (desktop plus 390 px mobile).
- `npm run typecheck`: PASS.
- `npm run lint`: PASS — Rust format, Clippy with `-D warnings`, and TypeScript.
- `npm run build`: PASS — repeats the full test suite, builds the release CLI, and produces `dist/site/`.
- Production output budgets: main JS `16,615` bytes, CSS `18,818` bytes, self-hosted hero WebP `62,510` bytes; all are below the stated static-product budgets.
- `cargo package --manifest-path cli/Cargo.toml`: PASS — package verified as `proper-noun-lexicon 0.1.3`, 11 files, 53.6 KiB unpacked / 14.5 KiB compressed. No package was published.

## CLI and library consumer checks

The packaged crate was installed into a fresh Cargo root. The installed binary reported `pnl 0.1.3`; `pnl --json demo` made three approved corrections and emitted the CSV, raw transcript, lexicon, corrected text, audit, Whisper prompt, Google PhraseSet, and Azure phrase-list files in a new temporary directory.

A separate fresh Rust binary depended on the packaged crate and successfully used `import_csv`, `correct`, and `export`. It proved exact raw preservation, two approved corrections, a non-match for `sociobotics`, and a Google payload containing the `phrases` root. `pnl --help` documents the single binary, local-file workflow, `--json`, and no interactive prompt. An invalid `--format unrecognized` request returned a JSON error.

## Live deployment, functional behavior, and privacy

- Local `dist/site/sw.js` and production `sw.js` both contain `pnl-shell-f48acd403523d20edf1c7a5996b911b718827fa2`. SHA-256 also matched for `index.html`, `404.html`, privacy and terms pages, manifest, social preview, and Apple-touch icon. Production therefore matches the requested candidate.
- `npm run verify:live`: PASS — product/catalog identity, $29 USD price, hosted Dodo checkout 303 redirect, invalid-license response, metadata, `/demo`, 404, security policy, immutable hashed assets, and asset budgets.
- `npm run verify:live:browser`: PASS — 1440 px and 390 px, no horizontal overflow or console/page errors, visible first-tab skip link, keyboard correction and rollback, 44 px controls, reduced-motion handling, offline demo reload, same-origin demo traffic, and zero Axe serious/critical findings.
- The factory `verify-url.sh` independently passed: landing `200` in 553 ms and demo `200` in 671 ms; both have title, `lang=en`, exactly one h1, a main landmark, complete image alt attributes, named controls, and no console errors.
- Independent live boundary/recovery check: blank raw text displayed “Paste a raw transcript first.”; `sociobotics` produced “No approved aliases found”; the sample input corrected exactly to `Ask Sociobot whether the Kubernetes API is ready.` with no page errors.
- Fresh cold/demo request logs contained only `https://proper-noun-lexicon.sociobot.in` during normal correction. No analytics, external fonts, transcription endpoints, or vocabulary/transcript egress occurred. The disclosed billing path sends only a license token to `https://api.sociobot.in` when invoked.
- Response policies are present: HSTS, `X-Content-Type-Options: nosniff`, strict referrer policy, restrictive CSP (including only the disclosed billing origin in `connect-src`), and permissions policy. HTML and `sw.js` revalidate; hashed JS/CSS use `public, max-age=31536000, immutable`.
- PWA update behavior passed independently: after seeding an obsolete `pnl-shell-obsolete-verifier` cache, unregistering/reloading installed the candidate worker and left only `pnl-shell-f48acd403523d20edf1c7a5996b911b718827fa2`. Offline `/demo` reload and correction also passed.

## License verifier rate policy

The documented client policy (one successful automatic verification cached for 24 hours; honor `Retry-After`) is covered by its claim test. A fresh bounded live single-client probe of the disclosed verifier made 31 invalid-token requests: requests 1–30 returned `200`; request 31 returned `429` with `Retry-After: 4`. Thus the observed allowance is 30 consecutive requests before rate limiting in this probe, and the required response behavior is present. No payment, valid license issuance, or refund was attempted.

## Findings

No P0, P1, or P2 defects found. The product satisfies the researched brief as a local vocabulary CLI/library and review UI: approved aliases only, documented model-bias exports, raw-text audit/rollback, isolated sample workflow, and no default corpus transmission.
