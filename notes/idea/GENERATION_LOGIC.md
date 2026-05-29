# Pattern Generation Logic
## Finnomena Asset Matrix Pattern Builder — Technical Reference

> This document is a precise technical reference for the **Parametric Pattern Generator Engine** and all related grid algorithms. It covers the full pipeline from a preset config to a rendered Figma-ready block layout.

---

## 1. Core Data Model

### 1.1 Grid State

The canvas grid is stored as a **flat 1D array** of color-slot indices:

```js
blocks: number[]  // length = cols × rows
                  // value: 0 = Color A (dominant), 1 = Color B, 2 = Color C
```

Cell `(col, row)` maps to index: `idx = row × cols + col`

### 1.2 Block Groups (Rectangles)

```ts
type Rect = { x: number; y: number; w: number; h: number; }
// x, y = top-left grid cell (0-indexed)
// w, h = width and height in grid cells
```

Block Groups are **bounding rectangles** overlaid on the dominant-color region. They are used for SVG export and columnar-mode validation.

### 1.3 Quadrant Config Schema

```ts
type QuadrantConfig = {
  amount: number;          // Number of atom groups (rectangles) to generate
  emergence: 'bottom' | 'center' | 'top';  // Vertical anchor
  minHeight?: number;      // Minimum allowed height (from allowed set)
  maxHeight?: number;      // Maximum allowed height (from allowed set)
  overlapChance?: number;  // Horizontal overlap probability [0.0–1.0]
  cornerChance?: number;   // Corner-touch probability [0.0–1.0]
  allowPartialEdge?: boolean; // Free Y placement within valid range
  // safe/growth only:
  startH?: number;
  stepUpChance?: number;   // (safe only)
  // moonshot only:
  baseHeight?: number;
  spikeHeight?: number;
  spikeCount?: number;
};
```

---

## 2. Pattern Generator — `generatePatternData()`

**Location:** [`src/utils/gridUtils.js` → `generatePatternData`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L1000)

**Signature:**
```js
generatePatternData(presetType, quadrantConfigs, configMaxHeight, configAmount, configEmergence)
  → { blocks: number[], rectangles: Rect[] }
```

The function executes in **four sequential phases:**

---

### Phase 1 — Height Sequence Generation

Allowed heights are filtered from `[1, 2, 3, 4, 6, 8]` by `[minHeight, maxHeight]`.

#### `safe` — Monotonic Non-Decreasing Step

```
heights = []
curr = startH
for i in [0, amount):
    heights.push(curr)
    curr += (rand() < stepUpChance) ? 0 : 1
heights = heights.map(h => clamp(h, minHeight, maxHeight))
```

- The sequence only ever stays the same or increases.
- `stepUpChance = 0.5` means on average the height steps up every 2 groups.

#### `locked` — Constant Flat

```
baseH = randomChoice(allowedHeights)
heights = Array(amount).fill(baseH)
```

- All groups share the exact same height — visual solidity.

#### `growth` — Gaussian Random Walk

```
heights = []
curr = startH
for i in [0, amount):
    heights.push(curr)
    Δ = randomChoice([-2, -1, 0, 1, 2])
    curr += Δ
heights = heights.map(h => clamp(h, minHeight, maxHeight))
```

- Simulates market price ticks. Uniform random delta ∈ {−2, −1, 0, +1, +2}.

#### `moonshot` — Flat Base + Spikes

```
heights = Array(amount - spikeCount).fill(baseHeight)
        ++ Array(spikeCount).fill(spikeHeight)
```

- Long stable baseline with a small number of extreme vertical spikes.

#### Default (no preset) — Random Legal

```
heights = Array(amount).fill(null).map(() => randomChoice(allowedHeights))
```

#### Post-Generation Sort

**All presets** have heights sorted ascending before placement:
```js
heights.sort((a, b) => a - b)
```
This enforces the visual left-to-right non-decreasing trend.

---

### Phase 2 — Width Partitioning

The generator must find a set of `amount` widths that **exactly tile** the 16-column grid.

#### Constraint Equation

```
Σ widths[i] − Σ overlaps[i] = 16
// where overlaps[0] = 0 always
```

#### Allowed Widths Selection

