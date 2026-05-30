import { buildConfigFromParams, DEFAULT_PARAMS, generatePatternRects, createRNG } from './src/utils/gridUtils.js';
import { ROWS, COLS } from './src/utils/gridUtils.js';

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Manually simulate isValidPattern step by step for a failing case
const params = { ...DEFAULT_PARAMS, midMinH: 8, midMaxH: 14, cornerAmount: 1 };
const cfg = buildConfigFromParams(params);

// Try many seeds until we find one that returns < 1 corner
for (let seed = 0; seed < 200; seed++) {
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
  if (corners !== 1) {
    console.log(`Failure at seed=${seed}: got ${corners} corners`);
    console.log('Rects:', JSON.stringify(rects));
    
    // Check WHICH validation is failing
    const amount = rects.length;
    const emergenceVal = (cfg.startY ?? 15) + 1;
    const exitVal = cfg.exitVal ?? 0;
    
    console.log('emergenceVal:', emergenceVal, 'exitVal:', exitVal);
    
    const expectedStartY = clamp(emergenceVal - rects[0].h, 0, ROWS - rects[0].h);
    console.log('startY check:', rects[0].y, 'expected:', expectedStartY, rects[0].y !== expectedStartY ? '❌ FAIL' : '✅');
    
    const expectedExitY = clamp(exitVal, 0, ROWS - rects[amount-1].h);
    console.log('exitY check:', rects[amount-1].y, 'expected:', expectedExitY, rects[amount-1].y !== expectedExitY ? '❌ FAIL' : '✅');
    
    let actualCorners2 = 0;
    for (let i = 1; i < amount; i++) {
      const rA = rects[i-1], rB = rects[i];
      const overlapX = Math.max(0, Math.min(rA.x+rA.w, rB.x+rB.w) - Math.max(rA.x, rB.x));
      const overlapY = Math.max(0, Math.min(rA.y+rA.h, rB.y+rB.h) - Math.max(rA.y, rB.y));
      const isCornerMeet = ((rA.y === rB.y+rB.h)||(rB.y===rA.y+rA.h)) && overlapX===0;
      const isHEdge = ((rA.y === rB.y+rB.h)||(rB.y===rA.y+rA.h)) && overlapX>=1;
      const isConnected = isCornerMeet || isHEdge || overlapY>=1;
      if (isCornerMeet) actualCorners2++;
      if (!isConnected) console.log(`  Pair ${i-1}→${i}: ❌ NOT CONNECTED oX=${overlapX} oY=${overlapY}`);
    }
    
    console.log('cornerAmount check:', actualCorners2, '!== 1?', actualCorners2 !== 1 ? '❌ FAIL' : '✅');
    
    // Dup dims check
    for (let i = 1; i < amount; i++) {
      const rA = rects[i-1], rB = rects[i];
      const ov = (rA.y <= rB.y+rB.h-1) && (rB.y <= rA.y+rA.h-1);
      if (ov && rA.w===rB.w && rA.h===rB.h) console.log(`  Pair ${i-1}→${i}: ❌ DUP DIMS`);
    }
    
    // Slope check
    const isTopFlat = (emergenceVal===0 && exitVal===0);
    const isBotFlat = (emergenceVal===ROWS && exitVal===ROWS);
    for (let i = 1; i < amount; i++) {
      const rA = rects[i-1], rB = rects[i];
      const overlapX = Math.max(0, Math.min(rA.x+rA.w, rB.x+rB.w) - Math.max(rA.x, rB.x));
      const isCorn = ((rA.y===rB.y+rB.h)||(rB.y===rA.y+rA.h)) && overlapX===0;
      if (isCorn) { console.log(`  Pair ${i-1}→${i}: corner - exempt from slope`); continue; }
      if (!isTopFlat && rA.y===rB.y) console.log(`  Pair ${i-1}→${i}: ❌ SLOPE same top y=${rA.y}`);
      if (!isBotFlat && rA.y+rA.h===rB.y+rB.h) console.log(`  Pair ${i-1}→${i}: ❌ SLOPE same bottom y+h=${rA.y+rA.h}`);
    }
    
    break;
  }
}
