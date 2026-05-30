export const COLS = 16;
export const ROWS = 16;

const ALLOWED_HEIGHTS = [1, 2, 3, 4, 6, 8, 10, 12, 14];
const ALLOWED_WIDTHS  = [1, 2, 3, 4, 6, 8, 10, 12, 14];

export const BRAND_PALETTE = {
  Navy:       ['#01172b', '#415160', '#808b95', '#c0c5ca'],
  'Lt. Grey': ['#a6bfcc', '#bccfd9', '#d3dfe6', '#e9eff2'],
  Yellow:     ['#f2f93c', '#f5fb6d', '#f9fc9e', '#fcfece'],
  White:      ['#ffffff'],
  Green:      ['#00e76b', '#40ed90', '#80f3b5', '#bff9da'],
  Blue:       ['#50cfff', '#7cdbff', '#a8e7ff', '#d3f3ff'],
  Purple:     ['#aa46c3', '#bf74d2', '#d5a3e1', '#ead1f0'],
  Red:        ['#f73232', '#f96565', '#fb9999', '#fdcccc'],
  Orange:     ['#f26414', '#f58b4f', '#f9b28a', '#fcd8c4'],
};

// Predefined brand color palettes (surface = Color A, background = Color B)
export const PALETTES = [
  { id: 'foundation', label: 'Foundation', surface: '#00e76b', background: '#01172b' },
  { id: 'haven',      label: 'Haven',      surface: '#50cfff', background: '#01172b' },
  { id: 'equities',  label: 'Equities',   surface: '#f26414', background: '#f2f93c' },
  { id: 'exotic',    label: 'Exotic',     surface: '#aa46c3', background: '#f73232' },
  { id: 'clean',     label: 'Clean',      surface: '#00e76b', background: '#ffffff' },
];

// Two-color preset pairs organized by brand family
// label format: "{Family} {surfaceShade}/{bgShade}" where 100=darkest shade, 25=lightest
export const COLOR_PAIRS = [
  // Green
  { id: 'grn-nav',    group: 'Green',  label: 'Green / Navy',    surface: '#00e76b', background: '#01172b' },
  { id: 'grn-100-25', group: 'Green',  label: 'Green 100/25',    surface: '#00e76b', background: '#bff9da' },
  { id: 'grn-wht',    group: 'Green',  label: 'Green / White',   surface: '#00e76b', background: '#ffffff' },
  // Blue
  { id: 'blu-nav',    group: 'Blue',   label: 'Blue / Navy',     surface: '#50cfff', background: '#01172b' },
  { id: 'blu-100-25', group: 'Blue',   label: 'Blue 100/25',     surface: '#50cfff', background: '#d3f3ff' },
  // Orange
  { id: 'org-100-25', group: 'Orange', label: 'Orange 100/25',   surface: '#f26414', background: '#fcd8c4' },
  { id: 'org-75-25',  group: 'Orange', label: 'Orange 75/25',    surface: '#f58b4f', background: '#fcd8c4' },
  { id: 'org-100-50', group: 'Orange', label: 'Orange 100/50',   surface: '#f26414', background: '#f9b28a' },
  { id: 'org-yel',    group: 'Orange', label: 'Orange / Yellow', surface: '#f26414', background: '#f2f93c' },
  // Yellow
  { id: 'yel-nav',    group: 'Yellow', label: 'Yellow / Navy',   surface: '#f2f93c', background: '#01172b' },
  { id: 'yel-100-25', group: 'Yellow', label: 'Yellow 100/25',   surface: '#f2f93c', background: '#fcfece' },
  // Red
  { id: 'red-100-25', group: 'Red',    label: 'Red 100/25',      surface: '#f73232', background: '#fdcccc' },
  // Purple
  { id: 'pur-red',    group: 'Purple', label: 'Purple / Red',    surface: '#aa46c3', background: '#f73232' },
  { id: 'pur-100-25', group: 'Purple', label: 'Purple 100/25',   surface: '#aa46c3', background: '#ead1f0' },
  // Navy
  { id: 'nav-gry',    group: 'Navy',   label: 'Navy / Lt.Grey',  surface: '#01172b', background: '#a6bfcc' },
];

// Complexity meta — controls block count only; height is driven by Trend Volatility
export const COMPLEXITY = {
  1: { label: 'Low',     amountOpts: [3],    description: '3 groups' },
  2: { label: 'Med',     amountOpts: [4, 5], description: '4–5 groups' },
  3: { label: 'High',    amountOpts: [6],    description: '6 groups' },
  4: { label: 'Extreme', amountOpts: [7, 8], description: '7–8 groups' },
};

export const START_HEIGHT_OPTIONS = [
  { value: 0,  label: '0',  sub: 'Bot' },
  { value: 4,  label: '4',  sub: '' },
  { value: 8,  label: '8',  sub: 'Ctr' },
  { value: 12, label: '12', sub: '' },
  { value: 16, label: '16', sub: 'Top' },
];

