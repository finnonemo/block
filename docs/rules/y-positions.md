# Rule: Y-Position Assignment

**Source:** `src/utils/gridUtils.js` — Y-assignment loop inside `generateSinglePatternRects`

Y positions are computed left to right after heights and widths are finalised. The logic splits into two modes based on whether the anchors differ on the Y axis.

---

## Staircase Mode (`startY ≠ endY`)

A linear baseline is interpolated across all blocks:

```
startYpos = clamp(emergenceVal - heights[0], 0, ROWS - heights[0])
exitYpos  = clamp(exitVal,                   0, ROWS - heights[N-1])

baseline[i] = round(startYpos + t × (exitYpos - startYpos))
  where t = i / (amount - 1)
```

Each block's Y is then determined by its connection type with the previous block:

### `corner` connection
- **Ascending** (`startY > endY`): B's bottom == A's top → `y = prevY - h`
- **Descending** (`startY < endY`): B's top == A's bottom → `y = prevY + prevH`
- If the result goes out of grid bounds, `h` is mutated to fit (see [heights.md](heights.md))

### `vertical` / `horizontal` / `overlap` connections
- `targetShare` = desired vertical overlap based on baseline distance
- Clamped to `[minOv, maxOv]` where `minOv = 1` for vertical, `minOv = 0` for horizontal
- `y = prevY - h + shareOffset` (ascending) or `y = prevY + prevH - shareOffset` (descending)

---

## Flat Mode (`startY == endY`)

Block 0 and block N-1 are anchored exactly. Middle blocks follow per-connection-type rules:

### `vertical` connection
- B must share ≥ 1 row with A.
- Valid Y range: `edgeLo = prevY - h + 1` to `edgeHi = prevY + prevH - 1`
- A **corridor** is further computed to ensure `endY` remains reachable:
  ```
  corridorLo = exitY - remainingHeightSum
  corridorHi = exitY + remainingHeightSum
  ```
  Y is sampled from `[max(edgeLo, corridorLo), min(edgeHi, corridorHi)]` — the intersection.
  If that intersection is empty, falls back to the raw `[edgeLo, edgeHi]` range.

### `horizontal` / `corner` connection
- B must touch A flush on a top or bottom edge:
  - `above = prevY - h` (B sits above A)
  - `below = prevY + prevH` (B sits below A)
- Direction is chosen to minimise distance to `exitY` — **80% chance toward goal, 20% random** (prevents monotone staircasing).
- If only one direction is valid (other goes out of bounds), that direction is used unconditionally.
- If `allowOverlap` is true, there is a 50% chance to instead use vertical overlap placement.

---

## Same-Y Guard

After any Y assignment, if the result would make `y == prevY` for a `vertical` connection (same top-left row as the previous block), the algorithm nudges by 1:

```
prefer y + 1 if it fits and stays within the vertical overlap band
else try y - 1
```

This prevents two adjacent blocks from looking identical in position.

---

## Final Clamp

Every computed Y is clamped before the rect is pushed:

```
y = clamp(y, 0, ROWS - heights[i])
```
