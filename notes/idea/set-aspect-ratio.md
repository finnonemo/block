---
tags: feature, canvas, grid
topics: aspect-ratio, grid-scaling, state-management
projects: fnm-pattern-builder-v01
---

# Set Aspect Ratio — Feature Note

## Concept

The **Set Aspect Ratio** feature controls the shape of the canvas that the user paints patterns on. Every grid in the Pattern Builder is a flat array of color-index cells arranged in `cols × rows`. Changing the ratio reshapes that canvas to match a target output format — so what gets exported fills the frame correctly without stretching or letterboxing.

### Why it matters

Finnomena publishes patterns across multiple surfaces:
- **Social feed posts** → 1:1 (square), 4:5 (portrait feed), 16:9 (landscape)
- **Stories / Reels** → 9:16 (tall vertical)
- **Print / PDF reports** → A4 (210×297 mm proportion)

Without this feature a designer would have to rebuild the pattern from scratch each time the target format changes. The feature preserves as much of the painted work as possible when switching by remapping the grid intelligently.

### Two-tier selection

The user first picks a **ratio** (shape family), then optionally picks a **grid resolution** within that ratio (low vs. high density). Example: picking `1:1` gives two resolution options — `16×16` (draft) and `32×32` (hi-res). This matches a common design workflow: rough at low resolution, refine at high resolution.

---

## Requirements for Dev

### Data contract — RATIOS object

Defined at `src/App.jsx:21` and mirrored (partially) in `src/utils/gridUtils.js:2`.

```js
const RATIOS = {
  '1:1':  [ { label: '16 × 16', cols: 16, rows: 16, key: '16x16' },
             { label: '32 × 32', cols: 32, rows: 32, key: '32x32' } ],
  '16:9': [ { label: '16 × 9',  cols: 16, rows: 9,  key: '16x9'  },
             { label: '32 × 18', cols: 32, rows: 18, key: '32x18' } ],
  '4:5':  [ { label: '16 × 20', cols: 16, rows: 20, key: '16x20' },
             { label: '32 × 40', cols: 32, rows: 40, key: '32x40' } ],
  '9:16': [ { label: '9 × 16',  cols: 9,  rows: 16, key: '9x16'  },
             { label: '18 × 32', cols: 18, rows: 32, key: '18x32' } ],
  'A4':   [ { label: '12 × 17', cols: 12, rows: 17, key: '12x17' },
             { label: '24 × 34', cols: 24, rows: 34, key: '24x34' } ]
};
```

- **key** is the stable ID used by `gridSizeKey` state — it must be unique across all ratios.
- **cols/rows** drive every downstream calculation (block rendering, export sizing, columnar validation).
- `RATIOS[ratio][0]` is always the default (low-res) grid for a newly selected ratio.
- If you add a new ratio, also update `previewWidth`/`previewHeight` at `App.jsx:1390–1391` which maps ratio names to pixel dimensions for the export preview canvas.

### State that must be updated atomically on ratio change

All of the following must change together. Partial updates cause mismatched renders:

| State variable | What it holds | Action on change |
|---|---|---|
| `ratio` | Active ratio key, e.g. `'16:9'` | Set to new ratio |
| `gridSizeKey` | Active size key, e.g. `'32x18'` | Set to first option of new ratio |
| `cols` | Number of grid columns | Set from selected size option |
| `rows` | Number of grid rows | Set from selected size option |
| `blocks` | Flat `cols×rows` color-index array | Remap via `mapBlocksGrid()` |
| `rectangles` | Block group overlays | **Clear to `[]`** |
| `columnarMode` | Columnar-mode flag | **Force to `false`** |
| `selectedRectIndex` | Selected group index | Set to `null` |
| `stampShape` | Pending stamp | Set to `null` |
| `hoveredCellIndex` | Hovered cell | Set to `null` |
| undo history | Past states | Push new state via `saveToHistory()` |

**rectangles must always be cleared** when the grid dimensions change because rectangles store `x/y/w/h` in grid coordinates — those become invalid after a resize.

**columnarMode must be forced false** because columnar mode is hardcoded to a 16-column wide canvas (1:1 ratio). Entering it from any other ratio would break its validation logic.

### Canvas render sizing

The rendered canvas pixel size is computed from `targetWidth` / `targetHeight` (CSS container dimensions) and `cols` / `rows`:

```js
const blockWidth  = targetWidth  / cols;
const blockHeight = targetHeight / rows;
```

