# Rule: Connection Types

**Source:** `src/utils/gridUtils.js` — `generateSinglePatternRects` (connection assignment), `makeWidths` (overlap enforcement), `isValidPattern` (connectivity check)

Every adjacent pair `(A, B)` where B immediately follows A has exactly one connection type. Connection types are assigned **before** heights or widths are computed because they constrain both.

---

## The Four Types

| Type | X overlap | Y overlap | Visual |
|------|-----------|-----------|--------|
| `vertical` | = 0 (B starts where A ends) | ≥ 1 (share rows) | Side-by-side step |
| `horizontal` | ≥ 1 (share columns) | = 0 (flush top or bottom edge) | Horizontal ledge |
| `corner` | = 0 | = 0 (diagonal touch only) | Corner-to-corner point |
| `overlap` | ≥ 1 (share columns) | ≥ 1 (share rows) | 2D overlap region |

A pattern is **connected** if every adjacent pair satisfies at least one of: y-overlap ≥ 1, horizontal edge flush, or corner touch. `vertical` and `overlap` types are connected by y-overlap. `horizontal` and `corner` are connected by edge/corner touch.

---

## Assignment Process

1. The exact number of `corner` connections is fixed to `min(cornerAmount, amount - 1)`.
2. `cornerAmount` indices in `[1, amount-1]` are chosen at random (without replacement) and assigned `corner`.
3. All remaining pairs are assigned randomly from the eligible pool:
   - Always available: `vertical`, `horizontal`
   - If `allowOverlap = true`: `overlap` is also eligible

---

## Effect on Width Generation

X-overlap rules are enforced strictly in `makeWidths`:
- `horizontal` / `overlap` → the pair **must** have x-overlap ≥ 1. If no valid width combination achieves this, the attempt is discarded and retried.
- `vertical` / `corner` → x-overlap is forced to **0**. These pairs never share columns.

---

## Effect on Y-Position Assignment

- `corner` (staircase): B's top == A's bottom (ascending) or B's bottom == A's top (descending).
- `horizontal` / `corner` (flat): B's top or bottom aligns flush with A's top or bottom.
- `vertical` (flat/staircase): B must share ≥ 1 row with A.

See [y-positions.md](y-positions.md) for full details.
