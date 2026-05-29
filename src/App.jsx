import { useState, useCallback, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PatternCanvas } from '@/components/PatternCanvas'
import { ParameterPanel } from '@/components/ParameterPanel'
import {
  COLS, ROWS,
  DEFAULT_PARAMS,
  PALETTES,
  buildConfigFromParams,
  generatePatternRects,
  syncBlocks,
  extractBlockGroups,
  buildSVG,
  copySVGToClipboard,
} from '@/utils/gridUtils'

const DEFAULT_PALETTE = PALETTES[0] // Foundation

function generateState(params, colorA) {
  const cfg   = buildConfigFromParams(params)
  const rects = generatePatternRects(cfg)
  return { rects, blocks: syncBlocks(rects) }
}

function initApp() {
  const params = { ...DEFAULT_PARAMS }
  const { rects, blocks } = generateState(params, DEFAULT_PALETTE.surface)
  return {
    params,
    colorA:     DEFAULT_PALETTE.surface,
    colorB:     DEFAULT_PALETTE.background,
    rectangles: rects,
    blocks,
  }
}

export default function App() {
  const [state, setState] = useState(initApp)
  const [copyStatus, setCopyStatus] = useState('idle')

  const { params, colorA, colorB, rectangles, blocks } = state

  // Auto-generate when params change (but not on color-only changes)
  const generate = useCallback((newParams = params) => {
    const { rects, blocks } = generateState(newParams, colorA)
    setState(s => ({ ...s, params: newParams, rectangles: rects, blocks }))
  }, [params, colorA])

  const handleParamsChange = useCallback((newParams) => {
    const { rects, blocks } = generateState(newParams, colorA)
    setState(s => ({ ...s, params: newParams, rectangles: rects, blocks }))
  }, [colorA])

  const handleColorAChange = useCallback(hex => setState(s => ({ ...s, colorA: hex })), [])
  const handleColorBChange = useCallback(hex => setState(s => ({ ...s, colorB: hex })), [])

  // Manual paint — color is fixed for the whole drag stroke (set by canvas on pointer down)
  const handlePaint = useCallback((idx, color) => {
    setState(s => {
      if (s.blocks[idx] === color) return s          // already that color — skip re-render
      const newBlocks = [...s.blocks]
      newBlocks[idx]  = color
      const newRects  = extractBlockGroups(newBlocks)
      return { ...s, blocks: newBlocks, rectangles: newRects }
    })
  }, [])

  const handleGenerate = useCallback(() => generate(params), [generate, params])

  const handleClear = useCallback(() => {
    setState(s => ({ ...s, blocks: Array(COLS * ROWS).fill(1), rectangles: [] }))
  }, [])

  const handleCopy = useCallback(async () => {
    if (rectangles.length === 0) return
    try {
      await copySVGToClipboard(buildSVG(rectangles, colorA, colorB))
      setCopyStatus('success')
      setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
    }
  }, [rectangles, colorA, colorB])

  return (
    <div className="h-screen bg-[#07101e] text-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-6 h-14 border-b border-[#1a2a3a] bg-[#0a1628] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-[#50cfff] flex items-center justify-center shrink-0">
            <Layers size={14} className="text-[#01172b]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-sm text-white">Pattern Builder</span>
            <span className="ml-2 text-xs text-slate-500">Finnomena Brand · 16×16</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">

        {/* Sidebar */}
        <aside className="w-72 shrink-0 bg-[#0a1628] border-r border-[#1a2a3a] flex flex-col overflow-hidden">

          {/* Scrollable content */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            <div className="p-4 space-y-5">

              {/* Parameter panel */}
              <ParameterPanel
                params={params}
                colorA={colorA}
                colorB={colorB}
                onParamsChange={handleParamsChange}
                onColorAChange={handleColorAChange}
                onColorBChange={handleColorBChange}
              />

              {/* Stats */}
              <div>
                <SectionLabel>Block Groups</SectionLabel>
                <div className="bg-[#0c1926] border border-[#1e2d3d] rounded-md p-3 space-y-2 text-xs">
                  <StatRow label="Groups extracted">
                    <span className={cn('font-mono font-semibold',
                      rectangles.length >= 3 && rectangles.length <= 6 ? 'text-emerald-400' : 'text-amber-400')}>
                      {rectangles.length} / 6
                    </span>
                  </StatRow>
                  <StatRow label="Active cells (A)">
                    <span className="font-mono text-slate-300">{blocks.filter(v => v === 0).length}</span>
                  </StatRow>
                  <StatRow label="Output size">
                    <span className="font-mono text-slate-300">1920 × 1920</span>
                  </StatRow>
                </div>
              </div>

              {/* Rect list */}
              {rectangles.length > 0 && (
                <div>
                  <SectionLabel>Rect Layout</SectionLabel>
                  <div className="space-y-1">
                    {rectangles.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 bg-[#0c1926] border border-[#1e2d3d] rounded px-2.5 py-1.5 text-xs">
                          <span
                            className="w-3 h-3 rounded-sm shrink-0 border border-white/10"
                            style={{ backgroundColor: colorA }}
                          />
                          <span className="text-slate-500">#{i + 1}</span>
                          <span className="font-mono text-slate-400">x{r.x} y{r.y}</span>
                          <span className="font-mono text-[#50cfff] ml-auto">{r.w}×{r.h}</span>
                        </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Sticky bottom actions */}
          <div className="shrink-0 border-t border-[#1a2a3a] p-4 space-y-2 bg-[#0a1628]">
            <Button className="w-full gap-2 text-xs" onClick={handleGenerate}>
              <RefreshCw size={13} />
              Generate Pattern
            </Button>
            <Button
              onClick={handleCopy}
              disabled={rectangles.length === 0}
              variant="secondary"
              className={cn(
                'w-full gap-2 text-xs font-semibold',
                copyStatus === 'success' && 'bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-500'
              )}
            >
              {copyStatus === 'success'
                ? <><Check size={13} /> Copied!</>
                : <><Copy size={13} /> Copy SVG to Figma</>}
            </Button>
            <Button variant="secondary" className="w-full gap-2 text-xs" onClick={handleClear}>
              Clear Canvas
            </Button>
          </div>

        </aside>

        {/* Canvas — fills remaining space, no overflow */}
        <main className="flex-1 min-h-0 overflow-hidden bg-[#07101e] flex items-center justify-center p-6">
          <CanvasArea
            blocks={blocks}
            rectangles={rectangles}
            colorA={colorA}
            colorB={colorB}
            onPaint={handlePaint}
          />
        </main>
      </div>
    </div>
  )
}

// Fills the available main area, measures it, feeds a snapped size into PatternCanvas
function CanvasArea({ blocks, rectangles, colorA, colorB, onPaint }) {
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(512)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      // Leave room for the label below (20px) and a small gap (8px)
      const available = Math.min(width, height - 28)
      // Snap to nearest multiple of 16 (COLS), capped at 512
      const snapped = Math.min(512, Math.floor(available / 16) * 16)
      setCanvasSize(Math.max(snapped, 128))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center gap-2">
      <PatternCanvas
        size={canvasSize}
        blocks={blocks}
        rectangles={rectangles}
        colorA={colorA}
        colorB={colorB}
        onPaint={onPaint}
      />
      <p className="text-xs text-slate-600 shrink-0">
        Click or drag to paint · Block groups auto-update
      </p>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">
      {children}
    </p>
  )
}

function StatRow({ label, children }) {
  return (
    <div className="flex justify-between text-slate-400">
      <span>{label}</span>
      {children}
    </div>
  )
}
