import { useCallback, useEffect, useRef, useState } from 'react'
import { COLS, ROWS } from '@/utils/gridUtils'

function getCornerMarkers(rectangles, cellSize) {
  const markers = [];
  const delta = cellSize * 0.4;

  for (let i = 1; i < rectangles.length; i++) {
    const rA = rectangles[i - 1];
    const rB = rectangles[i];

    // Case: A top-right → B bottom-left (rA above-left, rB below-right)
    if (rA.x + rA.w === rB.x && rA.y === rB.y + rB.h) {
      const cx = rB.x * cellSize;
      const cy = rA.y * cellSize;
      markers.push(
        <path key={`c-tr-bl-${i}`}
          d={`M ${cx - delta} ${cy} H ${cx} V ${cy + delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
      markers.push(
        <path key={`c-bl-tr-${i}`}
          d={`M ${cx + delta} ${cy} H ${cx} V ${cy - delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
    }
    // Case: A bottom-right → B top-left (rA above-right, rB below-left)
    else if (rA.x + rA.w === rB.x && rA.y + rA.h === rB.y) {
      const cx = rB.x * cellSize;
      const cy = rB.y * cellSize;
      markers.push(
        <path key={`c-br-tl-${i}`}
          d={`M ${cx - delta} ${cy} H ${cx} V ${cy - delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
      markers.push(
        <path key={`c-tl-br-${i}`}
          d={`M ${cx + delta} ${cy} H ${cx} V ${cy + delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
    }
    // Case: A top-left → B bottom-right
    else if (rA.x === rB.x + rB.w && rA.y === rB.y + rB.h) {
      const cx = rA.x * cellSize;
      const cy = rA.y * cellSize;
      markers.push(
        <path key={`c-tl-br-a-${i}`}
          d={`M ${cx + delta} ${cy} H ${cx} V ${cy + delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
      markers.push(
        <path key={`c-br-tl-a-${i}`}
          d={`M ${cx - delta} ${cy} H ${cx} V ${cy - delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
    }
    // Case: A bottom-left → B top-right
    else if (rA.x === rB.x + rB.w && rA.y + rA.h === rB.y) {
      const cx = rA.x * cellSize;
      const cy = rA.y * cellSize + rA.h * cellSize;
      markers.push(
        <path key={`c-bl-tr-a-${i}`}
          d={`M ${cx + delta} ${cy} H ${cx} V ${cy - delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
      markers.push(
        <path key={`c-tr-bl-a-${i}`}
          d={`M ${cx - delta} ${cy} H ${cx} V ${cy + delta}`}
          stroke="white" strokeWidth="2.5" fill="none"
        />
      );
    }
  }

  return markers;
}

function getEdgeMarkers(rectangles, cellSize) {
  const markers = [];

  for (let i = 1; i < rectangles.length; i++) {
    const rA = rectangles[i - 1];
    const rB = rectangles[i];

    // Shared vertical edge
    if (rA.x + rA.w === rB.x) {
      const overlapYMin = Math.max(rA.y, rB.y);
      const overlapYMax = Math.min(rA.y + rA.h, rB.y + rB.h);
      if (overlapYMin < overlapYMax) {
        markers.push(
          <line key={`e-v-${i}`}
            x1={rB.x * cellSize} y1={overlapYMin * cellSize}
            x2={rB.x * cellSize} y2={overlapYMax * cellSize}
            stroke="white" strokeWidth="2.5"
          />
        );
      }
    }
    // Shared horizontal edge (A below B)
    if (rA.y + rA.h === rB.y) {
      const overlapXMin = Math.max(rA.x, rB.x);
      const overlapXMax = Math.min(rA.x + rA.w, rB.x + rB.w);
      if (overlapXMin < overlapXMax) {
        markers.push(
          <line key={`e-h-above-${i}`}
            x1={overlapXMin * cellSize} y1={rB.y * cellSize}
            x2={overlapXMax * cellSize} y2={rB.y * cellSize}
            stroke="white" strokeWidth="2.5"
          />
        );
      }
    } else if (rB.y + rB.h === rA.y) {
      const overlapXMin = Math.max(rA.x, rB.x);
      const overlapXMax = Math.min(rA.x + rA.w, rB.x + rB.w);
      if (overlapXMin < overlapXMax) {
        markers.push(
          <line key={`e-h-below-${i}`}
            x1={overlapXMin * cellSize} y1={rA.y * cellSize}
            x2={overlapXMax * cellSize} y2={rA.y * cellSize}
            stroke="white" strokeWidth="2.5"
          />
        );
      }
    }
  }

  return markers;
}

export function PatternCanvas({ blocks, rectangles = [], colorA, colorB, onPaint, size = 512 }) {
  // Snap to nearest multiple of COLS so cells are always integer pixels
  const snapped   = Math.floor(size / COLS) * COLS
  const cellSize  = snapped / COLS
  const gridSize  = snapped

  const canvasRef      = useRef(null)
  const isPainting     = useRef(false)
  const lastIdx        = useRef(-1)
  const paintColor     = useRef(0)   // color applied for the whole drag stroke
  const onPaintRef     = useRef(onPaint)
  const blocksRef      = useRef(blocks)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => { onPaintRef.current = onPaint }, [onPaint])
  useEffect(() => { blocksRef.current  = blocks  }, [blocks])

  // Convert a client-space point to a grid cell index
  const clientToIdx = useCallback((clientX, clientY) => {
    const el = canvasRef.current
    if (!el) return -1
    const rect = el.getBoundingClientRect()
    const col  = Math.floor((clientX - rect.left)  / cellSize)
    const row  = Math.floor((clientY - rect.top)   / cellSize)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return -1
    return row * COLS + col
  }, [cellSize])

  // Global listeners while painting — prevents any scroll outside the canvas
  useEffect(() => {
    function onMove(e) {
      if (!isPainting.current) return
      e.preventDefault() // block page / panel scroll
      const { clientX, clientY } = e.touches ? e.touches[0] : e
      const idx = clientToIdx(clientX, clientY)
      if (idx >= 0 && idx !== lastIdx.current) {
        lastIdx.current = idx
        onPaintRef.current?.(idx, paintColor.current)
      }
    }
    function onUp() { isPainting.current = false }

    document.addEventListener('mousemove', onMove,   { passive: false })
    document.addEventListener('mouseup',   onUp,     { passive: true  })
    document.addEventListener('touchmove', onMove,   { passive: false })
    document.addEventListener('touchend',  onUp,     { passive: true  })
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup',   onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend',  onUp)
    }
  }, [clientToIdx])

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    isPainting.current = true
    const { clientX, clientY } = e.touches ? e.touches[0] : e
    const idx = clientToIdx(clientX, clientY)
    if (idx >= 0) {
      // The whole stroke paints the opposite of the first cell's current color
      paintColor.current = blocksRef.current[idx] === 0 ? 1 : 0
      lastIdx.current = idx
      onPaintRef.current?.(idx, paintColor.current)
    }
  }, [clientToIdx])

  const handleMouseMove = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  return (
    <div
      ref={canvasRef}
      className="relative select-none rounded-sm overflow-hidden shadow-2xl ring-1 ring-white/10"
      style={{
        width: gridSize,
        height: gridSize,
        flexShrink: 0,
        cursor: 'crosshair',
        touchAction: 'none',      // block native touch scroll
        userSelect: 'none',
      }}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background (Color B) */}
      <div className="absolute inset-0" style={{ backgroundColor: colorB }} />

      {/* Active cells (Color A) */}
      {blocks.map((v, i) => {
        if (v !== 0) return null
        const col = i % COLS
        const row = Math.floor(i / COLS)
        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: col * cellSize,
              top:  row * cellSize,
              width:  cellSize,
              height: cellSize,
              backgroundColor: colorA,
            }}
          />
        )
      })}


      {/* Grid lines, connection area markers, and block borders */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={gridSize} height={gridSize}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Block Borders (outlines) to see overlapping areas */}
        {isHovered && rectangles.map((r, i) => (
          <rect
            key={`b-border-${i}`}
            x={r.x * cellSize}
            y={r.y * cellSize}
            width={r.w * cellSize}
            height={r.h * cellSize}
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
        ))}

        {/* Connection Area Markers - corners always visible, edges on hover */}
        {getCornerMarkers(rectangles, cellSize)}
        {isHovered && getEdgeMarkers(rectangles, cellSize)}

        {/* Grid lines */}
        {Array.from({ length: COLS + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * cellSize} y1={0}
            x2={i * cellSize} y2={gridSize}
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: ROWS + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={i * cellSize}
            x2={gridSize} y2={i * cellSize}
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
          />
        ))}
      </svg>
    </div>
  )
}
