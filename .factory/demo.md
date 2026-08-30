# Demo contract

## Web demo

- One-click URL: <https://proper-noun-lexicon.sociobot.in/?demo=1>
- Route alias: <https://proper-noun-lexicon.sociobot.in/demo>
- Entry: choose **Try it with sample data** on the first screen.
- Sample: Sociobot, Kubernetes, and API with realistic spoken aliases, plus one raw transcript containing all three.
- Isolation: demo state uses only local-storage keys beginning with `demo:pnl:`. It never reads the real `pnl:workspace:v1` key and does not initialize license verification.
- Reset: **Reset demo** restores the bundled three-term vocabulary and raw transcript.
- Exit: **Start for real** deletes every `demo:pnl:` key before opening the real workspace. Real data is never imported automatically.

## CLI demo

Run:

```sh
pnl demo
# or
pnl --json demo
```

The command embeds `cli/examples/sample-terms.csv` and `cli/examples/raw-transcript.txt`. It creates a unique directory under the operating system's temporary directory. The command writes the sample CSV, raw text, portable vocabulary, corrected text, rollback audit, Whisper prompt, Google PhraseSet, and Azure phrase list. It prints the exact directory and never writes to the current project.

The CLI intentionally leaves that temporary directory in place so the user can inspect the outputs. The verifier removes only the reported directory after inspection.
