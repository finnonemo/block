import { useState, useCallback, useEffect, useRef } from 'react'
import { Copy, Check, RefreshCw, Layers, Save, BookOpen, X, Trash2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PatternCanvas } from '@/components/PatternCanvas'
import { ParameterPanel } from '@/components/ParameterPanel'
import { PatternPreview } from '@/components/PatternPreview'
import {
  COLS, ROWS,
  DEFAULT_PARAMS,
  COLOR_PAIRS,
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
import {
  CATEGORIES,
  loadGallery,
  addTemplate,
  removeTemplate,
} from '@/utils/gallery'

const DEFAULT_PAIR = COLOR_PAIRS[0] // Green / Navy

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
    colorA:     DEFAULT_PAIR.surface,
    colorB:     DEFAULT_PAIR.background,
    rectangles: rects,
    blocks,
  }
}

export default function AdminView({ onSwitchMode }) {
  const [state, setState]       = useState(initApp)
  const [copyStatus, setCopyStatus] = useState('idle')
  const [sidebarTab, setSidebarTab] = useState('params') // 'params' | 'gallery'
  const [gallery, setGallery]   = useState(loadGallery)
  const [saveModal, setSaveModal] = useState(false)

  const { seed, params, colorA, colorB, rectangles, blocks } = state

  const refreshGallery = useCallback(() => setGallery(loadGallery()), [])

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

  const handlePaint = useCallback((idx, color) => {
    setState(s => {
      if (s.blocks[idx] === color) return s
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

  const currentSeed = seed != null ? encodeSeed(seed, params, colorA, colorB) : null

  const handleSaveToGallery = useCallback((name, category) => {
    if (!currentSeed) return
    const newGallery = addTemplate({ name, category, seed: currentSeed })
    setGallery(newGallery)
    setSaveModal(false)
    setSidebarTab('gallery')
  }, [currentSeed])

  const handleDeleteTemplate = useCallback((id) => {
    const newGallery = removeTemplate(id)
    setGallery(newGallery)
  }, [])

  const handleLoadTemplate = useCallback((seedStr) => {
    const decoded = decodeSeed(seedStr)
    if (!decoded) return
    handleSeedApply(decoded)
    setSidebarTab('params')
  }, [handleSeedApply])

  return (
    <div className="min-h-screen md:h-screen bg-[#07101e] text-slate-200 flex flex-col md:overflow-hidden">
      {/* Header */}
      <header className="flex items-center px-4 md:px-6 h-12 md:h-14 border-b border-[#1a2a3a] bg-[#0a1628] shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 rounded-md bg-[#50cfff] flex items-center justify-center shrink-0">
            <Layers size={14} className="text-[#01172b]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-sm text-white">Pattern Builder</span>
            <span className="ml-2 text-xs text-slate-500">Admin · 16×16</span>
          </div>
        </div>
        <button
          onClick={onSwitchMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0c1926] border border-[#1e2d3d] hover:border-[#50cfff]/40 text-xs text-slate-400 hover:text-[#50cfff] transition-all"
        >
          <Users size={12} />
          User View
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden md:min-h-0">

        {/* Canvas */}
        <main className="order-1 md:order-2 md:flex-1 md:min-h-0 overflow-hidden bg-[#07101e] flex items-center justify-center p-3 md:p-6 h-[min(90vw,480px)] md:h-auto">
          <CanvasArea
            blocks={blocks}
            rectangles={rectangles}
            colorA={colorA}
            colorB={colorB}
            onPaint={handlePaint}
          />
        </main>

        {/* Sidebar */}
        <aside className="order-2 md:order-1 w-full md:w-72 md:shrink-0 bg-[#0a1628] border-t md:border-t-0 md:border-r border-[#1a2a3a] flex flex-col max-h-[60vh] md:max-h-none md:overflow-hidden">

          {/* Tab bar */}
          <div className="shrink-0 flex border-b border-[#1a2a3a]">
            {[
              { id: 'params',  label: 'Parameters', Icon: Layers },
              { id: 'gallery', label: 'Gallery',    Icon: BookOpen },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setSidebarTab(id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all border-b-2',
                  sidebarTab === id
                    ? 'text-[#50cfff] border-[#50cfff] bg-[#0c1926]'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                )}
              >
                <Icon size={12} />
                {label}
                {id === 'gallery' && gallery.templates.length > 0 && (
                  <span className="ml-0.5 px-1 py-0 rounded-full bg-[#50cfff]/20 text-[#50cfff] text-[9px] font-bold">
                    {gallery.templates.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">

            {sidebarTab === 'params' && (
              <div className="p-4 space-y-5">
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
                          <span className="w-3 h-3 rounded-sm shrink-0 border border-white/10" style={{ backgroundColor: colorA }} />
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
            )}

            {sidebarTab === 'gallery' && (
              <GalleryTab
                gallery={gallery}
                onLoad={handleLoadTemplate}
                onDelete={handleDeleteTemplate}
                onSave={() => setSaveModal(true)}
                hasCurrent={!!currentSeed}
              />
            )}
          </div>

          {/* Sticky bottom actions */}
          <div className="shrink-0 border-t border-[#1a2a3a] p-4 space-y-2 bg-[#0a1628]">
            <Button className="w-full gap-2 text-xs" onClick={handleGenerate}>
              <RefreshCw size={13} />
              Generate Pattern
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={rectangles.length === 0}
                variant="secondary"
                className={cn(
                  'flex-1 gap-2 text-xs font-semibold',
                  copyStatus === 'success' && 'bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-500'
                )}
              >
                {copyStatus === 'success'
                  ? <><Check size={13} /> Copied!</>
                  : <><Copy size={13} /> Copy SVG</>}
              </Button>
              <Button
                variant="secondary"
                disabled={!currentSeed}
                onClick={() => setSaveModal(true)}
                className="shrink-0 gap-1.5 text-xs"
                title="Save to Gallery"
              >
                <Save size={13} />
              </Button>
            </div>
            <Button variant="secondary" className="w-full gap-2 text-xs" onClick={handleClear}>
              Clear Canvas
            </Button>
          </div>

        </aside>
      </div>

      {/* Save to Gallery Modal */}
      {saveModal && (
        <SaveModal
          onSave={handleSaveToGallery}
          onClose={() => setSaveModal(false)}
          preview={currentSeed}
          colorA={colorA}
          colorB={colorB}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CanvasArea({ blocks, rectangles, colorA, colorB, onPaint }) {
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(512)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const available = Math.min(width, height - 28)
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

  const seedStr = seed != null ? encodeSeed(seed, params, colorA, colorB) : null
  const preview = input.trim() ? decodeSeed(input.trim()) : null

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

      {preview && (
        <div className="mt-1.5 bg-[#0c1926] border border-emerald-500/30 rounded px-2 py-1.5 space-y-1">
          <p className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">Valid seed</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] text-slate-400">
            <span>Complexity <span className="text-slate-200">{preview.params.complexity}</span></span>
            <span>Start <span className="text-slate-200">{preview.params.startHeight}</span></span>
            <span>Overlap <span className="text-slate-200">{preview.params.overlapChance * 10}%</span></span>
            <span>Corner <span className="text-slate-200">{preview.params.cornerChance}</span></span>
            <span>Block Size <span className="text-slate-200">{preview.params.startBlockSize}→{preview.params.endBlockSize}</span></span>
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

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab({ gallery, onLoad, onDelete, onSave, hasCurrent }) {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? gallery.templates
    : gallery.templates.filter(t => t.category === activeCategory)

  return (
    <div className="p-4 space-y-4">
      {/* Save button */}
      <Button
        className="w-full gap-2 text-xs"
        onClick={onSave}
        disabled={!hasCurrent}
      >
        <Save size={13} />
        Save Current Pattern
      </Button>

      {/* Category filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={cn(
            'px-2 py-1 rounded text-[10px] font-semibold border transition-all',
            activeCategory === 'all'
              ? 'bg-[#50cfff] text-[#01172b] border-[#50cfff]'
              : 'bg-[#0c1926] text-slate-400 border-[#1e2d3d] hover:border-[#3a4a5a]'
          )}
        >
          All ({gallery.templates.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = gallery.templates.filter(t => t.category === cat.id).length
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'px-2 py-1 rounded text-[10px] font-semibold border transition-all',
                activeCategory === cat.id
                  ? 'bg-[#50cfff] text-[#01172b] border-[#50cfff]'
                  : 'bg-[#0c1926] text-slate-400 border-[#1e2d3d] hover:border-[#3a4a5a]'
              )}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Template list */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-600 text-xs">
          {gallery.templates.length === 0
            ? 'No saved patterns yet.\nGenerate one and click Save.'
            : 'No patterns in this category.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t => (
            <GalleryCard
              key={t.id}
              template={t}
              onLoad={() => onLoad(t.seed)}
              onDelete={() => onDelete(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GalleryCard({ template, onLoad, onDelete }) {
  const cat = CATEGORIES.find(c => c.id === template.category)

  return (
    <div className="flex items-center gap-2 bg-[#0c1926] border border-[#1e2d3d] rounded-md px-2 py-2 hover:border-[#3a4a5a] group transition-all">
      <div className="shrink-0 rounded overflow-hidden">
        <PatternPreview seed={template.seed} size={40} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-200 truncate">{template.name}</p>
        <p className="text-[10px] text-slate-500">{cat?.icon} {cat?.label}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          onClick={onLoad}
          className="px-2 py-1 rounded bg-[#0d2035] border border-[#1e2d3d] hover:border-[#50cfff]/50 text-[10px] text-slate-400 hover:text-[#50cfff] transition-all"
        >
          Load
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

// ─── Save Modal ───────────────────────────────────────────────────────────────

function SaveModal({ onSave, onClose, preview, colorA, colorB }) {
  const [name, setName]         = useState('')
  const [category, setCategory] = useState('foundation')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-[#0a1628] border border-[#1e2d3d] rounded-xl shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Save to Gallery</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Pattern preview */}
        <div className="flex justify-center">
          <div className="rounded-lg overflow-hidden border border-[#1e2d3d]">
            <PatternPreview seed={preview} size={120} />
          </div>
        </div>

        {/* Color chips */}
        <div className="flex justify-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-4 h-4 rounded-sm border border-white/10" style={{ backgroundColor: colorA }} />
            {colorA}
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-4 h-4 rounded-sm border border-white/10" style={{ backgroundColor: colorB }} />
            {colorB}
          </span>
        </div>

        {/* Name input */}
        <div>
          <label className="text-xs text-slate-400 block mb-1">Pattern name</label>
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && name.trim() && onSave(name.trim(), category)}
            placeholder="e.g. Rising Minimal"
            className="w-full bg-[#0c1926] border border-[#1e2d3d] rounded px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-[#50cfff] transition-colors"
          />
        </div>

        {/* Category picker */}
        <div>
          <label className="text-xs text-slate-400 block mb-2">Category</label>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md border text-xs text-left transition-all',
                  category === cat.id
                    ? 'border-[#50cfff] bg-[#0d2035] text-white'
                    : 'border-[#1e2d3d] bg-[#0c1926] text-slate-400 hover:border-[#3a4a5a]'
                )}
              >
                <span className="text-sm">{cat.icon}</span>
                <div>
                  <div className="font-semibold leading-none">{cat.label}</div>
                  <div className="text-[9px] opacity-60 mt-0.5">{cat.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1 text-xs" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1 text-xs"
            disabled={!name.trim()}
            onClick={() => onSave(name.trim(), category)}
          >
            Save Pattern
          </Button>
        </div>
      </div>
    </div>
  )
}
