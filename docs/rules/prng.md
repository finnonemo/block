# Rule: PRNG (Seeded Random)

**Source:** `src/utils/gridUtils.js` — `createRNG`

## Algorithm

Mulberry32 — a 32-bit seeded PRNG. Fast, deterministic, good statistical distribution.

```js
export function createRNG(seed) {
  let s = seed >>> 0;          // treat as unsigned 32-bit int
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;  // float [0, 1)
  };
}
```

## Determinism Guarantee

Given the same `seed` integer and the same params, `generatePatternRects` always returns the identical sequence of rects. The RNG is never shared or re-seeded mid-generation.

## Seed Source

- Admin view: new seed from `Math.random()` on each "Generate" press.
- User view: seed decoded from the selected template's Base62 string.
- Seed range: unsigned 32-bit integer (`0` to `4294967295`).

## Usage Pattern

Every random decision in generation consumes exactly one RNG call in a fixed order. Inserting or removing any call changes all subsequent results — be careful when modifying generation code.
