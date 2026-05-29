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
  complexity:    2,
  startHeight:   0,
  endHeight:     0,
  overlapChance: 0,   // 0–10 integer (maps to 0–100%)
  cornerChance:  0,   // 0–3 exact count
  volatility:    5,   // 0–10 integer (maps to 0–100% curve bending, default 50%)
  sizeScale:     5,   // 0–10 integer (maps to 0–100% block scaling, default 50%)
};

// Build generation config from the UI parameters
export function buildConfigFromParams({ complexity, startHeight, endHeight = 0, overlapChance, cornerChance, volatility = 5, sizeScale = 5 }) {
  const meta = COMPLEXITY[complexity] ?? COMPLEXITY[2];
  const oc   = overlapChance / 10;

  return {
    amountOpts:    meta.amountOpts,   // amount picked by generatePatternRects using its rng
    emergenceVal:  ROWS - startHeight,
    exitVal:       ROWS - endHeight,
    overlapChance: oc,
    targetCorners: cornerChance,
    volatility:    volatility / 10,
    sizeScale:     sizeScale / 10,
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
  const { amount, volatility = 0, connectionTypes, sizeScale = 0 } = cfg;

  // Full-span staircase (start=0 end=16 or start=16 end=0):
  // heights must sum to exactly ROWS so every block tiles the full height with no gaps.
  const ev = typeof cfg.emergenceVal === 'number' ? cfg.emergenceVal : ROWS;
  const xv = typeof cfg.exitVal      === 'number' ? cfg.exitVal      : ev;
  if (Math.abs(ev - xv) === ROWS && connectionTypes) {
    // Each corner-like connection (corner or horizontal) saves 1 from the sum (no shared row).
    // Each vertical connection needs 2 extra (2 shared rows).
    const verticalCount = connectionTypes.filter(t => t === 'vertical').length;
    const targetSum = ROWS + (verticalCount * 2);

    const heights = [];
    let remaining = targetSum;
    for (let i = 0; i < amount - 1; i++) {
      const minLeft = amount - i - 1;
      const maxH    = Math.min(14, remaining - minLeft);
      const pool    = ALLOWED_HEIGHTS.filter(h => h >= 1 && h <= maxH);
      
      let picked;
      if (pool.length) {
        const progress = i / (amount - 1);
        const avgH = targetSum / amount;
        const expansionH = 1 + progress * (14 - 1);
        const targetH = avgH + sizeScale * (expansionH - avgH);

        const sortedPool = [...pool].sort((a, b) => Math.abs(a - targetH) - Math.abs(b - targetH));
        const subPool = sortedPool.slice(0, 3);
        picked = subPool.length ? rand(subPool, rng) : rand(pool, rng);
      } else {
        picked = 1;
      }
      
      heights.push(picked);
      remaining -= picked;
    }
    heights.push(clamp(remaining, 1, 14));
    heights.sort((a, b) => a - b);
    return heights;
  }

  // Heights are always drawn from the full pool (1–14).
  const h = Array(amount).fill(null).map((_, i) => {
    const progress = i / (amount - 1);
    const avgH = ROWS / amount;
    const expansionH = 1 + progress * (14 - 1);
    const targetH = avgH + sizeScale * (expansionH - avgH);

    const pool = [...ALLOWED_HEIGHTS].sort((a, b) => Math.abs(a - targetH) - Math.abs(b - targetH));
    const subPool = pool.slice(0, 3);
    return rand(subPool, rng);
  });
  h.sort((a, b) => a - b); // always ascending to support grow from small to large
  return h;
}

function makeWidths(heights, amount, overlapArea, rng, strictNoDupDims = false, connectionTypes = null, sizeScale = 0) {
  // Max width: up to 14, but leave at least 1 column for every other block
  const maxW    = Math.min(14, COLS - amount + 1);
  const allowedW = ALLOWED_WIDTHS.filter(w => w <= maxW);

  for (let attempt = 0; attempt < 1000; attempt++) {
    const widths  = Array(amount).fill(0).map((_, i) => {
      const progress = i / (amount - 1);
      const avgW = COLS / amount;
      const expansionW = 1 + progress * (maxW - 1);
      const targetW = avgW + sizeScale * (expansionW - avgW);

      const pool = [...allowedW].sort((a, b) => Math.abs(a - targetW) - Math.abs(b - targetW));
      const subPool = pool.slice(0, 3);
      return subPool.length ? rand(subPool, rng) : rand(allowedW, rng);
    });
    widths.sort((a, b) => a - b);
    const overlaps = [0];

    for (let i = 1; i < amount; i++) {
      const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
      if (maxOv >= 2) {
        const type = connectionTypes ? connectionTypes[i] : 'vertical';
        if (type === 'horizontal') {
          // Must have horizontal overlap
          const effectiveOverlapArea = overlapArea === 0 ? 0.4 : overlapArea;
          const overlapAmount = Math.ceil(effectiveOverlapArea * maxOv);
          overlaps.push(Math.max(2, Math.min(overlapAmount, maxOv)));
        } else {
          // corner or vertical
          // If overlapArea is 0, they MUST NOT overlap horizontally
          if (overlapArea > 0 && rng() < overlapArea) {
            const overlapAmount = Math.ceil(overlapArea * maxOv);
            overlaps.push(Math.max(2, Math.min(overlapAmount, maxOv)));
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

  // Fallback: even split, no overlaps
  const base   = Math.floor(COLS / amount);
  const widths = Array(amount).fill(base);
  let diff     = COLS - widths.reduce((a, b) => a + b, 0);
  for (let i = 0; diff > 0; i = (i + 1) % amount, diff--) widths[i]++;
  widths.sort((a, b) => a - b);
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
  const oc         = cfg.overlapChance ?? 0;
  const exitVal    = cfg.exitVal ?? emergenceVal;
  const isFullSpan = Math.abs(emergenceVal - exitVal) === ROWS;
  const ascending  = emergenceVal > exitVal;

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
      if (isFullSpan) {
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
  const { widths, overlaps } = makeWidths(heights, amount, oc, rng, flatBaseline, connectionTypes, cfg.sizeScale);

  const volatility = cfg.volatility ?? 0.5;

  // ── Baseline Y positions ─────────────────────────────────────────────────
  const startY = clamp(emergenceVal - heights[0],        0, ROWS - heights[0]);
  const exitY  = clamp(exitVal      - heights[amount-1], 0, ROWS - heights[amount-1]);

  const isTrendAscending = exitY < startY;
  const baseline = heights.map((h, i) => {
    const t = amount > 1 ? i / (amount - 1) : 0;
    let u;
    if (volatility < 0.5) {
      const p = 1 + (1 - volatility / 0.5) * 2; // ranges from 1 to 3
      u = isTrendAscending ? Math.pow(t, p) : 1 - Math.pow(1 - t, p);
    } else {
      const q = 1 + ((volatility - 0.5) / 0.5) * 2; // ranges from 1 to 3
      u = isTrendAscending ? 1 - Math.pow(1 - t, q) : Math.pow(t, q);
    }
    return clamp(Math.round(startY + u * (exitY - startY)), 0, ROWS - h);
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

    } else if (i === amount - 1) {
      // ── Block N-1 (last): anchored to exitY (End Height)
      y = exitY;

    } else if (isFullSpan) {
      // ── Full-span staircase (start=0↔end=16):
      //    🟡 corner / horizontal → 0 shared rows: y = prevY−h / prevY+prevH
      //    🔵 vertical            → 2 shared rows: y = prevY−h+2 / prevY+prevH−2
      const type = connectionTypes[i];
      const useHorizontalEdge = (type === 'corner' || type === 'horizontal');
      y = ascending
        ? (useHorizontalEdge ? prevY - h     : prevY - h + 2)
        : (useHorizontalEdge ? prevY + prevH : prevY + prevH - 2);

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
      const edgeLo = clamp(prevY - h + 2, 0, ROWS - h);
      const edgeHi = clamp(prevY + prevH - 2, 0, ROWS - h);
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

    // Enforce no-same-Y — skip when intentional (vertical edge, isFullSpan, last block, flatBaseline)
    const isLastBlock = (i === amount - 1);
    if (!flatBaseline && !isLastBlock && !isFullSpan && !verticalEdge && prevY !== null && y === prevY) {
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
    const overlaps = overlapY > 0;
    const isCornerMeet = ((yA === yB + hB) || (yB === yA + hA)) && (overlapX === 0);
    const isHorizontalEdgeMeet = ((yA === yB + hB) || (yB === yA + hA)) && (overlapX >= 2);

    if (isCornerMeet) {
      actualCorners++;
    }

    // Adjacent blocks must connect (either overlap >= 2, corner-touch, or horizontal edge >= 2)
    const isConnected = isCornerMeet || isHorizontalEdgeMeet || (overlapY >= 2);
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

  // 5. Enforce no equal top Y or bottom Y for adjacent blocks when startHeight !== endHeight
  if (emergenceVal !== exitVal) {
    for (let i = 1; i < amount; i++) {
      const rA = rects[i - 1];
      const rB = rects[i];
      if (rA.y === rB.y || (rA.y + rA.h === rB.y + rB.h)) {
        return false;
      }
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
// Wire format: 15 bytes → Base62 (A–Z a–z 0–9) → 21 alphanumeric chars, no symbols.
//   [0-3]  uint32 random seed  (big-endian)
//   [4]    complexity           (1–4)
//   [5]    startHeight / 4      (0–4  →  0,4,8,12,16)
//   [6]    overlapChance        (0–10)
//   [7]    cornerChance         (0–3)
//   [8]    volatility           (0–10)
//   [9-11] colorA RGB
//   [12-14] colorB RGB

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const B62_LEN = 21; // ceil(120 bits / log2(62))

function bytesToB62(bytes) {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let s = '';
  while (n > 0n) { s = B62[Number(n % 62n)] + s; n /= 62n; }
  return s.padStart(B62_LEN, 'A');
}

function b62ToBytes(str) {
  let n = 0n;
  for (const c of str) n = n * 62n + BigInt(B62.indexOf(c));
  const bytes = new Uint8Array(15);
  for (let i = 14; i >= 0; i--) { bytes[i] = Number(n & 0xffn); n >>= 8n; }
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
  const { complexity, startHeight, endHeight = 0, overlapChance, cornerChance, volatility = 5, sizeScale = 5 } = params;
  const [ar, ag, ab] = hexToBytes(colorA);
  const [br, bg, bb] = hexToBytes(colorB);
  // byte 5: low nibble = startHeight/4 (0-4), high nibble = endHeight/4 (0-4)
  // old seeds had high nibble = 0 → endHeight = 0 (backward-compatible)
  const heightsByte = (startHeight / 4) | ((endHeight / 4) << 4);
  // Pack sizeScale (0-10) in high nibble of cornerChance byte (b[7]).
  const cornerChanceByte = cornerChance | (sizeScale << 4);
  const buf = new Uint8Array([
    (seed >>> 24) & 0xff, (seed >>> 16) & 0xff, (seed >>> 8) & 0xff, seed & 0xff,
    complexity, heightsByte, overlapChance, cornerChanceByte, volatility,
    ar, ag, ab, br, bg, bb,
  ]);
  return bytesToB62(buf);
}

export function decodeSeed(str) {
  try {
    const s = str.trim();
    if (s.length !== B62_LEN || ![...s].every(c => B62.includes(c))) return null;
    const b    = b62ToBytes(s);
    const seed = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
    const startHeight = (b[5] & 0xF) * 4;
    const endHeight   = ((b[5] >> 4) & 0xF) * 4;
    const params = {
      complexity:    b[4],
      startHeight,
      endHeight,
      overlapChance: b[6],
      cornerChance:  b[7] & 0xF,
      sizeScale:     (b[7] >> 4) & 0xF,
      volatility:    b[8],
    };
    // Basic range validation
    if (params.complexity < 1 || params.complexity > 4) return null;
    if (startHeight > 16 || startHeight % 4 !== 0) return null;
    if (endHeight   > 16 || endHeight   % 4 !== 0) return null;
    if (params.overlapChance > 10 || params.cornerChance > 3 || params.volatility > 10 || params.sizeScale > 10) return null;
    const colorA = bytesToHex(b[9], b[10], b[11]);
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
