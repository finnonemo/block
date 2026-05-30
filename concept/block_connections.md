# Block Connection Geometry

The pattern generator builds patterns by linking rectangular blocks together in a continuous sequence. A critical rule of the generator is that blocks must **always connect** edge-to-edge (or corner-to-corner) without ever physically overlapping in 2-dimensional space. 

This means that the area of intersection between any two blocks is strictly `0`. The blocks simply sit flush against each other.

There are exactly three types of connections allowed in the algorithm:

## 1. Vertical Edge Connect
Blocks that connect vertically sit side-by-side along the X-axis and share a vertical boundary. 
- **X-Axis:** The right edge of the first block perfectly aligns with the left edge of the second block. This means the horizontal gap or overlap between them is exactly zero (`overlapX = 0`).
- **Y-Axis:** The blocks touch along their vertical edge. They must share at least 1 row of height (`overlapY >= 1`). The exact amount of shared rows is chosen randomly.
- **Visual Result:** The blocks look like they are stepping horizontally, sharing a flush vertical border.

## 2. Horizontal Edge Connect
Blocks that connect horizontally sit on top of (or below) each other along the Y-axis and share a horizontal boundary.
- **Y-Axis:** The bottom edge of the first block perfectly aligns with the top edge of the second block (or vice-versa). This means the vertical gap or overlap between them is exactly zero (`overlapY = 0`).
- **X-Axis:** The blocks touch along their horizontal edge. They must share at least 1 column of width (`overlapX >= 1`). The exact amount of shared columns is chosen randomly based on the available widths.
- **Visual Result:** The blocks look like they are stacked vertically, sharing a flush horizontal border.

## 3. Corner Connect
Blocks that connect by a corner only touch at exactly one pinpoint vertex.
- **X-Axis:** The horizontal overlap is exactly zero (`overlapX = 0`).
- **Y-Axis:** The vertical overlap is exactly zero (`overlapY = 0`).
- **Visual Result:** The blocks meet diagonally at their corners. The generator allows exact control over how many of these corner connections appear in a pattern via the `Corner Chance` parameter. If `Corner Chance = 0`, the engine mathematically forbids accidental corner connections.

---

### Internal Generation Logic
1. **Assignment:** When the generator begins, it determines the total amount of blocks and randomly assigns a connection type (`horizontal` or `vertical`) to every gap between them.
2. **Width Generation:** When calculating block widths, it strictly forces `overlapX = 0` for vertical connections, and ensures `overlapX >= 1` for horizontal connections.
3. **Y-Axis Routing:** When deciding the vertical `y` coordinates for the blocks, it routes the blocks towards the final `End Y` coordinate. If a horizontal connection is required, it forces the block to sit exactly flush on the Y-axis (`overlapY = 0`). If a vertical connection is required, it picks a Y-coordinate that ensures the blocks share a vertical strip (`overlapY >= 1`).
4. **Validation:** At the very end of generation, the layout is strictly validated. If any two blocks happen to overlap in 2D space (`overlapX * overlapY > 0`), the generator discards the layout and retries to guarantee perfectly flush edge-to-edge connections.