```
if maxHeight <= 3:  allowedW = [1, 2]
elif maxHeight <= 4: allowedW = [2, 3]
else:               allowedW = [4, 6]
// After 500 failed attempts: allowedW = [1, 2, 3, 4, 6, 8]
```

#### Case A — No Overlaps (`overlapChance = 0.0`)

All preset configurations default to `overlapChance = 0.0`:

```
overlaps = Array(amount).fill(0)

for attempt in [0, 1000):
    candidate = [randomChoice(allowedW) for i in amount]
    sum = Σ candidate
    
    if attempt < 400:
        // Duplicate-dimension check
        hasDuplicate = any(candidate[i] == candidate[i-1]
                       AND heights[i] == heights[i-1]  for i in [1,amount))
    
    if sum == 16 AND NOT hasDuplicate:
        widths = candidate; break
```

**Fallback** (if 1000 attempts fail to sum to 16):
```
baseW = floor(16 / amount)
widths = Array(amount).fill(baseW)
// Distribute remainder:
while Σwidths < 16: widths[idx]++; idx = (idx+1) % amount
while Σwidths > 16: widths[idx]--; idx = (idx+1) % amount
widths = widths.map(w => clamp(w, 1, 8))
```

#### Case B — With Overlaps (`overlapChance > 0`)

```
for attempt in [0, 1000):
    candidateW = []
    candidateO = [0]  // first overlap is always 0
    span = 0
    
    for i in [0, amount):
        w = randomChoice(allowedW)
        candidateW.push(w)
        
        if i > 0:
            maxOverlap = min(2, min(prevW, w) - 1)
            o = (maxOverlap > 0 AND rand() < overlapChance)
                ? floor(rand() × (maxOverlap + 1))
                : 0
            candidateO.push(o)
            span += (w - o)
        else:
            span += w
    
    if span == 16 AND NOT hasDuplicate:
        widths = candidateW; overlaps = candidateO; break
```

- Maximum overlap between two adjacent groups is `min(2, min(prevW, w) − 1)` cells.
- Overlap causes the next group's X position to start inside the previous group.

---

### Phase 3 — Y-Position Assignment

Y-coordinates are computed sequentially, with each group constrained to maintain connectivity with the previous.

#### Emergence Anchor Values

```js
const emergenceMap = { bottom: 16, center: 8, top: 4 }
emergenceVal = emergenceMap[emergence]
```

#### Base Y Calculation

```
baseY = clamp(emergenceVal − h, 0, 16 − h)
```

#### Group 0 (First Group)

```
yCoords[0] = baseY
```

#### Groups 1..N (Connectivity Clamping)

For each subsequent group `idx`:

```
prevY = yCoords[idx - 1]
prevH = heights[idx - 1]
currH = heights[idx]

// Connectivity range: must overlap OR corner-touch previous
minY = prevY - currH + 1  // bottom of prev = bottom of curr (corner meet from above)
maxY = prevY + prevH - 1  // top of prev = top of curr (corner meet from below)
```

**Corner Meet Option** (when `cornerChance > 0` and `corners < 2` and `overlap[idx] == 0`):
```
options = []
if prevY + prevH + currH <= 16:  options.push(prevY + prevH)  // touch below
if prevY >= currH:               options.push(prevY - currH)   // touch above

if options.length > 0 AND rand() < cornerChance:
    y = randomChoice(options)
    cornerMeetsCreated++
    // Skip connectivity clamping
```

**Standard Connectivity Clamping:**
```
if allowPartialEdge:
    validMin = max(0, minY)
    validMax = min(16 − currH, maxY)
    if validMin <= validMax:
        y = validMin + floor(rand() × (validMax − validMin + 1))
    else:
        y = clamp(clamp(baseY, 0, 16−currH), minY, maxY)
else:
    y = clamp(clamp(baseY, 0, 16−currH), minY, maxY)
```

---

### Phase 4 — Rectangle Assembly

```
currentX = 0
for idx in [0, amount):
    if idx > 0:
        currentX += widths[idx-1] - overlaps[idx]
    
    rect = { x: currentX, y: yCoords[idx], w: widths[idx], h: heights[idx] }
    nextRects.push(rect)
```

#### Duplicate-Dimension Fix

