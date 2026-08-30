# Adversarial first-read review 2 — FAIL

**Reviewed:** 2026-08-30 UTC  
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>  
**Candidate:** `04277b6e00d4c402494940c71bbcb46640bfe8f9`  
**Contexts:** fresh Chromium at 390 × 844 and 1440 × 1000; clean clone `/tmp/pnl-review-2.Jgxpva`

## Verdict

**FAIL.** One blocking, untested pricing claim remains. All other checks in this round passed.

## Cold first read

Before scrolling, both fresh contexts answered the required questions.

- **What it does:** corrects dictated names by replacing only approved aliases, then lets the user review or export the result.
- **For whom:** “For people who dictate work”.
- **What to click first:** **Try it with sample data**. “Loads three terms and one raw transcript.” says what happens.

The complete job headline, audience sentence, action/result, and all three facts fit in the 390 px viewport. The first-read gate passes.

## Findings

### F-2-1 — BLOCKING — the $29/no-subscription pricing promise is not proved by its listed claim test

**Quote/location:** Landing pricing: “Remove the limit for **$29 once.**” and “**No subscription.**” `.factory/claims.json` repeats the $29 one-time promise in `free-limit`.

**Evidence:** The sole tagged `free-limit` test imports 26 terms, verifies a fixture license, and confirms it can import 26 terms. It never reads `$29`, fetches/validates a recorded product price, checks a billing-plan interval, or asserts “No subscription.” The exact clean-clone command passes, but does not test those promises. `npm run verify:live` separately observed `price_minor: 2900` in the deployed catalog; it is useful deployment evidence, not the manifest’s required tagged sandbox test.

**Why this fails:** A visitor can rely on price and recurring-charge terms. Quantitative/payment claims must have an observable claim assertion. This passing limit test cannot establish either fact, so the page has an untested claim.

**Fix:** Remove “$29 once” and “No subscription,” or add an explicit `@claim:pricing` test (or extend and rename `@claim:free-limit`) using a recorded catalog fixture. It must assert USD `price_minor === 2900`, an explicit non-recurring product field, the visible price, and the license effect. Do not retain “No subscription” unless the fixture proves it.

## Demo and sandbox

**PASS.** The landing action opened `/?demo=1` in one click. Its first screen was already the populated review desk: Sociobot, Kubernetes, API, and “Ask socio bot whether the cuber netties A P I is ready.” The persistent banner says “Demo — sample data, nothing is saved to your workspace.” and exposes **Reset demo** and **Start for real**.

Applying corrections produced all three approved names. Reset restored the source sample. The tagged test seeded a real workspace, edited/reset demo, exited, and confirmed the real workspace was unchanged and demo keys were deleted. `/demo` worked directly. Normal demo correction made only same-origin requests. A dedicated context controlled the service worker, went offline, reloaded the demo, and completed a correction.

The clean-clone CLI demo claim also passed: `pnl demo` uses bundled samples in a new OS temporary directory and validates eight outputs without using the current directory.

## Claims

All exact `.factory/claims.json` commands were run independently from the clean clone:

| Claim | Result |
| --- | --- |
| `demo-sandbox` | PASS |
| `local-privacy` | PASS |
| `offline-reload` | PASS |
| `approved-reversible` | PASS |
| `model-exports` | PASS |
| `free-limit` | PASS, incomplete for F-2-1 |
| `cli-demo` | PASS |
| `license-request-policy` | PASS |
| `cli-json` | PASS |
| `typed-library` | PASS |

Demo, privacy, offline, reversible-correction, export, CLI, JSON, typed-library, and license-request page/README claims have matching tagged coverage. F-2-1 is the remaining untested claim; no other unlisted-claim finding was found.

## Copy audit

Counts are whitespace-separated words after punctuation. Every landing and README prose sentence appears below. Headings, labels, controls, and fragments were also checked: they name their subject/result; there are no mood headings, generic slogans, terminology drift, or non-result-naming controls. “Unlock unlimited” is a literal link to remove the stated term limit. No sentence exceeds 22 words.

### Landing prose

