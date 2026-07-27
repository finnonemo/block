---
tags: [ui, revamp, figma, user-mode, editor]
topics: [User View Redesign, Figma Design Import, Editor Panel Functionality, Dictionary-driven Generation]
projects: [fnm-pattern-generator]
url: https://www.figma.com/design/nU2fzJd6jPoPGiS2PqK40L/Design---Pattern-Builder-1.0.0?node-id=5-3
aliases: [UserView Revamp, Figma Editor Panel, Chip-to-Param Mapping, Eyedropper Tool]
---
# [UI Revamp] User-Mode UI Revamp from Figma Concept

## Key Takeaways

Revamped all three pages of the User-mode flow (`src/views/UserView.jsx`) based on a Figma concept, improving on it rather than copying it literally per the request. The Figma editor screen showed a chat-style generator panel (MODE toggle, numeric dial, STR/CORNER/RISK/COST chips, keyword input) with no real functionality behind it — built as genuine functionality wired to the app's actual param model and dictionary system instead of a static reskin. Also added a real eyedropper color-sampling tool. Kept theme adaptive via the existing semantic CSS tokens/`SURFACE_CARVED`/`SURFACE_RAISED` idiom rather than locking to Figma's pure-black canvas — verified in-browser that toggling `.dark` on the root still renders correctly (arguably better than the flat mockup).

## What Was Built

### `src/index.css`
- Added a Google Fonts `@import` for Pixelify Sans (matches the existing Space Grotesk/Mono import pattern) and a `--font-pixel` token in `@theme inline`. Scoped to the Shape dial readout and the Keyword input only — not applied globally.

### `CategoryPage` (Browse tab)
- Replaced the bordered-card grid with 2×2 `rounded-3xl` gradient cards (`bg-gradient-to-t` via inline `linear-gradient` style, since Tailwind's JIT scanner can't pick up dynamically-built arbitrary-value classes) using two shades from `BRAND_PALETTE` per category.
- Category → gradient family mapping (semantic best-fit, **not** a rename of the real `CATEGORIES` data): `foundation`→Green, `dynamic`→Orange, `minimal`→Blue, `featured`→Purple.
- Label + icon + count consolidated into a single `bg-background/80 backdrop-blur-sm` pill at the card's bottom edge (deviation from Figma's flat black-on-gradient text, which has a real contrast risk on saturated reds/oranges).
- Header and mode toggle got the glass (`bg-card/80 backdrop-blur-sm`) treatment; Browse/Type-to-Design tabs became a new reusable `PillToggle` component (carved track, raised active pill) instead of underline tabs.
- "Type to Design" search input and result rows got the `SURFACE_CARVED` treatment.

### `TemplatePage` / `TemplateCard`
- Extended the same idiom for consistency (no Figma reference for this screen): `rounded-3xl` cards, `SURFACE_CARVED`, glass header, breadcrumb as a pill chip.
- Fixed a pre-existing outlier: `TemplateCard`'s hardcoded `text-slate-200`/`hover:text-white` replaced with semantic `text-foreground`/`text-primary`.

