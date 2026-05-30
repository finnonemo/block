import { DEFAULT_PARAMS, buildConfigFromParams, generatePatternRects } from './src/utils/gridUtils.js';

const params = {
  ...DEFAULT_PARAMS,
  startY: 15,
  endY: 0,
  midMinH: 0,
  midMaxH: 0,
};
const cfg = buildConfigFromParams(params);
console.log(generatePatternRects(cfg, Math.random));
