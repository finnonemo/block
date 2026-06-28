---
tags: [feature, svg, typography, overlay]
topics: [Text Overlay Implementation]
projects: [fnm-pattern-generator]
url: 
aliases: [Text on Canvas]
---
# [Feature] Text Overlay on Canvas

## Key Takeaways

Added a text overlay system that lets users type text directly onto the pattern canvas with full typography controls — font family (including brand fonts), size, weight, style, alignment, color, position, and opacity. Text is rendered as an SVG `<text>` element and persists in exports and gallery saves. The feature reuses all the same overlay architecture introduced for the image fill feature.

---

## What Was Built

### New sidebar tab: Text

A new 5th tab ("Text") was added to the AdminView sidebar with a `Type` icon and a badge when text is active. It hosts a `TextOverlayPanel` component with two states:

- **Empty state** — textarea + "Add to Canvas" button. Text is only activated when the user commits content.
- **Active state** — editable text input at the top, full controls below, and a Remove (×) button.

### Typography controls

| Control | Range / Options |
|---------|----------------|
| Position X / Y | 0–100% of canvas |
| Font Family | FinnomenaTrek · Space Grotesk · Space Mono · Sans Serif · Serif · Monospace |
| Font Size | 3%–25% of canvas height |
| Font Weight | Regular (400) · Medium (500) · Bold (700) |
| Font Style | Normal · Italic |
| Text Align | Left · Center · Right |
| Color | `<input type="color">` |
| Opacity | 0–100% |

### FinnomenaTrek fonts registered

The brand OTF files in `src/assets/` were registered via `@font-face` in `index.css` — 6 declarations covering all weight/style combinations under the single family name `FinnomenaTrek`. Vite bundles them automatically into the dist. The font works in both HTML and inline SVG in the browser.

---

## Architecture

`textOverlay` follows the exact same state pattern as `imageOverlay`:

```js
// Separate useState in AdminView — never encoded in seed
const [textOverlay, setTextOverlay] = useState(null)

// Shape:
{
  content, x, y, fontSize,     // positioning + content
  fontFamily, fontWeight, fontStyle, textAnchor,  // typography
  color, opacity,               // appearance
}
```

### Rendering pipeline

The `<text>` SVG element is inserted as the **topmost layer** in every renderer:

- `PatternCanvas.jsx` — after grid lines in the SVG overlay
- `PatternSVG` — after image overlay
- `QuadPatternSVG` — 4 separate `<text>` elements at absolute tile offsets (same pattern as image overlay, avoids transform coordinate-space issues)

### Export

`buildSVG` (9th arg `textOverlay`) appends a `<text>` element with all SVG typography attributes (`font-size`, `font-family`, `font-weight`, `font-style`, `text-anchor`, `dominant-baseline`). Works in both the no-image and with-image SVG branches.

### Persistence

`addTemplate` in `gallery.js` saves `textOverlay` for **both** seed-based and blocks-based templates (text is lightweight JSON — no quota risk unlike image base64). `handleLoadTemplate` restores it via `template.textOverlay ?? null`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | 6 `@font-face` declarations for FinnomenaTrek |
| `src/components/TextOverlayPanel.jsx` | New component (empty + active states, all controls) |
| `src/components/PatternCanvas.jsx` | `textOverlay` prop → `<text>` as topmost SVG layer |
| `src/components/PatternPreview.jsx` | `textOverlay` prop in PatternSVG, QuadPatternSVG, wrappers |
| `src/utils/gridUtils.js` | `buildSVG` 9th arg, emits `<text>` in SVG string |
| `src/utils/gallery.js` | `addTemplate` saves textOverlay for both template types |
| `src/views/AdminView.jsx` | State, callback, 5th tab, wiring to CanvasArea/PatternCanvas |

---

## Questions

- Should the text overlay support multiline / line breaks? Currently single-line only (SVG `<text>` doesn't wrap natively — would need `<tspan>` or `foreignObject`).
- Should we expose letter-spacing as a parameter? Could be useful for headline/display use.
- For SVG export, the font is referenced by name only — when the SVG is opened outside the browser (Figma, Illustrator), FinnomenaTrek won't render unless installed. Worth embedding fonts as base64 in the export SVG for portability?
- Should the quad preview show text once (centered across all tiles) or 4× (per tile)? Currently 4× to stay consistent with how tiled patterns work.
