export const COLS = 16;
export const ROWS = 16;

const ALLOWED_HEIGHTS = [1, 2, 3, 4, 6, 8, 10, 12, 14];
const ALLOWED_WIDTHS = [1, 2, 3, 4, 6, 8, 10, 12, 14];

export const BRAND_PALETTE = {
  Navy: ['#01172b', '#415160', '#808b95', '#c0c5ca'],
  'Lt. Grey': ['#a6bfcc', '#bccfd9', '#d3dfe6', '#e9eff2'],
  Yellow: ['#f2f93c', '#f5fb6d', '#f9fc9e', '#fcfece'],
  White: ['#ffffff'],
  Green: ['#00e76b', '#40ed90', '#80f3b5', '#bff9da'],
  Blue: ['#50cfff', '#7cdbff', '#a8e7ff', '#d3f3ff'],
  Purple: ['#aa46c3', '#bf74d2', '#d5a3e1', '#ead1f0'],
  Red: ['#f73232', '#f96565', '#fb9999', '#fdcccc'],
  Orange: ['#f26414', '#f58b4f', '#f9b28a', '#fcd8c4'],
};

// Predefined brand color palettes (surface = Color A, background = Color B)
export const PALETTES = [
  { id: 'foundation', label: 'Foundation', surface: '#00e76b', background: '#01172b' },
  { id: 'haven', label: 'Haven', surface: '#50cfff', background: '#01172b' },
  { id: 'equities', label: 'Equities', surface: '#f26414', background: '#f2f93c' },
  { id: 'exotic', label: 'Exotic', surface: '#aa46c3', background: '#f73232' },
  { id: 'clean', label: 'Clean', surface: '#00e76b', background: '#ffffff' },
];

// Two-color preset pairs organized by brand family
// label format: "{Family} {surfaceShade}/{bgShade}" where 100=darkest shade, 25=lightest
export const COLOR_PAIRS = [
  // Green
  { id: 'grn-nav', group: 'Green', label: 'Green / Navy', surface: '#00e76b', background: '#01172b' },
  { id: 'grn-100-25', group: 'Green', label: 'Green 100/25', surface: '#00e76b', background: '#bff9da' },
  { id: 'grn-wht', group: 'Green', label: 'Green / White', surface: '#00e76b', background: '#ffffff' },
  // Blue
  { id: 'blu-nav', group: 'Blue', label: 'Blue / Navy', surface: '#50cfff', background: '#01172b' },
  { id: 'blu-100-25', group: 'Blue', label: 'Blue 100/25', surface: '#50cfff', background: '#d3f3ff' },
  // Orange
  { id: 'org-100-25', group: 'Orange', label: 'Orange 100/25', surface: '#f26414', background: '#fcd8c4' },
  { id: 'org-75-25', group: 'Orange', label: 'Orange 75/25', surface: '#f58b4f', background: '#fcd8c4' },
  { id: 'org-100-50', group: 'Orange', label: 'Orange 100/50', surface: '#f26414', background: '#f9b28a' },
  { id: 'org-yel', group: 'Orange', label: 'Orange / Yellow', surface: '#f26414', background: '#f2f93c' },
  // Yellow
  { id: 'yel-nav', group: 'Yellow', label: 'Yellow / Navy', surface: '#f2f93c', background: '#01172b' },
  { id: 'yel-100-25', group: 'Yellow', label: 'Yellow 100/25', surface: '#f2f93c', background: '#fcfece' },
  // Red
  { id: 'red-100-25', group: 'Red', label: 'Red 100/25', surface: '#f73232', background: '#fdcccc' },
  // Purple
  { id: 'pur-red', group: 'Purple', label: 'Purple / Red', surface: '#aa46c3', background: '#f73232' },
  { id: 'pur-100-25', group: 'Purple', label: 'Purple 100/25', surface: '#aa46c3', background: '#ead1f0' },
  // Navy
  { id: 'nav-gry', group: 'Navy', label: 'Navy / Lt.Grey', surface: '#01172b', background: '#a6bfcc' },
];

// Complexity meta — controls block count only; height is driven by Trend Volatility
export const COMPLEXITY = {
  1: { label: 'Low', amountOpts: [3], description: '3 groups' },
  2: { label: 'Med', amountOpts: [4, 5], description: '4–5 groups' },
  3: { label: 'High', amountOpts: [6], description: '6 groups' },
  4: { label: 'Extreme', amountOpts: [7, 8], description: '7–8 groups' },
};

