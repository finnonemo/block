# Pattern Seed Format

A seed is a **21-character alphanumeric string** (`A–Z`, `a–z`, `0–9`, no symbols) that fully describes a pattern. Pasting the same seed into the tool always produces the exact same result.

Example seed: `BkR7mXqN2fDcAeWvLpTsY`

---

## What a seed encodes

The seed packs **15 bytes** of information, then converts them to 21 Base62 characters.

| Bytes | Field           | Range / Notes                              |
|-------|-----------------|---------------------------------------------|
| 0–3   | RNG seed        | uint32, big-endian. Drives all randomness.  |
| 4     | Complexity      | 1–4 (Low / Med / High / Extreme)            |
| 5     | Start Height    | stored as `startHeight / 4` (0–4), so valid values are 0, 4, 8, 12, 16 |
| 6     | Overlap Chance  | 0–10 integer (UI slider × 10 = %)          |
| 7     | Corner Chance   | 0–3 exact count of corner-meets             |
| 8     | Volatility      | 0–10 integer (UI slider × 10 = %)          |
| 9–11  | Color A (RGB)   | Surface color, 3 bytes R G B               |
| 12–14 | Color B (RGB)   | Background color, 3 bytes R G B            |

Total: 15 bytes = 120 bits → 21 Base62 chars (62²¹ > 2¹²⁰).

---

## Encoding: bytes → seed string

```
15 bytes
  → treat as a single 120-bit big-endian integer (BigInt)
  → repeatedly divide by 62, map each remainder to a character in
     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  → left-pad with 'A' to exactly 21 characters
```

Standard base64 was avoided because it uses `+`, `/`, and `=`. Base62 uses only letters and digits so the string is safe to copy anywhere with no escaping.

---

## Decoding: seed string → pattern

```
21-char string
  → validate: length === 21, every character in Base62 alphabet
  → convert back to 120-bit BigInt, then extract 15 bytes
  → byte[0–3]  → uint32 RNG seed (big-endian reassembly)
  → byte[4]    → complexity
  → byte[5]×4  → startHeight
  → byte[6]    → overlapChance
  → byte[7]    → cornerChance
  → byte[8]    → volatility
  → byte[9–11] → colorA hex (#rrggbb)
  → byte[12–14]→ colorB hex (#rrggbb)
  → range-check each field; return null if invalid
```

---

## How randomness is reproduced (Mulberry32 PRNG)

The 4-byte RNG seed initialises a **Mulberry32** pseudo-random number generator. Every random decision during pattern generation consumes the next value from this generator in a fixed order:

1. **Amount** — how many block groups (picked from the complexity's `amountOpts`)
2. **Heights** — height of each block (from `ALLOWED_HEIGHTS` filtered by `maxHeight`)
3. **Widths & overlaps** — column widths per block, horizontal overlap between adjacent pairs
4. **Corner pairs** — Fisher-Yates shuffle to select which adjacent pairs get a forced corner-meet
5. **Corner direction** — above or below the previous block
6. **Volatility walk** — step size and direction for each block's Y position

Because the same seed drives the same sequence of calls, the output is identical every time.

Mulberry32 state update (one call):
```js
s = (s + 0x6D2B79F5) >>> 0
t = Math.imul(s ^ (s >>> 15), 1 | s)
t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
return ((t ^ (t >>> 14)) >>> 0) / 4294967296   // float in [0, 1)
```

---

## Lifecycle in the app

| Action | Seed behaviour |
|--------|---------------|
| App loads | New random seed generated via `Math.random()` |
| Generate Pattern button | New random seed |
| Adjust any parameter (slider, button) | New random seed (pattern re-rolls) |
| Change Color A / B | Seed number unchanged; encoded string updates to reflect new colors |
| Copy seed | Encodes current `{seed, params, colorA, colorB}` → 21-char string |
| Paste / Apply seed | Decodes all fields, restores params + colors, regenerates pattern with same RNG seed → identical result |

---

## Source

| File | Purpose |
|------|---------|
| `src/utils/gridUtils.js` | `encodeSeed`, `decodeSeed`, `createRNG`, `bytesToB62`, `b62ToBytes` |
| `src/App.jsx` | `makeNewSeed`, `generateState`, `handleSeedApply`, `SeedPanel` component |
