# Rule: Color System

**Source:** `src/utils/gridUtils.js` — `COLOR_PAIRS`, `BRAND_PALETTE`, `PALETTES`

## Two-Color Model

Every pattern uses exactly two colors:

| Slot | Role | UI Label |
|------|------|----------|
| `colorA` (surface) | Drawn on top — the block fill color | "Surface" |
| `colorB` (background) | Canvas background | "Background" |

---

## `COLOR_PAIRS` — Preset Brand Pairs

15 curated two-color presets, grouped by brand family. Each pair:

```js
{ id, group, label, surface, background }
```

| Group | Pairs |
|-------|-------|
| Green | Green/Navy, Green 100/25, Green/White |
| Blue | Blue/Navy, Blue 100/25 |
| Orange | Orange 100/25, 75/25, 100/50, Orange/Yellow |
| Yellow | Yellow/Navy, Yellow 100/25 |
| Red | Red 100/25 |
| Purple | Purple/Red, Purple 100/25 |
| Navy | Navy/Lt.Grey |

Shade notation: `100` = darkest (full), `75` = 75%, `50` = 50%, `25` = lightest.

---

## `BRAND_PALETTE` — Raw Swatches

Individual swatches per brand family, 1–4 shades each. Used in the custom color picker.

```js
{
  Navy:      ['#01172b', '#415160', '#808b95', '#c0c5ca'],
  'Lt. Grey':['#a6bfcc', '#bccfd9', '#d3dfe6', '#e9eff2'],
  Yellow:    ['#f2f93c', '#f5fb6d', '#f9fc9e', '#fcfece'],
  White:     ['#ffffff'],
  Green:     ['#00e76b', '#40ed90', '#80f3b5', '#bff9da'],
  Blue:      ['#50cfff', '#7cdbff', '#a8e7ff', '#d3f3ff'],
  Purple:    ['#aa46c3', '#bf74d2', '#d5a3e1', '#ead1f0'],
  Red:       ['#f73232', '#f96565', '#fb9999', '#fdcccc'],
  Orange:    ['#f26414', '#f58b4f', '#f9b28a', '#fcd8c4'],
}
```

---

## Seed Encoding

Both `colorA` and `colorB` are encoded in the seed string (3 bytes each as RGB). Changing either color produces a new seed. See [seed.md](seed.md).