export const END_HEIGHT_OPTIONS = [
  { value: 0,  label: '0',  sub: 'Bot' },
  { value: 4,  label: '4',  sub: '' },
  { value: 8,  label: '8',  sub: 'Ctr' },
  { value: 12, label: '12', sub: '' },
  { value: 16, label: '16', sub: 'Top' },
];

// Default parameters
export const DEFAULT_PARAMS = {
  blockMin:      3,    // Minimum number of blocks
  blockMax:      5,    // Maximum number of blocks
  startX:        0,    // 0–15: left edge of first block
  startY:        10,   // 0–15: top edge of first block
  startMinW:     2,
  startMaxW:     4,
  startMinH:     4,
  startMaxH:     8,
  endX:          16,   // 1–16: right edge of last block (bottom-right corner X)
  endY:          6,    // 1–16: bottom edge of last block (bottom-right corner Y)
  endMinW:       6,
  endMaxW:       10,
  endMinH:       4,
  endMaxH:       8,
  cornerChance:  0,    // 0–3 exact corner connections
  horizontalChance: 0, // 0-3 exact horizontal connections
};

// Build generation config from the UI parameters
export function buildConfigFromParams({
  blockMin = 3, blockMax = 5,
  startX = 0, startY = 10,
  startMinW = 2, startMaxW = 4, startMinH = 4, startMaxH = 8,
  endX = 16,  endY = 6,
  endMinW = 6, endMaxW = 10, endMinH = 4, endMaxH = 8,
  cornerChance = 0, horizontalChance = 0,
}) {
  return {
    blockMin,
    blockMax,
    startY,                            // top-edge Y of first block
    exitVal:      endY,                // bottom-edge Y of last block
    startX,                            // first block left-edge X
    targetSpan:   endX - startX,       // X columns from startX to endX
    startMinW, startMaxW, startMinH, startMaxH,
    endMinW, endMaxW, endMinH, endMaxH,
    targetCorners: cornerChance,
    horizontalChance,
  };
}

