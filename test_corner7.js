import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

// Test with midMinH=4, cornerAmount=1
const params = { ...DEFAULT_PARAMS, midMinH: 4, midMaxH: 14, cornerAmount: 1 };
const cfg = buildConfigFromParams(params);

let success = 0, fail = 0;
for (let seed = 0; seed < 50; seed++) {
  const rng = createRNG(seed * 777);
  const rects = generatePatternRects(cfg, rng);
  
  let corners = 0;
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i-1], b = rects[i];
    const isCorner = (
      (a.x + a.w === b.x && a.y + a.h === b.y) ||
      (a.x === b.x + b.w && a.y + a.h === b.y) ||
      (a.x + a.w === b.x && a.y === b.y + b.h) ||
      (a.x === b.x + b.w && a.y === b.y + b.h)
    );
    if (isCorner) corners++;
  }
  if (corners === 1) success++; else fail++;
}
console.log(`midMinH=4, cornerAmount=1: success=${success}/50, fail=${fail}/50`);