This means all canvas drawing code automatically adapts when `cols`/`rows` change — no special cases needed for rendering.

### UI — Sidebar panel

The Aspect Ratio panel is a collapsible section in the left sidebar (`App.jsx:2626–2683`). Its collapsed state is tracked in `sidebarCollapsed.aspectRatio` (boolean, part of the `sidebarCollapsed` object). The Grid Size sub-panel (`sidebarCollapsed.gridSize`) sits immediately below and always shows only the sizes for the currently selected ratio.

---

## Logic

### handleRatioChange (App.jsx:1396–1411)

Called when the user clicks a ratio button in the sidebar.

```
1. stopGeneration()           — cancel any in-progress procedural generation
2. setRatio(newRatio)         — update ratio state
3. defaultSize = RATIOS[newRatio][0]  — pick the first (lowest-res) grid
4. setGridSizeKey(defaultSize.key)
5. nextBlocks = mapBlocksGrid(blocks, cols, rows, defaultSize.cols, defaultSize.rows)
6. setBlocks(nextBlocks)
7. setRectangles([])          — clear all block group overlays
8. setCols / setRows          — update grid dimensions
9. setColumnarMode(false)
10. setSelectedRectIndex(null) / setStampShape(null) / setHoveredCellIndex(null)
11. saveToHistory(nextBlocks, [], false, selectedColors)  — push to undo stack
```

### handleGridSizeChange (App.jsx:1412–1427)

Called when the user picks a resolution within the currently selected ratio. Identical flow to `handleRatioChange` except the ratio itself does not change — only `gridSizeKey`, `cols`, `rows`, and `blocks` are updated.

### mapBlocksGrid (gridUtils.js:66–107)

The core algorithm that preserves pattern content when the grid is resized. It takes `(oldBlocks, oldCols, oldRows, newCols, newRows)` and returns a new flat array.

**Three paths:**

#### Path 1 — Upscale 2× (e.g., 16×16 → 32×32)
Triggered when `newCols === oldCols * 2 && newRows === oldRows * 2`.

Each new cell copies from its "parent" in the old grid:
```
newBlocks[r * newCols + c] = oldBlocks[floor(r/2) * oldCols + floor(c/2)]
```
Result: the pattern is doubled in size, perfectly pixel-replicated.

#### Path 2 — Downscale 2× (e.g., 32×32 → 16×16)
Triggered when `oldCols === newCols * 2 && oldRows === newRows * 2`.

Each new cell is decided by majority vote across its 2×2 children in the old grid:
```
children = [ old[r*2][c*2], old[r*2][c*2+1], old[r*2+1][c*2], old[r*2+1][c*2+1] ]
newBlocks[r * newCols + c] = mostFrequentValue(children)
```
Result: the pattern is halved, detail is preserved by consensus.

#### Path 3 — Nearest-neighbor fallback (all other transitions)
Used for non-power-of-2 transitions (e.g., 16×16 → 32×18, 9×16 → 16×16).

Normalizes the new cell position to [0,1] then looks up the nearest old cell:
```
normR = r / (newRows - 1)
normC = c / (newCols - 1)
oldR  = round(normR * (oldRows - 1))
oldC  = round(normC * (oldCols - 1))
newBlocks[r * newCols + c] = oldBlocks[oldR * oldCols + oldC]
```
Result: pattern content is stretched/compressed to fit the new aspect ratio, which may distort proportions but preserves the overall layout.

### Undo history

`saveToHistory(blocks, rectangles, columnarMode, selectedColors)` is called at the end of both handlers. This means switching ratio or grid size is fully undoable. The undo stack stores the remapped blocks and the cleared rectangles array — so undoing a ratio switch restores both the block pattern and the prior grid dimensions.

---

## Questions

- Should switching ratio attempt to preserve block groups (rectangles) by proportionally mapping their coordinates, instead of always clearing them?
- Should the nearest-neighbor fallback use bilinear interpolation to get smoother results on extreme ratio changes (e.g., 1:1 → 9:16)?
- Is the A4 ratio (12×17 / 24×34) an exact proportion of 210×297 mm, or is it an approximation chosen to keep grid cell counts small?

## Next Steps

- Add a visual thumbnail preview next to each ratio button so users can see the canvas shape before selecting it.
- Consider whether adding a custom ratio input (e.g., 3:4, 2:3) is needed for edge-case export targets.
- Reconcile the RATIOS definition between `App.jsx` and `gridUtils.js` — currently they diverge (16:9 in gridUtils only has one size option, App.jsx has two).
