import { DEFAULT_PARAMS, buildConfigFromParams, generatePatternRects } from './src/utils/gridUtils.js';

const params = {
  ...DEFAULT_PARAMS,
  startY: 15,
  endY: 0,
  midMinH: 0,
  midMaxH: 0,
};
const cfg = buildConfigFromParams(params);

// Monkey patch makeHeights logic
const originalRand = Math.random;
console.log(generatePatternRects(cfg, originalRand));
