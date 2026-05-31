# Rule: Width Generation

**Source:** `src/utils/gridUtils.js` — `makeWidths`

## Hard Constraint

All widths, after subtracting x-overlaps, must sum to exactly `targetSpan`:

```
Σ widths[i]  −  Σ overlaps[i]  =  targetSpan
```

`targetSpan = (endX + 1) - startX` (default `16`). This is non-negotiable — patterns that don't satisfy it are discarded.

---

## Sampling (per attempt)

| Index | Source |
|-------|--------|
| `0` (start) | `forcedStartW` — sampled from `[startMinW, startMaxW]` |
| `1 … N-2` (middle) | `pickBiasedSize` from `ALLOWED_WIDTHS` filtered to `[midMinW, midMaxW]` using `midCurve` |
| `N-1` (end) | `forcedEndW` — sampled from `[endMinW, endMaxW]` |

When `midMinW = midMaxW = 0` (default), the pool is `ALLOWED_WIDTHS` filtered to `[1, 14]` — unconstrained.

---

## X-Overlap Rules

Each connection type dictates the required x-overlap for its pair:

| Connection type | Required x-overlap |
|----------------|--------------------|
| `horizontal`, `overlap` | ≥ 1 (enforced; attempt discarded if impossible) |
| `vertical`, `corner` | = 0 (always zero, not negotiable) |

If a `horizontal` / `overlap` pair can't achieve x-overlap ≥ 1 with the sampled widths, the attempt is flagged invalid and discarded.

---

## Retry Logic

The algorithm makes up to **1,000 attempts** to find widths that satisfy the span constraint and all overlap rules.

Additional rejection in the first 400 attempts:
- Adjacent edge-connected pairs with identical `(w, h)` are rejected to avoid monotonous repetition.

---

## Fallback (after 1,000 failed attempts)

A deterministic expansion/compression pass that guarantees a valid span:

1. Fix start and end widths to their forced values.
2. Set middle widths to `midMinW` (or 1 if unconstrained).
3. **If `diff > 0`** (need more width): expand middle blocks one column at a time, up to `midMaxW`; if still short, keep expanding past the max.
4. **If `diff < 0`** (too wide): first absorb excess via x-overlaps on `horizontal`/`overlap` pairs; then shrink middles to `midMinW`; then to 1; finally borrow from start/end blocks.

The fallback always produces a valid span but may violate `midMinW`/`midMaxW` constraints.

---

## Width is Positional — No Sorting

Widths are assigned left to right and **never sorted**. A wider block on the right of the pattern does not imply any sort order; widths simply reflect the bias curve at each position.
