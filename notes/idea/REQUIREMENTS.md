# Software Requirements Specification (SRS)
## Finnomena Asset Matrix Pattern Builder (`fnm-pattern-builder`)

> **Version:** 1.0 · **Status:** Active  
> This document specifies the functional and non-functional requirements for the **Finnomena Asset Matrix Pattern Builder**, a specialized React/Vite web application designed for procedural financial pattern generation, visual canvas editing, block-group extraction, and Figma SVG export.

---

## 1. System Overview

The **Finnomena Asset Matrix Pattern Builder** is a browser-based tool tailored for designers and financial content strategists at Finnomena. It enables users to:

- **Procedurally generate** checkerboard / columnar grid patterns that visually encode financial characteristics (volatility, risk, liquidity, asset type).
- **Manually paint** individual grid cells with up to 3 brand color slots.
- **Extract and manage Block Groups** — bounding rectangles that represent structured atom groups for Figma vector export.
- **Export to Figma** by copying SVG markup directly to the clipboard, enabling native paste into Figma as editable vector layers.

**Tech Stack:** React 19, Vite 8, vanilla CSS + Tailwind CSS, Lucide React icons, browser `localStorage` for config persistence.

---

## 2. Visual Metaphor & Brand Semantics

### 2.1 Two-Dimensional Strategy Map

Financial assets are mapped onto a 2×2 strategy matrix with two axes:

| Axis | Left / Bottom | Right / Top |
|---|---|---|
| **X (horizontal)** | Conservative strategy | Aggressive strategy |
| **Y (vertical)** | High liquidity / Accessible | Low liquidity / Alternative |

### 2.2 Volatility as Visual Language

Column height variation in the grid encodes market behavior:

| Pattern Type | Height Profile | Asset Meaning |
|---|---|---|
| **Solid Flat** | All columns identical height | No volatility — absolute stability |
| **Smooth / Conservative** | Gentle, non-decreasing rise | Low volatility, steady capital growth |
| **Moderate Growth** | Mixed step increments | Balanced, market-correlated profile |
| **Jagged / Aggressive** | Large irregular spikes | High volatility, speculative behavior |

Quantified by cumulative height delta: `Σ|h[c+1] − h[c]|` across all 16 columns.

---

## 3. Application Pages & Navigation

The application is structured as three distinct views (no URL routing — state-based navigation):

| Page Key | Display Name | Entry Point |
|---|---|---|
| `canvas` | **Workspace Canvas Editor** | Default landing view |
| `matrix` | **Strategy Matrix Dashboard** | "Matrix" nav button |
| `config` | **Quadrant Configurator** | "Config" nav button |

---

## 4. Module 1 — Strategy Matrix Dashboard (`matrix` page)

### 4.1 2×2 Quadrant Layout

The matrix contains four quadrants. Each has a fixed preset type, brand color scheme, and 4×4 asset cell grid (16 cells per quadrant = 64 total).

| Quadrant Key | Title | Preset | Strategy | Liquidity | Brand Colors |
|---|---|---|---|---|---|
| `green` | **Solid Foundation** | `locked` | Conservative | Low | Emerald green, white |
| `purpleRed` | **Exotic & High Risk** | `moonshot` | Aggressive | Low | Purple, red, white |
| `blue` | **Safe Haven** | `safe` | Conservative | High | Navy, blue, white |
| `orangeYellow` | **Equities & Commodities** | `growth` | Aggressive | High | Orange, yellow, white |

### 4.2 Asset Cell Dictionary (64 Assets)

Each cell carries a display code and full asset name. Assets are pre-registered per quadrant:

**Green Quadrant (14 active assets):** Raw Land (`RL`), Water Infrastructure (`Wa`), Energy Infrastructure (`En`), Roads (`Ro`), Airports (`Ai`), Industrial Real Estate (`In`), Residential Real Estate (`Re`), Commercial Real Estate (`Com`), REITs (`REIT`), Railroads (`Rr`), Corporate Bonds (`CB`), Municipal Bonds (`MB`), Savings Bonds (`SB`), Fixed Annuities (`FA`).

