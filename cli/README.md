# `pnl`

The command-line companion to [Proper Noun Lexicon](https://proper-noun-lexicon.sociobot.in). Import approved terms and spoken aliases, export speech-engine hint files, correct transcripts without guessing, and restore the exact raw input from a local audit.

```sh
pnl import names.csv --output names.pnl.json
pnl correct --lexicon names.pnl.json --input raw.txt --output reviewed.txt --audit review.json
pnl rollback review.json --output raw-restored.txt
```

See the repository README for the complete contract and formats.

`pnl export --format google-speech` writes one inline Google Cloud Speech
`PhraseSet` object. Insert it into
`RecognitionConfig.adaptation.phraseSets[]` in the recognition request.
