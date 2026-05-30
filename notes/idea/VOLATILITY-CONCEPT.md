## Update: Volatility & Swing Logic (Stock Market Effect)

### 3.1 New Input Parameters
| Parameter | Type | Values | Description |
| :--- | :--- | :--- | :--- |
| **Exit Height** | Integer | 0, 4, 8, 12, 16 | The exact $y$ level the final block must attach to on the right edge. |
| **Volatility** | Float | 0.0 to 1.0 | Controls how much middle blocks can deviate from the direct trajectory. (0.0 = strict line, 1.0 = high swing/candlestick effect). |

---

### 4.1 Updated Trajectory Algorithm (The Swing Factor)

To simulate stock market fluctuations, the system calculates a "Baseline Trajectory" and applies a "Volatility Modifier" to middle blocks.

**Step A: Calculate Trajectory Slope**
Calculate the ideal vertical step per horizontal unit to draw an imaginary straight line from Start to Exit.
* Let $Y_{start}$ be the Y-coordinate of the first block.
* Let $Y_{exit}$ be the target Y-coordinate calculated from **Exit Height**.
* Total vertical distance: $\Delta Y = Y_{exit} - Y_{start}$

**Step B: The Middle Block Loop (Applying Swing)**
When calculating `nextY` for each middle block, instead of strictly moving towards $Y_{exit}$, we introduce a random directional modifier based on **Volatility**:

1.  **Calculate Expected Y ($Y_{ideal}$):**
    Based on the current block's $X$ position, what should its $Y$ be if it were perfectly on the trend line?
    $Y_{ideal} = Y_{start} + (currX / 16) \times \Delta Y$

2.  **Determine Connection Direction:**
    Use `Math.random()` compared against the **Volatility** parameter to decide if this block will follow the trend, or "rebel" (swing).
    * If `Volatility = 0.0`: The block strictly follows the trajectory towards $Y_{ideal}$. The connection goes UP if $Y_{ideal}$ is above, or DOWN if $Y_{ideal}$ is below.
    * If `Volatility = High (e.g., 0.8)`: There is an 80% chance the block can randomly inverse its Y direction (e.g., dropping down like a red candle) before the next block recovers.

3.  **Apply Connection (Up or Down):**
    Once the direction is decided, apply the Connection Logic (Overlap, Edge, Corner).
    * *Swing UP (Green Candle):* $nextY = prevBlock.y - h$ (or partial $h$ for overlap).
    * *Swing DOWN (Red Candle):* $nextY = prevBlock.y + h$ (or partial $h$ for overlap).

**Step C: The "Rubber Band" Correction (Last 2 Blocks)**
To ensure the final block accurately hits the `Exit Height` regardless of how wild the middle blocks swung:
* As the loop reaches the final middle blocks ($i \ge N - 2$), force the `Volatility` multiplier to `0.0`.
* This acts as a "Rubber Band", aggressively forcing the `nextY` connection direction to point directly towards $Y_{exit}$ so the final block aligns perfectly on the right edge.