### `EditorPage` — the bulk of the new functionality
- **Toolbar**: new `EditorToolbar` component above the canvas — Hand (default) / Pipette (eyedropper, real) / Crop (disabled, decorative — no crop concept exists in the app).
- **Header**: added a "Save" pill aliased to the existing `handleDownload` (closest real "save" action already in the file). Dropped Figma's history icon, settings icon, and CANCEL button — no real feature behind any of them.
- **Shape section**: new `MidCurveDial` (pointer-drag scrubber bound to `params.midCurve`, arrow-key accessible, `font-pixel` readout) + new `ParamChipRow` (4 toggle chips). Chip → param mapping (Figma's labels are placeholder text, confirmed with the user to keep the labels but bind them to real params):
  | Chip | Param | Toggle |
  |------|-------|--------|
  | CORNER | `cornerAmount` | 2 ↔ 0 |
  | STR. | `overlapChance` | 0 ↔ 1 |
  | RISK | `blockMax` | 8 ↔ 4 |
  | COST | `midCurve` | 50 ↔ 0 (preset shortcut on the same dial value) |
- **Generate section**: new `mode` state (`'preset'|'keyword'`) toggled via `PillToggle`. Preset mode is the existing `ColorPairGrid`/Custom Colors UI, unchanged. Keyword mode is a new `KeywordPanel` — types a dictionary word, submits, regenerates the pattern in place.
  - Extracted `matchDictWord(dictWords, query)` out of `CategoryPage`'s inline fuzzy-match so both `CategoryPage` and `KeywordPanel` share one implementation.
  - New `applyWord()` in `EditorPage` mirrors `handleSelectWord`'s merge semantics (respects `enabled.{colors,params}`) but applies in place; critically generates off the **locally-computed merged params**, not the (still-stale) `params` state var.
  - `dictWords` is now threaded as a prop from root `UserView` into `EditorPage` (previously only `CategoryPage` received it).
- **Eyedropper**: `EditorCanvasArea` gained a `toolMode`/`onSample` prop pair and a transparent overlay button (active only in eyedropper mode) that maps the click position to a grid cell using the same `row * cols + col` math as `PatternCanvas`'s internal `clientToIdx` — but reads the color straight from the `blocks` buffer already in `EditorPage` state (`0`→colorA, `1`→colorB) rather than touching canvas pixels or `PatternCanvas.jsx` at all. Produces a `pendingSample`, surfaced as a floating "Set as Surface / Set as Background / ×" confirm chip above the canvas.
- **`SimpleColorSlots`**: replaced its own duplicated brand-color object with the shared `BRAND_PALETTE` import, and replaced its active-swatch shadow (which was invalid CSS — `hsl(var(--primary))` wrapping an already-OKLCH variable) with the same `SURFACE_RAISED` + `var(--primary)` idiom used everywhere else.

## Verification

- `npm run build` — clean, no errors.
- Full manual walkthrough in Chrome at both mobile (~500px) and desktop (~1150px) widths: gradient category cards, template grid, editor Preset mode (unchanged behavior), Keyword mode (typed "ocean" against a seeded test dictionary word, confirmed params/colors/dial/chips all updated correctly), all 4 chips toggle and reflect in `params`, dial drag-scrub works, eyedropper sampled a cell and the confirm chip correctly set `colorA`.
- Verified dark-mode token adaptation by toggling `.dark` on `<html>` directly in the browser console — every new surface (gradient card label pill, dial, chips, keyword input, toolbar) re-themed correctly with no hardcoded-color regressions.
- Resizable-sidebar/bottom-sheet responsive behavior at the existing `md:` (768px) breakpoint confirmed unaffected — new content simply lives inside the pre-existing `<aside>`.

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Pixelify Sans import + `--font-pixel` token |
| `src/views/UserView.jsx` | All page/component changes described above — `CategoryPage`, `TemplatePage`/`TemplateCard`, `EditorPage`, `EditorCanvasArea`, `ColorPairGrid` (unchanged, already done in prior session's WIP), `SimpleColorSlots`, plus new `PillToggle`, `EditorToolbar`, `MidCurveDial`, `ParamChipRow`, `KeywordPanel`, `matchDictWord` |

## Follow-up: consolidated to a single page (same day)

After the initial 3-page revamp above, the user redirected: User mode should be **one screen only** (Figma node `150:178`, "Web"), not a 3-page Category → Template → Editor flow, with layout matching Figma's actual structure 100% (a single centered narrow column — header, floating toolbar, square canvas, one console card below — not the app's previous resizable split-pane sidebar+canvas layout). Functionality stayed mine to "re-imagine and improve."

**Removed entirely**: `CategoryPage`, `TemplatePage`, `TemplateCard`, the `page` state router in root `UserView`, the gallery/`CATEGORIES` browsing feature in User mode (imports `CATEGORIES`, `loadGallery`, `fetchSharedGallery`, `mergeGalleries`, `QuadPatternSVG`, `decodeSeed`, `extractBlockGroups` all dropped from this file). Also removed the resizable-sidebar drag-handle state/effects (`panelWidth`/`isResizing`/`isMobile`/`asideRef`, `fnm-sidebar-width` localStorage key) — there's no more a distinct side panel to resize in a single-column layout. `AdminView.jsx` has its own separate copy of that same pattern and was not touched.

**Renamed** the sole remaining component from `EditorPage` to `PatternBuilder` — it's no longer "page 3," it's the entire app. Root `UserView` is now just a thin dictionary-loader wrapper around it.

**New layout** (`PatternBuilder`): everything wrapped in `min-h-screen flex flex-col items-center` → `w-full max-w-[480px]` column, matching Figma's centered narrow "Web" composition (the desktop variant is just the mobile column centered with empty space on either side, not a wider two-pane layout). Header, toolbar+canvas, and one console card all stack vertically inside that column. `EditorCanvasArea` was refactored so the aspect-square measurement wraps only the canvas itself (`containerRef` on a `w-full aspect-square` box, width-only sizing) rather than the whole card — wrapping the *entire* card in `aspect-square` first was a bug caught in review, since it would have clipped the export-size caption below the canvas.

**No more incoming `template`**: since there's no gallery/dictionary selection step before landing on the editor, `PatternBuilder` now generates a fresh random pattern from `DEFAULT_PARAMS` on mount (computed once via a lazy `useState` initializer) rather than deriving initial state from a `template` prop.

**Header re-designed**: dropped the now-meaningless "back" arrow (nothing to go back to) in favor of a brand mark + a live pattern name (updates automatically when a preset color pair or keyword word is applied — doubles as the download filename, replacing the old `template.name` source). The "Admin" mode-switch button (previously on `CategoryPage`) moved into this header as a small icon button next to Save.

**Actions decluttered**: the header's "Save" button already covers SVG download, so the bottom action list dropped the separate Download icon button, keeping just Generate Variation + Copy SVG.

**Verified in-browser**: confirmed the OS-driven dark mode (an inline script in `index.html` toggles `.dark` off `prefers-color-scheme` — missed in the original file exploration, since it's not in any `.jsx`/`.js` file) renders the whole new layout correctly; confirmed desktop shows a genuinely centered narrow column with symmetric empty margins; confirmed mobile is identical structure at full width; confirmed keyword lookup, chip toggling, and the dynamic header name all still work end-to-end.

## Follow-up 2: tightened row-order fidelity against Figma (same day)

A second review pass compared `PatternBuilder`'s console card directly against Figma node `150:178` row-by-row and closed several remaining structural gaps:

- **Row order now matches Figma exactly**: mode pill row → 3-cell dial row (reset / screen / commit, replacing Figma's cancel / dial / confirm-arrow with real actions) → 4-chip row → mode-specific content (color grid or keyword input). Previously the mode-toggle row sat *after* the dial+chips instead of before, and there was an extra "Shape" label Figma doesn't have — removed.
- **Dial row reshaped to Figma's 3-cell proportions**: added a "Reset" button (left, resets `midCurve` to 50 — a real, useful stand-in for Figma's CANCEL, rather than a no-op) and moved "Generate Variation" into the right-hand cell (was a separate full-width button at the bottom) — this is exactly Figma's confirm-arrow slot, and RefreshCw is a more honest icon for "regenerate" than a fake keyboard-return glyph would've been.
- **Chip row height/alignment matched**: `ParamChipRow` cells grew from a slim `h-9` bar to `h-20` with bottom-anchored labels (`items-end`), matching Figma's chunky bottom-labeled console-key look instead of a flat pill-button strip.
- **Toolbar rounding corrected**: Figma's active tool (Hand) is square-ish (`rounded-lg`) while inactive tools (Pipette/Crop) are fully round (`rounded-full`) — `EditorToolbar` previously used uniform `rounded-lg` for all three.
- **Added the "+" shuffle button** in `KeywordPanel`, filling Figma's "Add" cell with a real action (`handleShuffleWord`: picks a random dictionary word and applies it) instead of leaving it out — closes the last structural gap in the input row (now `+` / input / submit, matching Figma's Add / CHINA-input / arrow-up exactly).
- Bottom actions simplified to just "Copy SVG" now that Generate Variation moved into the dial row.

Verified in-browser: mode row, dial row, chip row, and (in Keyword mode) the input row with working shuffle button all confirmed against the Figma screenshot side-by-side.

## Follow-up 3: fixed-viewport sticky/floating console (same day)

The user clarified "redesign following Figma visual design, size/position" and specifically: **the console card must be sticky and floating**, not scroll away with the page. Compared against Figma node `150:276`/`150:178` again — Figma's actual box model is a fixed-height frame (`Toolbar` shrink-0 → `Canvas` `flex-[1_0_0]` → `Chat Section` shrink-0), not a scrolling page. The previous implementation had the console inside normal document flow, so on a tall Preset-mode view it would scroll out of sight below the fold.

**Root layout switched from scrolling page to fixed viewport**: `min-h-screen` → `h-dvh ... overflow-hidden` on the root; the `max-w-[480px]` inner wrapper gained `h-full min-h-0`. `<main>` (toolbar+canvas) is now `flex-1 min-h-0` so it fills exactly whatever space the console doesn't use — this is a direct match for Figma's `Canvas` frame being `flex-[1_0_0]` while `Chat Section` is fixed.

**Console section is now the sticky/floating bottom bar**: `shrink-0`, so it's structurally impossible for it to scroll away (the page itself has no scrollbar — verified via `document.documentElement.scrollHeight === clientHeight` in-browser). Capped at `max-h-[45dvh]` with its own `overflow-y-auto`, so an expanded Preset "Custom Colors" section (the tallest possible content) scrolls *inside the card* instead of pushing the canvas off-screen or shrinking it to nothing — verified in-browser at both mobile (414px) and desktop (1280px) widths: expanding Custom Colors scrolled only the card's own content while the header/toolbar/canvas stayed completely fixed in place.

**`EditorCanvasArea` sizing logic reverted** to measuring both width *and* height (`min(width, height)` of a `flex-1 min-h-0` inner box), same approach as the very first pre-single-page implementation — appropriate again now that the card has a real, flex-constrained height rather than page-driven `aspect-square` sizing (which was correct for the interim scrolling-page version but wrong for this fixed-viewport one).

**Size/position tightened to Figma's literal pixel values** (previously approximated): canvas section padding `px-12 py-6` (Figma's `px-48 py-24`) with `gap-3` (`gap-12`); floating toolbar icon gap `gap-4` (`gap-16`); dial-row side cells (`Reset`/`Generate`) and chip-row cells resized from `w-16 h-20`/`h-20` to `w-24 h-24`/`h-24`, matching Figma's `96×96` cells exactly (previously `64×80`/`80`).

