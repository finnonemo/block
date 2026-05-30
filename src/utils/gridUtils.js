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
  complexity:      2,
  startHeight:     0,
  endHeight:       0,
  overlapChance:   0,   // 0–10 integer (maps to 0–100%)
  cornerChance:    0,   // 0–3 exact count
  volatility:      5,   // 0–10 integer (maps to 0–100% curve bending, default 50%)
  sizeScale:       5,   // 0–10 integer (maps to 0–100% block square scaling, default 50%)
  startBlockSize:  3,   // 0–10: target height of first/smallest block (0=tiny, 10=tall)
  endBlockSize:    8,   // 0–10: target height of last/largest block  (0=tiny, 10=tall)
};

// Build generation config from the UI parameters
export function buildConfigFromParams({ complexity, startHeight, endHeight = 0, overlapChance, cornerChance, volatility = 5, sizeScale = 5, startBlockSize = 3, endBlockSize = 8 }) {
  const meta = COMPLEXITY[complexity] ?? COMPLEXITY[2];
  const oc   = overlapChance / 10;

  return {
    amountOpts:     meta.amountOpts,
    emergenceVal:   ROWS - startHeight,
    exitVal:        ROWS - endHeight,
    overlapChance:  oc,
    targetCorners:  cornerChance,
    volatility:     volatility / 10,
    widthScale:     0.5,  // fixed — param removed from UI
    sizeScale:      sizeScale / 10,
    startBlockSize,
    endBlockSize,
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

function makeHeights(cfg, rng) {
  const { amount, connectionTypes, sizeScale = 0 } = cfg;

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
    return heights;
  }

  // Non-staircase: sizeScale = mean block height, volatility = height variation range.
  // volatility=0 → all blocks the same height (pool of 1 near meanH)
  // volatility=1 → heights spread across the full allowed range
  const meanH     = 1 + sizeScale * 13;   // sizeScale 0→1 maps to height 1→14
  const volatility = cfg.volatility ?? 0.5;
  const sorted    = [...ALLOWED_HEIGHTS].sort((a, b) => Math.abs(a - meanH) - Math.abs(b - meanH));
  const poolSz    = Math.max(1, Math.round(ALLOWED_HEIGHTS.length * volatility));
  const pool      = sorted.slice(0, poolSz);

  const h = Array(amount).fill(null).map(() => rand(pool, rng));
  h.sort((a, b) => a - b);
  return h;
}

function makeWidths(heights, amount, overlapArea, rng, strictNoDupDims = false, connectionTypes = null, startBlockSize = 3, endBlockSize = 8, sizeScale = 0) {
  const maxW     = Math.min(14, COLS - amount + 1);
  const allowedW = ALLOWED_WIDTHS.filter(w => w <= maxW);

  // Scale targets so the arithmetic series can always sum to ~COLS.
  // Cap at min(maxW, 2×avgW) so extreme combos don't overflow the grid span.
  const avgW       = COLS / amount;
  const maxTargetW = Math.min(maxW, avgW * 2);
  const startW = 1 + (startBlockSize / 10) * (maxTargetW - 1);
  const endW   = 1 + (endBlockSize   / 10) * (maxTargetW - 1);

  for (let attempt = 0; attempt < 1000; attempt++) {
    const widths = Array(amount).fill(0).map((_, i) => {
      const t      = amount > 1 ? i / (amount - 1) : 0.5;
      const targetW = startW + t * (endW - startW);
      // sizeScale blends width toward height for squareness
      const blendedW = targetW + sizeScale * (heights[i] - targetW);

      const pool   = [...allowedW].sort((a, b) => Math.abs(a - blendedW) - Math.abs(b - blendedW));
      // First and last blocks: use exact closest value (pool=1); middle: allow variation (pool=3)
      const poolSz = (i === 0 || i === amount - 1) ? 1 : 3;
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
          // Must have horizontal overlap
          const effectiveOverlapArea = overlapArea === 0 ? 0.4 : overlapArea;
          const overlapAmount = Math.ceil(effectiveOverlapArea * maxOv);
          overlaps.push(Math.max(minOvReq, Math.min(overlapAmount, maxOv)));
        } else {
          // corner or vertical
          // If overlapArea is 0, they MUST NOT overlap horizontally
          if (overlapArea > 0 && rng() < overlapArea) {
            const overlapAmount = Math.ceil(overlapArea * maxOv);
            overlaps.push(Math.max(minOvReq, Math.min(overlapAmount, maxOv)));
          } else {
            overlaps.push(0);
          }
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
    if (span !== COLS) continue;

    if (attempt < 400 || strictNoDupDims) {
      const hasDup = widths.some(
        (w, i) => i > 0 && overlaps[i] === 0 && w === widths[i - 1] && heights[i] === heights[i - 1]
      );
      if (hasDup) continue;
    }

    return { widths, overlaps };
  }

  // Fallback: even split, positional (no sort)
  const base   = Math.floor(COLS / amount);
  const widths = Array(amount).fill(base);
  let diff     = COLS - widths.reduce((a, b) => a + b, 0);
  for (let i = 0; diff > 0; i = (i + 1) % amount, diff--) widths[i]++;
  return { widths, overlaps: Array(amount).fill(0) };
}

// ─── Public generation ───────────────────────────────────────────────────────

function generateSinglePatternRects(cfg, rng) {
  const amount = Math.max(3, cfg.amount ?? rand(cfg.amountOpts, rng));

  // Hoist anchor / span variables so they're available before makeHeights
  const emergenceVal =
    typeof cfg.emergenceVal === 'number'
      ? cfg.emergenceVal
      : { bottom: ROWS, center: 8, top: 4 }[cfg.emergence ?? 'bottom'] ?? ROWS;
  const oc          = cfg.overlapChance ?? 0;
  const exitVal     = cfg.exitVal ?? emergenceVal;
  const isStaircase = emergenceVal !== exitVal;
  const ascending   = emergenceVal > exitVal;

  // Decide connectionTypes upfront for every adjacent pair
  const connectionTypes = Array(amount).fill(null);
  const targetCorners = cfg.targetCorners ?? 0;
  const indices = Array.from({ length: amount - 1 }, (_, i) => i + 1);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const cornerIndices = new Set(indices.slice(0, Math.min(targetCorners, amount - 1)));

  for (let i = 1; i < amount; i++) {
    if (cornerIndices.has(i)) {
      connectionTypes[i] = 'corner';
    } else {
      if (isStaircase) {
        connectionTypes[i] = rng() < 0.5 ? 'horizontal' : 'vertical';
      } else {
        connectionTypes[i] = rng() < oc ? 'horizontal' : 'vertical';
      }
    }
  }

  const cfgAmt = { ...cfg, amount, connectionTypes };
  const heights = makeHeights(cfgAmt, rng);

  // Flat only when both entry AND exit are at the same extreme edge
  const flatBaseline = (emergenceVal === exitVal) && (emergenceVal === 0 || emergenceVal === ROWS);
  const { widths, overlaps } = makeWidths(heights, amount, oc, rng, flatBaseline, connectionTypes, cfg.startBlockSize, cfg.endBlockSize, cfg.sizeScale);

  // ── Baseline Y positions — linear interpolation from startY to exitY ─────
  const startY = clamp(emergenceVal - heights[0],        0, ROWS - heights[0]);
  const exitY  = clamp(exitVal      - heights[amount-1], 0, ROWS - heights[amount-1]);

  const baseline = heights.map((h, i) => {
    const t = amount > 1 ? i / (amount - 1) : 0;
    return clamp(Math.round(startY + t * (exitY - startY)), 0, ROWS - h);
  });

  // ── Y assignment ─────────────────────────────────────────────────────────
  const rects = [];
  let x = 0, prevY = null, prevH = null;

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

    } else if (connectionTypes[i] === 'corner' || connectionTypes[i] === 'horizontal') {
      // ── Type 2 (Corner/Horizontal Connect): touch flush horizontally, direction randomised
      const above = prevY - h;
      const below = prevY + prevH;
      const okAbove = above >= 0;
      const okBelow = below + h <= ROWS;
      if (okAbove && okBelow) y = rng() < 0.5 ? above : below;
      else if (okAbove)       y = above;
      else if (okBelow)       y = below;
      else { y = clamp(idealY, prevY - h + 1, prevY + prevH - 1); }

    } else {
      // ── Middle blocks: fill the gap between block 0 and block N-1.
      //    Three connection types per block anatomy (Figma 106:274):
      //
      //    🔵 BLUE  (Left/Right vertical edge): blocks share a strip at their X-boundary
      //             → y ∈ [prevY−h+1, prevY+prevH−1]  (shared rows create the vertical strip)
      //    🔴 RED   (Top/Bottom horizontal edge): one block's Top meets prev's Bottom (or vice-versa)
      //             → y = prevY−h (current Bottom = prev Top)  — only a true edge when X-overlap > 0
      //    🟡 YELLOW (Corner): corner point touch — handled separately by cornerPairs
      //
      //    Corridor ensures exitY is still reachable with remaining block heights.
      const remainingH = heights.slice(i + 1).reduce((a, b) => a + b, 0);
      const corridorLo = clamp(exitY - remainingH, 0, ROWS - h);
      const corridorHi = clamp(exitY + remainingH, 0, ROWS - h);
      // BLUE range: shared-row positions, intersected with corridor
      const shareOffset = i === 1 ? 1 : 2;
      const edgeLo = clamp(prevY - h + shareOffset, 0, ROWS - h);
      const edgeHi = clamp(prevY + prevH - shareOffset, 0, ROWS - h);
      const lo = Math.max(edgeLo, corridorLo);
      const hi = Math.min(edgeHi, corridorHi);
      const blueRange = lo <= hi ? { lo, hi } : { lo: edgeLo, hi: edgeHi };
      // RED position: current block's Bottom touches prev block's Top (ascending)
      const redY      = prevY - h;
      const canRed    = oc > 0 && redY >= 0 && redY >= corridorLo && redY <= corridorHi;

      const r = rng();
      if (r < 1 / 3) {
        // 🔴 RED (Horizontal edge): current Bottom = prev Top.
        // With X-overlap this is a true horizontal edge strip; without overlap it degrades
        // to a corner point — so only fire when overlapArea > 0 (oc > 0).
        // Falls back to BLUE Sub-B when RED is not feasible.
        y = canRed ? redY : clamp(idealY, blueRange.lo, blueRange.hi);

      } else if (r < 2 / 3) {
        // 🔵 BLUE Sub-A (Vertical edge, same top-Y):
        // Blocks start at the same Y → their Left/Right boundary forms a vertical strip
        // whose height = min(h, prevH). L-shaped junction when heights differ.
        // Only apply when h ≠ prevH (equal heights → pure vertical, no horizontal step).
        if (h !== prevH && prevY >= blueRange.lo && prevY <= blueRange.hi) {
          y = prevY;
          verticalEdge = true; // intentional same-Y — skip the no-same-Y nudge
        } else {
          y = clamp(idealY, blueRange.lo, blueRange.hi);
        }

      } else {
        // 🔵 BLUE Sub-B (Vertical edge, offset Y):
        // y-offset creates an L-shaped junction with both a vertical strip (shared rows)
        // and a horizontal ledge (height difference at the step).
        y = clamp(idealY, blueRange.lo, blueRange.hi);
      }
    }

    y = clamp(y, 0, ROWS - h); // final grid-bounds safety

    // Enforce no-same-Y — skip when intentional (vertical edge, isStaircase, last block, flatBaseline)
    const isLastBlock = (i === amount - 1);
    if (!flatBaseline && !isLastBlock && !isStaircase && !verticalEdge && prevY !== null && y === prevY) {
      const down = y + 1;
      const up   = y - 1;
      if (down <= ROWS - h && down < prevY + prevH) y = down;
      else if (up >= 0 && up + h > prevY)           y = up;
    }

    rects.push({ x, y, w, h });
    prevY = y;
    prevH = h;
  }

  return rects;
}

function isValidPattern(rects, cfg) {
  const amount = rects.length;
  if (amount < 3) return false;

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
    
    const minOverlapReq = i === 1 ? 1 : 2;
    const isHorizontalEdgeMeet = ((yA === yB + hB) || (yB === yA + hA)) && (overlapX >= minOverlapReq);

    if (isCornerMeet) {
      actualCorners++;
    }

    // Adjacent blocks must connect (either overlap >= minOverlapReq, corner-touch, or horizontal edge >= minOverlapReq)
    const isConnected = isCornerMeet || isHorizontalEdgeMeet || (overlapY >= minOverlapReq);
    if (!isConnected) {
      return false;
    }
  }

  // 3. Validate corners count matches parameters
  const targetCorners = cfg.targetCorners ?? 0;
  if (actualCorners !== targetCorners) return false;

  // 3.5 Enforce zero 2D intersection area if overlap setting is 0
  const overlapChance = cfg.overlapChance ?? 0;
  if (overlapChance === 0) {
    for (let i = 1; i < amount; i++) {
      const rA = rects[i - 1];
      const rB = rects[i];
      const overlapX = Math.max(0, Math.min(rA.x + rA.w, rB.x + rB.w) - Math.max(rA.x, rB.x));
      const overlapY = Math.max(0, Math.min(rA.y + rA.h, rB.y + rB.h) - Math.max(rA.y, rB.y));
      if (overlapX * overlapY > 0) {
        return false;
      }
    }
  }

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
//   [0-3]  uint32 random seed  (big-endian)
//   [4]    complexity           (1–4)
//   [5]    heights byte: low nibble = startHeight/4, high nibble = endHeight/4
//   [6]    overlapChance        (0–10)
//   [7]    bits 0-1=cornerChance, bits 2-3=symmetryCode, bits 4-7=sizeScale
//   [8]    bits 0-3=volatility, bits 4-7=widthScale+1
//   [9-11] colorA RGB
//   [12-14] colorB RGB
//   [15]   V2 only: bits 0-3=startBlockSize (0-10), bits 4-7=endBlockSize (0-10)

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const B62_LEN_V1 = 21; // 15 bytes
const B62_LEN_V2 = 22; // 16 bytes — ceil(128 bits / log2(62))

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
  const { complexity, startHeight, endHeight = 0, overlapChance, cornerChance, volatility = 5, sizeScale = 5, startBlockSize = 3, endBlockSize = 8 } = params;
  const [ar, ag, ab] = hexToBytes(colorA);
  const [br, bg, bb] = hexToBytes(colorB);
  const heightsByte  = (startHeight / 4) | ((endHeight / 4) << 4);
  // bits 2-3 (symmetry) always 0 — param removed
  const cornerChanceByte = (cornerChance & 0x3) | ((sizeScale & 0xF) << 4);
  // high nibble (widthScale) always 0 — param removed
  const volatilityByte   = (volatility & 0xF);
  const blockSizeByte    = (startBlockSize & 0xF) | ((endBlockSize & 0xF) << 4);
  const buf = new Uint8Array([
    (seed >>> 24) & 0xff, (seed >>> 16) & 0xff, (seed >>> 8) & 0xff, seed & 0xff,
    complexity, heightsByte, overlapChance, cornerChanceByte, volatilityByte,
    ar, ag, ab, br, bg, bb,
    blockSizeByte,
  ]);
  return bytesToB62(buf, B62_LEN_V2);
}

