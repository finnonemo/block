function biasedRandIndex(length, bias) {
  let u = Math.random();
  if (bias > 0) {
    // push towards 1
    u = 1 - Math.pow(1 - u, 1 + bias * 5);
  } else if (bias < 0) {
    // push towards 0
    u = Math.pow(u, 1 - bias * 5);
  }
  return Math.floor(u * length);
}

const N = 10;
const pool = [1, 2, 3, 4, 6, 8, 10, 12, 14];

function testCurve(curve) {
  console.log(`\n=== Curve ${curve} ===`);
  const C = (curve - 50) / 50; // -1 to 1
  for (let i = 0; i < N; i++) {
    const t = N > 1 ? i / (N - 1) : 0;
    const bias = C * (2 * t - 1);
    
    // Sample 1000 times to get average for this block
    let sum = 0;
    for(let k=0; k<1000; k++) {
      sum += pool[biasedRandIndex(pool.length, bias)];
    }
    console.log(`Block ${i} (t=${t.toFixed(2)}, bias=${bias.toFixed(2)}): Avg Size = ${(sum/1000).toFixed(1)}`);
  }
}

testCurve(0);
testCurve(50);
testCurve(100);
