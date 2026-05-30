function testFallback() {
  const amount = 5;
  const targetSpan = 16;
  let forcedStartW = 3;
  let forcedEndW = 8;
  const fbUserMin = 1;
  const fbUserMax = 14;

  const widths = Array(amount).fill(1);
  widths[0] = forcedStartW;
  widths[amount - 1] = forcedEndW;
  for (let i = 1; i < amount - 1; i++) widths[i] = fbUserMin;

  let diff = targetSpan - widths.reduce((a, b) => a + b, 0);

  if (diff > 0) {
    // Randomly distribute diff
    let availableIndices = [];
    for (let i = 1; i < amount - 1; i++) {
      if (widths[i] < fbUserMax) availableIndices.push(i);
    }
    
    // First try to distribute to middle blocks
    while (diff > 0 && availableIndices.length > 0) {
      const idxStr = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      const i = parseInt(idxStr);
      widths[i]++;
      diff--;
      if (widths[i] >= fbUserMax) {
        availableIndices = availableIndices.filter(x => x !== i);
      }
    }

    // If still diff > 0, violate fbUserMax
    if (diff > 0) {
      availableIndices = [];
      for (let i = 1; i < amount - 1; i++) availableIndices.push(i);
      while (diff > 0 && availableIndices.length > 0) {
        const i = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        widths[i]++;
        diff--;
      }
    }
  }

  // If diff < 0, use the previous squash logic
  let overlaps = Array(amount).fill(0);
  if (diff < 0) {
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

  console.log("Final widths:", widths);
  console.log("overlaps:", overlaps);
  console.log("diff:", diff);
}
for (let i=0; i<5; i++) testFallback();
