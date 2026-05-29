export const COLS = 16;
export const ROWS = 16;

const ALLOWED_HEIGHTS = [1, 2, 3, 4, 6, 8];

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

// Complexity meta — controls both amount and height behaviour
export const COMPLEXITY = {
  1: { label: 'Low',     amountOpts: [3],    maxHeight: 4, description: '3 groups' },
  2: { label: 'Med',     amountOpts: [4, 5], maxHeight: 6, description: '4–5 groups' },
  3: { label: 'High',    amountOpts: [6],    maxHeight: 8, description: '6 groups' },
  4: { label: 'Extreme', amountOpts: [7, 8], maxHeight: 8, description: '7–8 groups' },
};

export const START_HEIGHT_OPTIONS = [
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
  overlapChance: 0,   // 0–10 integer (maps to 0–100%)
  cornerChance:  0,   // 0–3 exact count
  volatility:    0,   // 0–10 integer (maps to 0–100% rebellion probability)
};

// Build generation config from the UI parameters
export function buildConfigFromParams({ complexity, startHeight, overlapChance, cornerChance, volatility = 0 }) {
  const meta   = COMPLEXITY[complexity] ?? COMPLEXITY[2];
  const amount = meta.amountOpts[Math.floor(Math.random() * meta.amountOpts.length)];
  const oc     = overlapChance / 10;

  return {
    amount,
    minHeight:    1,
    maxHeight:    meta.maxHeight,
    emergenceVal: ROWS - startHeight,
    overlapChance: oc,
    targetCorners: cornerChance,
    volatility:   volatility / 10,  // 0–1 rebellion probability
  };
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function makeHeights(cfg) {
  const { amount } = cfg;
  const minH    = cfg.minHeight ?? 1;
  const maxH    = cfg.maxHeight ?? 8;
  const allowed = ALLOWED_HEIGHTS.filter(h => h >= minH && h <= maxH);
  const pool    = allowed.length ? allowed : ALLOWED_HEIGHTS;
  const h       = Array(amount).fill(null).map(() => rand(pool));
  // Keep sorted staircase when no volatility; random order creates candlestick sizes
  if ((cfg.volatility ?? 0) === 0) h.sort((a, b) => a - b);
  return h;
}

function makeWidths(heights, amount, overlapChance) {
  const maxH    = Math.max(...heights, 1);
  const allowedW = maxH <= 3 ? [1, 2] : maxH <= 4 ? [2, 3] : [4, 6];

  for (let attempt = 0; attempt < 1000; attempt++) {
    const widths  = Array(amount).fill(0).map(() => rand(allowedW));
    const overlaps = [0];

    for (let i = 1; i < amount; i++) {
      if (overlapChance > 0 && Math.random() < overlapChance) {
        const maxOv = Math.min(2, Math.min(widths[i - 1], widths[i]) - 1);
        overlaps.push(maxOv > 0 ? Math.floor(Math.random() * (maxOv + 1)) : 0);
      } else {
        overlaps.push(0);
      }
    }

    const span = widths.reduce((s, w, i) => s + w - overlaps[i], 0);
    if (span !== COLS) continue;

    if (attempt < 400) {
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
  return { widths, overlaps: Array(amount).fill(0) };
}

// ─── Public generation ───────────────────────────────────────────────────────

export function generatePatternRects(cfg) {
  const heights  = makeHeights(cfg);
  const oc       = cfg.overlapChance ?? 0;
  const { widths, overlaps } = makeWidths(heights, cfg.amount, oc);

  // Resolve emergence Y anchor
  const emergenceVal =
    typeof cfg.emergenceVal === 'number'
      ? cfg.emergenceVal
      : { bottom: ROWS, center: 8, top: 4 }[cfg.emergence ?? 'bottom'] ?? ROWS;

  // Pre-select which adjacent pairs will be forced corner-meets
  const cornerPairs   = new Set();
  const targetCorners = cfg.targetCorners ?? 0;
  if (targetCorners > 0 && cfg.amount > 1) {
    const pairIndices = Array.from({ length: cfg.amount - 1 }, (_, i) => i + 1);
    for (let i = pairIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairIndices[i], pairIndices[j]] = [pairIndices[j], pairIndices[i]];
    }
    pairIndices.slice(0, Math.min(targetCorners, pairIndices.length)).forEach(p => cornerPairs.add(p));
  }

  const volatility = cfg.volatility ?? 0;
  const amount     = cfg.amount;

  // ── Baseline Y positions ─────────────────────────────────────────────────
  const startY = clamp(emergenceVal - heights[0], 0, ROWS - heights[0]);

  let baseline;
  if (volatility > 0) {
    // Staircase / candlestick: random walk — each block steps ±maxStep rows from the previous
    const maxStep = Math.max(1, Math.round(volatility * ROWS * 0.4));
    baseline = [];
    let currentY = startY;
    for (let i = 0; i < amount; i++) {
      if (i > 0) {
        const step = Math.floor(Math.random() * (maxStep + 1));
        const dir  = Math.random() < 0.5 ? 1 : -1;
        currentY   = clamp(currentY + dir * step, 0, ROWS - heights[i]);
      }
      baseline.push(currentY);
    }
  } else {
    // No volatility: all blocks anchored to the same start Y level
    baseline = heights.map(h => clamp(startY, 0, ROWS - h));
  }

  // ── Y assignment ─────────────────────────────────────────────────────────
  const rects = [];
  let x = 0, prevY = null, prevH = null;

  for (let i = 0; i < amount; i++) {
    if (i > 0) x += widths[i - 1] - overlaps[i];

    const h = heights[i], w = widths[i];
    const idealY = baseline[i];
    let y;

    if (prevY === null) {
      // ── First block: anchor at baseline start
      y = idealY;

    } else if (cornerPairs.has(i)) {
      // ── Forced corner (from cornerChance)
      const below   = prevY + prevH;
      const above   = prevY - h;
      const okBelow = below + h <= ROWS;
      const okAbove = above >= 0;
      if (okBelow && okAbove) y = Math.random() < 0.5 ? below : above;
      else if (okBelow)       y = below;
      else if (okAbove)       y = above;
      else {
        const lo = prevY - h + 1, hi = prevY + prevH - 1;
        y = clamp(idealY, lo, hi);
      }

    } else if (volatility > 0) {
      // ── Staircase / candlestick: random-walked Y, clamped to guarantee connection
      //    [prevY - h] = top-corner touch  |  (prevY-h, prevY+prevH) = edge  |  [prevY + prevH] = bottom-corner touch
      y = clamp(idealY, prevY - h, prevY + prevH);

    } else {
      // ── FOLLOW: move toward idealY, constrained by overlap connectivity
      const lo = prevY - h + 1, hi = prevY + prevH - 1;
      y = clamp(idealY, lo, hi);
    }

    y = clamp(y, 0, ROWS - h); // final grid-bounds safety

    // Enforce: adjacent blocks must never share the same top Y
    if (prevY !== null && y === prevY) {
      const down = y + 1;
      const up   = y - 1;
      // prefer down; require it stays in grid and still shares an edge (not just corner)
      if (down <= ROWS - h && down < prevY + prevH) y = down;
      else if (up >= 0 && up + h > prevY)           y = up;
      // else: pathological single-cell case — accept same Y rather than break grid
    }

    rects.push({ x, y, w, h });
    prevY = y;
    prevH = h;
  }

  return rects;
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
        for (let h = 1; h <= Math.min(8, ROWS - y); h++) {
          for (let w = 1; w <= Math.min(8, COLS - x); w++) {
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

  // Fallback: ensure ≥3
  while (rects.length < 3) {
    let placed = false;
    for (let i = 0; i < active.length && !placed; i++) {
      if (active[i] !== 1 || overlap[i] > 0) continue;
      const r = Math.floor(i / COLS), c = i % COLS;
      const cand = r + 1 < ROWS ? { x: c, y: r, w: 1, h: 2 }
                 : c + 1 < COLS ? { x: c, y: r, w: 2, h: 1 }
                 : null;
      if (!cand) continue;
      rects.push(cand);
      for (let rr = cand.y; rr < cand.y + cand.h; rr++) {
        for (let cc = cand.x; cc < cand.x + cand.w; cc++) {
          overlap[rr * COLS + cc]++;
          covered[rr * COLS + cc] = 1;
        }
      }
      placed = true;
    }
    if (!placed) break;
  }

  return rects;
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
