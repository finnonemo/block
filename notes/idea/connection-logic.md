## Connection Logic Rules

When calculating `nextX` and `nextY` for a new block, the system randomly selects one of the following connection states (33% probability each) to attach it to the `prevBlock`:

| Connection Type | X-Axis Calculation (`nextX`) | Y-Axis Calculation (`nextY`) | Visual Result |
| :--- | :--- | :--- | :--- |
| **0: Overlap** | Starts at $x = \text{prevX} + (\text{prevW} / 2)$ | Starts at $y = \text{prevY} - (\text{newH} / 2)$ | Blocks physically intersect/overlap at their corners. |
| **1: Edge-to-Edge** | *Sub-Rule A (Right Edge):* $x = \text{prevX} + \text{prevW}$ <br>*Sub-Rule B (Top Edge):* $x$ overlaps previous | *Sub-Rule A:* $y$ overlaps previous <br>*Sub-Rule B:* $y = \text{prevY} - \text{newH}$ | Blocks sit flush against each other's side or top edges. |
| **2: Corner Connect** | Starts exactly at $x = \text{prevX} + \text{prevW}$ | Starts exactly at $y = \text{prevY} - \text{newH}$ | Top-right corner of previous block touches bottom-left of new block. |

*(Note: All `nextY` calculations are subject to a boundary check `if (nextY < 0) nextY = 0` to prevent blocks from disappearing off the top edge).*