## Follow-up 4: stripped to strict Figma parity (same day)

The user asked to remove the Preset/Keyword mode toggle and the Copy SVG button entirely, following the Figma design strictly — both were value-adds with no Figma equivalent (Figma only ever shows the keyword-input row, never a color-swatch grid or a copy action).

**Removed**: `mode` state and the `PillToggle` mode switcher; `ColorPairGrid` and `SimpleColorSlots` (both their usages and their component definitions — dead code deleted, not just unwired); `showColorPicker` state and the "Custom Colors" collapsible section; `handleSelectPair`; `copyStatus` state, `handleCopy`, and the Copy SVG button. Also removed the now-fully-unused `PillToggle` component definition (had no other callers) and unused imports (`COLOR_PAIRS`, `BRAND_PALETTE`, `copySVGToClipboard`, `Check`, `Copy`, `ChevronUp`, `ChevronDown`).

**Kept**: `KeywordPanel` is now unconditionally rendered (was one of two tabs, now the only content in that slot) — it remains the sole way to change colors/pattern from the console, alongside the eyedropper tool (unaffected, separate toolbar icon). The "GENERATE" pill at the top of the console stays but is now a static label + status dot (no click handler) — matches Figma's non-interactive MODE pill, since there's nothing left to toggle between.

Verified in-browser: console card now shows exactly four rows (mode pill → dial row → chip row → keyword input row) with no tabs and no Copy SVG button; shuffle "+" and keyword submit both still work end-to-end (dial/chips/header all update correctly); Save still downloads; layout still fits one viewport with no page scroll. `npm run build` clean, bundle size dropped slightly from the dead-code removal.

