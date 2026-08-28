# Proper Noun Lexicon

Proper Noun Lexicon is a private, portable vocabulary layer for people who use dictation or transcription. It imports approved names and spoken aliases, exports model-ready phrase hints, and applies only explicit corrections while preserving a reversible local audit. No audio or vocabulary is uploaded by the CLI or browser workspace.

Live documentation and review desk: <https://proper-noun-lexicon.sociobot.in>

## Install

Download a release binary, or build from source with Rust 1.85+:

```sh
cargo install --path cli
pnl --help
```

## Usage

Create `names.csv` using `term,aliases` columns. Separate multiple aliases with `|`:

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

Correct a transcript using approved aliases only. The audit contains the untouched raw text and every replacement:

```sh
pnl correct --lexicon team.pnl.json --input raw.txt --output corrected.txt --audit review.pnl-audit.json
pnl rollback review.pnl-audit.json --output restored.txt
```

Every command accepts `--json` for script-friendly status output. Errors go to stderr and return a non-zero exit code. No command prompts interactively.

## CSV and JSON contracts

- CSV header: `term,aliases`; aliases are `|`-separated. Quoted fields and escaped quotes are supported.
- Lexicon JSON: versioned object with `version`, `name`, and `entries`; each entry has a canonical `term` and unique `aliases`.
- Corrections are case-insensitive, match phrase boundaries, and prefer the longest alias. Terms are never guessed.
- Audit JSON: versioned object with `raw`, `corrected`, `created_at`, and ordered `changes` containing byte offsets, original text, replacement, and canonical term.

## Develop and verify

Requirements: Rust 1.85+, Node 20+, npm 10+.

```sh
npm install
npm test
npm run build
```

`npm run build` builds and tests the Rust CLI, creates release binaries, and outputs the static site at `dist/site/`. For site-only development use `npm run dev`; for the exact deploy artifact use `npm run build:site`.

Create a publishable Rust crate without uploading it:

```sh
cargo package --manifest-path cli/Cargo.toml
```

## Privacy and scope

The project has no telemetry. The web workspace uses browser local storage for vocabulary, review drafts, and license state. It does not transcribe audio or train a speech model. See the site’s Privacy and Terms pages for details.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
