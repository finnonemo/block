# Image Fill on Block Pattern

## Concept

Allow users to place an actual photo or logo **as the fill texture inside the block shapes**. The pattern's geometric blocks act as a clipping mask — the image shows through them. The background (colorB) stays unchanged. This is completely separate from the existing "Convert to Grid" feature which binarizes an image into blocks.

---

## What the user can do

- Upload a local image (PNG, JPG, WebP)
- The image appears clipped to all block shapes in real-time
- Reposition the image (pan X / pan Y)
- Scale the image (zoom in/out relative to the grid)
- Control opacity (blend over the solid colorA fill)
- Change image (re-upload without losing position/scale)
- Remove image (revert to solid colorA fill)
- Export SVG with image embedded as base64

---

## State

`imageOverlay` lives as a **separate** `useState` in `AdminView` — not inside the main state object (which drives seed encoding). Never included in the seed string.

```js
imageOverlay = null | {
  dataUrl: string,       // base64 JPEG (~800px max)
  aspectRatio: number,   // naturalHeight / naturalWidth
  x: number,            // pan offset as fraction of grid width  (–0.5 to 0.5)
  y: number,            // pan offset as fraction of grid height (–0.5 to 0.5)
  scale: number,        // 1 = image width == grid width  (0.5 to 3)
  opacity: number,      // 0–1
}
```

---

## SVG Rendering Technique

Uses SVG `<clipPath>` — all block rects are listed inside it, then the `<image>` element references it. The colorA block fills remain underneath (visible at opacity < 1).

```svg
<defs>
  <clipPath id="fnm-clip">
    <rect x="..." y="..." width="..." height="..." /> <!-- per block -->
    ...
  </clipPath>
</defs>
<rect fill={colorB} />          <!-- background -->
<rect fill={colorA} per block   <!-- colorA fallback/blend -->
<image href="data:..." clip-path="url(#fnm-clip)" opacity="..." />
```

For the 2×2 tiled `QuadPatternSVG`, 4 separate `<clipPath>` elements use **absolute coordinates** (tile offsets baked in). `<image>` elements are placed at the SVG root (not inside translated `<g>` tags) to avoid SVG coordinate-space issues.

---

## Files Changed

| File | Change |
|------|--------|
| `src/utils/imageUtils.js` | Add `loadImageAsDataUrl(file, maxSize=800)` — preserves aspect ratio, returns base64 + aspectRatio |
| `src/components/ImageOverlayPanel.jsx` | New component — upload zone → sliders (X, Y, scale, opacity) → change/remove |
| `src/components/PatternPreview.jsx` | `PatternSVG` + `QuadPatternSVG` accept `imageOverlay` prop, render clipPath + `<image>` |
| `src/components/PatternCanvas.jsx` | Accept `imageOverlay` prop, render clipPath + `<image>` in existing SVG overlay layer |
| `src/views/AdminView.jsx` | Add `imageOverlay` state, wire callbacks, split Image tab into "Image Fill" / "Convert to Grid" sub-tabs |
| `src/utils/gridUtils.js` | `buildSVG` accepts optional 8th arg `imageOverlay`, embeds `<defs>` + `<image>` with `xmlns:xlink` |
| `src/utils/gallery.js` | `addTemplate` accepts `imageOverlay`, stores it on blocks-based templates |

---

## UI Location

The sidebar **Image** tab now has two sub-tabs:

- **Image Fill** (default) — `ImageOverlayPanel`
- **Convert to Grid** — existing `ImageImport`

---

## Gallery Persistence Notes

- Image overlay stored as base64 JPEG in localStorage alongside block templates
- Templates with image fills are **local-only** — the shared `public/gallery.json` deployment is unsuitable for large image payloads (single image = 50–150 KB)
- `QuotaExceededError` is caught and shown to user: *"Image too large to save locally — export gallery instead"*

---

## Export

`buildSVG` with `imageOverlay` adds `xmlns:xlink` to the root `<svg>` tag and emits both `href` and `xlink:href` on `<image>` for broad SVG consumer compatibility (Figma, Inkscape, browsers).
