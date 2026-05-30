import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

// Find a failing case and show WHY it fails
const params = { ...DEFAULT_PARAMS, midMinH: 5, midMaxH: 14, cornerAmount: 1 };
const cfg = buildConfigFromParams(params);

for (let seed = 0; seed < 5; seed++) {
  const rng = createRNG(seed * 999);
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
  console.log(`seed=${seed}: ${corners} corners, blocks=${JSON.stringify(rects)}`);
}
