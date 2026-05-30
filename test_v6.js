import { generatePatternRects, buildConfigFromParams, DEFAULT_PARAMS } from './src/utils/gridUtils.js';

const params = {
  ...DEFAULT_PARAMS,
  startMinH: 4, startMaxH: 4,
  startMinW: 4, startMaxW: 4,
  endMinH: 4, endMaxH: 4,
  endMinW: 4, endMaxW: 4,
  midMinW: 8, midMaxW: 8,
  midMinH: 8, midMaxH: 8
};
const cfg = buildConfigFromParams(params);
const rects = generatePatternRects(cfg, Math.random);
console.log(rects);
