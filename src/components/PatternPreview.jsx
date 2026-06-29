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

export function PatternSVG({ rects, colorA, colorB, cols = COLS, rows = ROWS, size = 120, style, className, imageOverlay = null, textOverlay = null }) {
  const maskId = useRef('ps-' + Math.random().toString(36).slice(2)).current
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
      {/* colorB mask: white=show colorB, black=cut out block areas to reveal layers below */}
      <defs>
        <mask id={maskId}>
          <rect x="0" y="0" width={NORM} height={normH} fill="white"/>
          {rects.map((r, i) => (
            <rect key={i} x={r.x * cellW} y={r.y * cellH} width={r.w * cellW} height={r.h * cellH} fill="black"/>
          ))}
        </mask>
      </defs>
      {/* Layer 1: colorA fills entire canvas */}
      <rect x="0" y="0" width={NORM} height={normH} fill={colorA} />
      {/* Layer 2: image overlay — no clip; colorB mask above will hide it outside blocks */}
      {imageOverlay && (
        <image
          href={imageOverlay.dataUrl}
          x={imageOverlay.x * NORM}
          y={imageOverlay.y * normH}
          width={NORM * imageOverlay.scale}
          height={NORM * imageOverlay.scale * (imageOverlay.aspectRatio ?? 1)}
          opacity={imageOverlay.opacity ?? 1}
          preserveAspectRatio="none"
        />
      )}
      {/* Layer 3: colorB covers non-block areas */}
      <rect x="0" y="0" width={NORM} height={normH} fill={colorB} mask={`url(#${maskId})`} />
      {textOverlay?.content && (() => {
        const tx = textOverlay.x * NORM
        const ty = textOverlay.y * normH
        const lh = textOverlay.fontSize * normH * 1.25
        return (
          <text
            x={tx} y={ty}
            fontSize={textOverlay.fontSize * normH}
            fontFamily={textOverlay.fontFamily}
            fontWeight={textOverlay.fontWeight}
            fontStyle={textOverlay.fontStyle}
            fill={textOverlay.color}
            opacity={textOverlay.opacity}
            textAnchor={textOverlay.textAnchor}
            dominantBaseline="auto"
          >
            {textOverlay.content.split('\n').map((line, i) => (
              <tspan key={i} x={tx} dy={i === 0 ? 0 : lh}>{line || ' '}</tspan>
            ))}
          </text>
        )
      })()}
    </svg>
  )
}

// 2×2 tiled preview — each tile is the full pattern at half size
export function QuadPatternSVG({ rects, colorA, colorB, cols = COLS, rows = ROWS, size = 240, style, className, imageOverlay = null, textOverlay = null }) {
  const maskBase = useRef('qp-' + Math.random().toString(36).slice(2)).current
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
      {/* colorB masks at absolute coords — one per tile */}
      <defs>
        {[0, 1, 2, 3].map(i => {
          const tx = (i % 2) * NORM
          const ty = Math.floor(i / 2) * normH
          return (
            <mask key={i} id={`${maskBase}-${i}`}>
              <rect x={tx} y={ty} width={NORM} height={normH} fill="white"/>
              {rects.map((r, j) => (
                <rect key={j}
                  x={tx + r.x * cellW} y={ty + r.y * cellH}
                  width={r.w * cellW} height={r.h * cellH}
                  fill="black"
                />
              ))}
            </mask>
          )
        })}
      </defs>

      {/* Layer 1: colorA fills each tile */}
      {[0, 1, 2, 3].map(i => {
        const tx = (i % 2) * NORM
        const ty = Math.floor(i / 2) * normH
        return <rect key={i} x={tx} y={ty} width={NORM} height={normH} fill={colorA} />
      })}

      {/* Layer 2: image overlays at absolute positions — no clip */}
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
            opacity={imageOverlay.opacity ?? 1}
            preserveAspectRatio="none"
          />
        )
      })}

      {/* Layer 3: colorB masked to non-block areas per tile */}
      {[0, 1, 2, 3].map(i => {
        const tx = (i % 2) * NORM
        const ty = Math.floor(i / 2) * normH
        return (
          <rect key={i} x={tx} y={ty} width={NORM} height={normH} fill={colorB} mask={`url(#${maskBase}-${i})`} />
        )
      })}

      {/* Text overlays at absolute positions — one per tile */}
      {textOverlay?.content && [0, 1, 2, 3].map(i => {
        const tx = (i % 2) * NORM + textOverlay.x * NORM
        const ty = Math.floor(i / 2) * normH + textOverlay.y * normH
        const lh = textOverlay.fontSize * normH * 1.25
        return (
          <text
            key={i}
            x={tx} y={ty}
            fontSize={textOverlay.fontSize * normH}
            fontFamily={textOverlay.fontFamily}
            fontWeight={textOverlay.fontWeight}
            fontStyle={textOverlay.fontStyle}
            fill={textOverlay.color}
            opacity={textOverlay.opacity}
            textAnchor={textOverlay.textAnchor}
            dominantBaseline="auto"
          >
            {textOverlay.content.split('\n').map((line, j) => (
              <tspan key={j} x={tx} dy={j === 0 ? 0 : lh}>{line || ' '}</tspan>
            ))}
          </text>
        )
      })}
    </svg>
  )
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────
// Accept either a seed string OR blocks+colorA+colorB for image-derived patterns.

export function PatternPreview({ seed, blocks, colorA, colorB, cols, rows, size = 80, imageOverlay = null, textOverlay = null }) {
  const data = useMemo(
    () => resolve({ seed, blocks, colorA, colorB, cols, rows }),
    [seed, blocks, colorA, colorB, cols, rows]
  )
  if (!data) return <div style={{ width: size, height: size }} className="bg-muted rounded" />
  return <PatternSVG rects={data.rects} colorA={data.colorA} colorB={data.colorB} cols={data.cols} rows={data.rows} size={size} imageOverlay={imageOverlay} textOverlay={textOverlay} />
}

export function QuadPatternPreview({ seed, blocks, colorA, colorB, cols, rows, size = 160, imageOverlay = null, textOverlay = null }) {
  const data = useMemo(
    () => resolve({ seed, blocks, colorA, colorB, cols, rows }),
    [seed, blocks, colorA, colorB, cols, rows]
  )
  if (!data) return <div style={{ width: size, height: size }} className="bg-muted rounded" />
  return <QuadPatternSVG rects={data.rects} colorA={data.colorA} colorB={data.colorB} cols={data.cols} rows={data.rows} size={size} imageOverlay={imageOverlay} textOverlay={textOverlay} />
}
