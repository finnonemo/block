# App Concept — Finnomena Asset Matrix Pattern Builder

> A parametric pattern engine that translates financial risk profiles into brand-consistent SVG grid art for Figma — with full manual control over every cell.

---

## What is it?

A **browser-based design tool** built for Finnomena's designers and content strategists. It procedurally generates abstract **grid patterns** that *visually encode financial characteristics* of asset classes — then exports them as editable SVG vectors directly into Figma.

---

## The Core Idea: Volatility as Visual Language

The app maps **financial behavior → visual pattern**:

| Market Behavior | Visual Outcome |
|---|---|
| Stable / No volatility | Flat, uniform columns — all same height |
| Conservative growth | Gentle, non-decreasing column rise |
| Moderate / Market-linked | Mixed step increments |
| High volatility / Speculative | Irregular spikes — jagged silhouette |

The grid looks like a **bar chart silhouette** — the taller and more irregular the columns, the more aggressive/risky the asset.

---

## The 2×2 Asset Matrix

The app is organized around **4 brand quadrants**, each with a distinct visual personality:

| Quadrant | Brand Colors | Personality | Examples |
|---|---|---|---|
| 🟢 **Solid Foundation** | Emerald + White | Locked/flat — total stability | REITs, Bonds, Real Estate |
| 🟣 **Exotic & High Risk** | Purple + Red + White | Moonshot spikes | Crypto, Venture Capital, Rare Art |
| 🔵 **Safe Haven** | Navy + Blue + White | Smooth, safe step-up | T-Bills, Money Market, Cash |
| 🟠 **Equities & Commodities** | Orange + Yellow + White | Random walk volatility | Stocks, Gold, Oil, Wheat |

Each quadrant holds **16 asset cells** (64 total). Every cell has its own unique pattern.

---

## How It Works — The 3-Step Workflow

```
1. GENERATE  →  2. EDIT  →  3. EXPORT
```

1. **Generate** — Pick a quadrant preset, run the parametric algorithm to auto-generate bar-chart patterns for all 16 assets at once.
2. **Edit** — Open any asset's canvas to manually paint cells, adjust colors (3 slots: A/B/C), drag-resize block groups, or upload an image to remap as a grid pattern.
3. **Export** — Click "Copy SVG" → paste directly into Figma. Each pattern lands as a native, editable vector frame.

---

## Key Modules

### 🎛️ Strategy Matrix Dashboard
The home view showing all 4 quadrants × 16 asset cells. Each cell displays a live mini-preview of its pattern. A single "Regenerate All" button re-runs the parametric generator for an entire quadrant at once.

### 🖼️ Workspace Canvas Editor
The core editing surface. A `16×16` (or higher density) grid where users can:
- **Paint cells** by clicking or dragging (cycles through up to 3 color slots)
- **Enable Columnar Mode** to enforce the bar-chart visual metaphor with strict validation rules
- **Upload an image** to auto-map it onto the grid using brand-color pixel similarity
- **Manage Block Groups** — overlay rectangles that define the SVG atom structure

### ⚙️ Quadrant Configurator
A parameter dashboard where each preset's generation algorithm is tuned via sliders (`amount`, `minHeight`, `maxHeight`, `overlapChance`, `cornerChance`, etc.) or a raw JSON editor. All settings persist to `localStorage`.

---

## Key Technical Highlights

### Block Group Extraction
A greedy rectangle-covering algorithm automatically identifies **3–6 overlapping rectangles** that tile the dominant-color regions of the grid. These become the `<rect>` elements in the exported SVG.

- Uses O(1) prefix-sum (Integral Image) tables for fast area queries
- Scored by: `uncoveredActiveCells − 1.5 × inactiveCells`
- Constrained: max 2-layer overlap depth, each rect must have at least 1 exclusive cell

### Columnar Mode & Validation
Enforces the financial bar-chart metaphor with real-time warnings:
- Heights must be from allowed set: `{1, 2, 3, 4, 6, 8}`
- Columns must trend non-decreasing left → right
- Adjacent columns must connect (overlap or corner-touch)
- At most 3 corner-meet adjacencies per pattern
- No two adjacent columns may share the same `width × height`

### Parametric Generators (4 Presets)

| Preset | Algorithm | Asset Profile |
|---|---|---|
| `locked` | Constant flat height | Total stability — no volatility |
| `safe` | Monotonic step-up sequence | Conservative, steady growth |
| `growth` | Random walk `±[0,1,2]` | Moderate, market-correlated |
| `moonshot` | Flat baseline + spike bursts | High volatility, speculative |

### Image-to-Grid Pipeline
Upload any image → the app pixel-maps it to brand colors via RGB Euclidean distance → contrast adjustment → threshold binarization → majority-vote smoothing → small component removal → auto block group extraction.

### Figma SVG Export
The SVG is copied to clipboard with two MIME types (`text/plain` + `text/html`). Pasting into Figma (Cmd+V) creates native, vector-editable `<rect>` layers inside a Figma Frame.

---

## Design Constraints & Rules Summary

| Rule | Value |
|---|---|
| Block groups per pattern | 3 – 6 |
| Max cell overlap depth | 2 rectangles |
| Allowed column heights | 1, 2, 3, 4, 6, 8 |
| Max corner-meet adjacencies | 3 |
| Color slots per canvas | 1 – 3 (A, B, C) |
| Grid sizes | 16×16 up to 32×40 |
| Output resolution (1:1) | 1920 × 1920 px |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Vanilla CSS + Tailwind CSS |
| Icons | Lucide React |
| State | React hooks (`useState`, `useEffect`) — no external library |
| Persistence | Browser `localStorage` |
| Export | Async Clipboard API + Canvas 2D API |
