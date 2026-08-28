# Visual thesis — Luminous lexical observatory

Proper Noun Lexicon treats a private vocabulary as a field of precisely aligned signals, not a contact database. The visual system is a **luminous glass data landscape**: a deep ink workspace, translucent panes, and fine cyan routes linking a spoken alias to its approved written form. It feels technical and trustworthy without looking like a generic admin dashboard.

## Palette

- `ink-950` `#071117`: page background, explicitly dark/single-mode to evoke a private offline instrument.
- `ink-900` `#0b1922`: raised work surface.
- `glass` `rgba(18, 42, 53, .72)`: panels; the background remains visible enough to communicate depth.
- `paper` `#f2fbfb`: primary text (contrast > 14:1 on ink).
- `mist` `#a9c3c7`: secondary text (contrast > 7:1 on ink).
- `signal` `#67f5d2`: primary action and focus (dark text `#06221c`, contrast > 11:1).
- `violet` `#b9a8ff`: approved corrected tokens and secondary signals.
- `amber` `#ffc86a`: warnings.
- `danger` `#ff8f98`: errors/removals.
- `success` `#72e59b`: confirmed local state.

Color is never the sole state indicator; every status also has an icon or label. This is intentionally a single dark treatment: the image, glass layers, and comparison highlights depend on an instrument-panel night field. Native controls explicitly adopt `color-scheme: dark`.

## Type

- Display and body: the system sans stack (`Inter` where installed, `ui-sans-serif`, `system-ui`) for zero font payload and clean utility reading.
- Data and terms: the system mono stack (`ui-monospace`, `SFMono-Regular`, `Consolas`) so acronyms, aliases, offsets, and command examples scan as exact data.
- Scale: 12, 14, 16, 20, 28, and clamp(40–68) px. Body is never below 16 px. Long prose is capped at 68 characters.

## Spacing and shape

An 8 px base rhythm with 4 px fine adjustments. Main gutters are 20 px on phone and 40–64 px on larger screens. Glass planes use 18–24 px radii, while inputs and buttons use 10–12 px radii. A bright 1 px upper edge and soft 24 px shadow create depth; cards appear only for independent tools or records.

## Interaction grammar

The main flow is explicit: **1 Add vocabulary → 2 Paste raw text → 3 Review changes → 4 Export**. Segmented tabs slide between the workspace and model exports. Term rows appear where entered, and correction chips connect alias to approved text with an arrow. All targets are at least 44 px. Keyboard shortcuts: `Ctrl/Cmd+Enter` applies corrections; `Ctrl/Cmd+Z` restores raw text while focus is outside an editor.

## Motion policy

UI transitions last 180–240 ms and animate only opacity and transform. A corrected token blooms once from its source position; panes enter with a shallow vertical offset. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and smooth scrolling are removed and state changes become instant opacity swaps.

## Asset plan and provenance

- `site/public/lexical-landscape.webp`: original AI-generated atmospheric hero plate, made for this product with `/opt/fleet/lib/gen-image.sh` using the factory `factory-image` deployment on 2026-08-28. Prompt: “Abstract luminous glass data landscape for a privacy-first proper noun pronunciation lexicon: floating translucent phonetic tokens connected by precise mint light paths, deep ink observatory background, hints of waveform contours and ordered index cards, elegant editorial 3D illustration, cyan mint and soft violet accents, wide cinematic composition with generous dark negative space on the left for interface copy, no people, no letters, no words, no logos, no watermark.” Converted locally to WebP at quality 78; final size 64 KB. Generated imagery is used only as an explanatory atmosphere behind the mapping demo.
- Icons are original inline SVG strokes assembled locally from simple geometric primitives; no external asset library.

The hero’s connected token forms directly explain the product: speech fragments become stable, approved names. The decorative layer never carries required information.
