import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

// Find the ACTUAL failure scenario - maybe the canvas renders differently
// Let's check what happens with midMinH=4: do the blocks actually TOUCH at the corner?
const params = { ...DEFAULT_PARAMS, midMinH: 4, midMaxH: 14, cornerAmount: 1 };
const cfg = buildConfigFromParams(params);

for (let seed = 0; seed < 5; seed++) {
  const rng = createRNG(seed * 777);
  const rects = generatePatternRects(cfg, rng);
  
  console.log(`\n=== seed=${seed} ===`);
  rects.forEach((r, i) => console.log(`  Block ${i}: x=${r.x} y=${r.y} w=${r.w} h=${r.h} | bottom=${r.y+r.h} right=${r.x+r.w}`));
  
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i-1], b = rects[i];
    const overlapX = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
    const overlapY = Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
    const isCorner = (
      (a.x + a.w === b.x && a.y + a.h === b.y) ||
      (a.x === b.x + b.w && a.y + a.h === b.y) ||
      (a.x + a.w === b.x && a.y === b.y + b.h) ||
      (a.x === b.x + b.w && a.y === b.y + b.h)
    );
    if (isCorner) console.log(`  ✅ Pair ${i-1}→${i}: CORNER (overlapX=${overlapX} overlapY=${overlapY})`);
  }
}
