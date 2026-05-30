function testFallback() {
  const amount = 3;
  const targetSpan = 16;
  let forcedStartW = 8;
  let forcedEndW = 8;
  const base = Math.floor(targetSpan / amount);
  const widths = [8, 5, 8];
  const fbUserMin = 1;
  const fbUserMax = 14;

  let overlaps = Array(amount).fill(0);
  let diff = targetSpan - widths.reduce((a, b) => a + b, 0); // 16 - 21 = -5

  if (amount > 2) {
    if (diff > 0) {
      // ...
    } else if (diff < 0) {
      // 1. Try to absorb diff by overlapping horizontally
      while (diff < 0) {
        let changed = false;
        for (let i = 1; i < amount && diff < 0; i++) {
          const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
          if (overlaps[i] < maxOv) { overlaps[i]++; diff++; changed = true; }
        }
        if (!changed) break;
      }
      // 2. Squash middle blocks down to userMin
      while (diff < 0) {
        let changed = false;
        for (let i = amount - 2; i > 0 && diff < 0; i--) {
          const minW = Math.max(fbUserMin, (i > 0 ? overlaps[i] : 0) + 1, (i < amount - 1 ? overlaps[i+1] : 0) + 1);
          if (widths[i] > minW) { widths[i]--; diff++; changed = true; }
        }
        if (!changed) break;
      }
      // 3. Squash middle blocks down to 1 (violate userMin)
      while (diff < 0) {
        let changed = false;
        for (let i = amount - 2; i > 0 && diff < 0; i--) {
          const minW = Math.max(1, (i > 0 ? overlaps[i] : 0) + 1, (i < amount - 1 ? overlaps[i+1] : 0) + 1);
          if (widths[i] > minW) { widths[i]--; diff++; changed = true; }
        }
        if (!changed) break;
      }
      // 4. If we still need to borrow, borrow from start/end
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

  console.log("widths:", widths);
  console.log("overlaps:", overlaps);
  console.log("diff:", diff);
}
testFallback();
