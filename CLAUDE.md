# fnm-pattern-generator

React + Vite app that generates branded geometric patterns on a 16×16 grid. Two UI modes: **Admin** (full editor) and **User** (guided 3-page flow).

## Stack
- React 18, Vite, Tailwind CSS v4, shadcn/ui (custom), lucide-react
- No backend — all state in localStorage, patterns encoded in a 21-char Base62 seed string

## Commands
```
npm run dev       # dev server
npm run build     # production build
npm run preview   # preview build
```

## Key Files

| File | Role |
|------|------|
| `src/App.jsx` | Mode router only (admin vs user), persists in localStorage |
| `src/views/AdminView.jsx` | Full editor: params panel, gallery, image import, dictionary |
| `src/views/UserView.jsx` | 3-page user flow: category → quad-preview → editor/export |
| `src/utils/gridUtils.js` | **All generation logic** — single source of truth |
| `src/utils/gallery.js` | localStorage CRUD for templates, CATEGORIES const |
| `src/utils/dictionary.js` | Keyword-to-params dictionary system |
| `src/components/ParameterPanel.jsx` | Param controls: sliders, seg-groups, color pickers |
| `src/components/PatternCanvas.jsx` | Interactive 16×16 paintable canvas |
| `src/components/PatternPreview.jsx` | SVG output (single + 2×2 tiled quad) |

## Generation Pipeline

```
buildConfigFromParams(params)
  → generatePatternRects(cfg, rng)
      → generateSinglePatternRects  [loop until isValidPattern passes]
          1. sample block count
          2. assign connection types
          3. makeHeights
          4. makeWidths
          5. assign Y positions
  → syncBlocks(rects)
  → extractBlockGroups(rects)   [if symmetry applied]
```

---

## Generation Rules

Each rule is documented in its own file:

| Rule | File |
|------|------|
| Grid coordinate system, allowed sizes | [docs/rules/grid.md](docs/rules/grid.md) |
| Start / end anchor points | [docs/rules/anchors.md](docs/rules/anchors.md) |
| Block count sampling | [docs/rules/block-count.md](docs/rules/block-count.md) |
| Connection types (vertical, horizontal, corner, overlap) | [docs/rules/connections.md](docs/rules/connections.md) |
| Height generation & bias curve | [docs/rules/heights.md](docs/rules/heights.md) |
| Width generation & span constraint | [docs/rules/widths.md](docs/rules/widths.md) |
| Y-position assignment (staircase vs flat) | [docs/rules/y-positions.md](docs/rules/y-positions.md) |
| Validation (7 conditions) | [docs/rules/validation.md](docs/rules/validation.md) |
| PRNG (Mulberry32, seeded) | [docs/rules/prng.md](docs/rules/prng.md) |
| All parameters with defaults & constraints | [docs/rules/parameters.md](docs/rules/parameters.md) |
| Color system (COLOR_PAIRS, BRAND_PALETTE) | [docs/rules/colors.md](docs/rules/colors.md) |
| Seed encoding (Base62, 15 bytes) | [docs/rules/seed.md](docs/rules/seed.md) |