export const START_HEIGHT_OPTIONS = [
  { value: 0, label: '0', sub: 'Bot' },
  { value: 4, label: '4', sub: '' },
  { value: 8, label: '8', sub: 'Ctr' },
  { value: 12, label: '12', sub: '' },
  { value: 16, label: '16', sub: 'Top' },
];

export const END_HEIGHT_OPTIONS = [
  { value: 0, label: '0', sub: 'Bot' },
  { value: 4, label: '4', sub: '' },
  { value: 8, label: '8', sub: 'Ctr' },
  { value: 12, label: '12', sub: '' },
  { value: 16, label: '16', sub: 'Top' },
];

// Default parameters
export const DEFAULT_PARAMS = {
  blockMin: 3,    // Minimum number of blocks
  blockMax: 8,    // Maximum number of blocks
  startX: 0,    // 0–15: left edge of first block (bottom-left corner X)
  startY: 15,   // 0–15: bottom edge of first block (bottom-left corner Y)
  startMinW: 1,
  startMaxW: 3,
  startMinH: 1,
  startMaxH: 3,
  midMinW: 0,
  midMaxW: 0,
  midMinH: 0,
  midMaxH: 0,
  midCurve: 50,
  endX: 15,   // 0–15: right edge of last block (bottom-right corner X)
  endY: 0,    // 0–15: bottom edge of last block (bottom-right corner Y)
  endMinW: 6,
  endMaxW: 10,
  endMinH: 4,
  endMaxH: 8,
  overlapChance: 0,    // 0=Off, 1=On
};

