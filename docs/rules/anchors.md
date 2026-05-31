# Rule: Anchor Points

**Source:** `src/utils/gridUtils.js` — `generateSinglePatternRects`, `isValidPattern`

Every pattern has exactly two fixed anchors that constrain the entire layout.

---

## Start Block (Bottom-Left Anchor)

The first block (`i = 0`) is pinned to the **bottom-left** of the pattern.

| Property | Rule |
|----------|------|
| Left edge | `x = startX` (param, default `0`) |
| Bottom row | `y + h = startY + 1` — the block's bottom row equals `startY` |
| Height | Sampled from `[startMinH, startMaxH]`, then clamped: `h ≤ startY + 1` so it doesn't exceed the grid top |
| Width | Sampled from `[startMinW, startMaxW]` |

```
startY = 15 (default) → block is anchored to the very bottom row
startY = 0  → block is anchored to the very top row (height forced to 1)
```

---

## End Block (Top-Right Anchor)

The last block (`i = N-1`) is pinned to the **top-right** of the pattern.

| Property | Rule |
|----------|------|
| Right edge | `x + w = endX + 1` — right edge is exclusive (default `endX = 15` → right edge at column 16) |
| Top row | `y = endY` — the block's top row equals `endY` |
| Height | Sampled from `[endMinH, endMaxH]`, then clamped: `h ≤ ROWS - endY` so it doesn't fall off the bottom |
| Width | Sampled from `[endMinW, endMaxW]` |

```
endY = 0  (default) → block is anchored to the very top row
endY = 15 → block is anchored to the very bottom row (height forced to 1)
```

---

## Span Constraint

The total horizontal footprint of all blocks, after subtracting x-overlaps, must equal exactly:

```
targetSpan = (endX + 1) - startX
```

This is a hard constraint on width generation. See [widths.md](widths.md).

---

## Staircase vs Flat

If `startY ≠ endY`, the pattern is in **staircase mode** — block Y-positions interpolate diagonally between the two anchors. If `startY == endY`, it is **flat mode**. See [y-positions.md](y-positions.md).