**Purple/Red Quadrant (16 assets):** Stamps (`St`), Rare Coins (`RC`), Fine Art (`Art`), Crypto Currencies (`Cry`), Race Horses (`RH`), Classic Cars (`CC`), Rare Wine (`RW`), Timepieces (`Ti`), Fund of Funds (`FF`), Real Estate Fund (`REF`), LBO Fund (`LBO`), Venture Capital (`VC`), Interest-Linked Products (`ILP`), Structured Deposits (`SD`), Junk Bonds (`JB`), Mezzanine Capital (`MC`).

**Blue Quadrant (6 assets):** Short-term Treasuries (`StT`), Treasury Bills (`TB`), Certificate of Deposit (`CD`), Money Market (`MM`), Cash Deposits (`Ca`), High Yield Savings (`HY`).

**Orange/Yellow Quadrant (12 assets):** Preferred Shares (`PS`), Common Stock (`CS`), Equity Fund (`EF`), Dividend Paying Stocks (`DpS`), Tech Stocks (`TS`), Gold (`Au`), Silver (`Ag`), Crude Oil (`CO`), Natural Gas (`NG`), Wheat (`Wh`), Corn (`Cn`), Feeder Cattle (`FC`).

### 4.3 Per-Cell Interactions

- **Click a cell** → Opens the Canvas Editor pre-loaded with that asset's stored pattern data.
- **"Regenerate All" button (per quadrant)** → Runs the preset generator for all 16 cell slots using the quadrant's current parametric config from `localStorage`.
- Each cell displays a mini-preview of its current pattern blocks using the quadrant's brand colors.

---

## 5. Module 2 — Workspace Canvas Editor (`canvas` page)

### 5.1 Grid Configuration

#### 5.1.1 Aspect Ratios

| Ratio | Available Grid Densities |
|---|---|
| **1:1** | 16×16 (default), 32×32 |
| **16:9** | 16×9, 32×18 |
| **4:5** | 16×20, 32×40 |
| **9:16** | 9×16, 18×32 |
| **A4** | 12×17, 24×34 |

#### 5.1.2 Grid Dimension Switching

Switching density preserves the pattern using three remapping strategies:
1. **2× Upscale** — each cell copies its parent (pixel doubling).
2. **2× Downscale** — each cell takes the majority vote of its 2×2 child block group.
3. **Nearest-Neighbor Fallback** — normalized UV lookup for all other ratio changes.

All switches clear Block Groups and disable Columnar Mode.

### 5.2 Color System

#### 5.2.1 Color Slots

- The canvas supports **1, 2, or 3 active color slots** labeled `A`, `B`, `C` (slot indices 0, 1, 2).
- Each grid cell stores a **slot index**, not a raw hex value. Colors are resolved at render time.
- **Color Cycling (click):** A cell click cycles to the next slot index: `(current + 1) % numSlots`.
- **Drag Paint:** Holding mouse down and dragging paints all traversed cells with the active slot color index.

#### 5.2.2 Brand Color Palette

The swatch picker exposes 9 brand color families, each with up to 4 opacity levels (100%, 75%, 50%, 25%), for 33 total swatches:

| Family | 100% | 75% | 50% | 25% |
|---|---|---|---|---|
| Navy | `#01172b` | `#415160` | `#808b95` | `#c0c5ca` |
| Light Grey | `#a6bfcc` | `#bccfd9` | `#d3dfe6` | `#e9eff2` |
| Yellow | `#f2f93c` | `#f5fb6d` | `#f9fc9e` | `#fcfece` |
| White | `#ffffff` | — | — | — |
| Green | `#00e76b` | `#40ed90` | `#80f3b5` | `#bff9da` |
| Blue | `#50cfff` | `#7cdbff` | `#a8e7ff` | `#d3f3ff` |
| Purple | `#aa46c3` | `#bf74d2` | `#d5a3e1` | `#ead1f0` |
| Red | `#f73232` | `#f96565` | `#fb9999` | `#fdcccc` |
| Orange | `#f26414` | `#f58b4f` | `#f9b28a` | `#fcd8c4` |

#### 5.2.3 Dominant Color Index

The user can designate any slot (0, 1, or 2) as the **dominant color** — the one used as "Color A" (active) in Block Group extraction and validation logic.

