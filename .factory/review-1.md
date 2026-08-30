# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-30 UTC
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Viewports:** fresh Chromium contexts at 390 × 844 and 1440 × 900
**Verdict:** **FAIL** — six findings remain. None blocks trying the product; this is not a PASS because the acceptance rule requires zero findings.

## Cold first read

Before scrolling, both fresh viewports made the essential answer clear.

- **What it does:** corrects dictated names by replacing only approved spoken aliases with chosen spellings; it also exports speech-tool hints and preserves raw text for review.
- **For whom:** “For people who dictate work”.
- **What to click first:** **Try it with sample data**. The adjacent text, “Loads three terms and one raw transcript.”, says what happens next.

The 390 px first screen contained the complete headline, audience sentence, primary action, action result, and the three concise facts. No scroll was required. The first-read gate therefore passes.

## Findings

### F-1-1 — Minor — route changes leave focus on the document body and announce nothing

**Location/evidence:** From `/`, keyboard-focus **Try it with sample data**, activate it, then use Back. Live browser inspection found:

```text
/demo: activeElement = BODY; aria-live text = ""; scrollY = 438
/:     activeElement = BODY; aria-live text = ""; scrollY = 0
```

The URL routes work, but neither the new page heading nor the workspace receives focus, and the existing polite live region is empty. A keyboard or screen-reader user is dropped at document level after navigation and gets no route announcement.

**Concrete fix:** give the route destination heading a temporary `tabindex="-1"`, move focus to it after navigation (or to the visible demo-workspace heading for `/demo`), and announce the destination in the polite live region. Add a browser test for `/ → /demo → Back` that asserts focus and announcement.

### F-1-2 — Minor — the designed 404 lacks Open Graph and Twitter metadata

**Location/evidence:** live `/does-not-exist` correctly returns HTTP 404, title, description, canonical URL, favicon, one h1, and a return path. Its source response has no `og:*` or `twitter:*` tags, unlike `/`, `/privacy/`, and `/terms/`.

**Why this matters:** a shared broken link has an incomplete preview even though the route is otherwise designed.

**Concrete fix:** add `og:type`, `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` to `site/404.html`; test their presence on the live unknown route.

### F-1-3 — Minor — “Install the CLI” describes an action the link does not perform

**Location/evidence:** the first-screen control reads **“Install the CLI”** but its destination is the in-page `#cli` anchor. It only reveals a code example.

**Why a first-time visitor is misled:** on a phone, the label promises installation when it only scrolls to instructions.

**Concrete fix:** rename it **“View CLI install steps”**, or link it to an actual binary/install destination. Add an assertion that the destination supplies the result named by the button.

### F-1-4 — Minor — one landing sentence uses unexplained technical jargon

**Location:** `site/index.html`, Model exports: “Generate inputs for documented phrase-bias interfaces, or use the same lexicon with the offline CLI.”

**Why a first-time visitor is lost:** “phrase-bias interfaces” does not say what file is made or what a dictation user should do with it.

**Concrete rewrite:** “Create a prompt or phrase list for supported speech tools. You can also use the same vocabulary with the offline CLI.”

### F-1-5 — Minor — the same saved collection has two names

**Location/evidence:** the hero says “your vocabulary”; the workspace says “Your **lexicon** and transcript remain in this browser”; the collection heading is “My **lexicon**”; README begins “a local **vocabulary** layer”. The existing copy-audit terminology table itself declares the collection term to be “vocabulary”.

**Why a first-time visitor is lost:** it is not clear whether a lexicon differs from vocabulary, particularly when the product asks the user to save and export it.

**Concrete fix:** reserve “Proper Noun Lexicon” for the product name and use **vocabulary** for the user’s saved collection everywhere. For example, change “My lexicon” to “My vocabulary” and “Your lexicon and transcript…” to “Your vocabulary and transcript…”.

### F-1-6 — Minor — README has a sentence over the 22-word hard limit

**Location:** `README.md:104` (23 words): “`npm run verify:live` checks the deployed identity, response policy, asset budgets, production catalog entry, hosted-checkout redirect, and invalid-license response without making a purchase.”

**Why a reader is slowed down:** it packs six technical checks and a qualification into one sentence.

**Concrete rewrite:** “`npm run verify:live` checks the deployed site, its headers, file sizes, product listing, checkout redirect, and invalid-license response. It does not make a purchase.”

## Demo and sandbox check

