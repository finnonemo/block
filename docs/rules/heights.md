# Rule: Height Generation

**Source:** `src/utils/gridUtils.js` — `makeHeights`, `pickBiasedSize`

## Assignment Order

Heights are assigned in order from block 0 to block N-1:

| Index | Source |
|-------|--------|
| `0` (start) | `forcedStartH` — sampled from `[startMinH, startMaxH]`, clamped to `≤ startY + 1` |
| `1 … N-2` (middle) | `pickBiasedSize` with `midCurve` bias |
| `N-1` (end) | `forcedEndH` — sampled from `[endMinH, endMaxH]`, clamped to `≤ ROWS - endY` |

Middle blocks are sampled from `ALLOWED_HEIGHTS` filtered to `[midMinH, midMaxH]`. When `midMinH = midMaxH = 0` (the default), the full range `[1, 14]` is used.

---

## Bias Curve (`midCurve`)

`midCurve` (0–100) controls how block height changes across the middle of the pattern.

An interpolation parameter `t` runs from `0` (first middle block) to `1` (last middle block). The curve converts `t` into a probability `u` that biases which end of the size pool is sampled:

```
C = (midCurve - 50) / 50        → C ∈ [-1, 1]
bias = C × (2t - 1)             → bias ∈ [-1, 1]

if bias > 0:  u = 1 - (1 - u_raw)^(1 + bias×5)   → pulls toward large values
if bias < 0:  u = u_raw^(1 - bias×5)              → pulls toward small values
```

| `midCurve` | Effect |
|------------|--------|
| `0` | Early blocks large, late blocks small (steep drop) |
| `50` | Uniform — no bias |
| `100` | Early blocks small, late blocks large (late rise) |

---

## Staircase vs Flat

In **staircase mode** (`startY ≠ endY`):
- A `targetSum` gap is calculated from the Y-axis distance between anchors
- Middle heights are still bias-sampled but the vertical-edge `connectionTypes` shift which blocks absorb the gap

In **flat mode** (`startY == endY`):
- Heights are independent across middle blocks
- Only the `sizeScale` clamp (if used from legacy params) affects the pool

---

## Corner Height Mutation

When a `corner` connection is placed in staircase mode and the computed Y position would go out of bounds, the block's height is **mutated in place** to fit:

```
ascending  + out of top  → h = max(1, prevY),      y = 0
descending + out of bot  → h = max(1, ROWS - y)
```

This happens after `makeHeights` returns, inside the Y-assignment loop.