### 5.3 Quick Canvas Presets

| Action | Behavior |
|---|---|
| **Checkerboard** | Fills grid with alternating slot 0 / slot 1 based on `(row + col) % 2` |
| **Invert Grid** | Swaps all slot indices: `(index + 1) % numSlots` for every cell |
| **Fill A** | Sets all cells to slot index 0 |
| **Fill B** | Sets all cells to slot index 1 |

### 5.4 Columnar Growth Mode

A specialized editing mode that enforces the **financial chart metaphor** (bar-chart silhouette):

- **Entry:** "Enable Columnar Mode" button — converts existing Block Groups to column rectangles snapped to `validHeights = [1, 2, 3, 4, 6, 8]`, anchored to the bottom.
- **Exit:** "Return to Standard Mode" button — disables mode, preserving current blocks and groups.
- **Column Layout:** Each rectangle represents one or more contiguous grid columns with a fixed height.
- **Stamp Tool:** Gallery provides standard W×H atom templates (widths: 1–8, heights: 1–8). Clicking a stamp template then clicking the canvas appends a new column rectangle.
- **Auto-Fix Actions:**
  - **Sort & Fix Trend** — Sorts column heights ascending (left → right) and re-anchors to bottom row.
  - **Fix Connectivity** — Adjusts Y-positions so all adjacent columns overlap or corner-touch.
- **Validation Warnings (real-time):**
  1. **Height Check:** Each column height must be one of `[1, 2, 3, 4, 6, 8]`.
  2. **Trend Check:** No column may be taller than the column to its right.
  3. **Connectivity Check:** Adjacent columns must share at least one row (overlap) or exactly touch at a corner. Gaps are flagged.
  4. **Corner-Meet Limit:** At most **3** corner-to-corner adjacencies allowed per pattern.
  5. **Duplicate Dimensions:** Two adjacent edge-connected rectangles cannot share the same `width × height`.

### 5.5 Canvas Statistics

The status bar below the canvas shows:
- Cell count per slot (A, B, C).
- Export pixel dimensions per cell (`blockWidth × blockHeight`).
- Volatility style label and description (in Columnar Mode).

---

## 6. Module 3 — Block Group Extraction Engine

Block Groups are bounding rectangles that overlay the dominant-color (slot 0) regions of the grid. They are used for structured SVG export to Figma.

### 6.1 Extraction Algorithm (`extractBlockGroups`)

**Target:** Extract **3 to 6** non-trivially overlapping rectangles covering dominant-color cells.

**Inputs:** `blocks[]` (flat color-index array), `cols`, `rows`, `targetColorIndex` (dominant slot).

**Algorithm:**

1. **Mark active cells:** Build a binary `activeArr[]` where `activeArr[i] = 1` if `blocks[i] === targetColorIndex`.
2. **Greedy loop (up to 6 iterations):**
   a. Build 2D prefix-sum tables `sumActive` and `sumCovered` for O(1) rectangle queries.
   b. Evaluate all candidate rectangles with `w ∈ [1, 8]`, `h ∈ [1, 8]`, `w × h ≥ 2`.
   c. For each candidate, check three constraints (see §6.2).
   d. Score candidates: `score = uncoveredActiveCells − 1.5 × inactiveCells`.
   e. Commit the highest-scoring candidate with `score > 0`.
   f. Stop early if no valid candidate is found.
3. **Minimum fallback:** If fewer than 3 rectangles were placed, greedily append 1×2 or 2×1 rectangles on uncovered active cells.

**Output:** `{ finalBlocks[], rectangles[] }` where `finalBlocks` is the re-synthesized grid from committed rectangles.

### 6.2 Rectangle Constraints

| Rule | Condition |
|---|---|
| **Max overlap depth** | No cell covered by more than **2** rectangles (`overlapCount[cell] < 2`). |
| **New rect exclusivity** | The candidate must contain at least 1 cell currently uncovered (`overlapCount === 0`). |
| **Existing rect preservation** | Adding the candidate must not eliminate the last exclusive cell of any already-placed rectangle. |

### 6.3 Dynamic Paint-Sync Updates

