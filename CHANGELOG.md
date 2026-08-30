# Changelog

## 0.1.2 — 2026-08-30

- Refuse correction output/audit aliases before writing, including `.`/`..`, symlinked-parent, and hard-link paths.
- Emit UTF-8 byte offsets from browser audits to match the CLI contract.
- Return structured JSON for `--json` command-line validation errors.
- Quarantine malformed browser workspace data with a local recovery download instead of throwing on load.
- Add a compiled public-library example and shared Unicode audit fixture coverage.

## 0.1.1 — 2026-08-28

- Emit Google Speech exports as documented inline `PhraseSet` objects.
- Make CSV import fully operable by sequential keyboard navigation.
- Add arrow-key navigation to export tabs and 44 px mobile link targets.

## 0.1.0 — 2026-08-28

- First release of the `pnl` CLI with CSV import, model exports, approved-alias correction, JSON output, and raw-text rollback.
- Offline browser review desk, CSV import/export, model payload export, local audit, and one-time license unlock.