Before pushing, if the new rect has the same `(w, h)` as the previous and both are edge-connected:
```
// Try to find a taller height
alternatives = allowedHeights.filter(x => x > prevH)
if alternatives:
    currH = randomChoice(alternatives)
else:
    // Swap current width with a different group's width
    for j in [0, amount): if widths[j] != widths[idx]: swap(widths[idx], widths[j])
```

---

### Phase 5 — Sync Blocks from Rectangles

```js
// syncBlocksWithRects
blocks = Array(cols × rows).fill(1)  // fill with Color B
for each rect:
    for row in [rect.y, rect.y + rect.h):
        for col in [rect.x, rect.x + rect.w):
            blocks[row × cols + col] = 0  // set to Color A (dominant)
```

---

## 3. Block Group Extraction — `extractBlockGroups()`

**Location:** [`src/utils/gridUtils.js` → `extractBlockGroups`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L654)

Used after manual painting or image conversion, when the grid's pixel state must be reverse-engineered into a structured set of Block Groups.

### 3.1 Setup

```js
// 1. Build active cell bitmap
for i in [0, size): activeArr[i] = (blocks[i] === targetColorIndex) ? 1 : 0

// 2. Initialize tracking arrays
overlapCount = Uint8Array(size).fill(0)  // how many rects cover each cell
coveredArr   = Uint8Array(size).fill(0)  // whether any rect covers this cell
rectangles   = []
```

### 3.2 Greedy Rectangle Selection Loop

Runs up to `maxK = 6` iterations:

```
for k in [0, 6):
    // Build O(1) prefix-sum tables
    sumActive  = makeSumTable((c,r) => activeArr[r*cols+c])
    sumCovered = makeSumTable((c,r) => coveredArr[r*cols+c])
    
    bestRect = null; bestScore = -∞
    
    for y in [0, rows):
      for x in [0, cols):
        for h in [1, rows-y]:
          for w in [1, cols-x]:
            if w*h < 2: continue           // min size 1×2 or 2×1
            if w > 8 OR h > 8: continue    // max size cap
            
            candidate = {x, y, w, h}
            if NOT canAddRect(candidate): continue
            
            activeCount   = querySum(sumActive,  x, y, w, h)
            coveredCount  = querySum(sumCovered, x, y, w, h)
            uncoveredActive = activeCount - coveredCount
            inactiveCount = (w*h) - activeCount
            
            score = uncoveredActive - 1.5 × inactiveCount
            
            if score > bestScore:
                bestScore = score; bestRect = candidate
    
    if bestRect AND bestScore > 0:
        commitRect(bestRect)  // update overlapCount + coveredArr
    else:
        break  // no more valid improvements
```

### 3.3 Constraint Check — `canAddRect(candidate)`

```
// Rule A: max 2 rects per cell
for all cells in candidate:
    if overlapCount[cell] >= 2: return false

// Rule B: candidate must have ≥1 exclusive cell (currently uncovered)
hasExclusive = any(overlapCount[cell] == 0 for cell in candidate)
if NOT hasExclusive: return false

// Rule C: must not steal last exclusive cell from any existing rect
for each existing in rectangles:
    remainingExclusive = count(cells in existing
                               where overlapCount[cell] == 1
                               AND cell NOT in candidate)
    if remainingExclusive == 0: return false

return true
```

### 3.4 Minimum Fallback (K < 3)

```
while rectangles.length < 3:
    // Strategy 1: find uncovered active cell, place 1×2 or 2×1
    for i in uncovered active cells:
        candidate = (r+1 < rows) ? {x:c, y:r, w:1, h:2} : {x:c, y:r, w:2, h:1}
        if canAddRect(candidate): commitRect(candidate); break
    
    // Strategy 2: try any active cell (even covered)
    // Strategy 3: last resort — scan top-left for any valid 1×2
    if no placement found: break
```

### 3.5 Prefix Sum Table — `makeSumTable()` / `querySum()`

