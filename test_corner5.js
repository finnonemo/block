import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

// Simulate exactly what the UI does
const params = { ...DEFAULT_PARAMS, cornerAmount: 1 };
console.log('params.cornerAmount:', params.cornerAmount);

const cfg = buildConfigFromParams(params);
console.log('cfg.cornerAmount:', cfg.cornerAmount);

// Run 10 times
for (let i = 0; i < 10; i++) {
  const rng = createRNG(i * 1234);
  const rects = generatePatternRects(cfg, rng);
  
  let corners = 0;
  for (let j = 1; j < rects.length; j++) {
    const a = rects[j-1], b = rects[j];
    const isCorner = (
      (a.x + a.w === b.x && a.y + a.h === b.y) ||
      (a.x === b.x + b.w && a.y + a.h === b.y) ||
      (a.x + a.w === b.x && a.y === b.y + b.h) ||
      (a.x === b.x + b.w && a.y === b.y + b.h)
    );
    if (isCorner) corners++;
  }
  console.log(`seed=${i}: ${rects.length} blocks, ${corners} corners`);
}
