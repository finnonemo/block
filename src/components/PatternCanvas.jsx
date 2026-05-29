import { useCallback, useEffect, useRef } from 'react'
import { COLS, ROWS } from '@/utils/gridUtils'

export function PatternCanvas({ blocks, rectangles, colorA, colorB, onPaint, size = 512 }) {
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

      {/* Block group outlines — show extracted group boundaries */}
      {rectangles.map((r, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left:   r.x * cellSize,
            top:    r.y * cellSize,
            width:  r.w * cellSize,
            height: r.h * cellSize,
            outline: '1.5px solid rgba(255,255,255,0.55)',
            outlineOffset: '-1px',
          }}
        />
      ))}

      {/* Grid lines */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={gridSize} height={gridSize}
        xmlns="http://www.w3.org/2000/svg"
      >
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
