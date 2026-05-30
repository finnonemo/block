import { useMemo } from 'react'
import {
  COLS,
  decodeSeed,
  buildConfigFromParams,
  createRNG,
  generatePatternRects,
} from '@/utils/gridUtils'

function resolvePattern(seedStr) {
  const decoded = decodeSeed(seedStr)
  if (!decoded) return null
  const { seed, params, colorA, colorB } = decoded
  const rng   = createRNG(seed)
  const cfg   = buildConfigFromParams(params)
  const rects = generatePatternRects(cfg, rng)
  return { rects, colorA, colorB }
}

// Normalized coordinate space — lets SVG scale via CSS without recalculating coords
const NORM = 160

export function PatternSVG({ rects, colorA, colorB, size = 120, style, className }) {
  const cell = NORM / COLS
  return (
    <svg
      viewBox={`0 0 ${NORM} ${NORM}`}
      style={{ width: size, height: size, display: 'block', flexShrink: 0, ...style }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="0" y="0" width={NORM} height={NORM} fill={colorB} />
      {rects.map((r, i) => (
        <rect key={i}
          x={r.x * cell} y={r.y * cell}
          width={r.w * cell} height={r.h * cell}
          fill={colorA}
        />
      ))}
    </svg>
  )
}

// 2×2 tiled preview — each tile is the full 16×16 pattern at half size
export function QuadPatternSVG({ rects, colorA, colorB, size = 240, style, className }) {
  const cell = NORM / COLS
  const total = NORM * 2
  return (
    <svg
      viewBox={`0 0 ${total} ${total}`}
      style={{ width: size, height: size, display: 'block', flexShrink: 0, ...style }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 1, 2, 3].map(i => {
        const tx = (i % 2) * NORM
        const ty = Math.floor(i / 2) * NORM
        return (
          <g key={i} transform={`translate(${tx},${ty})`}>
            <rect x="0" y="0" width={NORM} height={NORM} fill={colorB} />
            {rects.map((r, j) => (
              <rect key={j}
                x={r.x * cell} y={r.y * cell}
                width={r.w * cell} height={r.h * cell}
                fill={colorA}
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// Convenience wrappers that accept a seed string
export function PatternPreview({ seed, size = 80 }) {
  const data = useMemo(() => resolvePattern(seed), [seed])
  if (!data) return (
    <div style={{ width: size, height: size }} className="bg-[#0c1926] rounded" />
  )
  return <PatternSVG rects={data.rects} colorA={data.colorA} colorB={data.colorB} size={size} />
}

export function QuadPatternPreview({ seed, size = 160 }) {
  const data = useMemo(() => resolvePattern(seed), [seed])
  if (!data) return (
    <div style={{ width: size, height: size }} className="bg-[#0c1926] rounded" />
  )
  return <QuadPatternSVG rects={data.rects} colorA={data.colorA} colorB={data.colorB} size={size} />
}