// Mulberry32 seeded PRNG — deterministic, fast, good distribution
export function createRNG(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function rand(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function randRange(min, max, rng) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(rng() * (hi - lo + 1)) + lo;
}

function makeHeights(cfg, rng) {
  const { amount, connectionTypes, forcedStartH, forcedEndH } = cfg;

  // Staircase trend (start height !== end height):
  // heights must sum to Math.abs(ev - xv) + shared rows so they tile the trend exactly.
  const ev = typeof cfg.emergenceVal === 'number' ? cfg.emergenceVal : ROWS;
  const xv = typeof cfg.exitVal      === 'number' ? cfg.exitVal      : ev;
  if (ev !== xv && connectionTypes) {
    // Connection 1 (i=1) can share 1 row if vertical, others share 2 rows.
    const verticalCount1 = connectionTypes[1] === 'vertical' ? 1 : 0;
    const verticalCountRest = connectionTypes.slice(2).filter(t => t === 'vertical').length;
    const targetSum = Math.abs(ev - xv) + (verticalCount1 * 1) + (verticalCountRest * 2);

    const heights = [];
    let remaining = targetSum;
    // The first amount-1 heights (0 to amount-2) must sum to targetSum
    for (let i = 0; i < amount - 2; i++) {
      const minLeft = amount - i - 2;
      const maxH    = Math.min(14, remaining - minLeft);
      const pool    = ALLOWED_HEIGHTS.filter(h => h >= 1 && h <= maxH);

      let picked;
      if (pool.length) {
        const avgH = targetSum / (amount - 1);
        const sortedPool = [...pool].sort((a, b) => Math.abs(a - avgH) - Math.abs(b - avgH));
        const subPool = sortedPool.slice(0, 3);
        picked = subPool.length ? rand(subPool, rng) : rand(pool, rng);
      } else {
        picked = 1;
      }

      heights.push(picked);
      remaining -= picked;
    }
    heights.push(clamp(remaining, 1, 14));

    // Generate the last block height independently (must be >= heights[amount-2])
    const minLastH = heights[heights.length - 1];
    const avgH = targetSum / (amount - 1);
    const pool = ALLOWED_HEIGHTS
      .filter(h => h >= minLastH)
      .sort((a, b) => Math.abs(a - avgH) - Math.abs(b - avgH));
    const subPool = pool.slice(0, 3);
    heights.push(subPool.length ? rand(subPool, rng) : minLastH);

    heights.sort((a, b) => a - b);
    if (forcedStartH != null) heights[0]              = clamp(forcedStartH, 1, 14);
    if (forcedEndH   != null) heights[heights.length - 1] = clamp(forcedEndH, 1, 14);
    return heights;
  }

  // Non-staircase
  const minBound = Math.min(forcedStartH ?? 1, forcedEndH ?? 14);
  const maxBound = Math.max(forcedStartH ?? 1, forcedEndH ?? 14);
  const pool = ALLOWED_HEIGHTS.filter(h => h >= minBound && h <= maxBound);
  const finalPool = pool.length ? pool : [forcedStartH ?? 1];
  const h = Array(amount).fill(null).map(() => rand(finalPool, rng));
  h.sort((a, b) => a - b);
  if (forcedStartH != null) h[0]          = clamp(forcedStartH, 1, 14);
  if (forcedEndH   != null) h[h.length - 1] = clamp(forcedEndH, 1, 14);
  return h;
}

function makeWidths(heights, amount, rng, strictNoDupDims = false, connectionTypes = null, targetSpan = COLS, forcedStartW = null, forcedEndW = null) {
  const maxW     = Math.max(1, targetSpan - amount + 1);
  const allowedW = Array.from({ length: maxW }, (_, i) => i + 1);

  const avgW       = targetSpan / amount;
  const maxTargetW = Math.min(maxW, avgW * 2);
  const startW = forcedStartW != null ? forcedStartW : 3;
  const endW   = forcedEndW   != null ? forcedEndW   : 8;

  for (let attempt = 0; attempt < 1000; attempt++) {
    const widths = Array(amount).fill(0).map((_, i) => {
      if (i === 0 && forcedStartW != null) return clamp(forcedStartW, 1, targetSpan);
      if (i === amount - 1 && forcedEndW != null) return clamp(forcedEndW, 1, targetSpan);
      const t      = amount > 1 ? i / (amount - 1) : 0.5;
      const targetW = startW + t * (endW - startW);
      const pool   = [...allowedW].sort((a, b) => Math.abs(a - targetW) - Math.abs(b - targetW));
      const poolSz = 3;
      return rand(pool.slice(0, poolSz), rng);
    });
    // Widths are positional — no sort
    const overlaps = [0];

    for (let i = 1; i < amount; i++) {
      const minOvReq = i === 1 ? 1 : 2;
      const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
      if (maxOv >= minOvReq) {
        const type = connectionTypes ? connectionTypes[i] : 'vertical';
        if (type === 'horizontal') {
          // Horizontal Edge Connect: They must overlap horizontally, so overlapX >= 1
          const overlapAmount = Math.max(1, Math.ceil(rng() * maxOv));
          overlaps.push(Math.max(minOvReq, Math.min(overlapAmount, maxOv)));
        } else {
          // Vertical Edge Connect or Corner: They must NOT overlap horizontally, so overlapX = 0
          overlaps.push(0);
        }
      } else {
        // If widths are too small to overlap, but it's a horizontal edge connection, fail this attempt
        if (connectionTypes && connectionTypes[i] === 'horizontal') {
          overlaps.push(-1);
        } else {
          overlaps.push(0);
        }
      }
    }

    if (overlaps.includes(-1)) continue;

    const span = widths.reduce((s, w, i) => s + w - overlaps[i], 0);
    if (span !== targetSpan) continue;

    if (attempt < 400 || strictNoDupDims) {
      const hasDup = widths.some(
        (w, i) => i > 0 && overlaps[i] === 0 && w === widths[i - 1] && heights[i] === heights[i - 1]
      );
      if (hasDup) continue;
    }

    return { widths, overlaps };
  }

  // Fallback: even split, positional (no sort)
  const base   = Math.floor(targetSpan / amount);
  const widths = Array(amount).fill(base);
  if (forcedStartW != null) widths[0]          = clamp(forcedStartW, 1, targetSpan);
  if (forcedEndW   != null) widths[amount - 1] = clamp(forcedEndW,   1, targetSpan);
  
  let diff = targetSpan - widths.reduce((a, b) => a + b, 0);
  
  if (amount > 2) {
    if (diff > 0) {
      for (let i = 1; diff > 0; i = i === amount - 2 ? 1 : i + 1, diff--) widths[i]++;
    } else if (diff < 0) {
      let borrowAttempt = 0;
      for (let i = 1; diff < 0 && borrowAttempt < 1000; i = i === amount - 2 ? 1 : i + 1, borrowAttempt++) {
        if (widths[i] > 1) { widths[i]--; diff++; }
      }
      // If middle blocks are completely squashed to 1, we are forced to borrow from start/end
      while (diff < 0) {
        if (widths[0] > 1) { widths[0]--; diff++; }
        else if (widths[amount - 1] > 1) { widths[amount - 1]--; diff++; }
        else break;
      }
    }
  } else {
    for (let i = 0; diff > 0; i = (i + 1) % amount, diff--) widths[i]++;
  }

  return { widths, overlaps: Array(amount).fill(0) };
}

// ─── Public generation ───────────────────────────────────────────────────────

function generateSinglePatternRects(cfg, rng) {
  const amount = Math.max(2, randRange(cfg.blockMin ?? 3, cfg.blockMax ?? 5, rng));

  const startH = randRange(cfg.startMinH ?? 1, cfg.startMaxH ?? 14, rng);
  const endH = randRange(cfg.endMinH ?? 1, cfg.endMaxH ?? 14, rng);
  const startW = randRange(cfg.startMinW ?? 1, cfg.startMaxW ?? 14, rng);
  const endW = randRange(cfg.endMinW ?? 1, cfg.endMaxW ?? 14, rng);

  // Hoist anchor / span variables so they're available before makeHeights
  const emergenceVal = clamp(cfg.startY + startH, 0, ROWS);
  const exitVal     = cfg.exitVal ?? emergenceVal;
  const isStaircase = emergenceVal !== exitVal;
  const ascending   = emergenceVal > exitVal;

  // Decide connectionTypes upfront for every adjacent pair
  const connectionTypes = Array(amount).fill(null);
  const targetCorners = cfg.targetCorners ?? 0;
  const targetHorizontals = cfg.horizontalChance ?? 0;
  const indices = Array.from({ length: amount - 1 }, (_, i) => i + 1);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const cornerIndices = new Set(indices.slice(0, Math.min(targetCorners, amount - 1)));
  const horizontalIndices = new Set(indices.slice(cornerIndices.size, Math.min(targetCorners + targetHorizontals, amount - 1)));

  for (let i = 1; i < amount; i++) {
    if (cornerIndices.has(i)) {
      connectionTypes[i] = 'corner';
    } else if (horizontalIndices.has(i)) {
      connectionTypes[i] = 'horizontal';
    } else {
      connectionTypes[i] = rng() < 0.5 ? 'horizontal' : 'vertical';
    }
  }

  const cfgAmt = { ...cfg, amount, connectionTypes, forcedStartH: startH, forcedEndH: endH, forcedStartW: startW, forcedEndW: endW, emergenceVal, exitVal };
  const heights = makeHeights(cfgAmt, rng);

  const flatBaseline = (emergenceVal === exitVal) && (emergenceVal === 0 || emergenceVal === ROWS);
  const targetSpan   = cfg.targetSpan ?? COLS;
  const { widths, overlaps } = makeWidths(
    heights, amount, rng, flatBaseline, connectionTypes,
    targetSpan, startW, endW
  );

  // ── Baseline Y positions — linear interpolation from startY to exitY ─────
  const startY = clamp(emergenceVal - heights[0],        0, ROWS - heights[0]);
  const exitY  = clamp(exitVal      - heights[amount-1], 0, ROWS - heights[amount-1]);

  const baseline = heights.map((h, i) => {
    const t = amount > 1 ? i / (amount - 1) : 0;
    return clamp(Math.round(startY + t * (exitY - startY)), 0, ROWS - h);
  });

  // ── Y assignment ─────────────────────────────────────────────────────────
  const rects = [];
  let x = cfg.startX ?? 0, prevY = null, prevH = null;

  for (let i = 0; i < amount; i++) {
    if (i > 0) x += widths[i - 1] - overlaps[i];

    const h = heights[i], w = widths[i];
    const idealY = baseline[i];
    let y;
    let verticalEdge = false; // set true when same-Y is intentional (Type 1 Sub-A)

    if (prevY === null) {
      // ── Block 0: anchored to startY
      y = idealY;

    } else if (isStaircase) {
      // ── Staircase (start height !== end height):
      //    🟡 corner / horizontal → 0 shared rows: y = prevY−h / prevY+prevH
      //    🔵 vertical            → share 1 row (i=1) or 2 rows (i>1)
      const type = connectionTypes[i];
      const useHorizontalEdge = (type === 'corner' || type === 'horizontal');
      const shareOffset = i === 1 ? 1 : 2;
      y = ascending
        ? (useHorizontalEdge ? prevY - h     : prevY - h + shareOffset)
        : (useHorizontalEdge ? prevY + prevH : prevY + prevH - shareOffset);

    } else if (i === amount - 1) {
      // ── Block N-1 (last): anchored to exitY (End Height)
      y = exitY;

    } else {
      const type = connectionTypes[i];
      if (type === 'horizontal' || type === 'corner') {
        // ── Horizontal / Corner Connect: overlapY MUST BE 0 (touch flush on top or bottom)
        const above = prevY - h;
        const below = prevY + prevH;
        const okAbove = above >= 0;
        const okBelow = below + h <= ROWS;
        
        // Find which direction gets us closer to exitY
        const distAbove = Math.abs(above - exitY);
        const distBelow = Math.abs(below - exitY);
        
        if (okAbove && okBelow) {
          // 80% chance to step towards the goal, 20% chance to step away (for randomness)
          const preferAbove = distAbove < distBelow;
          if (preferAbove) {
            y = rng() < 0.8 ? above : below;
          } else {
            y = rng() < 0.8 ? below : above;
          }
        } else if (okAbove) {
          y = above;
        } else if (okBelow) {
          y = below;
        } else {
          // Dead end, fallback to above and let grid clamping handle it
          y = above; 
        }

      } else {
        // ── Vertical Edge Connect: overlapY MUST BE >= 1
        // Blocks share a vertical edge strip (x-overlap = 0)
        const edgeLo = clamp(prevY - h + 1, 0, ROWS - h);
        const edgeHi = clamp(prevY + prevH - 1, 0, ROWS - h);
        
        // Corridor ensures exitY is still reachable with remaining block heights
        const remainingH = heights.slice(i + 1).reduce((a, b) => a + b, 0);
        const corridorLo = clamp(exitY - remainingH, 0, ROWS - h);
        const corridorHi = clamp(exitY + remainingH, 0, ROWS - h);
        
        const lo = Math.max(edgeLo, corridorLo);
        const hi = Math.min(edgeHi, corridorHi);
        
        if (lo <= hi) {
          y = randRange(lo, hi, rng);
        } else {
          y = randRange(edgeLo, edgeHi, rng);
        }
      }
    }

    y = clamp(y, 0, ROWS - h); // final grid-bounds safety

    // Enforce no-same-Y — skip when intentional (vertical edge, last block)
    const isLastBlock = (i === amount - 1);
    const type = connectionTypes[i];
    if (!isLastBlock && type === 'vertical' && prevY !== null && y === prevY) {
      const down = y + 1;
      const up   = y - 1;
      if (down <= ROWS - h && down < prevY + prevH) y = down;
      else if (up >= 0 && up > prevY - h)           y = up;
    }

    rects.push({ x, y, w, h });
    prevY = y;
    prevH = h;
  }

  return rects;
}

function isValidPattern(rects, cfg) {
  const amount = rects.length;
  if (amount < 2) return false;

  const emergenceVal =
    typeof cfg.emergenceVal === 'number'
      ? cfg.emergenceVal
      : { bottom: ROWS, center: 8, top: 4 }[cfg.emergence ?? 'bottom'] ?? ROWS;
  const exitVal = cfg.exitVal ?? emergenceVal;

  // 1. Verify start and end heights / anchors
  const expectedStartY = clamp(emergenceVal - rects[0].h, 0, ROWS - rects[0].h);
  if (rects[0].y !== expectedStartY) return false;

  const expectedExitY = clamp(exitVal - rects[amount - 1].h, 0, ROWS - rects[amount - 1].h);
  if (rects[amount - 1].y !== expectedExitY) return false;

  // 2. Count actual corner connections and check connectivity/gaps
  let actualCorners = 0;
  for (let i = 1; i < amount; i++) {
    const yA = rects[i - 1].y;
    const hA = rects[i - 1].h;
    const yB = rects[i].y;
    const hB = rects[i].h;

    const overlapX = Math.max(0, Math.min(rects[i - 1].x + rects[i - 1].w, rects[i].x + rects[i].w) - Math.max(rects[i - 1].x, rects[i].x));
    const overlapY = Math.max(0, Math.min(rects[i - 1].y + rects[i - 1].h, rects[i].y + rects[i].h) - Math.max(rects[i - 1].y, rects[i].y));
    const isCornerMeet = ((yA === yB + hB) || (yB === yA + hA)) && (overlapX === 0);
    
    const isHorizontalEdgeMeet = ((yA === yB + hB) || (yB === yA + hA)) && (overlapX >= 1);

    if (isCornerMeet) {
      actualCorners++;
    }

    // Adjacent blocks must connect (either overlap >= 1, corner-touch, or horizontal edge >= 1)
    const isConnected = isCornerMeet || isHorizontalEdgeMeet || (overlapY >= 1);
    if (!isConnected) {
      return false;
    }
  }

  // 3. Validate corners count matches parameters
  const targetCorners = cfg.targetCorners ?? 0;
  if (actualCorners !== targetCorners) return false;



  // 4. Duplicate dimensions check for adjacent edge-connected blocks
  for (let i = 1; i < amount; i++) {
    const rA = rects[i - 1];
    const rB = rects[i];
    const overlaps = (rA.y <= rB.y + rB.h - 1) && (rB.y <= rA.y + rA.h - 1);
    if (overlaps && rA.w === rB.w && rA.h === rB.h) {
      return false;
    }
  }

  // 5. Enforce staircase slope on both top and bottom edges
  const isTopFlatAllowed = (emergenceVal === 0 && exitVal === 0);
  const isBotFlatAllowed = (emergenceVal === ROWS && exitVal === ROWS);

  for (let i = 1; i < amount; i++) {
    const rA = rects[i - 1];
    const rB = rects[i];
    if (!isTopFlatAllowed && rA.y === rB.y) {
      return false;
    }
    if (!isBotFlatAllowed && (rA.y + rA.h === rB.y + rB.h)) {
      return false;
    }
  }

  return true;
}

export function generatePatternRects(cfg, rng = Math.random) {
  let rects = null;
  for (let attempt = 0; attempt < 1000; attempt++) {
    rects = generateSinglePatternRects(cfg, rng);
    if (isValidPattern(rects, cfg)) {
      return rects;
    }
  }
  return rects; // fallback
}

export function syncBlocks(rects) {
  const blocks = Array(COLS * ROWS).fill(1);
  for (const r of rects) {
    for (let row = r.y; row < r.y + r.h && row < ROWS; row++) {
      for (let col = r.x; col < r.x + r.w && col < COLS; col++) {
        blocks[row * COLS + col] = 0;
      }
    }
  }
  return blocks;
}

// Mirror blocks array horizontally or vertically
export function applySymmetry(blocks, mode) {
  if (!mode || mode === 'none') return blocks;
  const b = [...blocks];
  if (mode === 'mirror-h') {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < Math.floor(COLS / 2); col++) {
        b[row * COLS + (COLS - 1 - col)] = b[row * COLS + col];
      }
    }
  } else if (mode === 'mirror-v') {
    for (let row = 0; row < Math.floor(ROWS / 2); row++) {
      for (let col = 0; col < COLS; col++) {
        b[(ROWS - 1 - row) * COLS + col] = b[row * COLS + col];
      }
    }
  }
  return b;
}