```js
// Build: O(rows × cols)
table[r][c] = valFn(c, r) + table[r-1][c] + table[r][c-1] - table[r-1][c-1]

// Query: O(1)  — area sum of rectangle [x, y, x+w-1, y+h-1]
querySum(table, x, y, w, h):
    x2 = x+w-1; y2 = y+h-1
    return table[y2][x2]
         - (y > 0 ? table[y-1][x2] : 0)
         - (x > 0 ? table[y2][x-1] : 0)
         + (x > 0 AND y > 0 ? table[y-1][x-1] : 0)
```

---

## 4. Dynamic Paint Sync — `tryExpandRectangles()` + `tryAddNewBlockGroups()`

### 4.1 Expand/Shrink Loop

**Location:** [`src/utils/gridUtils.js` → `tryExpandRectangles`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L432)

After any paint action, the system adjusts each existing rectangle without full re-extraction:

```
repeat until stable:
  for each rect:
    // SHRINK — edge row/col all inactive (non-dominant)
    if top row of rect all inactive:    rect.y++; rect.h--
    if bottom row of rect all inactive: rect.h--
    if left col of rect all inactive:   rect.x++; rect.w--
    if right col of rect all inactive:  rect.w--
    
    // EXPAND — adjacent exterior strip all active (dominant)
    if row above rect all active:  rect.y--; rect.h++
    if row below rect all active:  rect.h++
    if col left of rect all active: rect.x--; rect.w++
    if col right of rect all active: rect.w++

// Remove rects with no active cells remaining
rects = rects.filter(rect has any active cell)
```

Minimum size guard: shrink only if resulting `w × h ≥ 2`.

### 4.2 New Group Emergence

**Location:** [`src/utils/gridUtils.js` → `tryAddNewBlockGroups`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L522)

```
// Find cells active but not covered by any rect
uncovered = {i : blocks[i] === 0 AND overlapCount[i] === 0}

// BFS to find 4-connected clusters
for each unvisited uncovered cell:
    cluster = BFS(4-connected active uncovered cells)
    if cluster.size < 2: skip
    
    boundingBox = minBoundingRect(cluster)
    
    if canAddRectLocal(boundingBox): 
        add to rectangles (up to max 6)
```

---

## 5. Columnar Mode Validation — `validateColumnarMode()`

**Location:** [`src/utils/gridUtils.js` → `validateColumnarMode`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L871)

Operates on the 16-column Columnar Mode layout only.

### 5.1 Height Map Extraction

```js
colHeights = Array(16).fill(0)
colY       = Array(16).fill(0)

// Sort by x, assign dominant height per column
rects.sort(by x).forEach(r => {
    for x in [r.x, r.x + r.w):
        colHeights[x] = r.h
        colY[x] = r.y
})
```

### 5.2 Validation Rules

**Rule 1 — Valid Height Set:**
```
validHeights = [1, 2, 3, 4, 6, 8]
for c in [0, 16):
    if colHeights[c] NOT in validHeights: WARN 'height'
```

**Rule 2 — Non-Decreasing Trend:**
```
for c in [0, 15):
    if colHeights[c] > colHeights[c+1]: WARN 'trend'
```

**Rule 3 — Connectivity & Corner Count:**
```
cornerCount = 0
for c in [0, 15):
    yA = colY[c];    hA = colHeights[c]
    yB = colY[c+1];  hB = colHeights[c+1]
    
    overlaps     = (yA <= yB+hB-1) AND (yB <= yA+hA-1)
    isCornerMeet = (yA == yB+hB) OR (yB == yA+hA)
    
    if isCornerMeet: cornerCount++
    if NOT overlaps AND NOT isCornerMeet: WARN 'connectivity'

if cornerCount > 3: WARN 'corner-limit'
```

**Rule 4 — No Duplicate Adjacent Dimensions:**
```
for each pair of adjacent rects (sorted by x):
    if they share an edge-overlap (overlap in Y ranges):
        if rA.w == rB.w AND rA.h == rB.h: WARN 'duplicate-dimensions'
```

---

## 6. Volatility Classifier — `getVolatilityStyle()`

**Location:** [`src/utils/gridUtils.js` → `getVolatilityStyle`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L967)

```js
diffSum = Σ |colHeights[c+1] − colHeights[c]|  for c in [0, 15)

if diffSum === 0:  → 'Solid Flat'          (text-slate-400)
if diffSum <= 4:   → 'Smooth / Conservative' (text-emerald-400)
if diffSum <= 10:  → 'Moderate Growth'     (text-sky-400)
else:              → 'Jagged / Aggressive Growth' (text-rose-400)
```

