# Rule: Grid Coordinate System

**Source:** `src/utils/gridUtils.js` — constants `COLS`, `ROWS`, `ALLOWED_HEIGHTS`, `ALLOWED_WIDTHS`

## Dimensions

```
COLS = 16   (columns, X axis)
ROWS = 16   (rows,    Y axis)
```

## Coordinate Convention

- **X** increases left → right. `0` = leftmost column, `15` = rightmost column.
- **Y** increases top → bottom. `0` = top row, `15` = bottom row.
- Each block is `{ x, y, w, h }` where `(x, y)` is the **top-left corner**.
- A block occupies columns `[x, x+w)` and rows `[y, y+h)`.

## Discrete Allowed Sizes

All block dimensions must be chosen from these fixed sets — no arbitrary integers:

```js
ALLOWED_HEIGHTS = [1, 2, 3, 4, 6, 8, 10, 12, 14]
ALLOWED_WIDTHS  = [1, 2, 3, 4, 6, 8, 10, 12, 14]
```

Values 5, 7, 9, 11, 13, 15 are never used. This creates the characteristic "stepped" look of the pattern.

## Grid Bounds Invariant

Every block must satisfy:
```
x >= 0  &&  x + w <= 16
y >= 0  &&  y + h <= 16
```

This is enforced at generation time and re-checked in `isValidPattern`.