## Follow-up 5: literal pixel-match to an exported Figma PNG (same day)

The user exported the Figma design as a PNG and asked for exact visual fidelity, overriding the earlier "stay adaptive via semantic tokens" decision **for this screen specifically**. Every console/canvas surface switched from theme tokens (`bg-card`, `border-border`, `SURFACE_CARVED`/`SURFACE_RAISED` built from `color-mix`) to the literal Figma hex values: `bg-black` root, `#161617`/`#313131` console card, `#1d1d1d` + `border-2 border-black` for the MODE pill/dial screen/chip cells, a gray gradient (`#585657`→`#646265`) Reset button, an orange gradient (`#e33305`→`#ff8047`) Generate button, `#181818`/`#323232` shuffle button, white Save/submit buttons, `#3a3a3a` Admin button. `SURFACE_CARVED`/`SURFACE_RAISED` became fully unused after this and were deleted (not left as dead code).

Also fixed comparing directly against the export: the canvas was wrapped in an extra `bg-card border rounded-3xl p-4` card that has no Figma equivalent — removed. The canvas square now sits directly on the black page with `rounded-[24px]` + Figma's literal shadow (`rgba(0,0,0,0.12)`) applied straight to it; the export-size caption is now plain white/40 text, no pill background.

Chip active-state (no literal Figma spec for "on") kept as white-bg/black-text — verified in-browser this reads clearly against the dark inactive cells.

