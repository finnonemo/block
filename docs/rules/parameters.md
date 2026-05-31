# Rule: Parameters Reference

**Source:** `src/utils/gridUtils.js` — `DEFAULT_PARAMS`, `buildConfigFromParams`

## Full Parameter Table

| Param | Default | Range | Effect |
|-------|---------|-------|--------|
| `blockMin` | `3` | `2–8` | Minimum number of blocks |
| `blockMax` | `8` | `2–8` | Maximum number of blocks |
| `startX` | `0` | `0–15` | Left edge column of the first block |
| `startY` | `15` | `0–15` | Bottom row of the first block (bottom-left anchor) |
| `startMinW` | `1` | `1–14` | Min width of first block |
| `startMaxW` | `3` | `1–14` | Max width of first block |
| `startMinH` | `1` | `1–14` | Min height of first block |
| `startMaxH` | `3` | `1–14` | Max height of first block |
| `midMinW` | `0` | `0–14` | Min width of middle blocks (`0` = unconstrained) |
| `midMaxW` | `0` | `0–14` | Max width of middle blocks (`0` = unconstrained) |
| `midMinH` | `0` | `0–14` | Min height of middle blocks (`0` = unconstrained) |
| `midMaxH` | `0` | `0–14` | Max height of middle blocks (`0` = unconstrained) |
| `midCurve` | `50` | `0–100` | Size bias: `0`=early-large, `50`=uniform, `100`=late-large |
| `endX` | `15` | `0–15` | Right edge column of the last block (inclusive) |
| `endY` | `0` | `0–15` | Top row of the last block (top-right anchor) |
| `endMinW` | `6` | `1–14` | Min width of last block |
| `endMaxW` | `10` | `1–14` | Max width of last block |
| `endMinH` | `4` | `1–14` | Min height of last block |
| `endMaxH` | `8` | `1–14` | Max height of last block |
| `overlapChance` | `0` | `0` or `1` | Enable 2D overlap connections (`0` = off, `1` = on) |
| `cornerAmount` | `2` | `0–2` | Exact number of corner-to-corner connections |

## Constraints (must always hold)

```
blockMin    ≤ blockMax
startMinW   ≤ startMaxW
startMinH   ≤ startMaxH
midMinW     ≤ midMaxW      (when both > 0)
midMinH     ≤ midMaxH      (when both > 0)
endMinW     ≤ endMaxW
endMinH     ≤ endMaxH
startX      < endX         (need at least 2 columns of span)
cornerAmount ≤ blockMax - 1
```

The UI's `set(key, val)` function in `ParameterPanel.jsx` enforces min/max clamping automatically when a slider crosses its counterpart.

## `0` Means Unconstrained for Mid Params

`midMinW`, `midMaxW`, `midMinH`, `midMaxH` use `0` as a sentinel for "no constraint" rather than a literal minimum of 0 columns/rows. When either bound is `0`, the full `ALLOWED_*` range is used. See [heights.md](heights.md) and [widths.md](widths.md).

## `buildConfigFromParams`

Translates UI params into the internal config object that `generatePatternRects` consumes:

```js
targetSpan = (endX + 1) - startX   // total column span
exitVal    = endY                   // top row of end block (top-right anchor)
allowOverlap = overlapChance > 0
```
