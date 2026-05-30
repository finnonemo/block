import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

// Test with cornerAmount=1, use a fixed seed so we can reproduce
for (const cornerAmount of [1, 2]) {
  const params = { ...DEFAULT_PARAMS, cornerAmount };
  const cfg = buildConfigFromParams(params);
  
  console.log(`\n=== cornerAmount=${cornerAmount} ===`);
  console.log('cfg.cornerAmount:', cfg.cornerAmount);
  
  const rng = createRNG(42);
  const rects = generatePatternRects(cfg, rng);
  
  console.log('Rects:', JSON.stringify(rects));
  
  let corners = 0;
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i-1], b = rects[i];
    const overlapX = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
    const overlapY = Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
    const isCornerMeet = ((a.y === b.y+b.h) || (b.y === a.y+a.h)) && (overlapX === 0);
    console.log(`  Pair ${i-1}→${i}: overlapX=${overlapX} overlapY=${overlapY} isCorner=${isCornerMeet}`);
    if (isCornerMeet) corners++;
  }
  console.log('Actual corners:', corners);
}