**PASS.** Clicking the landing action opened `/demo` in one navigation. At 390 px the first demo screen was already the populated review desk: three terms (Sociobot, Kubernetes, API) and the raw transcript “Ask socio bot whether the cuber netties A P I is ready.” The persistent banner said “Demo — sample data, nothing is saved to your workspace.” and offered **Reset demo** and **Start for real**.

Applying corrections immediately produced “Ask Sociobot whether the Kubernetes API is ready.” with the three visible alias-to-name changes. Reset restored three terms and the original raw transcript; the old corrected DOM is hidden after reset. The live request log contained only `https://proper-noun-lexicon.sociobot.in`; demo storage contained only `demo:pnl:workspace:v1`. The isolated-demo claim test additionally seeded a real workspace, edited and reset demo data, exited demo, and proved that real data remained unchanged.

## Claims check

`.factory/claims.json` exists. A clean clone was made in a temporary directory, `npm ci` was run there, and every exact listed command passed independently:

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

The direct live request log also confirmed same-origin traffic for normal demo correction. The manifest covers the claim-like landing and README statements: sample isolation (`demo-sandbox`), local/no-transcription transfer (`local-privacy`), offline use, approved/reversible correction, three exports, pricing/free limit, CLI workflow, license request policy, JSON errors, and typed library API. No unlisted claim finding is raised.

The CLI demo contract is also present: `pnl demo` is covered by the clean claim test and creates its bundled sample review in a new temporary directory without using the current directory.

## Copy audit

Counts use whitespace-separated words after punctuation. Headings, controls, labels, and fragments are checked separately below; the tables list every prose sentence in the landing markup (including the demo banner and static recovery/empty states) and repository `README.md`. The only hard-length failure is F-1-6. F-1-4 and F-1-5 are the terminology/plain-word failures.

### Landing prose

| Location | Sentence | Words |
| --- | --- | ---: |
| Hero | Correct dictated names from your vocabulary. | 6 |
| Hero | For people who dictate work, it turns chosen aliases into exact names without sending transcripts away. | 16 |
| Hero action | Loads three terms and one raw transcript. | 7 |
| Workspace | Turn approved aliases into exact names. | 6 |
| Workspace | Your lexicon and transcript remain in this browser. | 8 |
| Workspace | Nothing here calls a transcription service. | 6 |
| Recovery state | Saved vocabulary was set aside. | 5 |
| Recovery state | Download it before you start a new lexicon. | 8 |
| Empty state | Start with one important name. | 5 |
| Empty state | Add it above, import a CSV, or try a harmless sample set. | 12 |
| Limit | Free workspace: up to 25 terms. | 6 |
| Limit link | Unlock unlimited. | 2 |
| Raw-text placeholder | Paste a transcript here. | 4 |
| Raw-text placeholder | Only aliases in your lexicon will change. | 7 |
| Review empty state | Your raw and corrected text will appear side by side in the audit. | 13 |
| Review empty state | Zero changes is a valid result. | 6 |
| How it works | Review names in three steps. | 5 |
| How it works | Import a CSV or add each name and spoken alias. | 10 |
| How it works | Paste raw text and inspect only the aliases you approved. | 10 |
| How it works | Export the corrected text, raw copy, audit, or model hint. | 10 |
| Model exports | Export speech-model phrase hints. | 4 |
| Model exports | Generate inputs for documented phrase-bias interfaces, or use the same lexicon with the offline CLI. | 15 |
| Export empty state | Add vocabulary to preview a model-ready export. | 7 |
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

Controls use result-naming verbs except F-1-3. The headings describe their sections; no mood slogan or generic marketing adjective was found. The terminology issue is F-1-5.

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
| JSON output | Every command accepts `--json`, including invalid command-line arguments. | 8 |
| JSON output | Errors use stderr and a non-zero exit code. | 8 |
| JSON output | Commands never prompt interactively. | 4 |
| Contracts | CSV header: `term,aliases`; aliases are `|`-separated. | 6 |
| Contracts | Quoted fields and escaped quotes are supported. | 7 |
| Contracts | Lexicon JSON: versioned object with `version`, `name`, and `entries`; each entry has a canonical `term` and unique `aliases`. | 18 |
| Contracts | Corrections are case-insensitive, match phrase boundaries, and prefer the longest alias. | 11 |
| Contracts | Terms are never guessed. | 4 |
| Contracts | Audit JSON: versioned object with `raw`, `corrected`, `created_at`, and ordered `changes` containing UTF-8 byte offsets, original text, replacement, and canonical term. | 21 |
| Contracts | The CLI and browser emit the same offsets. | 8 |
| Develop | Requirements: Rust 1.85+, Node 20+, npm 10+. | 7 |
| Develop | `npm run build` tests the CLI and site, builds the release binary, and writes the static site to `dist/site/`. | 19 |
| Develop | Use `npm run dev` for local site work. | 8 |
| Develop | `npm run verify:live` checks the deployed identity, response policy, asset budgets, production catalog entry, hosted-checkout redirect, and invalid-license response without making a purchase. | 23 |
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

