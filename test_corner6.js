import { buildConfigFromParams, DEFAULT_PARAMS } from './src/utils/gridUtils.js';

// Check what DEFAULT_PARAMS produces
console.log('DEFAULT_PARAMS:', DEFAULT_PARAMS);

const params = { ...DEFAULT_PARAMS, cornerAmount: 1 };
const cfg = buildConfigFromParams(params);
console.log('\nConfig produced:');
console.log('  cornerAmount:', cfg.cornerAmount);
console.log('  startY (emergenceVal base):', cfg.startY);
console.log('  exitVal:', cfg.exitVal);
console.log('  targetSpan:', cfg.targetSpan);

// Check the slope validation with a manual corner rect
// startY=15, emergenceVal=16, exitVal=0
// For a corner to exist, we need two blocks where:
//   rA.y === rB.y + rB.h  OR  rA.y + rA.h === rB.y
// BUT isValidPattern also checks:
//   rA.y !== rB.y  (no same top)
//   rA.y + rA.h !== rB.y + rB.h  (no same bottom)
// A true corner has overlapX=0 AND overlapY=0

// Example corner: A={x:0,y:3,w:3,h:4} B={x:3,y:7,w:3,h:4}
// A.y + A.h = 7 = B.y → horizontal edge, not corner (overlapX can be 0 or >0)
// For corner we need B.x > A.x+A.w (so overlapX=0) AND either flush top or bottom

// OK: A={x:0,y:3,w:3,h:4}, B={x:3,y:7,w:3,h:4}
// A right=3, B left=3 → touching vertically, BUT A.y+A.h=7=B.y → horizontal edge (overlapX=0)!
// That's actually isCornerMeet with the old formula!
// New formula: (a.x+a.w === b.x && a.y+a.h === b.y) → TRUE! This IS a corner.
// But wait: overlapX = min(3,6)-max(0,3) = 3-3 = 0 ✓
//           overlapY = min(7,11)-max(3,7) = 7-7 = 0 ✓
// isConnected = isCornerMeet(true) || isHorizontalEdgeMeet(false) || overlapY>=1(false) = true

// Let's check if the staircase slope constraint would reject this:
// rA.y=3, rB.y=7 → not equal ✓  
// rA.y+rA.h=7, rB.y+rB.h=11 → not equal ✓
// PASSES!

console.log('\nSlope constraint check for corner A={y:3,h:4} → B={y:7,h:4}:');
console.log('  rA.y === rB.y?', 3 === 7);
console.log('  rA.y+rA.h === rB.y+rB.h?', 7 === 11);
console.log('  Both false = corner should PASS slope check ✓');

// Now check: is there ANY slope constraint that kills the corner before it gets accepted?
// The last block (rects[amount-1]) must have y === exitVal = 0
// For ascending (startY=15→exitY=0), y decreases each step. 
// A corner needs blocks to NOT share any rows.
// With height constraints, can we always find valid corners?

// Edge case: what if amount=2? Then we need 1 corner between block 0 and block 1.
// But block 0 is at y=clamp(15+1-h0, 0, 16-h0) and block 1 is at y=exitVal=0.
// For block 0 with h0=4: y0=clamp(16-4,0,12)=12. 
// For block 1 to be a corner: either y1=y0-h1 or y1=y0+h0
// y0+h0 = 12+4=16 > ROWS(16)... wait ROWS=16, grid is 0..15 rows, y+h=16 is OK (bottom of grid)
// Wait, ROWS=16, so y can go from 0 to ROWS-h.
// Block 1 at y=exitVal=0, and it needs to be a corner with block 0.
// Corner: a.y+a.h=b.y (a bottom = b top): 12+4=16, b.y=0 → 16≠0 ✗
// Corner: a.y=b.y+b.h (a top = b bottom): 12=0+h1 → h1=12. That works if h1=12!
// But what if h1 is not 12? Then no corner is possible with 2 blocks.
// The generator forces h1=exitVal=0... wait exitVal is the Y position not height.

console.log('\nFor 2 blocks: start y0=12(h=4), end y1=0:');
console.log('  Corner case a.y+a.h=b.y: 12+4=16, b.y=0 →', 16===0);
console.log('  Corner case a.y=b.y+b.h: 12=0+h1, so h1 must be 12 →', 12);
console.log('  → a 2-block corner requires end block height = startY of first block');