export function decodeSeed(str) {
  try {
    const s = str.trim();
    const isV1 = s.length === B62_LEN_V1;
    const isV2 = s.length === B62_LEN_V2;
    if ((!isV1 && !isV2) || ![...s].every(c => B62.includes(c))) return null;

    const byteCount = isV2 ? 16 : 15;
    const b         = b62ToBytes(s, byteCount);
    const seed      = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;

    const startHeight = (b[5] & 0xF) * 4;
    const endHeight   = ((b[5] >> 4) & 0xF) * 4;

    const params = {
      complexity:     b[4],
      startHeight,
      endHeight,
      overlapChance:  b[6],
      cornerChance:   b[7] & 0x3,
      sizeScale:      (b[7] >> 4) & 0xF,
      volatility:     b[8] & 0xF,
      startBlockSize: isV2 ? (b[15] & 0xF)        : 3,
      endBlockSize:   isV2 ? ((b[15] >> 4) & 0xF) : 8,
    };

    if (params.complexity < 1 || params.complexity > 4)       return null;
    if (startHeight > 16 || startHeight % 4 !== 0)            return null;
    if (endHeight   > 16 || endHeight   % 4 !== 0)            return null;
    if (params.overlapChance > 10 || params.cornerChance > 3) return null;
    if (params.volatility > 10 || params.sizeScale > 10)      return null;

    const colorA = bytesToHex(b[9],  b[10], b[11]);
    const colorB = bytesToHex(b[12], b[13], b[14]);
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
