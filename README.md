# Proper Noun Lexicon

Proper Noun Lexicon is a local vocabulary layer for people who use dictation. It imports approved names and aliases, exports documented phrase hints, and changes only whole aliases. Every correction includes the untouched raw text for rollback.

Try the isolated sample: <https://proper-noun-lexicon.sociobot.in/demo>

The demo sends no vocabulary or transcript away from the product origin. Its `demo:pnl:` storage never reads or changes the real workspace.

## Install

Download a release binary, or build from source with Rust 1.85+:

```sh
cargo install --path cli
pnl --help
```

Run the bundled sample without preparing files:

```sh
pnl demo
# Prints a new temporary directory containing the complete review.
```

The sample sources live in `cli/examples/`. The command creates corrected text, a rollback audit, and all three model exports.

## Usage

Create `names.csv` with `term,aliases` columns. Separate aliases with `|`:

```csv
term,aliases
Sociobot,socio bot|soshio bot
Kubernetes,cuber netties|kube er net ease
API,A P I
```

Import and inspect a portable lexicon:

```sh
pnl import names.csv --output team.pnl.json
pnl list --lexicon team.pnl.json
```

Export documented phrase/prompt payloads for a transcription engine:

```sh
pnl export --lexicon team.pnl.json --format whisper --output whisper-prompt.txt
pnl export --lexicon team.pnl.json --format google-speech --output phrase-set.json
pnl export --lexicon team.pnl.json --format azure-speech --output phrase-list.json
```

The Google Speech file is one documented inline `PhraseSet` object with a
`phrases` root. Insert that object as an item in
`RecognitionConfig.adaptation.phraseSets[]`; it is not a complete recognition
request or a standalone `SpeechAdaptation` wrapper.

Correct a transcript using approved aliases only. The audit contains the untouched raw text and every replacement:

```sh
pnl correct --lexicon team.pnl.json --input raw.txt --output corrected.txt --audit review.pnl-audit.json
pnl rollback review.pnl-audit.json --output restored.txt
```

Every command accepts `--json`, including invalid command-line arguments. Errors use stderr and a non-zero exit code. Commands never prompt interactively.

## Library API

The packaged crate also exposes the same local, typed workflow for Rust tools:

```rust
use proper_noun_lexicon::{correct, export, import_csv, ExportFormat};

fn main() -> Result<(), proper_noun_lexicon::PnlError> {
    let lexicon = import_csv("term,aliases\nSociobot,socio bot\n", "team")?;
    let audit = correct("Ask socio bot.", &lexicon)?;
    assert_eq!(audit.corrected, "Ask Sociobot.");
    assert_eq!(audit.raw, "Ask socio bot."); // Preserve this audit for rollback.
    let phrase_set = export(&lexicon, ExportFormat::GoogleSpeech)?;
    assert!(phrase_set.contains("Sociobot"));
    Ok(())
}
```

## CSV and JSON contracts

- CSV header: `term,aliases`; aliases are `|`-separated. Quoted fields and escaped quotes are supported.
- Lexicon JSON: versioned object with `version`, `name`, and `entries`; each entry has a canonical `term` and unique `aliases`.
- Corrections are case-insensitive, match phrase boundaries, and prefer the longest alias. Terms are never guessed.
- Audit JSON: versioned object with `raw`, `corrected`, `created_at`, and ordered `changes` containing UTF-8 byte offsets, original text, replacement, and canonical term. The CLI and browser emit the same offsets.

## Develop and verify

Requirements: Rust 1.85+, Node 20+, npm 10+.

```sh
npm ci
npm test
npm run build
npm run verify:live
```

`npm run build` tests the CLI and site, builds the release binary, and writes the static site to `dist/site/`. Use `npm run dev` for local site work.
`npm run verify:live` checks the deployed identity, response policy, asset budgets, production catalog entry, hosted-checkout redirect, and invalid-license response without making a purchase.

Create a publishable Rust crate without uploading it:

```sh
cargo package --manifest-path cli/Cargo.toml
```

## Demo, privacy, and billing requests

The review desk stores vocabulary and drafts in browser local storage. It does not transcribe audio. Normal demo correction makes only product-origin requests.

Successful automatic license checks are reused for 24 hours. If the billing gateway returns `429`, the app follows `Retry-After` and keeps the free or last verified state. The browser sends only the license token to the disclosed Sociobot verifier.

See [.factory/demo.md](.factory/demo.md), [.factory/claims.json](.factory/claims.json), and the site’s Privacy and Terms pages for the test contracts.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
