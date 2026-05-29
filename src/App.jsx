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
  createRNG,
  encodeSeed,
  decodeSeed,
} from '@/utils/gridUtils'

const DEFAULT_PALETTE = PALETTES[0] // Foundation

function makeNewSeed() {
  return (Math.random() * 0x100000000) >>> 0
}

function generateState(params, seed) {
  const rng   = createRNG(seed)
  const cfg   = buildConfigFromParams(params)
  const rects = generatePatternRects(cfg, rng)
  return { rects, blocks: syncBlocks(rects) }
}

function initApp() {
  const params = { ...DEFAULT_PARAMS }
  const seed   = makeNewSeed()
  const { rects, blocks } = generateState(params, seed)
  return {
    seed,
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

  const { seed, params, colorA, colorB, rectangles, blocks } = state

  const handleGenerate = useCallback(() => {
    const newSeed = makeNewSeed()
    const { rects, blocks } = generateState(params, newSeed)
    setState(s => ({ ...s, seed: newSeed, rectangles: rects, blocks }))
  }, [params])

  const handleParamsChange = useCallback((newParams) => {
    const newSeed = makeNewSeed()
    const { rects, blocks } = generateState(newParams, newSeed)
    setState(s => ({ ...s, params: newParams, seed: newSeed, rectangles: rects, blocks }))
  }, [])

  const handleSeedApply = useCallback(({ seed: newSeed, params: newParams, colorA: newA, colorB: newB }) => {
    const { rects, blocks } = generateState(newParams, newSeed)
    setState({ seed: newSeed, params: newParams, colorA: newA, colorB: newB, rectangles: rects, blocks })
  }, [])

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
    <div className="min-h-screen md:h-screen bg-[#07101e] text-slate-200 flex flex-col md:overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-4 md:px-6 h-12 md:h-14 border-b border-[#1a2a3a] bg-[#0a1628] shrink-0">
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
      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden md:min-h-0">

        {/* Canvas — on mobile: first, full width; on desktop: fills remaining space */}
        <main className="order-1 md:order-2 md:flex-1 md:min-h-0 overflow-hidden bg-[#07101e] flex items-center justify-center p-3 md:p-6
                         h-[min(90vw,480px)] md:h-auto">
          <CanvasArea
            blocks={blocks}
            rectangles={rectangles}
            colorA={colorA}
            colorB={colorB}
            onPaint={handlePaint}
          />
        </main>

        {/* Sidebar — on mobile: second, full width, capped height; on desktop: fixed left column */}
        <aside className="order-2 md:order-1 w-full md:w-72 md:shrink-0 bg-[#0a1628] border-t md:border-t-0 md:border-r border-[#1a2a3a] flex flex-col
                          max-h-[60vh] md:max-h-none md:overflow-hidden">

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

              {/* Seed */}
              <SeedPanel
                seed={seed}
                params={params}
                colorA={colorA}
                colorB={colorB}
                onApply={handleSeedApply}
              />

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

function SeedPanel({ seed, params, colorA, colorB, onApply }) {
  const [input, setInput]   = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError]   = useState(false)

  const seedStr   = seed != null ? encodeSeed(seed, params, colorA, colorB) : null
  const preview   = input.trim() ? decodeSeed(input.trim()) : null

  const handleCopy = async () => {
    if (!seedStr) return
    await navigator.clipboard.writeText(seedStr)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const applyDecoded = (decoded) => {
    onApply(decoded)
    setInput('')
    setError(false)
  }

  const handleApply = () => {
    const decoded = decodeSeed(input.trim())
    if (!decoded) { setError(true); setTimeout(() => setError(false), 2000); return }
    applyDecoded(decoded)
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    const decoded = decodeSeed(text.trim())
    if (decoded) { e.preventDefault(); applyDecoded(decoded) }
  }

  return (
    <div>
      <SectionLabel>Pattern Seed</SectionLabel>

      {/* Current seed display + copy */}
      <div className="flex gap-1.5 mb-2">
        <code className="flex-1 min-w-0 bg-[#0c1926] border border-[#1e2d3d] rounded px-2 py-1.5 text-[10px] font-mono text-[#50cfff] truncate select-all">
          {seedStr ?? '—'}
        </code>
        <button
          onClick={handleCopy}
          disabled={!seedStr}
          title="Copy seed"
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded bg-[#0c1926] border border-[#1e2d3d] hover:border-[#3a4a5a] text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-all"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>

      {/* Paste / type seed to restore */}
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={e => { setInput(e.target.value); setError(false) }}
          onPaste={handlePaste}
          onKeyDown={e => e.key === 'Enter' && handleApply()}
          placeholder="Paste seed to restore…"
          className={cn(
            'flex-1 min-w-0 bg-[#0c1926] border rounded px-2 py-1.5 text-[10px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors',
            error            ? 'border-red-500/60 focus:border-red-500'
            : preview        ? 'border-emerald-500/50 focus:border-emerald-500'
            : input.length   ? 'border-amber-500/50 focus:border-amber-500'
                             : 'border-[#1e2d3d] focus:border-[#50cfff]'
          )}
        />
        <button
          onClick={handleApply}
          disabled={!input.trim()}
          className="shrink-0 px-2 py-1.5 rounded bg-[#0c1926] border border-[#1e2d3d] hover:border-[#50cfff] text-[10px] font-semibold text-slate-400 hover:text-[#50cfff] disabled:opacity-30 transition-all"
        >
          Apply
        </button>
      </div>

      {/* Decoded preview */}
      {preview && (
        <div className="mt-1.5 bg-[#0c1926] border border-emerald-500/30 rounded px-2 py-1.5 space-y-1">
          <p className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">Valid seed</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-400">
            <span>Complexity <span className="text-slate-200">{preview.params.complexity}</span></span>
            <span>Start <span className="text-slate-200">{preview.params.startHeight}</span></span>
            <span>Overlap Area <span className="text-slate-200">{preview.params.overlapChance * 10}%</span></span>
            <span>Corner <span className="text-slate-200">{preview.params.cornerChance}</span></span>
            <span>Volatility <span className="text-slate-200">{preview.params.volatility * 10}%</span></span>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-slate-400">
            <span className="w-3 h-3 rounded-sm border border-white/10 shrink-0" style={{ backgroundColor: preview.colorA }} />
            <span className="font-mono">{preview.colorA}</span>
            <span className="w-3 h-3 rounded-sm border border-white/10 shrink-0" style={{ backgroundColor: preview.colorB }} />
            <span className="font-mono">{preview.colorB}</span>
          </div>
        </div>
      )}
      {error && (
        <p className="text-[10px] text-red-400 mt-1">Invalid seed — check and try again</p>
      )}
    </div>
  )
}