Verified in-browser (fresh tab, after a CDP screenshot hiccup on the reloaded original tab — page itself was responsive, just a transient capture issue): zoomed comparison of the dial row against the source export is near-identical; keyword submit, shuffle, and header pattern-name update all still function correctly with the new colors. `npm run build` clean.

**Known open item from the code-review pass earlier this session** (not addressed here, out of scope for this visual-only change): `seed` state in `PatternBuilder` is set but never read (`no-unused-vars` per `npm run lint`) — dead leftover from the old template-driven flow.

## Follow-up 6: pushed toward real skeuomorphism (same day)

The user asked to push the visual language further toward skeuomorphism with "real texture." The previous literal-color pass (Follow-up 5) got the flat colors right but had simplified away Figma's own multi-layer inset-shadow "Surface" recipes — this pass restores and extends them:

- New shadow-recipe constants: `EMBOSS_DARK`/`EMBOSS_GRAY_GRADIENT`/`EMBOSS_ORANGE_GRADIENT`/`EMBOSS_WHITE` (raised-key look: dark shadow bottom-right, bright highlight top-left, soft ambient tint — ported from Figma's exact `rgba` values for the dark/gray/orange/generic surfaces) and `RECESSED_SCREEN`/`RECESSED_INPUT` (the inverse, for the dial screen and keyword input, so they read as pressed *into* the material like glass rather than rising out of it like a key).
- Applied across every interactive surface: toolbar active Hand button, MODE pill, Reset/Generate dial-row buttons, chip cells (both active/inactive states — active got its own lighter `EMBOSS_WHITE` recipe), shuffle "+" button, submit arrow, Save button, Admin button, and the eyedropper confirm chip.
- `SHEEN_DARK` — a subtle top-to-bottom gradient (`#232323`→`#1a1a1a`) applied under flat dark cells instead of a flat single hex, so they read as molded plastic catching ambient light rather than a flat color fill.
- Dial readout got a subtle `text-shadow` glow on the digits — a classic backlit-LCD skeuomorphic touch.
- MODE pill's status dot got a matching `box-shadow` glow in its own live `colorA` color (kept the existing functional binding, just added the glow).
- Added a bezel: the canvas is now framed in an 8px dark metal-gradient frame (`linear-gradient(145deg, #2e2e2e, #0a0a0a)`) with an inset shadow on the inner screen, like the pattern is "mounted" in a device rather than floating on a flat card. Had to shrink `PatternCanvas`'s actual pixel size by `BEZEL*2` to fit inside the frame without changing the outer footprint the `ResizeObserver` already measures, and adjust the eyedropper's cell-math to use the new inner size instead of the full frame size.
- Subtle radial-gradient vignette added to the page background (`rgba(255,255,255,0.05)` fading from top-center) for a soft overhead-light feel instead of flat black.
- Active buttons got `active:translate-y-px` (Reset/Generate) for a physical "press down" micro-interaction on click.

**Not yet verified in-browser**: the Chrome extension disconnected mid-session and didn't reconnect after two retries. `npm run build` and `npx eslint src/views/UserView.jsx` are both clean (only the pre-existing known `seed`-unused issue). Values are direct ports of Figma's own documented shadow recipes for elements Figma specifies, plus reasoned extensions (bezel, glow, sheen) for elements it doesn't — should be visually verified next session before considering this done.

## Open Follow-ups (not in scope this pass)

- `notes/idea/ui-user-concept.md` documents an earlier "financial risk quadrant" vision (Solid Foundation / Exotic & High Risk / Safe Haven / Equities & Commodities) that the Figma's category labels echoed. Now moot for User mode specifically, since the category/gallery browsing step was removed entirely in the follow-up below — `CATEGORIES` and the gallery browsing UI still exist and are unchanged in `AdminView.jsx`.
- `TextOverlayPanel.jsx` and `ParameterPanel.jsx` (Admin-only) still have their own hand-rolled `Slider`/`ToggleGroup`/`Switch`/`SegGroup`, duplicated from each other and now conceptually overlapping with `UserView`'s new `PillToggle`/`MidCurveDial`. Candidate for consolidation into `src/components/ui/` in a later pass.
- The Figma "CANCEL" state (an undo/pending-edit concept) was deliberately not built as a real undo stack — its slot is now filled by "Reset to default" instead, a simpler and more honest real action.
