import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects } from './src/utils/gridUtils.js';

// Test with cornerAmount = 0, 1, 2
for (const cornerAmount of [0, 1, 2]) {
  let cornerCounts = [];
  for (let seed = 0; seed < 20; seed++) {
    const params = { ...DEFAULT_PARAMS, cornerAmount };
    const cfg = buildConfigFromParams(params);
    const rects = generatePatternRects(cfg, Math.random);
    cornerCounts.push('(no debug info - need connectionTypes)');
  }
  console.log(`cornerAmount=${cornerAmount}: ran 20 times`);
}
