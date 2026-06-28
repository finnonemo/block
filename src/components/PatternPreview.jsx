import { useMemo, useRef } from 'react'
import {
  COLS,
  ROWS,
  decodeSeed,
  buildConfigFromParams,
  createRNG,
  generatePatternRects,
  extractBlockGroups,
} from '@/utils/gridUtils'

// ─── Data resolvers ───────────────────────────────────────────────────────────

function resolvePattern(seedStr) {
  const decoded = decodeSeed(seedStr)
  if (!decoded) return null
  const { seed, params, colorA, colorB } = decoded
  const rng   = createRNG(seed)
  const cfg   = buildConfigFromParams(params)
  const rects = generatePatternRects(cfg, rng)
  return { rects, colorA, colorB, cols: COLS, rows: ROWS }
}

function resolveBlocks(blocks, colorA, colorB, cols, rows) {
  if (!blocks || blocks.length !== cols * rows) return null
  return { rects: extractBlockGroups(blocks, cols, rows), colorA, colorB, cols, rows }
}

// Resolve from either a seed string OR a raw blocks array + colors.
// Blocks-based is used for image-import / hand-painted templates.
function resolve({ seed, blocks, colorA, colorB, cols = COLS, rows = ROWS }) {
  if (seed)   return resolvePattern(seed)
  if (blocks) return resolveBlocks(blocks, colorA, colorB, cols, rows)
  return null
}

// ─── SVG renderers ───────────────────────────────────────────────────────────

// Normalized coordinate space — lets SVG scale via CSS without recalculating coords
const NORM = 160

export function PatternSVG({ rects, colorA, colorB, cols = COLS, rows = ROWS, size = 120, style, className, imageOverlay = null }) {
  const clipId = useRef('ps-' + Math.random().toString(36).slice(2)).current
  const normH = NORM * rows / cols
  const cellW = NORM / cols
  const cellH = normH / rows
  return (
    <svg
      viewBox={`0 0 ${NORM} ${normH}`}
      style={{ width: size, height: size * (rows / cols), display: 'block', flexShrink: 0, ...style }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {imageOverlay && (
        <defs>
          <clipPath id={clipId}>
            {rects.map((r, i) => (
              <rect key={i} x={r.x * cellW} y={r.y * cellH} width={r.w * cellW} height={r.h * cellH} />
            ))}
          </clipPath>
        </defs>
      )}
      <rect x="0" y="0" width={NORM} height={normH} fill={colorB} />
      {rects.map((r, i) => (
        <rect key={i}
          x={r.x * cellW} y={r.y * cellH}
          width={r.w * cellW} height={r.h * cellH}
          fill={colorA}
        />
      ))}
      {imageOverlay && (
        <image
          href={imageOverlay.dataUrl}
          x={imageOverlay.x * NORM}
          y={imageOverlay.y * normH}
          width={NORM * imageOverlay.scale}
          height={NORM * imageOverlay.scale * (imageOverlay.aspectRatio ?? 1)}
          clipPath={`url(#${clipId})`}
          opacity={imageOverlay.opacity ?? 1}
          preserveAspectRatio="none"
        />
      )}
    </svg>
  )
}

// 2×2 tiled preview — each tile is the full pattern at half size
export function QuadPatternSVG({ rects, colorA, colorB, cols = COLS, rows = ROWS, size = 240, style, className, imageOverlay = null }) {
  const clipBase = useRef('qp-' + Math.random().toString(36).slice(2)).current
  const cellW = NORM / cols
  const normH = NORM * rows / cols
  const cellH = normH / rows
  const totalW = NORM * 2
  const totalH = normH * 2
  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ width: size, height: size * (rows / cols), display: 'block', flexShrink: 0, ...style }}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {/* Clip paths at absolute coords — one per tile to avoid transform coordinate-space issues */}
      {imageOverlay && (
        <defs>
          {[0, 1, 2, 3].map(i => {
            const tx = (i % 2) * NORM
            const ty = Math.floor(i / 2) * normH
            return (
              <clipPath key={i} id={`${clipBase}-${i}`}>
                {rects.map((r, j) => (
                  <rect key={j}
                    x={tx + r.x * cellW} y={ty + r.y * cellH}
                    width={r.w * cellW} height={r.h * cellH}
                  />
                ))}
              </clipPath>
            )
          })}
        </defs>
      )}

      {/* Background + colorA tiles */}
      {[0, 1, 2, 3].map(i => {
        const tx = (i % 2) * NORM
        const ty = Math.floor(i / 2) * normH
        return (
          <g key={i} transform={`translate(${tx},${ty})`}>
            <rect x="0" y="0" width={NORM} height={normH} fill={colorB} />
            {rects.map((r, j) => (
              <rect key={j}
                x={r.x * cellW} y={r.y * cellH}
                width={r.w * cellW} height={r.h * cellH}
                fill={colorA}
              />
            ))}
          </g>
        )
      })}

      {/* Image overlays at absolute positions — one per tile */}
      {imageOverlay && [0, 1, 2, 3].map(i => {
        const tx = (i % 2) * NORM
        const ty = Math.floor(i / 2) * normH
        return (
          <image
            key={i}
            href={imageOverlay.dataUrl}
            x={tx + imageOverlay.x * NORM}
            y={ty + imageOverlay.y * normH}
            width={NORM * imageOverlay.scale}
            height={NORM * imageOverlay.scale * (imageOverlay.aspectRatio ?? 1)}
            clipPath={`url(#${clipBase}-${i})`}
            opacity={imageOverlay.opacity ?? 1}
            preserveAspectRatio="none"
          />
        )
      })}
    </svg>
  )
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────
// Accept either a seed string OR blocks+colorA+colorB for image-derived patterns.

export function PatternPreview({ seed, blocks, colorA, colorB, cols, rows, size = 80, imageOverlay = null }) {
  const data = useMemo(
    () => resolve({ seed, blocks, colorA, colorB, cols, rows }),
    [seed, blocks, colorA, colorB, cols, rows]
  )
  if (!data) return <div style={{ width: size, height: size }} className="bg-muted rounded" />
  return <PatternSVG rects={data.rects} colorA={data.colorA} colorB={data.colorB} cols={data.cols} rows={data.rows} size={size} imageOverlay={imageOverlay} />
}

export function QuadPatternPreview({ seed, blocks, colorA, colorB, cols, rows, size = 160, imageOverlay = null }) {
  const data = useMemo(
    () => resolve({ seed, blocks, colorA, colorB, cols, rows }),
    [seed, blocks, colorA, colorB, cols, rows]
  )
  if (!data) return <div style={{ width: size, height: size }} className="bg-muted rounded" />
  return <QuadPatternSVG rects={data.rects} colorA={data.colorA} colorB={data.colorB} cols={data.cols} rows={data.rows} size={size} imageOverlay={imageOverlay} />
}
