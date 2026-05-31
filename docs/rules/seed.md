# Rule: Seed Encoding

**Source:** `src/utils/gridUtils.js` — `encodeSeed`, `decodeSeed`

## Format

A **21-character Base62** string encoding **15 bytes** of pattern state. Same seed + same codebase = identical output every time.

## Byte Layout

```
Byte 0–3   seed (uint32, big-endian)
Byte 4     blockMin (upper nibble) + blockMax (lower nibble)
Byte 5     startY (upper nibble) + endY (lower nibble)
Byte 6     overlapChance (bit 0) + reserved
Byte 7     cornerAmount (bits 0–1) + reserved (bits 2–7)
Byte 8     startX (upper nibble) + endX (lower nibble)
Byte 9     startMinW (upper nibble) + startMaxW (lower nibble)
Byte 10    startMinH (upper nibble) + startMaxH (lower nibble)
Byte 11    midCurve (0–100, 1 byte)
Byte 12    endMinW (upper nibble) + endMaxW (lower nibble)    [approximate]
Byte 13    endMinH (upper nibble) + endMaxH (lower nibble)    [approximate]
Byte 14    colorA R
Byte 15    colorA G
Byte 16    colorA B
Byte 17    colorB R
Byte 18    colorB G
Byte 19    colorB B
```

> Note: exact packing may vary — always refer to `encodeSeed` / `decodeSeed` in `gridUtils.js` as the authoritative source.

## Properties

- **Deterministic**: identical seed → identical rects, colors, and params.
- **Self-contained**: the seed encodes both the generation params **and** the color pair — no external state needed to reproduce a pattern.
- **Backward compatible**: seeds from older versions decode gracefully; unknown fields fall back to `DEFAULT_PARAMS`.

## Usage

```js
const seed   = makeNewSeed()          // random uint32
const str    = encodeSeed(params, colorA, colorB, seed)  // → 21-char string
const state  = decodeSeed(str)        // → { seed, params, colorA, colorB }
```

Seeds are stored in gallery templates and shared via URL. Changing any param or color produces a new seed string.