// ─── Block Group Extraction (greedy, prefix-sum accelerated) ─────────────────

function buildSum(flat, cols, rows) {
  const t = Array.from({ length: rows }, () => new Float32Array(cols));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      t[r][c] = flat[r * cols + c]
        + (r > 0 ? t[r - 1][c] : 0)
        + (c > 0 ? t[r][c - 1] : 0)
        - (r > 0 && c > 0 ? t[r - 1][c - 1] : 0);
    }
  }
  return t;
}

function qsum(t, x, y, w, h) {
  const x2 = x + w - 1, y2 = y + h - 1;
  let s = t[y2][x2];
  if (y > 0) s -= t[y - 1][x2];
  if (x > 0) s -= t[y2][x - 1];
  if (x > 0 && y > 0) s += t[y - 1][x - 1];
  return s;
}

export function extractBlockGroups(blocks) {
  const active  = blocks.map(v => (v === 0 ? 1 : 0));
  const overlap = new Uint8Array(COLS * ROWS);
  const covered = new Uint8Array(COLS * ROWS);
  const rects   = [];

  for (let k = 0; k < 6; k++) {
    const sumA = buildSum(active, COLS, ROWS);
    const sumC = buildSum(Array.from(covered), COLS, ROWS);

    let best = null, bestScore = 0;

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        for (let h = 1; h <= Math.min(14, ROWS - y); h++) {
          for (let w = 1; w <= Math.min(14, COLS - x); w++) {
            if (w * h < 2) continue;

            let ok = true;
            outer: for (let r = y; r < y + h; r++) {
              for (let c = x; c < x + w; c++) {
                if (overlap[r * COLS + c] >= 2) { ok = false; break outer; }
              }
            }
            if (!ok) continue;
            if (qsum(sumC, x, y, w, h) >= w * h) continue;

            let steals = false;
            for (const e of rects) {
              let remain = 0;
              for (let r = e.y; r < e.y + e.h; r++) {
                for (let c = e.x; c < e.x + e.w; c++) {
                  const idx = r * COLS + c;
                  if (overlap[idx] === 1 && !(r >= y && r < y + h && c >= x && c < x + w)) remain++;
                }
              }
              if (remain === 0) { steals = true; break; }
            }
            if (steals) continue;

            const aCount = qsum(sumA, x, y, w, h);
            const cCount = qsum(sumC, x, y, w, h);
            const score  = (aCount - cCount) - 1.5 * (w * h - aCount);
            if (score > bestScore) { bestScore = score; best = { x, y, w, h }; }
          }
        }
      }
    }

    if (!best) break;
    rects.push(best);
    for (let r = best.y; r < best.y + best.h; r++) {
      for (let c = best.x; c < best.x + best.w; c++) {
        overlap[r * COLS + c]++;
        covered[r * COLS + c] = 1;
      }
    }
  }

  // Fallback: guarantee ≥3 groups
  while (rects.length < 3) {
    let placed = false;

    // Pass 1: prefer uncovered active cells
    for (let i = 0; i < active.length && !placed; i++) {
      if (active[i] !== 1 || overlap[i] > 0) continue;
      const r = Math.floor(i / COLS), c = i % COLS;
      const cand = r + 1 < ROWS ? { x: c, y: r, w: 1, h: 2 }
                 : c + 1 < COLS ? { x: c, y: r, w: 2, h: 1 }
                 : null;
      if (!cand) continue;
      rects.push(cand);
      for (let rr = cand.y; rr < cand.y + cand.h; rr++)
        for (let cc = cand.x; cc < cand.x + cand.w; cc++) {
          overlap[rr * COLS + cc]++; covered[rr * COLS + cc] = 1;
        }
      placed = true;
    }

    // Pass 2: any active cell, overlap allowed (ensures we always reach 3)
    if (!placed) {
      for (let i = 0; i < active.length && !placed; i++) {
        if (active[i] !== 1) continue;
        const r = Math.floor(i / COLS), c = i % COLS;
        const cand = r + 1 < ROWS ? { x: c, y: r, w: 1, h: 2 }
                   : c + 1 < COLS ? { x: c, y: r, w: 2, h: 1 }
                   : { x: c, y: r, w: 1, h: 1 };
        rects.push(cand);
        placed = true;
      }
    }

    if (!placed) break; // no active cells at all — truly impossible
  }

  return rects;
}

