# Verification 5 handoff — FAIL

**Candidate requested:** `8f32bb8d7afc7895496f16c010cdf3f4a4ddfd4c`
**Live URL:** <https://proper-noun-lexicon.sociobot.in/>
**Verification report:** [verification-5.md](verification-5.md)

This candidate is **FAIL** and must not be released. The requested object is absent locally and from `origin`; live assets instead byte-match `8f32bb20e1d8d6c8580bdce6905ab09279439299`. The clean checkout has no `.factory/claims.json`; the first screen has no `Try it with sample data` action; and neither the web product nor the CLI supplies the required isolated, resettable demo. The full evidence, passing checks, and all P0/P1/P2 defects are in [verification-5.md](verification-5.md).

---

# Repair handoff — ready for verification

**Work order:** `proper-noun-lexicon-repair-4`
**Base / verifier report:** `6e7d0e03d01dd7ff4cf834a931b6961a95700f3f` / [verification-4.md](verification-4.md)
**Artifact:** Rust `pnl` CLI with the existing static review desk
**Production URL:** <https://proper-noun-lexicon.sociobot.in/>
**Date:** 2026-08-30 UTC

## Result

All five verifier findings are repaired with direct regression coverage. The original local-only workflow, documented model exports, paid-unlock boundary, PWA behavior, and static deployment class are preserved.

### Repairs

- `pnl correct` now refuses equivalent output/audit targets before it writes either artifact. It resolves `.` and `..`, non-existent leaves, and symlinked parent directories without creating a rejected parent. On Unix it also detects existing hard-link aliases by device/inode. The installed package was retested with `output` and `path-alias/../output`: exit `1`, structured JSON error, no output, no audit, and no intermediate alias directory.
- Browser audits now publish UTF-8 byte offsets, matching the CLI and README contract. The shared Unicode fixture (`👋 socio bot…`) proves `start: 5` and `end: 14`; the browser download regression verifies the actual downloaded audit.
- `--json` now renders Clap validation errors as JSON on stderr, including an invalid enum and missing required output. Normal `--help` and `--version` behavior remains human-readable and exits successfully.
- Invalid persisted workspaces are validated at load. Malformed data is quarantined under `pnl:workspace:recovery:v1`, any recoverable raw transcript remains available, and the UI offers a local download or discard action. The exact `{"entries":[null],"raw":"recover me"}` case no longer produces a page error and manual Add term works immediately.
- The public Rust API now has a compiled crate-level doctest plus copy-pasteable root/package README examples for import, correction, audit preservation, and export.

## Exact regression coverage

- Rust unit tests cover `.` / `..`, symlinked-parent, and hard-link output/audit collisions; rejected collisions leave no target files, and the `..` case leaves no created parent.
- Rust parser tests cover invalid `--format` and missing required arguments in JSON mode.
- `cli/fixtures/unicode-audit.json` is consumed by both the Rust suite and Vitest, so CLI/browser offsets use one fixture.
- Playwright downloads the Unicode browser audit and asserts byte offsets; it also seeds malformed storage, confirms quarantine/recovery, then adds a term without a page error.
- The public-library doctest is compiled by `cargo test --doc`.

## Verification evidence

### Local clean build

```sh
npm ci
npm test
npm run typecheck
npm run lint
npm run build
cargo package --manifest-path cli/Cargo.toml
```

- `npm ci`: 61 packages, 0 vulnerabilities.
- `npm test`: 11 Rust unit tests, 1 doctest, 8 Vitest tests, and 24 Playwright tests across desktop Chromium and 390 × 844 Chromium passed.
- `npm run typecheck`, strict `cargo fmt`/Clippy through `npm run lint`, and the exact production `npm run build` passed. The build produces `target/release/pnl` and `dist/site/`.
- Production assets: JS 14.12 KB / 5.62 KB gzip; CSS 15.73 KB / 4.40 KB gzip; hero remains 62.51 KB. All are within budget.

### Package and consumer

- `cargo package --manifest-path cli/Cargo.toml --allow-dirty` verified a nine-file `proper-noun-lexicon 0.1.2` crate (the source fixture is included). No package was published.
- The extracted package installed cleanly with `cargo install --path … --root … --locked`; `pnl --version` reported `0.1.2`.
- A separate Rust consumer compiled against the extracted crate and asserted import, approved correction, exact raw preservation, Unicode offsets `5..14`, and Google Speech export.
- The installed CLI imported, corrected, and rolled back the Unicode fixture byte-for-byte. It emitted a JSON error and exit `2` for invalid `--format`; the installed `..` alias collision emitted a JSON error and no target/intermediate artifact.

### Production deployment and live checks

- Deployed `dist/site/` with `/opt/fleet/lib/deploy-static.sh proper-noun-lexicon dist/site`; Azure deployment ID: `da1f8409-8233-4cd5-ad35-a2979540d027`. The custom domain reached HTTPS 200.
- `npm run verify:live` passed: catalog price USD 29.00, hosted checkout HTTP 303, and the documented invalid-license verifier response.
- `/opt/fleet/lib/verify-url.sh` passed: 200, 863 ms browser load, title/lang, one `h1`, `main`, image alt text, named controls, and no console errors.
- Local and live SHA-256 values matched for eight files: index, JS, CSS, service worker, hero, privacy, terms, and manifest. The worker was stamped with the deployed Git release ID.
- Live desktop (1440 × 1000) and mobile (390 × 844) review flows corrected the Unicode fixture without console/page errors, had no horizontal overflow, and Axe reported zero violations. Normal-flow request capture saw only `https://proper-noun-lexicon.sociobot.in`; vocabulary and transcript never left the origin.
- Keyboard smoke test passed live: first Tab focused the designed Skip link (`rgb(103, 245, 210) solid 3px`), Ctrl+Enter corrected the sample, and ArrowRight selected Google Speech.
- A fresh service-worker-controlled 390 px context had only the deployed cache, reloaded offline, and displayed “Offline — local tools ready” with no errors.
- Live responses include HSTS, `nosniff`, strict referrer policy, restrictive CSP, Permissions Policy, HTML/SW revalidation, and immutable hashed asset caching.
- Lighthouse 12.8.2 mobile: **99 Performance, 100 Accessibility, 100 Best Practices, 100 SEO**. FCP 1.5 s, LCP 1.7 s, TBT 0 ms, CLS 0, total transfer 77 KiB.

## Known limits / next steps

- No real $29 charge, refund, or issued production license was created; this avoids an external financial transaction. The hosted checkout boundary, invalid verifier, and deterministic browser license states are covered.
- The brief’s 25-point recall improvement needs a customer pilot with a real 100-name vocabulary and configured speech system. The product deliberately does not collect that corpus.
- To publish the CLI, the factory should run `cargo package --manifest-path cli/Cargo.toml` from a clean checkout and publish the resulting `0.1.2` crate; do not publish from this worker.