| Location | Sentence | Words |
| --- | --- | ---: |
| Hero | Correct dictated names from your vocabulary. | 6 |
| Hero | For people who dictate work, it turns chosen aliases into exact names without sending transcripts away. | 16 |
| Hero action | Loads three terms and one raw transcript. | 7 |
| Workspace | Turn approved aliases into exact names. | 6 |
| Workspace | Your vocabulary and transcript remain in this browser. | 8 |
| Workspace | Nothing here calls a transcription service. | 6 |
| Recovery | Saved vocabulary was set aside. | 5 |
| Recovery | Download it before you start a new vocabulary. | 8 |
| Empty state | Start with one important name. | 5 |
| Empty state | Add it above, import a CSV, or try a harmless sample set. | 12 |
| Limit | Free workspace: up to 25 terms. | 6 |
| Placeholder | Paste a transcript here. | 4 |
| Placeholder | Only aliases in your vocabulary will change. | 7 |
| Review empty | Your raw and corrected text will appear side by side in the audit. | 12 |
| Review empty | Zero changes is a valid result. | 6 |
| How it works | Review names in three steps. | 5 |
| How it works | Import a CSV or add each name and spoken alias. | 10 |
| How it works | Paste raw text and inspect only the aliases you approved. | 10 |
| How it works | Export the corrected text, raw copy, audit, or model hint. | 10 |
| Model exports | Export speech-model phrase hints. | 4 |
| Model exports | Create a prompt or phrase list for supported speech tools. | 10 |
| Model exports | You can also use the same vocabulary with the offline CLI. | 11 |
| Export empty | Add vocabulary to preview a model-ready export. | 7 |
| Whisper help | Use this text as a Whisper initial prompt. | 8 |
| CLI | Run the same workflow with `pnl`. | 6 |
| CLI | One Rust binary runs the same workflow on local files. | 10 |
| Privacy | Your transcript stays out of our systems. | 7 |
| Privacy | The review desk does not transcribe audio or send vocabulary away. | 11 |
| Privacy | License checks send only the license token to Sociobot. | 9 |
| Pricing | Use 25 terms free. | 4 |
| Pricing | Remove the limit for $29 once. | 6 |
| Pricing | No subscription. | 2 |
| Pricing | The free workspace includes 25 terms, every model export, audits, and rollback. | 12 |
| Pricing | The one-time license removes the term limit on your devices. | 10 |
| License note | Checkout and refunds are handled by Sociobot/Dodo, the merchant of record. | 11 |
| Footer | Correct approved names and keep the raw text. | 8 |
| Demo banner | Demo — sample data, nothing is saved to your workspace. | 10 |

### README prose

