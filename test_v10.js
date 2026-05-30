const ALLOWED_WIDTHS = [1, 2, 3, 4, 6, 8, 10, 12, 14];
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function testFallback() {
  const amount = 5;
  const targetSpan = 16;
  let forcedStartW = 3;
  let forcedEndW = 8;
  const fbUserMin = 1;
  const fbUserMax = 14;

  let widths = Array(amount).fill(0);
  widths[0] = forcedStartW;
  widths[amount - 1] = forcedEndW;

  for (let i = 1; i < amount - 1; i++) {
    const pool = ALLOWED_WIDTHS.filter(w => w >= fbUserMin && w <= fbUserMax);
    widths[i] = pool.length ? rand(pool) : fbUserMin;
  }

  console.log("Initial random widths:", widths);

  let overlaps = Array(amount).fill(0);
  let diff = targetSpan - widths.reduce((a, b) => a + b, 0);

  if (amount > 2) {
    if (diff > 0) {
      for (let i = 1; i < amount - 1 && diff > 0; i++) {
        while (diff > 0 && widths[i] < fbUserMax) { widths[i]++; diff--; }
      }
      for (let i = 1; i < amount - 1 && diff > 0; i++) {
        widths[i]++; diff--;
      }
    } else if (diff < 0) {
      while (diff < 0) {
        let changed = false;
        for (let i = 1; i < amount && diff < 0; i++) {
          const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
          if (overlaps[i] < maxOv) { overlaps[i]++; diff++; changed = true; }
        }
        if (!changed) break;
      }
      while (diff < 0) {
        let changed = false;
        for (let i = amount - 2; i > 0 && diff < 0; i--) {
          const minW = Math.max(fbUserMin, (i > 0 ? overlaps[i] : 0) + 1, (i < amount - 1 ? overlaps[i+1] : 0) + 1);
          if (widths[i] > minW) { widths[i]--; diff++; changed = true; }
        }
        if (!changed) break;
      }
      while (diff < 0) {
        let changed = false;
        for (let i = amount - 2; i > 0 && diff < 0; i--) {
          const minW = Math.max(1, (i > 0 ? overlaps[i] : 0) + 1, (i < amount - 1 ? overlaps[i+1] : 0) + 1);
          if (widths[i] > minW) { widths[i]--; diff++; changed = true; }
        }
        if (!changed) break;
      }
      while (diff < 0) {
        let changed = false;
        const minW0 = Math.max(1, overlaps[1] + 1);
        if (widths[0] > minW0) { widths[0]--; diff++; changed = true; }
        const minWEnd = Math.max(1, overlaps[amount - 1] + 1);
        if (widths[amount - 1] > minWEnd && diff < 0) { widths[amount - 1]--; diff++; changed = true; }
        if (!changed) break;
      }
    }
  }

  console.log("Final widths:", widths);
  console.log("overlaps:", overlaps);
  console.log("diff:", diff);
}
testFallback();
