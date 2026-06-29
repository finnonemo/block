import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { COLS as DEFAULT_COLS, ROWS as DEFAULT_ROWS } from '@/utils/gridUtils'

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

export function PatternCanvas({
  blocks, rectangles = [], colorA, colorB, onPaintEnd,
  size = 512, cols = DEFAULT_COLS, rows = DEFAULT_ROWS, imageOverlay = null, textOverlay = null,
}) {
  // Snap cell size so cells are always integer pixels on both axes
  const cellSize  = Math.max(1, Math.floor(size / Math.max(cols, rows)))
  const gridWidth  = cellSize * cols
  const gridHeight = cellSize * rows

  const canvasRef      = useRef(null)
  const cellCanvasRef  = useRef(null)
  const isPainting     = useRef(false)
  const lastIdx        = useRef(-1)
  const paintColor     = useRef(0)   // color applied for the whole drag stroke
  const onPaintEndRef  = useRef(onPaintEnd)
  const blocksRef      = useRef(blocks)
  // Single-cell direct draw fn — refreshed after every full redraw
  const paintCellRef   = useRef(null)
  // Accumulates cell changes during a stroke; flushed to parent on mouseup
  const paintBufferRef = useRef(null)
  const imgRef         = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => { onPaintEndRef.current = onPaintEnd }, [onPaintEnd])
  // Don't sync blocksRef mid-stroke — paint buffer is the live source of truth
  useEffect(() => { if (!isPainting.current) blocksRef.current = blocks }, [blocks])

  // Load image overlay into an HTMLImageElement so canvas can drawImage it
  useEffect(() => {
    if (!imageOverlay?.dataUrl) {
      imgRef.current = null
      setImageLoaded(false)
      return
    }
    const img = new Image()
    img.onload = () => { imgRef.current = img; setImageLoaded(true) }
    img.src = imageOverlay.dataUrl
  }, [imageOverlay?.dataUrl])

  // Draw blocks onto the pixel canvas — single canvas element avoids reconciling
  // hundreds of individual <div> nodes on every paint stroke.
  // Layer order: colorA full fill → image → colorB compound path over inactive cells.
  // colorB as a compound path (beginPath + N rect + fill) is a single GPU batch,
  // much faster than N individual fillRect calls.
  useLayoutEffect(() => {
    const el = cellCanvasRef.current
    if (!el) return
    const ctx = el.getContext('2d')

    // Layer 1: fill entire canvas with colorA
    ctx.fillStyle = colorA
    ctx.fillRect(0, 0, gridWidth, gridHeight)

    // Layer 2: image between colorA and colorB — visible only where colorB is cut out
    if (imgRef.current && imageOverlay) {
      ctx.globalAlpha = imageOverlay.opacity ?? 1
      ctx.drawImage(
        imgRef.current,
        imageOverlay.x * gridWidth,
        imageOverlay.y * gridHeight,
        gridWidth * imageOverlay.scale,
        gridWidth * imageOverlay.scale * (imageOverlay.aspectRatio ?? 1)
      )
      ctx.globalAlpha = 1
    }

    // Layer 3: colorB as a single compound path over all inactive (background) cells
    ctx.fillStyle = colorB
    ctx.beginPath()
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i] === 1) {
        ctx.rect((i % cols) * cellSize, Math.floor(i / cols) * cellSize, cellSize, cellSize)
      }
    }
    ctx.fill()

    // Refresh the direct-draw fn — captures current ctx, colors, and cell dimensions.
    // Used during paint strokes to draw individual cells without a full redraw.
    paintCellRef.current = (idx, color) => {
      const c = idx % cols
      const r = Math.floor(idx / cols)
      ctx.fillStyle = color === 0 ? colorA : colorB
      ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
    }
  }, [blocks, colorA, colorB, cols, cellSize, gridWidth, gridHeight, imageOverlay, imageLoaded])

  // Convert a client-space point to a grid cell index
  const clientToIdx = useCallback((clientX, clientY) => {
    const el = canvasRef.current
    if (!el) return -1
    const rect = el.getBoundingClientRect()
    const col  = Math.floor((clientX - rect.left)  / cellSize)
    const row  = Math.floor((clientY - rect.top)   / cellSize)
    if (col < 0 || col >= cols || row < 0 || row >= rows) return -1
    return row * cols + col
  }, [cellSize, cols, rows])

  // Global listeners while painting — prevents any scroll outside the canvas
  useEffect(() => {
    function onMove(e) {
      if (!isPainting.current) return
      e.preventDefault() // block page / panel scroll
      const { clientX, clientY } = e.touches ? e.touches[0] : e
      const idx = clientToIdx(clientX, clientY)
      if (idx >= 0 && idx !== lastIdx.current) {
        lastIdx.current = idx
        // Update buffer and draw directly — no React state update during stroke
        if (paintBufferRef.current) paintBufferRef.current[idx] = paintColor.current
        paintCellRef.current?.(idx, paintColor.current)
      }
    }
    function onUp() {
      if (!isPainting.current) return
      isPainting.current = false
      if (paintBufferRef.current) {
        // Flush completed stroke to parent — one React update for the whole stroke
        onPaintEndRef.current?.(paintBufferRef.current)
        paintBufferRef.current = null
      }
    }

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
      // Determine paint color from first cell; whole stroke uses the same color
      paintColor.current = blocksRef.current[idx] === 0 ? 1 : 0
      lastIdx.current = idx
      // Copy current blocks into paint buffer — accumulates changes for the stroke
      paintBufferRef.current = blocksRef.current.slice()
      paintBufferRef.current[idx] = paintColor.current
      blocksRef.current = paintBufferRef.current
      // Draw directly on canvas — no React state update
      paintCellRef.current?.(idx, paintColor.current)
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
        width: gridWidth,
        height: gridHeight,
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
      {/* All cells drawn on a single canvas — no per-cell DOM nodes */}
      <canvas
        ref={cellCanvasRef}
        className="absolute inset-0"
        width={gridWidth}
        height={gridHeight}
      />


      {/* Grid lines, connection area markers, and block borders */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={gridWidth} height={gridHeight}
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
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
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line
            key={`v${i}`}
            x1={i * cellSize} y1={0}
            x2={i * cellSize} y2={gridHeight}
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: rows + 1 }, (_, i) => (
          <line
            key={`h${i}`}
            x1={0} y1={i * cellSize}
            x2={gridWidth} y2={i * cellSize}
            stroke="rgba(255,255,255,0.07)" strokeWidth="0.5"
          />
        ))}

        {/* Text overlay — topmost layer */}
        {textOverlay?.content && (() => {
          const tx = textOverlay.x * gridWidth
          const ty = textOverlay.y * gridHeight
          const lh = textOverlay.fontSize * gridHeight * 1.25
          return (
            <text
              x={tx} y={ty}
              fontSize={textOverlay.fontSize * gridHeight}
              fontFamily={textOverlay.fontFamily}
              fontWeight={textOverlay.fontWeight}
              fontStyle={textOverlay.fontStyle}
              fill={textOverlay.color}
              opacity={textOverlay.opacity}
              textAnchor={textOverlay.textAnchor}
              dominantBaseline="auto"
            >
              {textOverlay.content.split('\n').map((line, i) => (
                <tspan key={i} x={tx} dy={i === 0 ? 0 : lh}>{line || ' '}</tspan>
              ))}
            </text>
          )
        })()}
      </svg>
    </div>
  )
}
