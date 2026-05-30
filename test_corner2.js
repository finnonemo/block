import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects } from './src/utils/gridUtils.js';

for (const cornerAmount of [0, 1, 2]) {
  const results = [];
  for (let seed = 0; seed < 30; seed++) {
    const params = { ...DEFAULT_PARAMS, cornerAmount };
    const cfg = buildConfigFromParams(params);
    const rects = generatePatternRects(cfg, Math.random);
    
    // Count actual corners in the returned rects
    let corners = 0;
    for (let i = 1; i < rects.length; i++) {
      const a = rects[i-1], b = rects[i];
      const overlapX = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
      const isCornerMeet = ((a.y === b.y+b.h) || (b.y === a.y+a.h)) && (overlapX === 0);
      if (isCornerMeet) corners++;
    }
    results.push(corners);
  }
  const allMatch = results.every(c => c === cornerAmount);
  console.log(`cornerAmount=${cornerAmount}: results=[${results.join(',')}] → ${allMatch ? '✅ ALL MATCH' : '❌ MISMATCH'}`);
}
