import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';
import { ROWS } from './src/utils/gridUtils.js';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

const params = { ...DEFAULT_PARAMS, midMinH: 8, midMaxH: 14, cornerAmount: 2 };
const cfg = buildConfigFromParams(params);

let found = false;
for (let seed = 0; seed < 500; seed++) {
  const rng = createRNG(seed * 999);
  const rects = generatePatternRects(cfg, rng);
  let corners = 0;
  for (let i = 1; i < rects.length; i++) {
    const a = rects[i-1], b = rects[i];
    if ((a.x+a.w===b.x&&a.y+a.h===b.y)||(a.x===b.x+b.w&&a.y+a.h===b.y)||
        (a.x+a.w===b.x&&a.y===b.y+b.h)||(a.x===b.x+b.w&&a.y===b.y+b.h)) corners++;
  }
  if (corners !== 2 && !found) {
    found = true;
    console.log(`seed=${seed}: got ${corners} corners`);
    console.log('Rects:', JSON.stringify(rects));
    
    const amount = rects.length;
    const emergenceVal = (cfg.startY ?? 15) + 1;
    const exitVal = cfg.exitVal ?? 0;
    const isTopFlat = (emergenceVal===0 && exitVal===0);
    const isBotFlat = (emergenceVal===ROWS && exitVal===ROWS);
    
    for (let i = 1; i < amount; i++) {
      const rA = rects[i-1], rB = rects[i];
      const overlapX = Math.max(0, Math.min(rA.x+rA.w, rB.x+rB.w) - Math.max(rA.x, rB.x));
      const isCorn = ((rA.y===rB.y+rB.h)||(rB.y===rA.y+rA.h)) && overlapX===0;
      const overlapY = Math.max(0, Math.min(rA.y+rA.h, rB.y+rB.h) - Math.max(rA.y, rB.y));
      const isHEdge = ((rA.y===rB.y+rB.h)||(rB.y===rA.y+rA.h)) && overlapX>=1;
      const isConn = isCorn || isHEdge || overlapY>=1;
      
      let issues = [];
      if (!isConn) issues.push('NOT_CONNECTED');
      if (isCorn) issues.push('CORNER');
      else {
        if (!isTopFlat && rA.y===rB.y) issues.push('SAME_TOP');
        if (!isBotFlat && rA.y+rA.h===rB.y+rB.h) issues.push('SAME_BOT');
      }
      if (rA.w===rB.w && rA.h===rB.h && overlapY>0) issues.push('DUP_DIMS');
      console.log(`  Pair ${i-1}→${i}: oX=${overlapX} oY=${overlapY} ${issues.join(' ')}`);
    }
  }
}
if (!found) console.log('All 500 seeds passed!');