## Structure, accessibility, and links

**Passing checks:**

- `/`, `/demo`, `/privacy/`, and `/terms/` returned 200; an unknown route returned the designed `404.html` with HTTP 404. Every page checked has `lang="en"`, one h1, a main landmark, title, description, canonical URL, favicon, and Apple touch icon. `/demo` updates its browser title to `Demo — Proper Noun Lexicon`.
- All landing links were crawled. Product and GitHub links returned 200; the declared purchase endpoint returned the expected HTTP 303 without creating a purchase.
- Production HTML has a restrictive CSP, `frame-ancestors` as a response header, HSTS, nosniff, referrer policy, and permissions policy. Hashed JavaScript and the hero image return `Cache-Control: public, max-age=31536000, immutable`; `sw.js` returns no-cache.
- The dark observatory/glass system is visually product-specific and follows `.factory/design.md`; it is not a generic centered-card SaaS layout. The 390 px screen has no horizontal overflow and exposes 44 px primary targets.

F-1-1 and F-1-2 remain the route/metadata exceptions.

## History retest

All earlier `.factory/verification*.md` files and the prior handoff were read. There are no earlier `review-*` or `polish-*` files. The prior findings were rechecked in live behavior and current code/tests rather than accepted from their status labels:

| Earlier finding | Current confirmation |
| --- | --- |
| Staging billing, unavailable checkout, and undocumented rate handling | `site/src/app.ts` uses `https://api.sociobot.in`; live checkout returns 303; `license-request-policy` passed from a clean clone. |
| CLI could leave corrected output without a rollback audit | Current Rust suite passed `correction_is_not_emitted_when_its_audit_destination_is_unwritable`, plus path-alias safety tests. |
| Hashed cache policy, stale service-worker cache, and response hardening | Live assets are immutable, the worker cache is release-stamped, and the live headers include CSP/Permissions Policy. |
| Google PhraseSet, CSV keyboard access, undersized links, and tab keyboard behavior | `model-exports` passed; the full 44-test Playwright suite passed current keyboard, target-size, and tab tests. |
| Browser audit byte offsets, JSON CLI errors, malformed saved state, and missing typed API example | Current full suite passed Unicode-offset, parser JSON, recovery, and doctest coverage; `cli-json` and `typed-library` passed independently. |
| Missing manifest, one-click demo, isolated browser/CLI samples, and 404/metadata basics | Current manifest has ten executable claims; all ten passed independently; `/demo`, `demo:pnl:` isolation, `pnl demo`, and designed 404 all work. F-1-2 is the remaining 404 social-metadata detail. |
| The old unavailable candidate SHA noted in verification 5 | The currently checked-out, buildable candidate and current live artifact are the relevant release state; this historical unavailable-object condition cannot recur as a product behavior. |

## Missed leverage

No finding. The brief implies import, export, approved-name correction, audit/rollback, and an isolated way to try them. The product supplies CSV import/export, three documented model exports, local audit/rollback, web demo, and `pnl demo`. An AI action would be decorative here: the job is deterministic replacement using user-approved vocabulary, and the brief does not imply model inference.

## What would make this perfect

Resolve F-1-1 through F-1-6: announce and focus routes, complete 404 social metadata, make the CLI control truthful, replace export jargon, use one collection term, and split the long README verification sentence. Then rerun the clean claim commands, `npm test`, `npm run build`, the 390 px cold/demo flow, unknown-route metadata check, and the keyboard `/ → /demo → Back` focus test. Only then should this review move to PASS.

## Verification commands run

From a fresh clone in a temporary directory:

```sh
npm ci
# each exact command from .factory/claims.json, run separately
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:demo-sandbox
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:local-privacy
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:offline-reload
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:approved-reversible
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:model-exports
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:free-limit
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:cli-demo
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:license-request-policy
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:cli-json
npx playwright test -c site/playwright.config.ts --project=desktop-chromium --grep @claim:typed-library
npm test
npm run build
```

All commands passed.
