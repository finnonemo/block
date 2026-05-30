import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG, COLS, ROWS } from './src/utils/gridUtils.js';

// Find any rects that are outside bounds or have h=0/w=0
let outOfBounds = 0, zeroSize = 0;
for (let seed = 0; seed < 200; seed++) {
  const params = { ...DEFAULT_PARAMS, midMinH: 5, midMaxH: 14, cornerAmount: 2 };
  const cfg = buildConfigFromParams(params);
  const rng = createRNG(seed * 1337);
  const rects = generatePatternRects(cfg, rng);
  
  for (const r of rects) {
    if (r.h === 0 || r.w === 0) { zeroSize++; console.log(`ZERO SIZE seed=${seed}:`, r); }
    if (r.x < 0 || r.y < 0 || r.x + r.w > COLS || r.y + r.h > ROWS) {
      outOfBounds++;
      console.log(`OUT OF BOUNDS seed=${seed}:`, r, `(grid ${COLS}x${ROWS})`);
    }
  }
  
  // Also check last block position
  const last = rects[rects.length - 1];
  if (last.x + last.w > COLS) {
    console.log(`LAST BLOCK OVERFLOWS X seed=${seed}: x=${last.x} w=${last.w} right=${last.x+last.w}`);
  }
}
console.log(`\nTotal: zeroSize=${zeroSize}, outOfBounds=${outOfBounds}`);
