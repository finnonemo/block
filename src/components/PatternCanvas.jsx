import { useCallback, useEffect, useRef, useState } from 'react'
import { COLS, ROWS } from '@/utils/gridUtils'

function getCellType(col, row, rectangles) {
  // Find all rectangles covering this cell
  const covering = rectangles.filter(r => 
    col >= r.x && col < r.x + r.w && row >= r.y && row < r.y + r.h
  );

  if (covering.length === 0) return null;
  if (covering.length >= 2) return "overlap";

  // Check if it's a corner connection
  for (let i = 0; i < rectangles.length; i++) {
    for (let j = i + 1; j < rectangles.length; j++) {
      const rA = rectangles[i].x <= rectangles[j].x ? rectangles[i] : rectangles[j];
      const rB = rA === rectangles[i] ? rectangles[j] : rectangles[i];

      // Top-right of rA touches bottom-left of rB
      if (rA.x + rA.w === rB.x && rA.y === rB.y + rB.h) {
        if ((col === rA.x + rA.w - 1 && row === rA.y) || (col === rB.x && row === rB.y + rB.h - 1)) {
          return "corner";
        }
      }
      // Bottom-right of rA touches top-left of rB
      if (rA.x + rA.w === rB.x && rA.y + rA.h === rB.y) {
        if ((col === rA.x + rA.w - 1 && row === rA.y + rA.h - 1) || (col === rB.x && row === rB.y)) {
          return "corner";
        }
      }
    }
  }

  // Check if it's a shared edge
  for (let i = 0; i < rectangles.length; i++) {
    for (let j = i + 1; j < rectangles.length; j++) {
      const rA = rectangles[i];
      const rB = rectangles[j];

      // Shared vertical edge (X-boundary)
      if (rA.x + rA.w === rB.x) {
        const overlapYMin = Math.max(rA.y, rB.y);
        const overlapYMax = Math.min(rA.y + rA.h, rB.y + rB.h);
        if (row >= overlapYMin && row < overlapYMax) {
          if (col === rA.x + rA.w - 1 || col === rB.x) {
            return "edge";
          }
        }
      }
      // Shared horizontal edge (Y-boundary)
      if (rA.y + rA.h === rB.y) {
        const overlapXMin = Math.max(rA.x, rB.x);
        const overlapXMax = Math.min(rA.x + rA.w, rB.x + rB.w);
        if (col >= overlapXMin && col < overlapXMax) {
          if (row === rA.y + rA.h - 1 || row === rB.y) {
            return "edge";
          }
        }
      }
    }
  }

  // Otherwise, it's inside a single rectangle
  const r = covering[0];
  const isOnPerimeter = col === r.x || col === r.x + r.w - 1 || row === r.y || row === r.y + r.h - 1;
  return isOnPerimeter ? "block border" : "area";
}

function getConnectionMarkers(rectangles, cellSize) {
  const markers = [];
  const delta = cellSize * 0.25;

  for (let i = 1; i < rectangles.length; i++) {
    const rA = rectangles[i - 1];
    const rB = rectangles[i];

    // Corner touch
    if (rA.x + rA.w === rB.x && rA.y === rB.y + rB.h) {
      const cx = rB.x * cellSize;
      const cy = rA.y * cellSize;
      markers.push(
        <path
          key={`c-tr-${i}`}
          d={`M ${cx - delta} ${cy} H ${cx} V ${cy + delta}`}
          stroke="white"
          strokeWidth="2.5"
          fill="none"
        />
      );
      markers.push(
        <path
          key={`c-bl-${i}`}
          d={`M ${cx + delta} ${cy} H ${cx} V ${cy - delta}`}
          stroke="white"
          strokeWidth="2.5"
          fill="none"
        />
      );
    }
    else if (rA.x + rA.w === rB.x && rA.y + rA.h === rB.y) {
      const cx = rB.x * cellSize;
      const cy = rB.y * cellSize;
      markers.push(
        <path
          key={`c-br-${i}`}
          d={`M ${cx - delta} ${cy} H ${cx} V ${cy - delta}`}
          stroke="white"
          strokeWidth="2.5"
          fill="none"
        />
      );
      markers.push(
        <path
          key={`c-tl-${i}`}
          d={`M ${cx + delta} ${cy} H ${cx} V ${cy + delta}`}
          stroke="white"
          strokeWidth="2.5"
          fill="none"
        />
      );
    }

    // Shared vertical edge
    if (rA.x + rA.w === rB.x) {
      const overlapYMin = Math.max(rA.y, rB.y);
      const overlapYMax = Math.min(rA.y + rA.h, rB.y + rB.h);
      if (overlapYMin < overlapYMax) {
        markers.push(
          <line
            key={`e-v-${i}`}
            x1={rB.x * cellSize}
            y1={overlapYMin * cellSize}
            x2={rB.x * cellSize}
            y2={overlapYMax * cellSize}
            stroke="white"
            strokeWidth="2.5"
          />
        );
      }
    }
    // Shared horizontal edge
    if (rA.y + rA.h === rB.y) {
      const overlapXMin = Math.max(rA.x, rB.x);
      const overlapXMax = Math.min(rA.x + rA.w, rB.x + rB.w);
      if (overlapXMin < overlapXMax) {
        markers.push(
          <line
            key={`e-h-above-${i}`}
            x1={overlapXMin * cellSize}
            y1={rB.y * cellSize}
            x2={overlapXMax * cellSize}
            y2={rB.y * cellSize}
            stroke="white"
            strokeWidth="2.5"
          />
        );
      }
    } else if (rB.y + rB.h === rA.y) {
      const overlapXMin = Math.max(rA.x, rB.x);
      const overlapXMax = Math.min(rA.x + rA.w, rB.x + rB.w);
      if (overlapXMin < overlapXMax) {
        markers.push(
          <line
            key={`e-h-below-${i}`}
            x1={overlapXMin * cellSize}
            y1={rA.y * cellSize}
            x2={overlapXMax * cellSize}
            y2={rA.y * cellSize}
            stroke="white"
            strokeWidth="2.5"
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
  const [hoverInfo, setHoverInfo] = useState(null)
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

  const handleMouseMove = useCallback((e) => {
    setIsHovered(true)
    const el = canvasRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const col  = Math.floor((e.clientX - rect.left)  / cellSize)
    const row  = Math.floor((e.clientY - rect.top)   / cellSize)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
      setHoverInfo(null)
      return
    }

    const type = getCellType(col, row, rectangles)
    if (type) {
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      setHoverInfo({ x, y, type })
    } else {
      setHoverInfo(null)
    }
  }, [cellSize, rectangles])

  const handleMouseLeave = useCallback(() => {
    setHoverInfo(null)
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


      {/* Grid lines & Connection markers */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={gridSize} height={gridSize}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection Area Markers */}
        {isHovered && getConnectionMarkers(rectangles, cellSize)}

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

      {/* Connection Type Tooltip */}
      {hoverInfo && (
        <div
          className="absolute z-30 pointer-events-none px-2 py-1 rounded bg-[#0a1628]/95 border border-[#50cfff]/30 shadow-lg text-[9px] font-bold uppercase tracking-wider text-[#50cfff] whitespace-nowrap transition-all duration-75 select-none"
          style={{
            left: hoverInfo.x + 12,
            top: hoverInfo.y + 12,
          }}
        >
          {hoverInfo.type}
        </div>
      )}
    </div>
  )
}