After any manual cell paint, the system updates Block Groups incrementally without a full re-extraction:

#### Expand/Shrink (`tryExpandRectangles`)
Iterates until stable:
- **Shrink:** If all cells along an interior edge of a rectangle are inactive (non-dominant), strip that edge row/column (min size `w × h ≥ 2`).
- **Expand:** If all cells in the exterior strip adjacent to an edge are active (dominant), grow the rectangle to absorb them.
- **Cleanup:** Remove any rectangle whose interior contains zero active cells.

#### New Group Emergence (`tryAddNewBlockGroups`)
After painting activates new cells:
- Find uncovered 4-connected clusters of `≥ 2` active cells not yet covered by any rectangle.
- Compute the bounding box of each cluster.
- Validate the bounding box against all three constraints (§6.2).
- Add valid bounding boxes as new Block Groups (up to the 6-group maximum).

### 6.4 Manual Block Group Manipulation

Users can interact with Block Group outlines directly on the canvas:

| Interaction | Behavior |
|---|---|
| **Click outline** | Selects the block group (highlighted border) |
| **Drag outline** | Moves the rectangle; underlying active cells shift with it |
| **Drag resize handle (N/S/E/W/corners)** | Resizes the bounding box; grid cells inside the new bounds become active, cells outside revert to background |
| **Drag-to-select** | Drawing a drag region on the grid creates a new custom Block Group |

All moves and resizes are constrained to grid boundaries and re-validate overlap constraints in real-time.

---

## 7. Module 4 — Parametric Pattern Generator

### 7.1 Preset Generator Algorithms

Each brand quadrant uses a distinct mathematical height sequence generator:

#### 7.1.1 `safe` Preset — Monotonic Step-Up
```
h[0] = startH
h[i+1] = h[i] + (rand() < stepUpChance ? 0 : 1)
h[i] = clamp(h[i], minHeight, maxHeight)
```
- Heights trend non-decreasing. Represents stable, conservative capital growth.
- **Default config:** `startH=4`, `stepUpChance=0.5`, `minHeight=4`, `maxHeight=8`, `amount=4`.

#### 7.1.2 `locked` Preset — Constant Flat
```
baseH = randomChoice(allowedHeights)
h[i] = baseH  ∀ i
```
- All columns share the exact same height — total stability.
- **Default config:** `minHeight=2`, `maxHeight=4`, `amount=6`.

#### 7.1.3 `growth` Preset — Random Walk
```
h[0] = startH
h[i+1] = h[i] + randomChoice([-2, -1, 0, 1, 2])
h[i] = clamp(h[i], minHeight, maxHeight)
```
- Simulates market price ticks — moderate volatility.
- **Default config:** `startH=2`, `minHeight=1`, `maxHeight=3`, `amount=8`.

#### 7.1.4 `moonshot` Preset — Flat Baseline with Spikes
```
heights = [baseH × (amount - spikeCount)] ++ [spikeH × spikeCount]
```
- Long flat baseline with localized extreme vertical peaks.
- **Default config:** `baseHeight=1`, `spikeHeight=8`, `spikeCount=2`, `amount=16`.

### 7.2 Width Partitioning

After height generation, the system finds a set of widths that **exactly partition** the 16-column grid:

**Constraint:** `Σ widths[i] − Σ overlaps[i] = 16`

**Allowed widths:** dynamically chosen based on `maxHeight`:
- `maxHeight ≤ 3` → `[1, 2]`
- `maxHeight ≤ 4` → `[2, 3]`
- `maxHeight > 4` → `[4, 6]`
- Fallback after 500 failed attempts → `[1, 2, 3, 4, 6, 8]`

**Duplicate-dimension prevention:** If two adjacent rectangles would have identical `(width, height)`, an alternative height is chosen or widths are swapped.

**Overlap logic (when `overlapChance > 0`):**
```
overlap[i] = rand() < overlapChance ? floor(rand() × min(2, min(prevW, w) − 1)) : 0
```

### 7.3 Y-Position (Vertical Placement)

After widths and heights are computed, Y-coordinates are assigned per group:

