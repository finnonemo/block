function pickBiasedSize(pool, t, curve, rng) {
  if (!pool.length) return 1;
  const C = (curve - 50) / 50; // -1 to 1
  const bias = C * (2 * t - 1); // -1 to 1

  let u = rng();
  if (bias > 0) {
    // push towards 1
    u = 1 - Math.pow(1 - u, 1 + bias * 5);
  } else if (bias < 0) {
    // push towards 0
    u = Math.pow(u, 1 - bias * 5);
  }

  const idx = Math.min(pool.length - 1, Math.floor(u * pool.length));
  return pool[idx];
}

const N = 10;
const pool = [1, 2, 3, 4, 6, 8, 10, 12, 14];

function testCurve(curve) {
  console.log(`\n=== Curve ${curve} ===`);
  for (let i = 0; i < N; i++) {
    const t = N > 1 ? i / (N - 1) : 0;
    let sum = 0;
    for(let k=0; k<1000; k++) {
      sum += pickBiasedSize(pool, t, curve, Math.random);
    }
    console.log(`Block ${i}: Avg Size = ${(sum/1000).toFixed(1)}`);
  }
}

testCurve(0);
testCurve(100);
