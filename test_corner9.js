import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

// Multiple midMin/midMax combos with more blocks
for (const midMinH of [1, 3, 5, 8]) {
  const params = { ...DEFAULT_PARAMS, midMinH, midMaxH: 14, cornerAmount: 2, blockMin: 6, blockMax: 8 };
  const cfg = buildConfigFromParams(params);

  let totalCorners = 0, totalRuns = 0, failures = 0;
  for (let seed = 0; seed < 30; seed++) {
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
    totalCorners += corners;
    totalRuns++;
    if (corners !== 2) failures++;
  }
  console.log(`midMinH=${midMinH}: avg corners=${(totalCorners/totalRuns).toFixed(2)}, failures=${failures}/30`);
}