- **Emergence anchor:** `emergenceVal = { bottom: 16, center: 8, top: 4 }`
- **Base Y:** `yVal = emergenceVal − h`  clamped to `[0, 16 − h]`
- **Connectivity enforcement:** Each group's Y is clamped to overlap or corner-touch the previous group's extent: `y ∈ [prevY − h + 1, prevY + prevH − 1]`
- **Corner Meet option (when `cornerChance > 0`):** With probability `cornerChance`, the group is positioned to exactly corner-touch (not overlap) the previous one. Maximum **2** corner meets are created per generate call.
- **Partial edge mode (when `allowPartialEdge = true`):** Y is chosen uniformly at random within the valid connectivity range.

### 7.4 Post-Generation Sorting

Heights are **sorted ascending** before placement to enforce the visual non-decreasing trend from left to right.

### 7.5 Default Quadrant Configs (`localStorage` key: `fnm_quadrant_configs`)

```json
{
  "safe":     { "amount": 4, "emergence": "bottom", "minHeight": 4, "maxHeight": 8,
                "startH": 4, "stepUpChance": 0.5, "overlapChance": 0.0,
                "cornerChance": 0.0, "allowPartialEdge": false },
  "locked":   { "amount": 6, "emergence": "bottom", "minHeight": 2, "maxHeight": 4,
                "overlapChance": 0.0, "cornerChance": 0.0, "allowPartialEdge": false },
  "growth":   { "amount": 8, "emergence": "center", "minHeight": 1, "maxHeight": 3,
                "startH": 2, "overlapChance": 0.0, "cornerChance": 0.0, "allowPartialEdge": false },
  "moonshot": { "amount": 16, "emergence": "bottom", "baseHeight": 1, "spikeHeight": 8,
                "spikeCount": 2, "overlapChance": 0.0, "cornerChance": 0.0, "allowPartialEdge": false }
}
```

---

## 8. Module 5 — Image-to-Grid Conversion

Users can upload an image and map it to the grid canvas using pixel color similarity.

### 8.1 Processing Pipeline

1. **Cover-fit scaling** — Draw the image onto an off-screen `<canvas>` at `cols × rows` pixels, center-cropping to maintain aspect ratio.
2. **Per-pixel similarity** — For each pixel, compute Euclidean RGB distance to **Color A**:
   ```
   dist = √((r−rA)² + (g−gA)² + (b−bA)²)
   similarity = clamp(1 − dist/300, 0, 1)
   ```
3. **Contrast adjustment:** `s = clamp((similarity − 0.5) × contrast + 0.5, 0, 1)`
4. **Threshold binarization:** `cell = (s ≥ threshold) ? 0 : 1` (optionally inverted).
5. **Majority filter** (0–3 passes) — 3×3 neighborhood majority vote to smooth noise.
6. **Small component removal** — BFS flood-fill; components ≤ `spotLimit` cells are absorbed by the majority adjacent color (2 passes).
7. **Bridge close dominants** — Any non-dominant cell touching ≥ 2 distinct dominant components is converted to dominant (fills single-cell gaps).

### 8.2 Animated Generation

When an image is uploaded for the first time:
1. Colors A/B are auto-detected by snapping all pixels to the nearest brand swatch and taking the top 2 by frequency.
2. The generation runs a **diagonal sweep animation** (bottom-left → top-right reveal order), incrementally revealing cells in batches.
3. If overlap violations are detected post-extraction, the threshold is bumped by a step (`+0.05` for small grids, `+0.1` for large) and a new pass is chained.

### 8.3 Live Sync

When **Live Sync** is enabled, any change to threshold, contrast, invert, smooth passes, or spot limit immediately re-runs the image-to-grid pipeline.

---

## 9. Module 6 — Configurator Dashboard (`config` page)

### 9.1 Per-Quadrant Parameter Sliders

For each of the 4 presets (`safe`, `locked`, `growth`, `moonshot`), the user can adjust:

