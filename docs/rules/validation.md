# Rule: Validation

**Source:** `src/utils/gridUtils.js` — `isValidPattern`

After `generateSinglePatternRects` produces a candidate set of rects, `isValidPattern` checks all of the following. A single failure discards the pattern and triggers a re-generation.

---

## Conditions (all must pass)

### 1. Grid bounds
Every block must lie entirely within the 16×16 grid:
```
x >= 0  &&  x + w <= 16
y >= 0  &&  y + h <= 16
w >= 1  &&  h >= 1
```

### 2. Start anchor — left edge
```
rects[0].x === startX
```

### 3. End anchor — right edge
```
rects[N-1].x + rects[N-1].w === endX + 1
```
The total horizontal span is exact — no gap, no overshoot.

### 4. Start anchor — bottom row
```
rects[0].y === clamp(emergenceVal - rects[0].h, 0, ROWS - rects[0].h)
```
Where `emergenceVal = startY + 1`.

### 5. End anchor — top row
```
rects[N-1].y === clamp(exitVal, 0, ROWS - rects[N-1].h)
```
Where `exitVal = endY`.

### 6. Connectivity — every adjacent pair is connected
For pair `(A, B)`:
```
overlapY = max(0, min(A.y+A.h, B.y+B.h) − max(A.y, B.y))
overlapX = max(0, min(A.x+A.w, B.x+B.w) − max(A.x, B.x))

isCorner         = (A.y == B.y+B.h || B.y == A.y+A.h)  &&  overlapX == 0
isHorizontalEdge = (A.y == B.y+B.h || B.y == A.y+A.h)  &&  overlapX >= 1
isConnected      = overlapY >= 1  ||  isHorizontalEdge  ||  isCorner
```
All pairs must have `isConnected = true`.

### 7. Exact corner count
The number of diagonal-only corner touches among all adjacent pairs must equal `cornerAmount` exactly:
```
actualCorners === cornerAmount
```

---

## Notes

- Duplicate `(w, h)` dimensions on adjacent blocks do **not** cause validation failure — they are only rejected during the sampling phase (first 400 attempts in `makeWidths`).
- There is no retry limit in `generatePatternRects` — it keeps calling `generateSinglePatternRects` until a valid pattern is produced.
