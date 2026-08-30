# `pnl`

The command-line companion to [Proper Noun Lexicon](https://proper-noun-lexicon.sociobot.in). Import approved terms and spoken aliases, export speech-engine hint files, correct transcripts without guessing, and restore the exact raw input from a local audit.

```sh
pnl demo
pnl import names.csv --output names.pnl.json
pnl correct --lexicon names.pnl.json --input raw.txt --output reviewed.txt --audit review.json
pnl rollback review.json --output raw-restored.txt
```

`pnl demo` embeds the sample files in `examples/`, runs the full workflow in a new temporary directory, and prints that path. It creates a portable lexicon, corrected text, rollback audit, and all three model exports.

See the repository README for the complete contract and formats.

## Library API

The crate exposes the same local workflow to Rust programs:

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

`pnl export --format google-speech` writes one inline Google Cloud Speech
`PhraseSet` object. Insert it into
`RecognitionConfig.adaptation.phraseSets[]` in the recognition request.