---

## 7. Image-to-Grid Processing — `processImageData()`

**Location:** [`src/utils/gridUtils.js` → `processImageData`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L325)

### 7.1 Full Pipeline

```
1. Scale image to (cols × rows) using cover-fit crop
2. Per pixel: compute similarity to Color A
   dist      = √((r−rA)² + (g−gA)² + (b−bA)²)
   normDist  = dist / 300.0
   similarity = clamp(1 − normDist, 0, 1)
   s          = clamp((similarity − 0.5) × contrast + 0.5, 0, 1)

3. Threshold binarize:
   val = (s >= threshold) ? 0 : 1
   if invert: val = 1 − val

4. Majority filter (smoothPasses iterations):
   3×3 neighborhood majority vote

5. Small component removal (spotLimit):
   BFS flood fill; absorb islands/holes ≤ spotLimit cells

6. Bridge dominants:
   Any non-dominant cell touching ≥ 2 distinct dominant blobs → becomes dominant

7. Modulo-map to palette:
   blocks[i] = val % numColors
```

### 7.2 Majority Filter — `applyMajorityFilter()`

```
for pass in [0, passes):
    next = copy(blocks)
    for each cell (r, c):
        counts = tally all values in 3×3 window (clamped to grid)
        next[r*cols+c] = argmax(counts)
    blocks = next
```

### 7.3 Small Component Removal — `removeSmallComponents()`

```
for pass in [0, 2):  // max 2 passes
    BFS flood-fill to label all connected components (4-connectivity)
    for each component:
        if component.size <= minSize:
            borderCounts = tally values of neighboring cells outside component
            majorityNeighbor = argmax(borderCounts)
            if majorityNeighbor != component.value:
                fill all component cells with majorityNeighbor
```

### 7.4 Bridge Dominant Components — `bridgeCloseDominantComponents()`

```
// Phase 1: label all dominant (Color A) connected components
componentIds[i] = compId  // if blocks[i] === dominantIdx

// Phase 2: for each non-dominant cell
for each cell where blocks[cell] != dominantIdx:
    adjacentCompIds = {componentIds[neighbor] for 4-neighbors if > 0}
    if adjacentCompIds.size >= 2:
        blocks[cell] = dominantIdx  // bridge the gap
```

---

## 8. Grid Dimension Remapping — `mapBlocksGrid()`

