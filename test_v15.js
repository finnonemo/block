function testStaircase() {
  const ROWS = 16;
  const startY = 15;
  const exitY = 0;
  const heights = [3, 14, 8, 10, 4];
  const amount = heights.length;
  const baseline = heights.map((h, i) => {
    const t = amount > 1 ? i / (amount - 1) : 0;
    return Math.max(0, Math.min(ROWS - h, Math.round(startY + t * (exitY - startY))));
  });

  console.log("Baseline:", baseline);

  let prevY = null;
  let prevH = null;
  const ascending = startY > exitY;

  for (let i = 0; i < amount; i++) {
    const h = heights[i];
    let y;
    if (i === 0) {
      y = baseline[0];
    } else if (i === amount - 1) {
      y = exitY;
    } else {
      const idealY = baseline[i];
      const targetShare = ascending ? (idealY - prevY + h) : (prevY + prevH - idealY);
      const maxOv = Math.min(prevH, h) - 1;
      const minOv = 0; // allow flush stacking
      const shareOffset = Math.max(minOv, Math.min(maxOv, targetShare));
      
      y = ascending ? (prevY - h + shareOffset) : (prevY + prevH - shareOffset);
    }
    console.log(`Block ${i} (h=${h}): y=${y} (ideal=${baseline[i]})`);
    prevY = y;
    prevH = h;
  }
}
testStaircase();