| Parameter | Type | Range | Description |
|---|---|---|---|
| `amount` | Integer | 1–16 | Number of atom groups per pattern |
| `emergence` | Enum | `bottom`, `center`, `top` | Vertical anchor for group placement |
| `minHeight` | Integer | 1–8 (allowed: 1,2,3,4,6,8) | Minimum allowed column height |
| `maxHeight` | Integer | 1–8 (allowed: 1,2,3,4,6,8) | Maximum allowed column height |
| `overlapChance` | Float | 0.0–1.0 | Probability of horizontal group overlap |
| `cornerChance` | Float | 0.0–1.0 | Probability of corner-touch adjacency |
| `allowPartialEdge` | Boolean | — | Allow Y-placement anywhere in valid range |
| `startH` *(safe/growth)* | Integer | 1–8 | Starting height for the sequence |
| `stepUpChance` *(safe)* | Float | 0.0–1.0 | Probability of staying flat vs stepping up |
| `baseHeight` *(moonshot)* | Integer | 1–8 | Flat baseline height |
| `spikeHeight` *(moonshot)* | Integer | 1–16 | Peak spike height |
| `spikeCount` *(moonshot)* | Integer | 1–8 | Number of spike columns |

### 9.2 JSON Editor

A raw text area allows direct JSON editing of the entire config object. Features:
- Inline syntax error feedback.
- Parse and save on "Save JSON" action.
- Revert to last saved state if JSON is invalid.

### 9.3 Persistence

All config changes are auto-saved to `localStorage` under key `fnm_quadrant_configs`.

---

## 10. Module 7 — Figma SVG Export

### 10.1 SVG Structure

The export generates an SVG string at the target output resolution:

| Ratio | Output Size |
|---|---|
| 1:1 | 1920 × 1920 px |
| 16:9 | 1920 × 1080 px |
| 9:16 | 1080 × 1920 px |
| 4:5 | 1920 × 2400 px |
| A4 | 1190 × 1684 px |

Each Block Group rectangle is rendered as a `<rect>` element with:
- `x`, `y` in output pixels (`col × blockWidth`, `row × blockHeight`)
- `width = rect.w × blockWidth`, `height = rect.h × blockHeight`
- `fill` from the active Color A hex

### 10.2 Clipboard API

The SVG is copied via the async Clipboard API with two MIME types:
- `text/plain` — raw SVG string
- `text/html` — wrapped in an `<html>` body for direct Figma paste compatibility

Pasting (Cmd/Ctrl+V) into Figma creates native, vector-editable `<rect>` layers organized inside a Figma Frame.

---

## 11. Undo / Redo

All state-mutating actions (paint, generate, resize, add/remove color, mode switch) push a snapshot to a linear history stack:

```js
snapshot = {
  blocks: [...],         // Flat color-index array
  rectangles: [...],     // Array of { x, y, w, h }
  columnarMode: bool,
  selectedColors: [...], // Array of hex strings
  dominantColorIndex: int
}
```

- **Undo:** `Ctrl/Cmd + Z`
- **Redo:** `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`

---

## 12. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Prefix-sum (Integral Image) tables enable O(1) rectangle area queries. Block group extraction on a 16×16 grid completes in < 100 ms. |
| **State Management** | Pure React hooks (`useState`, `useEffect`). No external state library. |
| **Browser Compatibility** | Modern Chromium / WebKit. Requires async Clipboard API and Canvas 2D API. |
| **Persistence** | Config saved to `localStorage`. No backend or network calls. |
| **Accessibility** | Keyboard undo/redo. Contrast-aware text labels on swatches. |

---

## 13. Validation Rule Summary

| Rule | Threshold | Error Type |
|---|---|---|
| Column height must be in allowed set | `{1, 2, 3, 4, 6, 8}` | `height` warning |
| Heights non-decreasing left → right | `h[c] ≤ h[c+1]` | `trend` warning |
| Adjacent columns must connect | Overlap or corner-touch | `connectivity` warning |
| Corner-meets per pattern | ≤ 3 | `corner-limit` warning |
| Adjacent groups same dimensions | `w[i] = w[i+1] ∧ h[i] = h[i+1]` | `duplicate-dimensions` warning |
| Cell overlap depth | ≤ 2 rectangles per cell | Extraction constraint |
| Each rect has exclusive cell | `overlapCount = 1` for ≥1 cell | Extraction/violation check |
| Block group count | 3 ≤ K ≤ 6 | Extraction target |
