import { useState, useCallback, useEffect, useRef } from 'react'
import { ArrowLeft, Copy, Check, RefreshCw, Download, Layers, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PatternCanvas } from '@/components/PatternCanvas'
import { PatternPreview, QuadPatternSVG } from '@/components/PatternPreview'
import {
  COLS, ROWS,
  COLOR_PAIRS,
  buildConfigFromParams,
  generatePatternRects,
  extractBlockGroups,
  syncBlocks,
  buildSVG,
  copySVGToClipboard,
  createRNG,
  decodeSeed,
} from '@/utils/gridUtils'
import { CATEGORIES, loadGallery, fetchSharedGallery, mergeGalleries } from '@/utils/gallery'
import { loadDictionary, fetchSharedDictionary, mergeDictionaries } from '@/utils/dictionary'

function makeNewSeed() {
  return (Math.random() * 0x100000000) >>> 0
}

function generateState(params, seed) {
  const rng   = createRNG(seed)
  const cfg   = buildConfigFromParams(params)
  const rects = generatePatternRects(cfg, rng)
  return { rects, blocks: syncBlocks(rects) }
}

// ─── Page 1: Category Picker ──────────────────────────────────────────────────

function CategoryPage({ gallery, dictWords, onSelect, onSelectWord, onSwitchMode }) {
  const [mode, setMode]       = useState('browse') // 'browse' | 'type'
  const [search, setSearch]   = useState('')

  const filtered = search.trim()
    ? dictWords.filter(w =>
        w.word.toLowerCase().includes(search.toLowerCase()) ||
        w.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      )
    : dictWords

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter') return
    const q = search.trim().toLowerCase()
    const exact = dictWords.find(w => w.word.toLowerCase() === q)
    if (exact) onSelectWord(exact)
    else if (filtered.length === 1) onSelectWord(filtered[0])
  }

  return (
    <div className="min-h-screen bg-[#07101e] text-slate-200 flex flex-col">
      <header className="flex items-center px-4 md:px-6 h-14 border-b border-[#1a2a3a] bg-[#0a1628] shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-7 h-7 rounded-md bg-[#50cfff] flex items-center justify-center shrink-0">
            <Layers size={14} className="text-[#01172b]" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-semibold text-sm text-white">Pattern Gallery</span>
            <span className="ml-2 text-xs text-slate-500">Finnomena Brand</span>
          </div>
        </div>
        <button
          onClick={onSwitchMode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0c1926] border border-[#1e2d3d] hover:border-[#50cfff]/40 text-xs text-slate-400 hover:text-[#50cfff] transition-all"
        >
          <Settings2 size={12} />
          Admin
        </button>
      </header>

      {/* Mode toggle */}
      <div className="shrink-0 flex gap-0 border-b border-[#1a2a3a] bg-[#0a1628] px-4 md:px-6">
        {[
          { id: 'browse', label: 'Browse' },
          { id: 'type',   label: 'Type to Design' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => { setMode(id); setSearch('') }}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all',
              mode === id
                ? 'text-[#50cfff] border-[#50cfff]'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'type' ? (
        /* ── Type to Design ─────────────────────────────────────── */
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-xl mx-auto">
            <input
              autoFocus
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a word to design..."
              className="w-full px-4 py-3 rounded-xl bg-[#0c1926] border border-[#1e2d3d] focus:border-[#50cfff]/60 focus:outline-none text-white placeholder-slate-600 text-sm mb-6"
            />

            {dictWords.length === 0 ? (
              <p className="text-center text-slate-600 text-sm py-8">
                No dictionary words yet. Ask an admin to add some!
              </p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-600 text-sm py-8">
                No words found — try Browse or a different term.
              </p>
            ) : (
              <div className="space-y-2">
                {filtered.map(w => (
                  <button
                    key={w.id}
                    onClick={() => onSelectWord(w)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-[#0a1628] border border-[#1a2a3a] hover:border-[#50cfff]/40 hover:bg-[#0c1e36] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white group-hover:text-[#50cfff] transition-colors">
                          {w.word}
                        </p>
                        {w.description && (
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{w.description}</p>
                        )}
                      </div>
                      {w.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 shrink-0">
                          {w.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 rounded bg-[#0c1926] border border-[#1e2d3d] text-[9px] text-slate-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: w.colorA }} />
                      <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: w.colorB }} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Browse ─────────────────────────────────────────────── */
        <div className="flex-1 p-6 md:p-10">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-1">Choose a Category</h1>
            <p className="text-sm text-slate-500 mb-8">Pick a style to browse pattern templates</p>

            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map(cat => {
                const templates = gallery.templates.filter(t => t.category === cat.id)
                const previews  = templates.slice(0, 3)

                return (
                  <button
                    key={cat.id}
                    onClick={() => templates.length > 0 && onSelect(cat.id)}
                    disabled={templates.length === 0}
                    className={cn(
                      'group text-left bg-[#0a1628] border rounded-xl p-4 transition-all',
                      templates.length > 0
                        ? 'border-[#1a2a3a] hover:border-[#50cfff]/40 hover:bg-[#0c1e36] cursor-pointer'
                        : 'border-[#1a2a3a] opacity-40 cursor-not-allowed'
                    )}
                  >
                    <div className="flex gap-1.5 mb-4 h-14">
                      {previews.length > 0 ? previews.map(t => (
                        <div key={t.id} className="flex-1 rounded overflow-hidden">
                          <PatternPreview seed={t.seed} size={56} />
                        </div>
                      )) : (
                        <div className="flex-1 rounded bg-[#0c1926] border border-[#1e2d3d] flex items-center justify-center text-slate-700 text-2xl">
                          {cat.icon}
                        </div>
                      )}
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-[#50cfff] transition-colors">
                          {cat.icon} {cat.label}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.description}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-semibold text-slate-500 mt-0.5">
                        {templates.length} pattern{templates.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {gallery.templates.length === 0 && (
              <p className="text-center text-slate-600 text-sm mt-8">
                No patterns in gallery yet. Ask an admin to add some!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page 2: Template Grid ────────────────────────────────────────────────────

function TemplatePage({ categoryId, gallery, onBack, onSelect }) {
  const cat       = CATEGORIES.find(c => c.id === categoryId)
  const templates = gallery.templates.filter(t => t.category === categoryId)

  return (
    <div className="min-h-screen bg-[#07101e] text-slate-200 flex flex-col">
      <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-[#1a2a3a] bg-[#0a1628] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          Categories
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-semibold text-white">{cat?.icon} {cat?.label}</span>
        <span className="text-[11px] text-slate-500 ml-auto">{templates.length} patterns</span>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-3xl mx-auto">
          {templates.length === 0 ? (
            <div className="text-center py-16 text-slate-600">No templates in this category yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map(t => (
                <TemplateCard key={t.id} template={t} onSelect={() => onSelect(t)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TemplateCard({ template, onSelect }) {
  // Seed-based: decode + generate rects; Blocks-based: use directly
  const colorA = template.colorA ?? '#00e76b'
  const colorB = template.colorB ?? '#01172b'

  let rects = []
  if (template.seed) {
    const decoded = decodeSeed(template.seed)
    if (decoded) {
      const rng = createRNG(decoded.seed)
      const cfg = buildConfigFromParams(decoded.params)
      rects = generatePatternRects(cfg, rng)
    }
  } else if (template.blocks) {
    rects = extractBlockGroups(template.blocks)
  }

  return (
    <button
      onClick={onSelect}
      className="group text-left bg-[#0a1628] border border-[#1a2a3a] rounded-xl overflow-hidden hover:border-[#50cfff]/40 transition-all"
    >
      {/* 2×2 Quad preview */}
      <div className="w-full aspect-square overflow-hidden">
        {rects.length > 0 ? (
          <QuadPatternSVG
            rects={rects}
            colorA={colorA}
            colorB={colorB}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="w-full h-full bg-[#0c1926]" />
        )}
      </div>

      <div className="p-3">
        <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
          {template.name}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: colorA }} />
          <span className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: colorB }} />
          <span className="text-[9px] text-slate-600 ml-auto font-mono">{colorA}</span>
        </div>
      </div>
    </button>
  )
}

// ─── Page 3: Editor / Export ──────────────────────────────────────────────────

function EditorPage({ template, onBack }) {
  const decoded = template.seed ? decodeSeed(template.seed) : null
  const isSeedBased = !!decoded

  const [seed, setSeed]           = useState(decoded?.seed ?? makeNewSeed())
  const [params, setParams]       = useState(decoded?.params ?? template.params ?? {})
  const [colorA, setColorA]       = useState(template.colorA ?? decoded?.colorA ?? '#00e76b')
  const [colorB, setColorB]       = useState(template.colorB ?? decoded?.colorB ?? '#01172b')
  const [rectangles, setRects]    = useState([])
  const [blocks, setBlocks]       = useState(Array(COLS * ROWS).fill(1))
  const [copyStatus, setCopyStatus] = useState('idle')
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Init canvas from template
  useEffect(() => {
    if (isSeedBased && decoded) {
      const { rects, blocks } = generateState(decoded.params, decoded.seed)
      setRects(rects)
      setBlocks(blocks)
    } else if (template.blocks) {
      const rects = extractBlockGroups(template.blocks)
      setBlocks(template.blocks)
      setRects(rects)
    } else if (template.params && Object.keys(template.params).length > 0) {
      // Dictionary word: generate a fresh pattern with the word's params
      const newSeed = makeNewSeed()
      const { rects, blocks } = generateState(template.params, newSeed)
      setSeed(newSeed)
      setRects(rects)
      setBlocks(blocks)
    }
  }, [template.seed, template.blocks, template.params]) // eslint-disable-line

  const handleGenerate = useCallback(() => {
    const newSeed = makeNewSeed()
    const { rects, blocks } = generateState(params, newSeed)
    setSeed(newSeed)
    setRects(rects)
    setBlocks(blocks)
  }, [params])

  const handleSelectPair = useCallback((pair) => {
    setColorA(pair.surface)
    setColorB(pair.background)
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

  const handleDownload = useCallback(() => {
    if (rectangles.length === 0) return
    const svg  = buildSVG(rectangles, colorA, colorB)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [rectangles, colorA, colorB, template.name])

  return (
    <div className="min-h-screen md:h-screen bg-[#07101e] text-slate-200 flex flex-col md:overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 h-14 border-b border-[#1a2a3a] bg-[#0a1628] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors text-xs"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-semibold text-white truncate">{template.name}</span>
      </header>

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden md:min-h-0">

        {/* Canvas */}
        <main className="order-1 md:order-2 md:flex-1 md:min-h-0 overflow-hidden bg-[#07101e] flex items-center justify-center p-4 md:p-8 h-[min(90vw,480px)] md:h-auto">
          <EditorCanvasArea
            blocks={blocks}
            rectangles={rectangles}
            colorA={colorA}
            colorB={colorB}
          />
        </main>

        {/* Right panel */}
        <aside className="order-2 md:order-1 w-full md:w-72 md:shrink-0 bg-[#0a1628] border-t md:border-t-0 md:border-r border-[#1a2a3a] flex flex-col max-h-[55vh] md:max-h-none md:overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">

            {/* Color pairs */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Color Scheme</p>
              <ColorPairGrid
                colorA={colorA}
                colorB={colorB}
                onSelect={handleSelectPair}
              />
            </div>

            {/* Custom colors */}
            <div>
              <button
                onClick={() => setShowColorPicker(v => !v)}
                className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 hover:text-slate-300 transition-colors"
              >
                Custom Colors
                <span className="text-[9px]">{showColorPicker ? '▲' : '▼'}</span>
              </button>
              {showColorPicker && (
                <div className="mt-2">
                  <SimpleColorSlots
                    colorA={colorA}
                    colorB={colorB}
                    onChangeA={setColorA}
                    onChangeB={setColorB}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Actions */}
          <div className="shrink-0 border-t border-[#1a2a3a] p-4 space-y-2 bg-[#0a1628]">
            <Button className="w-full gap-2 text-xs" onClick={handleGenerate}>
              <RefreshCw size={13} />
              Generate Variation
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                disabled={rectangles.length === 0}
                variant="secondary"
                className={cn(
                  'flex-1 gap-2 text-xs',
                  copyStatus === 'success' && 'bg-emerald-500 hover:bg-emerald-500 text-white border-emerald-500'
                )}
              >
                {copyStatus === 'success'
                  ? <><Check size={13} /> Copied!</>
                  : <><Copy size={13} /> Copy SVG</>}
              </Button>
              <Button
                variant="secondary"
                disabled={rectangles.length === 0}
                onClick={handleDownload}
                className="shrink-0 gap-1.5 text-xs"
                title="Download SVG"
              >
                <Download size={13} />
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

// Canvas area (read-only for user view — no painting)
function EditorCanvasArea({ blocks, rectangles, colorA, colorB }) {
  const containerRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(480)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const available = Math.min(width, height)
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
      />
      <p className="text-xs text-slate-600 shrink-0">1920 × 1920 px export</p>
    </div>
  )
}

// Grid of color pair swatches
function ColorPairGrid({ colorA, colorB, onSelect }) {
  const active = COLOR_PAIRS.find(p => p.surface === colorA && p.background === colorB)

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {COLOR_PAIRS.map(pair => (
        <button
          key={pair.id}
          onClick={() => onSelect(pair)}
          title={pair.label}
          className={cn(
            'flex flex-col items-center gap-1 p-1.5 rounded-md border transition-all',
            active?.id === pair.id
              ? 'border-[#50cfff] bg-[#0d2035]'
              : 'border-[#1e2d3d] bg-[#0c1926] hover:border-[#3a4a5a]'
          )}
        >
          <div className="flex gap-0.5 w-full">
            <span className="flex-1 h-5 rounded-sm border border-white/10" style={{ backgroundColor: pair.surface }} />
            <span className="flex-1 h-5 rounded-sm border border-white/10" style={{ backgroundColor: pair.background }} />
          </div>
          <span className="text-[8px] text-slate-500 leading-none text-center line-clamp-1 w-full">{pair.label}</span>
        </button>
      ))}
    </div>
  )
}

// Simple A/B color slots with brand swatch grid
function SimpleColorSlots({ colorA, colorB, onChangeA, onChangeB }) {
  const [slot, setSlot] = useState('A')
  const BRAND = {
    Navy: ['#01172b', '#415160', '#808b95', '#c0c5ca'],
    'Lt.Grey': ['#a6bfcc', '#bccfd9', '#d3dfe6', '#e9eff2'],
    Yellow: ['#f2f93c', '#f5fb6d', '#f9fc9e', '#fcfece'],
    White: ['#ffffff'],
    Green: ['#00e76b', '#40ed90', '#80f3b5', '#bff9da'],
    Blue: ['#50cfff', '#7cdbff', '#a8e7ff', '#d3f3ff'],
    Purple: ['#aa46c3', '#bf74d2', '#d5a3e1', '#ead1f0'],
    Red: ['#f73232', '#f96565', '#fb9999', '#fdcccc'],
    Orange: ['#f26414', '#f58b4f', '#f9b28a', '#fcd8c4'],
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {[{ s: 'A', c: colorA, label: 'Surface' }, { s: 'B', c: colorB, label: 'BG' }].map(({ s, c, label }) => (
          <button
            key={s}
            onClick={() => setSlot(s)}
            className={cn(
              'flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded border text-xs transition-all',
              slot === s ? 'border-[#50cfff] bg-[#0d2035] text-white' : 'border-[#1e2d3d] bg-[#0c1926] text-slate-400'
            )}
          >
            <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: c }} />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="space-y-1">
        {Object.entries(BRAND).map(([fam, colors]) => (
          <div key={fam} className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-600 w-12 text-right shrink-0">{fam}</span>
            <div className="flex gap-1">
              {colors.map(hex => (
                <button
                  key={hex}
                  onClick={() => slot === 'A' ? onChangeA(hex) : onChangeB(hex)}
                  className={cn(
                    'w-5 h-5 rounded-sm border transition-all hover:scale-110',
                    (slot === 'A' ? colorA : colorB) === hex
                      ? 'border-[#50cfff] shadow-[0_0_0_1px_#50cfff]'
                      : 'border-white/10 hover:border-white/30'
                  )}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Root UserView with page routing ─────────────────────────────────────────

export default function UserView({ onSwitchMode }) {
  const [gallery, setGallery]         = useState(loadGallery)
  const [dictWords, setDictWords]     = useState(() => loadDictionary().words)
  const [page, setPage]               = useState(1)
  const [selectedCategory, setCategory]   = useState(null)
  const [selectedTemplate, setTemplate]   = useState(null)
  const [editorFromDict, setEditorFromDict] = useState(false)

  useEffect(() => {
    fetchSharedGallery().then(shared => {
      setGallery(prev => mergeGalleries(shared, prev))
    })
    fetchSharedDictionary().then(shared => {
      setDictWords(prev => mergeDictionaries(shared, { words: prev }).words)
    })
  }, [])

  const handleSelectCategory = useCallback((catId) => {
    setCategory(catId)
    setPage(2)
  }, [])

  const handleSelectTemplate = useCallback((template) => {
    setTemplate(template)
    setEditorFromDict(false)
    setPage(3)
  }, [])

  const handleSelectWord = useCallback((word) => {
    const enabled = word.enabled ?? { colors: true, params: true }
    setTemplate({
      name:   word.word,
      // null means "don't override" — EditorPage falls back to defaults
      params: enabled.params ? word.params : {},
      colorA: enabled.colors ? word.colorA : null,
      colorB: enabled.colors ? word.colorB : null,
      seed:   null,
      blocks: null,
    })
    setEditorFromDict(true)
    setPage(3)
  }, [])

  const handleBackToCategories = useCallback(() => {
    setPage(1)
    setCategory(null)
  }, [])

  const handleBackToTemplates = useCallback(() => {
    setPage(2)
    setTemplate(null)
  }, [])

  if (page === 3 && selectedTemplate) {
    return (
      <EditorPage
        template={selectedTemplate}
        onBack={editorFromDict ? handleBackToCategories : handleBackToTemplates}
      />
    )
  }

  if (page === 2 && selectedCategory) {
    return (
      <TemplatePage
        categoryId={selectedCategory}
        gallery={gallery}
        onBack={handleBackToCategories}
        onSelect={handleSelectTemplate}
      />
    )
  }

  return (
    <CategoryPage
      gallery={gallery}
      dictWords={dictWords}
      onSelect={handleSelectCategory}
      onSelectWord={handleSelectWord}
      onSwitchMode={onSwitchMode}
    />
  )
}
