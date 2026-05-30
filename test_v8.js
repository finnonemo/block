function testFallback() {
  const amount = 3;
  const targetSpan = 16;
  let forcedStartW = 8;
  let forcedEndW = 8;
  const base = Math.floor(targetSpan / amount);
  const widths = Array(amount).fill(base);
  if (forcedStartW != null) widths[0] = Math.max(1, Math.min(forcedStartW, targetSpan));
  if (forcedEndW != null) widths[amount - 1] = Math.max(1, Math.min(forcedEndW, targetSpan));

  const fbUserMin = 1;
  const fbUserMax = 14;
  for (let i = 1; i < amount - 1; i++) {
    widths[i] = Math.max(fbUserMin, Math.min(widths[i], fbUserMax));
  }

  let overlaps = Array(amount).fill(0);
  let diff = targetSpan - widths.reduce((a, b) => a + b, 0);

  if (amount > 2) {
    if (diff > 0) {
      // expand logic...
    } else if (diff < 0) {
      // 1. Overlap first
      for (let i = 1; i < amount && diff < 0; i++) {
        const maxOv = Math.max(0, Math.min(widths[i - 1], widths[i]) - 1);
        const toOverlap = Math.min(maxOv, Math.abs(diff));
        overlaps[i] += toOverlap;
        diff += toOverlap;
      }
      
      // 2. Squash middle blocks down to userMin
      for (let i = amount - 2; i > 0 && diff < 0; i--) {
        while (diff < 0 && widths[i] > fbUserMin) { widths[i]--; diff++; }
      }
      // 3. Squash middle blocks down to 1 (violate userMin)
      for (let i = amount - 2; i > 0 && diff < 0; i--) {
        if (widths[i] > 1) { widths[i]--; diff++; }
      }
      // 4. Squash start/end blocks
      while (diff < 0) {
        if (widths[0] > 1) { widths[0]--; diff++; }
        else if (widths[amount - 1] > 1) { widths[amount - 1]--; diff++; }
        else break;
      }
    }
  }

  console.log("widths:", widths);
  console.log("overlaps:", overlaps);
  console.log("diff:", diff);
}
testFallback();