// ─── Seed encode / decode ────────────────────────────────────────────────────
// V1 format: 15 bytes → 21 B62 chars (old seeds, no block sizes)
// V2 format: 16 bytes → 22 B62 chars (adds startBlockSize + endBlockSize in b[15])
// V3 format: 18 bytes → 25 B62 chars (8 dimension bounds)
// V4 format: 19 bytes → 26 B62 chars (adds startX, startY, endX, endY explicit coords)

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const B62_LEN_V1 = 21; // 15 bytes
const B62_LEN_V2 = 22; // 16 bytes — ceil(128 bits / log2(62))
const B62_LEN_V3 = 25; // 18 bytes
const B62_LEN_V4 = 26; // 19 bytes

function bytesToB62(bytes, targetLen) {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let s = '';
  while (n > 0n) { s = B62[Number(n % 62n)] + s; n /= 62n; }
  return s.padStart(targetLen, 'A');
}

function b62ToBytes(str, byteCount) {
  let n = 0n;
  for (const c of str) n = n * 62n + BigInt(B62.indexOf(c));
  const bytes = new Uint8Array(byteCount);
  for (let i = byteCount - 1; i >= 0; i--) { bytes[i] = Number(n & 0xffn); n >>= 8n; }
  return bytes;
}

function hexToBytes(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function bytesToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function encodeSeed(seed, params, colorA, colorB) {
  const {
    blockMin = 3, blockMax = 5, overlapChance, cornerChance, horizontalChance = 0,
    startX = 0, startY = 10, startMinW = 2, startMaxW = 4, startMinH = 4, startMaxH = 8,
    endX = 16, endY = 6, endMinW = 6, endMaxW = 10, endMinH = 4, endMaxH = 8
  } = params;
  const [ar, ag, ab] = hexToBytes(colorA);
  const [br, bg, bb] = hexToBytes(colorB);

  const blockCountByte = (blockMin & 0xF) | ((blockMax & 0xF) << 4);
  const startCoordByte = (startX & 0xF) | ((startY & 0xF) << 4);
  const endCoordByte   = ((endX - 1) & 0xF) | (((endY - 1) & 0xF) << 4);
  
  const connectionByte = (cornerChance & 0x3) | ((horizontalChance & 0x3) << 2);

  const startWByte = (startMinW & 0xF) | ((startMaxW & 0xF) << 4);
  const startHByte = (startMinH & 0xF) | ((startMaxH & 0xF) << 4);
  const endWByte   = (endMinW & 0xF) | ((endMaxW & 0xF) << 4);
  const endHByte   = (endMinH & 0xF) | ((endMaxH & 0xF) << 4);

  const buf = new Uint8Array([
    (seed >>> 24) & 0xff, (seed >>> 16) & 0xff, (seed >>> 8) & 0xff, seed & 0xff,
    blockCountByte, startCoordByte, overlapChance, connectionByte,
    startWByte, startHByte, endWByte, endHByte, endCoordByte,
    ar, ag, ab, br, bg, bb,
  ]);
  return bytesToB62(buf, B62_LEN_V4);
}

export function decodeSeed(str) {
  try {
    const s = str.trim();
    const isV1 = s.length === B62_LEN_V1;
    const isV2 = s.length === B62_LEN_V2;
    const isV3 = s.length === B62_LEN_V3;
    const isV4 = s.length === B62_LEN_V4;
    if ((!isV1 && !isV2 && !isV3 && !isV4) || ![...s].every(c => B62.includes(c))) return null;

    const byteCount = isV4 ? 19 : isV3 ? 18 : isV2 ? 16 : 15;
    const b         = b62ToBytes(s, byteCount);
    const seed      = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;

    let params;
    let colorA, colorB;

    if (isV4) {
      params = {
        blockMin:       b[4] & 0xF,
        blockMax:       (b[4] >> 4) & 0xF,
        startX:         b[5] & 0xF,
        startY:         (b[5] >> 4) & 0xF,
        overlapChance:  b[6],
        cornerChance:   b[7] & 0x3,
        horizontalChance: (b[7] >> 2) & 0x3,
        startMinW:      b[8] & 0xF,
        startMaxW:      (b[8] >> 4) & 0xF,
        startMinH:      b[9] & 0xF,
        startMaxH:      (b[9] >> 4) & 0xF,
        endMinW:        b[10] & 0xF,
        endMaxW:        (b[10] >> 4) & 0xF,
        endMinH:        b[11] & 0xF,
        endMaxH:        (b[11] >> 4) & 0xF,
        endX:           (b[12] & 0xF) + 1,
        endY:           ((b[12] >> 4) & 0xF) + 1,
      };
      colorA = bytesToHex(b[13], b[14], b[15]);
      colorB = bytesToHex(b[16], b[17], b[18]);
    } else {
      // V1, V2, V3 decode fallback (legacy)
      const oldStartHeight = (b[5] & 0xF) * 4;
      const oldEndHeight   = ((b[5] >> 4) & 0xF) * 4;
      const legacyComplexity = b[4];
      const fallbackBlockMin = legacyComplexity === 1 ? 3 : legacyComplexity === 2 ? 4 : legacyComplexity === 3 ? 6 : 7;
      const fallbackBlockMax = legacyComplexity === 1 ? 4 : legacyComplexity === 2 ? 5 : legacyComplexity === 3 ? 6 : 8;

      if (isV3) {
        params = {
          blockMin:       fallbackBlockMin,
          blockMax:       fallbackBlockMax,
          startX:         0,
          startY:         oldStartHeight || 10,
          overlapChance:  b[6],
          cornerChance:   b[7] & 0x3,
          horizontalChance: 0,
          startMinW:      b[8] & 0xF,
          startMaxW:      (b[8] >> 4) & 0xF,
          startMinH:      b[9] & 0xF,
          startMaxH:      (b[9] >> 4) & 0xF,
          endMinW:        b[10] & 0xF,
          endMaxW:        (b[10] >> 4) & 0xF,
          endMinH:        b[11] & 0xF,
          endMaxH:        (b[11] >> 4) & 0xF,
          endX:           16,
          endY:           oldEndHeight || 6,
        };
        colorA = bytesToHex(b[12], b[13], b[14]);
        colorB = bytesToHex(b[15], b[16], b[17]);
      } else {
        params = {
          blockMin:       fallbackBlockMin,
          blockMax:       fallbackBlockMax,
          startX:         0,
          startY:         oldStartHeight || 10,
          overlapChance:  b[6],
          cornerChance:   b[7] & 0x3,
          horizontalChance: 0,
          startMinW:      2,
          startMaxW:      4,
          startMinH:      4,
          startMaxH:      8,
          endMinW:        6,
          endMaxW:        10,
          endMinH:        4,
          endMaxH:        8,
          endX:           16,
          endY:           oldEndHeight || 6,
        };
        colorA = bytesToHex(b[9],  b[10], b[11]);
        colorB = bytesToHex(b[12], b[13], b[14]);
      }
    }

    if (params.overlapChance > 10 || params.cornerChance > 3) return null;

    return { seed, params, colorA, colorB };
  } catch {
    return null;
  }
}

// ─── SVG Export ──────────────────────────────────────────────────────────────

function getPaletteFamily(hex) {
  for (const shades of Object.values(BRAND_PALETTE)) {
    if (shades.includes(hex)) return shades; // [100%, 75%, 50%, 25%] dark→light
  }
  return null;
}

export function assignGroupColors(rects, colorA) {
  const family = getPaletteFamily(colorA);
  if (!family || family.length < 2 || rects.length < 2) return rects.map(() => colorA);
  const firstIdx = Math.min(rects.length - 1, family.length - 1);
  return rects.map((_, i) => family[Math.max(0, firstIdx - i)]);
}

export function buildSVG(rects, colorA, colorB) {
  const size = 1920;
  const cell = size / COLS; // 120px per cell

  const rectEls = rects
    .map(r =>
      `  <rect x="${r.x * cell}" y="${r.y * cell}" width="${r.w * cell}" height="${r.h * cell}" fill="${colorA}"/>`
    )
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n  <rect x="0" y="0" width="${size}" height="${size}" fill="${colorB}"/>\n${rectEls}\n</svg>`;
}

export async function copySVGToClipboard(svgString) {
  await navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([svgString], { type: 'text/plain' }),
      'text/html':  new Blob([`<html><body>${svgString}</body></html>`], { type: 'text/html' }),
    }),
  ]);
}
