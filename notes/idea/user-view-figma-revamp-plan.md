---
tags: [ui, revamp, figma, user-mode]
topics: [User View Redesign, Figma Design Import, Editor Panel Functionality]
projects: [fnm-pattern-generator]
url: https://www.figma.com/design/nU2fzJd6jPoPGiS2PqK40L/Design---Pattern-Builder-1.0.0?node-id=5-3
aliases: [UserView Revamp, Figma Editor Panel, Chip-to-Param Mapping]
---
# [UI Revamp] User-Mode UI Revamp from Figma Concept

## Key Takeaways

Revamped `src/views/UserView.jsx` (Category → Template → Editor 3-page flow) based on a Figma concept, improving on it rather than copying it literally. The Figma editor screen showed a chat-style generator panel (MODE toggle, numeric dial, STR/CORNER/RISK/COST chips, keyword input) that doesn't map to the app's real generation model — built as real functionality wired to the actual param model instead of a static reskin. Kept theme adaptive via existing semantic CSS tokens rather than locking to Figma's pure-black canvas.

Related: `notes/idea/ui-user-concept.md` documents an earlier "financial risk quadrant" vision (Solid Foundation / Exotic & High Risk / Safe Haven / Equities & Commodities) that Figma's category card labels ("Structured & Locked" / "Aggressive" / "Safe Haven" / "Active Growth") clearly echo — verbatim overlap on "Safe Haven". This plan intentionally does **not** rename the live `CATEGORIES` data (`foundation/dynamic/minimal/featured` in `gallery.js`) to match, since that's a data-model change with migration implications for existing gallery templates, out of scope for a visual revamp. Worth a dedicated follow-up if the product direction wants to formally adopt the quadrant naming.

## Scope decisions (from user clarification, 2026-07-26/27)

- Editor's chat-style bottom panel → build as **real functionality**, not a static reskin.
- Toolbar icons (pan/eyedropper/crop) → **wire up what's feasible**: eyedropper real, crop decorative (no crop concept exists), pan = default tool state.
- Theme → adaptive via existing semantic tokens (not dark-locked); consistent with the already-started `SURFACE_CARVED`/`SURFACE_RAISED` WIP.
- Fonts → Space Grotesk/Mono already in the stack; only Pixelify Sans is new, scoped narrowly to the dial + keyword input.
- Chip labels (STR./CORNER/RISK/COST) → keep Figma's literal labels, bind to a real-param mapping (see table below).
- Unmapped Figma chrome (history icon, settings icon, CANCEL button) → dropped, not faked.
- Real `CATEGORIES` data → not renamed; only visual treatment (2×2 gradient cards) adopted.

## Confirmed chip → param mapping

| Chip | Param | Behavior |
|------|-------|----------|
| CORNER | `cornerAmount` | toggles `2` (default) ↔ `0` |
| STR. | `overlapChance` | toggles `0` (default) ↔ `1` |
| RISK | `blockMax` | toggles `8` (default) ↔ `4` |
| COST | `midCurve` | toggles `50` (default) ↔ `0` |

Dial is the primary continuous control for `midCurve` (0–100 drag-scrub); COST is a preset shortcut on the same value.

## Files touched

- `src/index.css` — Pixelify Sans import + `--font-pixel` token.
- `src/views/UserView.jsx` — all page/component changes (`CategoryPage`, `TemplatePage`/`TemplateCard`, `EditorPage`, `EditorCanvasArea`, `ColorPairGrid`, `SimpleColorSlots`, new `EditorToolbar`/`ModeToggle`/`MidCurveDial`/`ParamChipRow`/`KeywordPanel`/`matchDictWord`).

## Next Steps

- [ ] Implement per the sequencing in the approved plan (`~/.claude/plans/i-want-to-revamp-lively-wombat.md` at plan time — see journal entry for final as-built state).
- [ ] Consider a follow-up product discussion on whether to formally rename `CATEGORIES` toward the financial-quadrant naming, now that both the original concept note and this Figma independently converge on it.
- [ ] `SimpleColorSlots`, `TextOverlayPanel.jsx`, `ParameterPanel.jsx` still have hand-rolled `Switch`/`Slider`/`ToggleGroup`/`SegGroup` duplicated per-file — candidate for promotion into `src/components/ui/` in a later cleanup pass.
