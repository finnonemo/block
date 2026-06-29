---
tags: [refactor, performance, canvas, svg, rendering]
topics: [Pattern Layering Refactor, Canvas Paint Performance]
projects: [fnm-pattern-generator]
url: 
aliases: [Invert Layer, colorB Mask, Paint Buffer]
---
# [Refactor] Pattern Layering Inversion + Canvas Paint Performance

## Key Takeaways

Inverted the pattern rendering stack so `colorB` becomes a top-layer cutout mask rather than a base fill — visually identical to users but architecturally cleaner and faster. Combined with decoupling canvas painting from React state during drag strokes, 32×32 paint performance goes from sluggish (N React re-renders per stroke) to instant (0 React re-renders during drag, 1 flush on mouseup).

---

## What Was Built

### Layer order change (all renderers)

**Old stack (bottom → top):**
1. `colorB` full fill (background)
2. `colorA` per-block fills
3. Image clipped to block shapes via `<clipPath>`

**New stack (bottom → top):**
1. `colorA` full fill (entire canvas/SVG)
2. Image — no clip, sits freely on colorA
3. `colorB` mask — covers non-block areas, revealing only layers 1+2 inside blocks

Visual result is identical. The image naturally disappears outside block areas because `colorB` covers it — no `<clipPath>` needed.

### PatternCanvas.jsx

- **Canvas draw** (`useLayoutEffect`): changed from `fillRect(colorB)` + N × `fillRect(colorA)` to `fillRect(colorA)` once + `drawImage()` (image) + compound path (`beginPath` + N × `rect()` + `fill()`) for colorB inactive cells. The compound path is a single GPU batch — significant speedup vs individual `fillRect` calls.
- **Image moved to canvas**: image overlay drawn directly via `ctx.drawImage()` (loaded into an `HTMLImageElement` via a `useEffect`/ref). The SVG overlay no longer has an `<image>` element or `<clipPath>`.
- **`paintCellRef`**: after every full canvas redraw, a direct-draw function is captured that can paint a single cell in O(1) without triggering React.

### PatternPreview.jsx (PatternSVG + QuadPatternSVG)

- Replaced `<clipPath>` on the image with a `<mask>` on the `colorB` rect.
- Mask: white rect (full tile) + black rects for each block area. White = show colorB, black = cut out block areas.
- Layer order in SVG: colorA full rect → image (no clip) → colorB masked rect → text overlay.
- `QuadPatternSVG`: 4 masks at absolute tile offsets replace 4 clipPaths.

### gridUtils.js — buildSVG

- Unified the previously branching code (separate paths for with/without image) into one structure.
- Now always emits `<mask id="fnm-mask">` with block cutouts, colorA full rect, optional image, colorB masked rect.

---

## Paint Stroke Performance Fix

### Root cause

`handlePaint(idx, color)` in AdminView was called on every `mousemove` event. Each call:
1. Copied the entire `blocks` array (1024 elements for 32×32)
2. Called `extractBlockGroups()` — merges cells into rects, O(N)
3. Triggered a full React re-render of AdminView
4. Triggered `useLayoutEffect` → full canvas redraw (1024-cell compound path)

For 32×32 this happened ~60× per second during a fast drag stroke.

### Fix: paint buffer + stroke-end flush

- **During stroke**: `patternCanvas` draws each cell directly via `paintCellRef.current(idx, color)` — a single `fillRect`. No state update. Zero React renders.
- **Accumulator**: changes are collected in `paintBufferRef` (a copied blocks array mutated in place during the stroke).
- **On mouseup**: `onPaintEnd(paintBufferRef.current)` fires once → parent calls `extractBlockGroups` once → one React update → one full canvas redraw.
- `blocksRef` is redirected to the paint buffer at stroke start so paint-direction logic (toggle on first cell) stays accurate mid-stroke.

### Interface change

| Before | After |
|--------|-------|
| `onPaint(idx, color)` — called per cell | `onPaintEnd(blocks)` — called once per stroke |
| `handlePaint` in AdminView | `handlePaintEnd` in AdminView |

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/PatternCanvas.jsx` | New layer order; image to canvas; paintCellRef; paint buffer + onPaintEnd |
| `src/components/PatternPreview.jsx` | clipPath → mask in PatternSVG and QuadPatternSVG |
| `src/utils/gridUtils.js` | buildSVG unified with mask structure |
| `src/views/AdminView.jsx` | handlePaint → handlePaintEnd; CanvasArea prop updated |

---

## New Idea Added

`notes/idea/multi-color-palette.md` — allow admin to select multiple colorA / colorB swatches. On generation each block rect randomly picks from the palette (seeded for determinism). Palette saved with template. Requires per-rect color assignment instead of a global colorA, and an updated rendering model in all three renderers.