| Location | Sentence | Words |
| --- | --- | ---: |
| Introduction | Proper Noun Lexicon is a local vocabulary layer for people who use dictation. | 13 |
| Introduction | It imports approved names and aliases, exports documented phrase hints, and changes only whole aliases. | 15 |
| Introduction | Every correction includes the untouched raw text for rollback. | 9 |
| Demo | Try the isolated sample: | 4 |
| Demo | The demo sends no vocabulary or transcript away from the product origin. | 12 |
| Demo | Its `demo:pnl:` storage never reads or changes the real workspace. | 10 |
| Install | Download a release binary, or build from source with Rust 1.85+. | 11 |
| CLI demo | The sample sources live in `cli/examples/`. | 6 |
| CLI demo | The command creates corrected text, a rollback audit, and all three model exports. | 13 |
| Usage | Create `names.csv` with `term,aliases` columns. | 5 |
| Usage | Separate aliases with `|`. | 4 |
| Google export | The Google Speech file is one documented inline `PhraseSet` object with a `phrases` root. | 14 |
| Google export | Insert that object as an item in `RecognitionConfig.adaptation.phraseSets[]`; it is not a complete recognition request or a standalone `SpeechAdaptation` wrapper. | 20 |
| Correction | Correct a transcript using approved aliases only. | 7 |
| Correction | The audit contains the untouched raw text and every replacement. | 10 |
| JSON | Every command accepts `--json`, including invalid command-line arguments. | 8 |
| JSON | Errors use stderr and a non-zero exit code. | 8 |
| JSON | Commands never prompt interactively. | 4 |
| Contracts | CSV header: `term,aliases`; aliases are `|`-separated. | 6 |
| Contracts | Quoted fields and escaped quotes are supported. | 7 |
| Contracts | Vocabulary JSON: versioned object with `version`, `name`, and `entries`; each entry has a canonical `term` and unique `aliases`. | 18 |
| Contracts | Corrections are case-insensitive, match phrase boundaries, and prefer the longest alias. | 11 |
| Contracts | Terms are never guessed. | 4 |
| Contracts | Audit JSON: versioned object with `raw`, `corrected`, `created_at`, and ordered `changes` containing UTF-8 byte offsets, original text, replacement, and canonical term. | 21 |
| Contracts | The CLI and browser emit the same offsets. | 8 |
| Develop | Requirements: Rust 1.85+, Node 20+, npm 10+. | 7 |
| Develop | `npm run build` tests the CLI and site, builds the release binary, and writes the static site to `dist/site/`. | 19 |
| Develop | Use `npm run dev` for local site work. | 8 |
| Develop | `npm run verify:live` checks the deployed site, its headers, file sizes, product listing, checkout redirect, and invalid-license response. | 18 |
| Develop | It does not make a purchase. | 6 |
| Package | Create a publishable Rust crate without uploading it: | 8 |
| Privacy | The review desk stores vocabulary and drafts in browser local storage. | 11 |
| Privacy | It does not transcribe audio. | 5 |
| Privacy | Normal demo correction makes only product-origin requests. | 7 |
| Billing | Successful automatic license checks are reused for 24 hours. | 9 |
| Billing | If the billing gateway returns `429`, the app follows `Retry-After` and keeps the free or last verified state. | 18 |
| Billing | The browser sends only the license token to the disclosed Sociobot verifier. | 12 |
| References | See `.factory/demo.md`, `.factory/claims.json`, and the site’s Privacy and Terms pages for the test contracts. | 14 |
| License | MIT © 2026 Sociobot (Param Factory). | 6 |
| License | See `LICENSE`. | 2 |

## History retest

Read `.factory/review-1.md`, `.factory/polish-1.md`, and `.factory/handoff.md`. Every earlier finding was checked live and in current code/tests:

| Finding | Confirmation |
| --- | --- |
| F-1-1 | `/ → ?demo=1 → Back` focuses its destination and fills `#route-status` at both viewports. |
| F-1-2 | `/does-not-exist` returns HTTP 404 with complete Open Graph/Twitter metadata. |
| F-1-3 | “View CLI install steps” opens `#cli`, whose first command is `cargo install --path cli`. |
| F-1-4 | Live exports copy says “Create a prompt or phrase list for supported speech tools.” |
| F-1-5 | User collection copy consistently says “vocabulary”; reviewed “lexicon” phrases are absent. |
| F-1-6 | The README verification text is now 18 and 6 words. |

No earlier finding is unfixed, half-fixed, or regressed.

## Structure, accessibility, and visual identity

**PASS except F-2-1.** `/`, `/demo`, `/privacy/`, and `/terms/` return 200. An unknown route returns a designed HTTP 404. Routes have individual titles, descriptions, canonical URLs, Open Graph/Twitter metadata, favicon/apple touch icon, `lang="en"`, one h1, and a main landmark. The title pattern is correct. Live browser checks confirmed 390 px fit/no overflow, 44 px targets, keyboard access, reduced motion, deep links, Back/focus/announcement behavior, no console errors, zero serious/critical Axe issues, and working internal links.

`npm run verify:live` and `npm run verify:live:browser` passed. The demo request log remains same-origin. The ink/glass/cyan/violet observatory surface and documented original artwork match `.factory/design.md` and are not a generic SaaS template.

## Missed leverage

No finding. The brief implies importing approved terms, deterministic correction/review, audit/rollback, documented model exports, and a local CLI. The product provides them. AI would be decorative for this deterministic approved-alias job.

## What would make this perfect

Close F-2-1 by adding an observable tagged price/non-recurring test or removing those pricing promises. Then rerun every claim command, `npm test`, `npm run build`, and the 390 px live demo. With no untested claim, this review can pass.

## Commands

All ten exact `npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:<id>` commands from `.factory/claims.json` passed independently in the clean clone. `npm test` passed; `npm run build` passed and produced `dist/site/` plus the release `pnl` binary. Live checks: `npm run verify:live` PASS; `npm run verify:live:browser` PASS.
