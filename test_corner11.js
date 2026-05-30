import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';

for (const midMinH of [1, 3, 5, 8, 10]) {
  const params = { ...DEFAULT_PARAMS, midMinH, midMaxH: 14, cornerAmount: 2, blockMin: 5, blockMax: 7 };
  const cfg = buildConfigFromParams(params);

  let failures = 0;
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
    if (corners !== 2) failures++;
  }
  const icon = failures === 0 ? '✅' : failures < 5 ? '⚠️' : '❌';
  console.log(`${icon} midMinH=${midMinH}: failures=${failures}/30`);
}
