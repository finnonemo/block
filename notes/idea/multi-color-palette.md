# Multi-Color Palette Selection

## Concept

Allow admin users to select **multiple colorA values and multiple colorB values** instead of a single pair. When generating a pattern, each block rect or background region randomly picks a color from its respective palette. The selected palette is saved with the template so user-facing previews and exports also use it.

---

## User-Facing Behavior

- Admin opens a new "Color Palette" panel (replaces or extends the current single-pair color picker).
- Admin can add up to N swatches per slot (e.g. 4–8 colors for colorA, 4–8 for colorB).
- On generation/regeneration the pattern assigns each **block rect** a random colorA swatch and each **background cell** a random colorB swatch. The randomness is seeded so the same seed always produces the same color assignments.
- Users see the multi-color result identically — they don't interact with the palette directly.

---

## Design Decisions to Resolve

### A. Granularity of color assignment
| Option | Description | Trade-off |
|--------|-------------|-----------|
| Per **rect** | Each merged block rect gets one color from the palette | Simple; N colorA values needed (N = rect count) |
| Per **cell** | Each individual grid cell gets its own color | More varied, harder to read as a pattern |
| Per **column group** | All rects in the same "column" share a color | Follows the existing staircase visual structure |

**Recommended**: per-rect. Aligns with how `rects` are already the rendering unit in SVG and canvas.

### B. Seed encoding
The 21-char Base62 seed currently encodes 15 bytes of pattern params. Two options:
1. Store palette indices as part of the seed (extend seed length or pack into spare bits).
2. Store the multi-color selection **only in the template object** (not in the seed), so shared seeds always use a default pair.

**Recommended**: store palette in the template only. Seed remains backward-compatible; the palette is a template-layer concern. For "live" admin generation without a saved template, a session-local palette state is used.

### C. Color randomisation source
Use the existing Mulberry32 PRNG (seeded by the pattern seed) to draw color indices after the geometry is generated, so color assignments are deterministic per seed.

---

## Implementation Sketch

### State changes
```js
// Current
const [colorA, setColorA] = useState('#...')
const [colorB, setColorB] = useState('#...')

// New
const [paletteA, setPaletteA] = useState(['#...'])   // array of hex strings
const [paletteB, setPaletteB] = useState(['#...'])   // array of hex strings
```

### Generation change (`gridUtils.js`)
After `generatePatternRects` returns `rects`, assign colors per rect:
```js
function assignRectColors(rects, paletteA, paletteB, rng) {
  return rects.map(r => ({
    ...r,
    colorA: paletteA[Math.floor(rng() * paletteA.length)],
  }))
}
```
Background cells use `paletteB` similarly (or a single sampled colorB applied to the whole background for simplicity).

### Rendering change
`PatternSVG`, `QuadPatternSVG`, `buildSVG`, and `PatternCanvas` need each rect to carry its own color:
- SVG: `<rect fill={r.colorA}/>` instead of global `fill={colorA}`
- Canvas: set `ctx.fillStyle = r.colorA` per rect in Layer 1 (since rects are the merge groups)
- Canvas Layer 1 currently fills the entire canvas with a single colorA — with multi-color we'd need to fill per-rect instead of a single fillRect, then paint colorB on top (preserving the new layer order)

### Template storage
```js
{
  seed: '...',
  paletteA: ['#hex1', '#hex2', ...],
  paletteB: ['#hex1', '#hex2', ...],
  // imageOverlay, textOverlay unchanged
}
```

### UI: Color Palette Panel
- Grid of swatches with an "Add color" (+) button per slot
- Drag-to-reorder (optional)
- Hex input or color picker per swatch
- "Randomise" button samples N colors from BRAND_PALETTE

---

## Edge Cases

- Single swatch in palette → behaves identically to current single colorA/colorB
- Remove all swatches → fall back to one default color (prevent empty palette)
- Backward compat: templates without `paletteA`/`paletteB` fields keep using their `colorA`/`colorB` strings