// Build generation config from the UI parameters
export function buildConfigFromParams({
  blockMin = 3, blockMax = 8,
  startX = 0, startY = 15,
  startMinW = 2, startMaxW = 4, startMinH = 4, startMaxH = 8,
  midMinW = 0, midMaxW = 0, midMinH = 0, midMaxH = 0, midCurve = 50,
  endX = 15, endY = 5,
  endMinW = 6, endMaxW = 10, endMinH = 4, endMaxH = 8,
  overlapChance = 0, cornerChance = 0,
}) {
  return {
    blockMin,
    blockMax,
    startY,                            // bottom-edge Y of first block
    exitVal: endY,                     // top-edge Y of last block
    startX,                            // first block left-edge X
    targetSpan: (endX + 1) - startX,   // X columns from startX to endX inclusive
    startMinW, startMaxW, startMinH, startMaxH,
    midMinW, midMaxW, midMinH, midMaxH, midCurve,
    endMinW, endMaxW, endMinH, endMaxH,
    allowOverlap: overlapChance > 0,
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
  const ev = typeof cfg.emergenceVal === 'number' ? cfg.emergenceVal : ROWS;
  const xv = typeof cfg.exitVal === 'number' ? cfg.exitVal : ev;
  if (ev !== xv && connectionTypes) {
    const h0 = forcedStartH != null ? clamp(forcedStartH, 1, 14) : rand(ALLOWED_HEIGHTS, rng);
    const startY = Math.max(0, ev - h0);
    const gap = Math.abs(startY - xv);

    const verticalCount1 = connectionTypes[1] === 'vertical' ? 1 : 0;
    const verticalCountRest = connectionTypes.slice(2).filter(t => t === 'vertical').length;
    let targetSum = gap + (verticalCount1 * 1) + (verticalCountRest * 2);

    const heights = [h0];
    const hN_1 = forcedEndH != null ? clamp(forcedEndH, 1, 14) : null;
    const blocksToGenerate = hN_1 != null ? amount - 2 : amount - 1;

    const middleHeights = [];
    const userMin = cfg.midMinH || 1;
    const userMax = cfg.midMaxH || 14;
    
    for (let i = 0; i < blocksToGenerate; i++) {
      const pool = ALLOWED_HEIGHTS.filter(h => h >= userMin && h <= userMax);
      middleHeights.push(pool.length ? rand(pool, rng) : userMin);
    }

    // Sort middleHeights based on midCurve
    const curve = cfg.midCurve ?? 50;
    const power = Math.pow(10, (curve - 50) / 50); // Maps 0->0.1, 50->1, 100->10
    const N = middleHeights.length;
    const sorted = [];
    const pool = [...middleHeights];
    let currentSum = 0;
    const totalMidSum = pool.reduce((a, b) => a + b, 0);

    for (let i = 0; i < N; i++) {
      const targetY = totalMidSum * Math.pow((i + 1) / N, power);
      
      let bestIdx = 0;
      let minDiff = Infinity;
      // If curve is exactly 50, we introduce a slight randomness to ties or near-ties to keep it organic
      for (let j = 0; j < pool.length; j++) {
        const diff = Math.abs((currentSum + pool[j]) - targetY);
        // Add tiny random noise if curve is close to 50 to avoid repetitive stairs
        const noise = (Math.abs(curve - 50) < 5) ? (rng() * 0.1) : 0; 
        if (diff + noise < minDiff) {
          minDiff = diff + noise;
          bestIdx = j;
        }
      }
      
      const picked = pool.splice(bestIdx, 1)[0];
      sorted.push(picked);
      currentSum += picked;
    }

    heights.push(...sorted);

    if (hN_1 != null) {
      heights.push(hN_1); // h_{N-1}
    }

    return heights;
  }

  // Non-staircase
  const h = Array(amount).fill(null).map((_, i) => {
    if (i === 0 && forcedStartH != null) return clamp(forcedStartH, 1, 14);
    if (i === amount - 1 && forcedEndH != null) return clamp(forcedEndH, 1, 14);
    
    const userMin = cfg.midMinH || 1;
    const userMax = cfg.midMaxH || 14;
    const pool = ALLOWED_HEIGHTS.filter(h => h >= userMin && h <= userMax);
    return pool.length ? rand(pool, rng) : userMin;
  });
  return h;
}

function makeWidths(heights, amount, rng, strictNoDupDims = false, connectionTypes = null, targetSpan = COLS, forcedStartW = null, forcedEndW = null, allowOverlap = false) {
  const maxW = Math.max(1, targetSpan - amount + 1);
  const allowedW = Array.from({ length: maxW }, (_, i) => i + 1);

  const avgW = targetSpan / amount;
  const maxTargetW = Math.min(maxW, avgW * 2);
  const startW = forcedStartW != null ? forcedStartW : 3;
  const endW = forcedEndW != null ? forcedEndW : 8;

  for (let attempt = 0; attempt < 1000; attempt++) {
    const widths = Array(amount).fill(0).map((_, i) => {
      if (i === 0 && forcedStartW != null) return clamp(forcedStartW, 1, targetSpan);
      if (i === amount - 1 && forcedEndW != null) return clamp(forcedEndW, 1, targetSpan);
      
      const userMin = connectionTypes ? (connectionTypes.midMinW || 1) : 1;
      const userMax = connectionTypes ? (connectionTypes.midMaxW || 14) : 14;
      const pool = ALLOWED_WIDTHS.filter(w => w >= userMin && w <= userMax);
      return pool.length ? rand(pool, rng) : userMin;
    });
    // Widths are positional — no sort
    const overlaps = [0];

    for (let i = 1; i < amount; i++) {
      const minOvReq = i === 1 ? 1 : 2;
      const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
      if (maxOv >= minOvReq) {
        const type = connectionTypes ? connectionTypes[i] : 'vertical';
        if (type === 'horizontal' || type === 'overlap') {
          // They must overlap horizontally, so overlapX >= 1
          const overlapAmount = Math.max(1, Math.ceil(rng() * maxOv));
          overlaps.push(Math.max(minOvReq, Math.min(overlapAmount, maxOv)));
        } else {
          // Strict geometry: They must NOT overlap horizontally, so overlapX = 0
          overlaps.push(0);
        }
      } else {
        // If widths are too small to overlap, but it's a horizontal edge or overlap connection, fail this attempt
        if (connectionTypes && (connectionTypes[i] === 'horizontal' || connectionTypes[i] === 'overlap')) {
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
        (w, i) => i > 0 && w === widths[i - 1] && heights[i] === heights[i - 1]
      );
      if (hasDup) continue;
    }

    return { widths, overlaps };
  }

  // Fallback: randomized bottom-up expansion
  const fbUserMin = connectionTypes ? (connectionTypes.midMinW || 1) : 1;
  const fbUserMax = connectionTypes ? (connectionTypes.midMaxW || 14) : 14;

  const widths = Array(amount).fill(1);
  if (forcedStartW != null) widths[0] = clamp(forcedStartW, 1, targetSpan);
  if (forcedEndW != null) widths[amount - 1] = clamp(forcedEndW, 1, targetSpan);
  for (let i = 1; i < amount - 1; i++) widths[i] = fbUserMin;

  let overlaps = Array(amount).fill(0);
  let diff = targetSpan - widths.reduce((a, b) => a + b, 0);

  if (amount > 2) {
    if (diff > 0) {
      let available = [];
      for (let i = 1; i < amount - 1; i++) if (widths[i] < fbUserMax) available.push(i);
      
      while (diff > 0 && available.length > 0) {
        const i = available[Math.floor(rng() * available.length)];
        widths[i]++;
        diff--;
        if (widths[i] >= fbUserMax) available = available.filter(x => x !== i);
      }
      
      // If still diff > 0, violate max constraint to fit the grid
      if (diff > 0) {
        available = [];
        for (let i = 1; i < amount - 1; i++) available.push(i);
        while (diff > 0 && available.length > 0) {
          const i = available[Math.floor(rng() * available.length)];
          widths[i]++;
          diff--;
        }
      }
    } else if (diff < 0) {
      // 1. Try to absorb diff by overlapping horizontally
      while (diff < 0) {
        let changed = false;
        for (let i = 1; i < amount && diff < 0; i++) {
          const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
          if (overlaps[i] < maxOv) { overlaps[i]++; diff++; changed = true; }
        }
        if (!changed) break;
      }
      // 2. Squash middle blocks down to userMin
      while (diff < 0) {
        let changed = false;
        for (let i = amount - 2; i > 0 && diff < 0; i--) {
          const minW = Math.max(fbUserMin, (i > 0 ? overlaps[i] : 0) + 1, (i < amount - 1 ? overlaps[i+1] : 0) + 1);
          if (widths[i] > minW) { widths[i]--; diff++; changed = true; }
        }
        if (!changed) break;
      }
      // 3. Squash middle blocks down to 1 (violate userMin)
      while (diff < 0) {
        let changed = false;
        for (let i = amount - 2; i > 0 && diff < 0; i--) {
          const minW = Math.max(1, (i > 0 ? overlaps[i] : 0) + 1, (i < amount - 1 ? overlaps[i+1] : 0) + 1);
          if (widths[i] > minW) { widths[i]--; diff++; changed = true; }
        }
        if (!changed) break;
      }
      // 4. If we still need to borrow, borrow from start/end
      while (diff < 0) {
        let changed = false;
        const minW0 = Math.max(1, overlaps[1] + 1);
        if (widths[0] > minW0) { widths[0]--; diff++; changed = true; }
        const minWEnd = Math.max(1, overlaps[amount - 1] + 1);
        if (widths[amount - 1] > minWEnd && diff < 0) { widths[amount - 1]--; diff++; changed = true; }
        if (!changed) break;
      }
    }
  } else {
    for (let i = 0; diff > 0; i = (i + 1) % amount, diff--) widths[i]++;
  }

  return { widths, overlaps };
}

// ─── Public generation ───────────────────────────────────────────────────────

function generateSinglePatternRects(cfg, rng) {
  const amount = Math.max(2, randRange(cfg.blockMin ?? 3, cfg.blockMax ?? 5, rng));

  let startH = randRange(cfg.startMinH ?? 1, cfg.startMaxH ?? 14, rng);
  // Start block is Bottom-Left anchored. It scales UPWARDS.
  // The bottom-most row index is cfg.startY. Max possible height is (cfg.startY + 1).
  startH = Math.max(1, Math.min(startH, (cfg.startY ?? 15) + 1));

  let endH = randRange(cfg.endMinH ?? 1, cfg.endMaxH ?? 14, rng);
  // End block is Top-Right anchored. It scales DOWNWARDS.
  // The top-most row index is cfg.endY. Max possible height is (ROWS - cfg.endY).
  endH = Math.max(1, Math.min(endH, ROWS - (cfg.endY ?? 0)));
  const startW = randRange(cfg.startMinW ?? 1, cfg.startMaxW ?? 14, rng);
  const endW = randRange(cfg.endMinW ?? 1, cfg.endMaxW ?? 14, rng);

  // Hoist anchor / span variables so they're available before makeHeights
  // emergenceVal is the bottom edge coordinate (y + h)
  const emergenceVal = clamp((cfg.startY ?? 15) + 1, 0, ROWS);
  const exitVal = cfg.exitVal ?? emergenceVal;
  const isStaircase = emergenceVal !== exitVal;
  const ascending = emergenceVal > exitVal;

  // Decide connectionTypes upfront for every adjacent pair
  const connectionTypes = Array(amount).fill(null);
  let cornerCount = 0;
  for (let i = 1; i < amount; i++) {
    const availableTypes = ['vertical', 'horizontal'];
    if (cornerCount < 2) availableTypes.push('corner');
    if (cfg.allowOverlap) availableTypes.push('overlap');
    
    // Pick with equal probability
    const pickedType = availableTypes[Math.floor(rng() * availableTypes.length)];
    if (pickedType === 'corner') cornerCount++;
    connectionTypes[i] = pickedType;
  }

  const cfgAmt = { ...cfg, amount, connectionTypes, forcedStartH: startH, forcedEndH: endH, forcedStartW: startW, forcedEndW: endW, emergenceVal, exitVal };
  const heights = makeHeights(cfgAmt, rng);

  const flatBaseline = (emergenceVal === exitVal) && (emergenceVal === 0 || emergenceVal === ROWS);
  const targetSpan = cfg.targetSpan ?? COLS;
  
  // Pack middle width constraints into connectionTypes so makeWidths can access them cleanly without changing signature
  const connWithMidConstraints = [...connectionTypes];
  connWithMidConstraints.midMinW = cfg.midMinW;
  connWithMidConstraints.midMaxW = cfg.midMaxW;

  const { widths, overlaps } = makeWidths(
    heights, amount, rng, flatBaseline, connWithMidConstraints,
    targetSpan, startW, endW, cfg.allowOverlap
  );

  // ── Baseline Y positions — linear interpolation from startY to exitY ─────
  const startY = clamp(emergenceVal - heights[0], 0, ROWS - heights[0]);
  const exitY = clamp(exitVal, 0, ROWS - heights[amount - 1]);

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
      //    Dynamic overlapping allows varied large blocks to perfectly follow the baseline trend
      const type = connectionTypes[i];
      const useHorizontalEdge = (type === 'corner' || type === 'horizontal');
      
      const idealY = baseline[i];
      const targetShare = ascending ? (idealY - prevY + h) : (prevY + prevH - idealY);
      
      const maxOv = Math.min(prevH, h) - 1;
      const minOv = useHorizontalEdge ? 0 : 1; 
      
      const shareOffset = clamp(targetShare, minOv, maxOv);
      
      y = ascending
        ? (prevY - h + shareOffset)
        : (prevY + prevH - shareOffset);

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

        let targetY;
        if (okAbove && okBelow) {
          // 80% chance to step towards the goal, 20% chance to step away (for randomness)
          const preferAbove = distAbove < distBelow;
          if (preferAbove) {
            targetY = rng() < 0.8 ? above : below;
          } else {
            targetY = rng() < 0.8 ? below : above;
          }
        } else if (okAbove) {
          targetY = above;
        } else if (okBelow) {
          targetY = below;
        } else {
          // Dead end, fallback to above and let grid clamping handle it
          targetY = above;
        }

        if (cfg.allowOverlap && rng() < 0.5) {
          // Randomly force it into the vertical overlap region if 2D overlap is enabled
          const edgeLo = clamp(prevY - h + 1, 0, ROWS - h);
          const edgeHi = clamp(prevY + prevH - 1, 0, ROWS - h);
          if (edgeLo <= edgeHi) y = randRange(edgeLo, edgeHi, rng);
          else y = targetY;
        } else {
          y = targetY;
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
      const up = y - 1;
      if (down <= ROWS - h && down < prevY + prevH) y = down;
      else if (up >= 0 && up > prevY - h) y = up;
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

  const expectedExitY = clamp(exitVal, 0, ROWS - rects[amount - 1].h);
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
    // If we struggle to find a path, prioritize location by relaxing corner requirements
    const currentCfg = attempt > 500 ? { ...cfg, targetCorners: 0 } : cfg;

    rects = generateSinglePatternRects(currentCfg, rng);
    if (isValidPattern(rects, currentCfg)) {
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
  const active = blocks.map(v => (v === 0 ? 1 : 0));
  const overlap = new Uint8Array(COLS * ROWS);
  const covered = new Uint8Array(COLS * ROWS);
  const rects = [];

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
            const score = (aCount - cCount) - 1.5 * (w * h - aCount);
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
// V4 format: 19 bytes → 26 B62 chars (explicit bounding coords)
// V5 format: 21 bytes → 29 B62 chars (adds middle block constraints)
// V6 format: 22 bytes → 30 B62 chars (adds curve parameter)

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const B62_LEN_V4 = 26; // 19 bytes
const B62_LEN_V5 = 29; // 21 bytes
const B62_LEN_V6 = 30; // 22 bytes

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
    blockMin = 3, blockMax = 8, overlapChance,
    startX = 0, startY = 15, startMinW = 2, startMaxW = 4, startMinH = 4, startMaxH = 8,
    midMinW = 0, midMaxW = 0, midMinH = 0, midMaxH = 0, midCurve = 50,
    endX = 15, endY = 0, endMinW = 6, endMaxW = 10, endMinH = 4, endMaxH = 8
  } = params;
  const [ar, ag, ab] = hexToBytes(colorA);
  const [br, bg, bb] = hexToBytes(colorB);

  const blockCountByte = (blockMin & 0xF) | ((blockMax & 0xF) << 4);
  const startCoordByte = (startX & 0xF) | ((startY & 0xF) << 4);
  const endCoordByte = (endX & 0xF) | ((endY & 0xF) << 4);

  const connectionByte = 0; // Legacy unused

  const startWByte = (startMinW & 0xF) | ((startMaxW & 0xF) << 4);
  const startHByte = (startMinH & 0xF) | ((startMaxH & 0xF) << 4);
  const endWByte = (endMinW & 0xF) | ((endMaxW & 0xF) << 4);
  const endHByte = (endMinH & 0xF) | ((endMaxH & 0xF) << 4);
  
  const midWByte = (midMinW & 0xF) | ((midMaxW & 0xF) << 4);
  const midHByte = (midMinH & 0xF) | ((midMaxH & 0xF) << 4);

  const buf = new Uint8Array([
    (seed >>> 24) & 0xff, (seed >>> 16) & 0xff, (seed >>> 8) & 0xff, seed & 0xff,
    blockCountByte, startCoordByte, overlapChance, connectionByte,
    startWByte, startHByte, endWByte, endHByte, endCoordByte,
    ar, ag, ab, br, bg, bb, midWByte, midHByte, Math.max(0, Math.min(100, midCurve))
  ]);
  return bytesToB62(buf, B62_LEN_V6);
}

export function decodeSeed(str) {
  try {
    const s = str.trim();
    const isV4 = s.length === B62_LEN_V4;
    const isV5 = s.length === B62_LEN_V5;
    const isV6 = s.length === B62_LEN_V6;
    
    if ((!isV4 && !isV5 && !isV6) || ![...s].every(c => B62.includes(c))) return null;

    const byteCount = isV6 ? 22 : (isV5 ? 21 : 19);
    const b = b62ToBytes(s, byteCount);
    const seed = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;

    const params = {
      blockMin: b[4] & 0xF,
      blockMax: (b[4] >> 4) & 0xF,
      startX: b[5] & 0xF,
      startY: (b[5] >> 4) & 0xF,
      overlapChance: b[6],
      startMinW: b[8] & 0xF,
      startMaxW: (b[8] >> 4) & 0xF,
      startMinH: b[9] & 0xF,
      startMaxH: (b[9] >> 4) & 0xF,
      endMinW: b[10] & 0xF,
      endMaxW: (b[10] >> 4) & 0xF,
      endMinH: b[11] & 0xF,
      endMaxH: (b[11] >> 4) & 0xF,
      endX: b[12] & 0xF,
      endY: (b[12] >> 4) & 0xF,
      midMinW: isV5 || isV6 ? (b[19] & 0xF) : 0,
      midMaxW: isV5 || isV6 ? ((b[19] >> 4) & 0xF) : 0,
      midMinH: isV5 || isV6 ? (b[20] & 0xF) : 0,
      midMaxH: isV5 || isV6 ? ((b[20] >> 4) & 0xF) : 0,
      midCurve: isV6 ? b[21] : 50,
    };
    const colorA = bytesToHex(b[13], b[14], b[15]);
    const colorB = bytesToHex(b[16], b[17], b[18]);

    if (params.overlapChance > 10) return null;

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
      'text/html': new Blob([`<html><body>${svgString}</body></html>`], { type: 'text/html' }),
    }),
  ]);
}
