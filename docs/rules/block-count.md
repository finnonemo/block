# Rule: Block Count

**Source:** `src/utils/gridUtils.js` — `generateSinglePatternRects`

## Sampling

The number of blocks for a pattern is sampled uniformly:

```js
amount = randRange(blockMin, blockMax, rng)  // inclusive on both ends
amount = Math.max(2, amount)                 // hard minimum of 2
```

## Params

| Param | Default | Range |
|-------|---------|-------|
| `blockMin` | `3` | `2–8` |
| `blockMax` | `8` | `2–8` |

`blockMin ≤ blockMax` must always hold. The UI enforces this by clamping when either slider crosses the other.

## Effect on Other Rules

- `cornerAmount` is clamped to `amount - 1` at generation time — you can never have more corners than adjacent pairs.
- `targetSpan` is divided across `amount` blocks, so higher block counts produce narrower average widths.
- The bias curve (`midCurve`) interpolates across `amount - 2` middle blocks (indices 1 through N-2).