**Location:** [`src/utils/gridUtils.js` → `mapBlocksGrid`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/utils/gridUtils.js#L66)

```
if newCols == oldCols × 2 AND newRows == oldRows × 2:
    // 2× upscale: pixel doubling
    newBlocks[r][c] = oldBlocks[floor(r/2)][floor(c/2)]

elif oldCols == newCols × 2 AND oldRows == newRows × 2:
    // 2× downscale: majority vote over 2×2 child block
    children = [oldBlocks[2r][2c], [2r][2c+1], [2r+1][2c], [2r+1][2c+1]]
    newBlocks[r][c] = mostFrequent(children)

else:
    // Nearest-neighbor: normalized UV lookup
    normR = r / (newRows - 1)
    normC = c / (newCols - 1)
    oldR = round(normR × (oldRows - 1))
    oldC = round(normC × (oldCols - 1))
    newBlocks[r][c] = oldBlocks[oldR][oldC]
```

---

## 9. SVG Export Logic

**Location:** [`src/App.jsx`](file:///Users/kane/Projects/Finnomena/fnm-pattern-builder/fnm-pattern-builder-v01/src/App.jsx) — `copySvgToClipboard()` handler

### 9.1 Output Resolution Map

```js
const targetWidth  = ratio === '16:9' ? 1920 : ratio === '9:16' ? 1080 : ratio === '4:5' ? 1920 : ratio === 'A4' ? 1190 : 1920;
const targetHeight = ratio === '16:9' ? 1080 : ratio === '9:16' ? 1920 : ratio === '4:5' ? 2400 : ratio === 'A4' ? 1684 : 1920;

blockWidth  = targetWidth  / cols
blockHeight = targetHeight / rows
```

### 9.2 SVG Generation

```xml
<svg xmlns="http://www.w3.org/2000/svg"
     width="{targetWidth}" height="{targetHeight}"
     viewBox="0 0 {targetWidth} {targetHeight}">

  <!-- One <rect> per Block Group -->
  <rect
    x="{rect.x × blockWidth}"
    y="{rect.y × blockHeight}"
    width="{rect.w × blockWidth}"
    height="{rect.h × blockHeight}"
    fill="{colorA_hex}" />
  ...
</svg>
```

### 9.3 Clipboard Write

```js
await navigator.clipboard.write([
  new ClipboardItem({
    'text/plain': new Blob([svgString], { type: 'text/plain' }),
    'text/html':  new Blob([`<html><body>${svgString}</body></html>`], { type: 'text/html' })
  })
]);
```

Pasting into Figma (Cmd/Ctrl+V) creates native `<rect>` vector layers inside a Figma Frame.

---

## 10. State History (Undo/Redo)

```js
type Snapshot = {
  blocks:             number[];   // flat color-index grid
  rectangles:         Rect[];     // Block Group layout
  columnarMode:       boolean;
  selectedColors:     string[];   // hex values for slots A, B, C
  dominantColorIndex: number;     // 0 | 1 | 2
}

// Save
history = history.slice(0, historyIndex + 1)
history.push(snapshot)
historyIndex = history.length - 1

// Undo (Ctrl/Cmd+Z)
historyIndex--
restore(history[historyIndex])

// Redo (Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y)
historyIndex++
restore(history[historyIndex])
```

State-mutating triggers that push to history:
- Manual cell paint (on mouse up)
- Generate pattern
- Grid ratio/size change
- Color slot add/remove/change
- Columnar mode enable/disable
- Block group move/resize (drag end)
- Image apply
- Quick presets (checkerboard, fill, invert)

---

## 11. Complete Generation Call Flow

```
User clicks "Generate" (with presetType = 'safe' | 'locked' | 'growth' | 'moonshot' | null)
  │
  ├─ generatePatternData(presetType, configs, ...)
  │    ├─ Phase 1: Height sequence generation (preset-specific math)
  │    ├─ heights.sort() — enforce ascending order
  │    ├─ Phase 2: Width partitioning (sum to 16, no duplicates)
  │    ├─ Phase 3: Y-position assignment (connectivity clamping)
  │    └─ Phase 4: Rectangle assembly → nextRects[]
  │
  ├─ syncBlocksWithRects(nextRects)
  │    └─ Fill blocks[] with Color A (0) inside rects, Color B (1) elsewhere
  │
  ├─ setRectangles(nextRects)
  ├─ setBlocks(newBlocks)
  └─ saveToHistory(newBlocks, nextRects, ...)
```

```
User paints a cell
  │
  ├─ blocks[idx] = (blocks[idx] + 1) % numColors
  ├─ setBlocks(newBlocks)
  │
  └─ (if suggestAtomGroups):
       ├─ tryExpandRectangles(newBlocks, rects, ...)
       │    └─ Shrink/expand existing rects to fit active cells
       └─ tryAddNewBlockGroups(newBlocks, adjustedRects, ...)
            └─ BFS new clusters → add bounding rects (up to 6)
```

```
User uploads image
  │
  ├─ extractColorsFromDataUrl(imgUrl)
  │    ├─ Scale to 64×64
  │    ├─ Snap each pixel to nearest brand swatch
  │    ├─ Top 2 colors → selectedColors[A, B]
  │    └─ startGenerationAnimation(imgUrl, newColors)
  │
  └─ startGenerationAnimation(imgUrl, newColors)
       ├─ processImageData(img, cols, rows, 0.6, contrast, ...)
       │    ├─ Cover-fit scale + pixel similarity
       │    ├─ Threshold binarize
       │    ├─ Majority filter (smoothPasses)
       │    ├─ Remove small components (spotLimit)
       │    └─ Bridge dominant components
       ├─ extractBlockGroups(rawBlocks, ...)
       ├─ Diagonal sweep animation (bottom-left → top-right)
       ├─ If overlap violations: threshold += step → runPass() again
       └─ Commit final state → saveToHistory()
```
