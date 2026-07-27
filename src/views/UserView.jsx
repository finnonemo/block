import { useState, useCallback, useEffect, useRef } from 'react'
import { RefreshCw, Layers, Settings2, Hand, Pipette, Crop, Save, ArrowUp, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { PatternCanvas } from '@/components/PatternCanvas'
import {
  COLS, ROWS,
  DEFAULT_PARAMS,
  buildConfigFromParams,
  generatePatternRects,
  syncBlocks,
  buildSVG,
  createRNG,
} from '@/utils/gridUtils'
import { loadDictionary, fetchSharedDictionary, mergeDictionaries } from '@/utils/dictionary'

function makeNewSeed() {
  return (Math.random() * 0x100000000) >>> 0
}

// ─── Skeuomorphic material recipes ─────────────────────────────────────────
// Each is a layered inset shadow that fakes real light hitting a molded surface:
// a dark shadow on the bottom-right (recessed edge), a bright highlight on the
// top-left (catching light), and a soft ambient-occlusion tint. Matches Figma's
// own "Surface" layer recipes rather than a flat single-tone shadow.
const EMBOSS_DARK =
  'shadow-[inset_-2px_-2px_4px_0px_rgba(0,0,0,0.25),inset_1px_1px_2px_0px_rgba(255,255,255,0.12),inset_2px_2px_8px_0px_rgba(189,189,191,0.05)]'
const EMBOSS_GRAY_GRADIENT =
  'shadow-[inset_-2px_-2px_4px_0px_rgba(0,0,0,0.25),inset_1px_1px_2px_0px_rgba(255,255,255,0.12),inset_4px_4px_8px_0px_rgba(189,189,191,0.25)]'
const EMBOSS_ORANGE_GRADIENT =
  'shadow-[inset_-2px_-2px_4px_0px_rgba(0,0,0,0.25),inset_1px_1px_2px_0px_rgba(255,255,255,0.5),inset_4px_4px_8px_0px_rgba(255,221,0,0.25)]'
const EMBOSS_WHITE =
  'shadow-[inset_-2px_-2px_4px_0px_rgba(0,0,0,0.15),inset_1px_1px_2px_0px_rgba(255,255,255,0.8),inset_2px_2px_8px_0px_rgba(255,255,255,0.4)]'
// Recessed: the inverse — dark on top-left, light on bottom-right — like a glass
// screen or a slot pressed *into* the material rather than a key rising out of it.
const RECESSED_SCREEN = 'shadow-[inset_0px_4px_4px_0px_rgba(0,0,0,0.35),inset_-1px_-1px_4px_0px_rgba(255,255,255,0.12)]'
const RECESSED_INPUT = 'shadow-[inset_0px_3px_4px_0px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_0px_rgba(255,255,255,0.08)]'
const PILL_DROP = 'shadow-[2px_2px_8px_0px_rgba(0,0,0,0.5)]'
const BUTTON_DROP = 'shadow-[0px_2px_6px_0px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.15)]'

// Subtle top-lit gradient so flat dark cells read as molded plastic rather than
// a flat color fill — real materials are never perfectly uniform under light.
const SHEEN_DARK = { backgroundImage: 'linear-gradient(to bottom, #232323, #1a1a1a)' }

function generateState(params, seed) {
  const rng   = createRNG(seed)
  const cfg   = buildConfigFromParams(params)
  const rects = generatePatternRects(cfg, rng)
  return { rects, blocks: syncBlocks(rects) }
}

// Shared dictionary fuzzy-match: exact word match wins, otherwise a single
// unambiguous substring/tag match.
function matchDictWord(dictWords, query) {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const exact = dictWords.find(w => w.word.toLowerCase() === q)
  if (exact) return exact
  const filtered = dictWords.filter(w =>
    w.word.toLowerCase().includes(q) ||
    w.tags.some(t => t.toLowerCase().includes(q))
  )
  return filtered.length === 1 ? filtered[0] : null
}

// Floating tool chip row above the canvas — Hand (default/view), Pipette (eyedropper,
// real: samples a cell's color off the `blocks` array), Crop (decorative — no crop
// concept exists in the app yet, kept visible for parity with the Figma reference but
// disabled rather than faked).
function EditorToolbar({ toolMode, onToolChange }) {
  const tools = [
    { id: 'hand',      icon: Hand,    label: 'Pan' },
    { id: 'eyedropper', icon: Pipette, label: 'Pick a color' },
  ]
  return (
    <div className="flex items-center gap-4 shrink-0">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onToolChange(id)}
          title={label}
          aria-label={label}
          style={toolMode === id ? { backgroundImage: 'linear-gradient(to bottom, #444444, #333333)' } : undefined}
          className={cn(
            'flex items-center justify-center size-9 transition-all rounded-lg',
            toolMode === id ? cn('text-white', EMBOSS_DARK, BUTTON_DROP) : 'bg-transparent text-white/70 hover:text-white'
          )}
        >
          <Icon size={16} />
        </button>
      ))}
      <button
        disabled
        title="Crop (coming soon)"
        aria-label="Crop (coming soon)"
        className="flex items-center justify-center size-9 rounded-lg bg-transparent text-white/40 cursor-not-allowed"
      >
        <Crop size={16} />
      </button>
    </div>
  )
}

// Drag-scrub numeric dial bound to `midCurve` (0=early-large, 50=uniform, 100=late-large
// per docs/rules/parameters.md). Vertical pointer-drag adjusts the value; arrow keys work
// too for accessibility. Reads out in the Pixelify Sans "readout" font from the Figma ref.
function MidCurveDial({ value, onChange }) {
  const dragRef = useRef(null)

  const handlePointerDown = useCallback((e) => {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startValue: value }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [value])

  const handlePointerMove = useCallback((e) => {
    if (!dragRef.current) return
    const deltaY = dragRef.current.startY - e.clientY // drag up = increase
    const next = Math.round(Math.min(100, Math.max(0, dragRef.current.startValue + deltaY * 0.5)))
    onChange(next)
  }, [onChange])

  const handlePointerUp = useCallback((e) => {
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') { e.preventDefault(); onChange(Math.min(100, value + 1)) }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') { e.preventDefault(); onChange(Math.max(0, value - 1)) }
  }, [value, onChange])

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label="Size bias"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full flex flex-col items-center justify-center h-24 rounded-lg bg-black border-2 border-black cursor-ns-resize select-none touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        RECESSED_SCREEN
      )}
    >
      <span className="text-caption-2 text-white/40 font-pixel tracking-widest [text-shadow:0_0_4px_rgba(255,255,255,0.15)]">EARLY</span>
      <span className="text-[26px] leading-none text-white font-pixel tracking-wider tabular-nums [text-shadow:0_0_8px_rgba(255,255,255,0.35)]">{value}</span>
      <span className="text-caption-2 text-white/40 font-pixel tracking-widest [text-shadow:0_0_4px_rgba(255,255,255,0.15)]">LATE</span>
    </div>
  )
}

// The Figma reference's four chip labels (STR./CORNER/RISK/COST) are placeholder text
// with no literal spec — mapped here onto real, distinct generation params:
//   CORNER → cornerAmount (2 default ↔ 0 "exact corners off")
//   STR.   → overlapChance (0 default/structured ↔ 1 loose/overlap)
//   RISK   → blockMax (8 default ↔ 4 bolder/fewer blocks)
//   COST   → midCurve preset shortcut (50 default ↔ 0 early-large extreme)
function ParamChipRow({ params, onSetParam }) {
  const strOn    = (params.overlapChance ?? 0) === 1
  const cornerOn = (params.cornerAmount ?? 2) === 0
  const riskOn   = (params.blockMax ?? 8) !== 8
  const costOn   = (params.midCurve ?? 50) !== 50

  const chips = [
    { key: 'STR.',   active: strOn,    onClick: () => onSetParam('overlapChance', strOn ? 0 : 1) },
    { key: 'CORNER', active: cornerOn, onClick: () => onSetParam('cornerAmount', cornerOn ? 2 : 0) },
    { key: 'RISK',   active: riskOn,   onClick: () => onSetParam('blockMax', riskOn ? 8 : 4) },
    { key: 'COST',   active: costOn,   onClick: () => onSetParam('midCurve', costOn ? 50 : 0) },
  ]

  return (
    <div className="grid grid-cols-4 gap-1.5">
      {chips.map(c => (
        <button
          key={c.key}
          onClick={c.onClick}
          style={c.active ? undefined : SHEEN_DARK}
          className={cn(
            'flex items-end justify-center h-24 pb-3 rounded-lg border-2 border-black text-caption-2 font-mono font-semibold tracking-widest uppercase transition-all',
            c.active ? cn('bg-white text-black', EMBOSS_WHITE) : cn('text-white/40 hover:text-white/70', EMBOSS_DARK)
          )}
        >
          {c.key}
        </button>
      ))}
    </div>
  )
}

// Keyword generator — types a dictionary word, submits to regenerate the current
// pattern in place via matchDictWord + PatternBuilder's applyWord. The leading "+"
// shuffles in a random dictionary word directly (matches the Figma reference's "Add"
// button slot with a real action instead of a decorative plus).
function KeywordPanel({ dictWords, value, onChange, onSubmit, onShuffle, feedback }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onShuffle}
          disabled={dictWords.length === 0}
          aria-label="Shuffle in a random word"
          title="Shuffle"
          style={SHEEN_DARK}
          className={cn('flex items-center justify-center size-9 rounded-full border border-[#323232] text-white/70 hover:text-white shrink-0 transition-all disabled:opacity-30', EMBOSS_DARK, BUTTON_DROP)}
        >
          <Plus size={16} />
        </button>
        <div className={cn('flex-1 flex items-center gap-2 rounded-full bg-[#1d1d1d] border-2 border-black pl-4 pr-1.5 py-1.5', RECESSED_INPUT)}>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') onSubmit() }}
            placeholder="Type a word to design..."
            className="flex-1 min-w-0 bg-transparent focus:outline-none text-white placeholder-white/40 text-sm font-pixel tracking-wide"
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim()}
            aria-label="Generate from word"
            className={cn('flex items-center justify-center size-8 rounded-full shrink-0 transition-all disabled:opacity-30 bg-white text-black', EMBOSS_WHITE, BUTTON_DROP)}
          >
            <ArrowUp size={14} />
          </button>
        </div>
      </div>
      {feedback && (
        <p className={cn('text-caption-2 px-1', feedback.status === 'found' ? 'text-white/50' : 'text-red-500')}>
          {feedback.status === 'found' ? `Applied "${feedback.word}"` : 'No matching word — try a different one.'}
        </p>
      )}
      {dictWords.length === 0 && (
        <p className="text-caption-2 text-white/50 px-1">No dictionary words yet. Ask an admin to add some!</p>
      )}
    </div>
  )
}

// ─── The whole of User mode: one screen (matches Figma node 150:178) ─────────

function PatternBuilder({ dictWords, onSwitchMode }) {
  // Computed once on mount: a fresh random pattern from DEFAULT_PARAMS. There's no
  // incoming template anymore — this is a from-scratch builder, not a gallery viewer.
  const [initial] = useState(() => {
    const seed = makeNewSeed()
    return { seed, ...generateState(DEFAULT_PARAMS, seed) }
  })

  const [seed, setSeed]           = useState(initial.seed)
  const [params, setParams]       = useState(() => ({ ...DEFAULT_PARAMS }))
  const [colorA, setColorA]       = useState('#00e76b')
  const [colorB, setColorB]       = useState('#01172b')
  const [rectangles, setRects]    = useState(initial.rects)
  const [blocks, setBlocks]       = useState(initial.blocks)
  const [patternName, setPatternName] = useState('New Pattern')
  const [toolMode, setToolMode]     = useState('hand') // 'hand' | 'eyedropper'
  const [keywordInput, setKeywordInput]       = useState('')
  const [keywordFeedback, setKeywordFeedback] = useState(null) // { status: 'found'|'not-found', word? }
  const [pendingSample, setPendingSample]     = useState(null) // { idx, hex } — awaiting Surface/Background confirm

  const handleGenerate = useCallback(() => {
    const newSeed = makeNewSeed()
    const { rects, blocks } = generateState(params, newSeed)
    setSeed(newSeed)
    setRects(rects)
    setBlocks(blocks)
  }, [params])

  // Applies a dictionary word's params/colors, respecting its enabled.{colors,params}
  // flags, generating off the locally-computed merged params (not the still-stale
  // `params` state var, which won't be visible until next render).
  const applyWord = useCallback((word) => {
    const enabled = word.enabled ?? { colors: true, params: true }
    const mergedParams = enabled.params ? word.params : params
    const nextColorA = enabled.colors ? word.colorA : colorA
    const nextColorB = enabled.colors ? word.colorB : colorB
    const newSeed = makeNewSeed()
    const { rects, blocks } = generateState(mergedParams, newSeed)
    setParams(mergedParams)
    setColorA(nextColorA)
    setColorB(nextColorB)
    setPatternName(word.word)
    setSeed(newSeed)
    setRects(rects)
    setBlocks(blocks)
  }, [params, colorA, colorB])

  const handleKeywordSubmit = useCallback(() => {
    const matched = matchDictWord(dictWords, keywordInput)
    if (matched) {
      applyWord(matched)
      setKeywordFeedback({ status: 'found', word: matched.word })
    } else {
      setKeywordFeedback({ status: 'not-found' })
    }
  }, [dictWords, keywordInput, applyWord])

  const handleShuffleWord = useCallback(() => {
    if (dictWords.length === 0) return
    const word = dictWords[Math.floor(Math.random() * dictWords.length)]
    applyWord(word)
    setKeywordInput(word.word)
    setKeywordFeedback({ status: 'found', word: word.word })
  }, [dictWords, applyWord])

  // Eyedropper: sample color straight from the `blocks` buffer (0 → colorA, 1 → colorB)
  // rather than reading canvas pixels — simpler and exact, no image overlay in user mode.
  const handleSample = useCallback((idx) => {
    if (idx == null || !blocks || blocks[idx] == null) return
    setPendingSample({ idx, hex: blocks[idx] === 0 ? colorA : colorB })
  }, [blocks, colorA, colorB])

  const handleDownload = useCallback(() => {
    if (rectangles.length === 0) return
    const svg  = buildSVG(rectangles, colorA, colorB)
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${patternName.replace(/\s+/g, '-').toLowerCase()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }, [rectangles, colorA, colorB, patternName])

  return (
    <div
      className="h-dvh bg-black text-white flex flex-col items-center overflow-hidden"
      style={{ backgroundImage: 'radial-gradient(ellipse 120% 60% at 50% 0%, rgba(255,255,255,0.05), transparent 60%)' }}
    >
      <div className="w-full max-w-[480px] h-full min-h-0 flex flex-col">

        {/* Header */}
        <header className="flex items-center gap-3 px-4 h-14 shrink-0">
          <div className={cn('w-7 h-7 rounded-md bg-white flex items-center justify-center shrink-0', EMBOSS_WHITE)}>
            <Layers size={14} className="text-black" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-white truncate">{patternName}</span>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={onSwitchMode}
              aria-label="Switch to Admin mode"
              title="Admin"
              style={{ backgroundImage: 'linear-gradient(to bottom, #464646, #333333)' }}
              className={cn('flex items-center justify-center size-9 rounded-full text-white/80 hover:text-white transition-all', EMBOSS_DARK, BUTTON_DROP)}
            >
              <Settings2 size={14} />
            </button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={rectangles.length === 0}
              className={cn('rounded-full gap-1.5 text-footnote bg-white text-black hover:bg-white/90', EMBOSS_WHITE, BUTTON_DROP)}
            >
              <Save size={13} />
              Save
            </Button>
          </div>
        </header>

        {/* Toolbar + Canvas — flex-1 fills whatever space the sticky console below
            doesn't use, matching Figma's Canvas frame (flex-[1_0_0]) exactly. */}
        <main className="relative flex-1 min-h-0 w-full flex flex-col items-center gap-3 px-12 py-6 overflow-hidden">
          <EditorToolbar toolMode={toolMode} onToolChange={setToolMode} />

          {pendingSample && (
            <div style={SHEEN_DARK} className={cn('absolute top-12 z-10 flex items-center gap-2 rounded-full border-2 border-black px-2 py-1.5', EMBOSS_DARK, PILL_DROP)}>
              <span className="size-5 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: pendingSample.hex }} />
              <button
                onClick={() => { setColorA(pendingSample.hex); setPendingSample(null) }}
                className="px-2.5 py-1 rounded-full text-caption-2 font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Set as Surface
              </button>
              <button
                onClick={() => { setColorB(pendingSample.hex); setPendingSample(null) }}
                className="px-2.5 py-1 rounded-full text-caption-2 font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Set as Background
              </button>
              <button
                onClick={() => setPendingSample(null)}
                aria-label="Cancel"
                className="flex items-center justify-center size-6 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
          )}

          <div className="w-full flex-1 min-h-0">
            <EditorCanvasArea
              blocks={blocks}
              rectangles={rectangles}
              colorA={colorA}
              colorB={colorB}
              toolMode={toolMode}
              onSample={handleSample}
            />
          </div>
        </main>

        {/* Console: sticky/floating bottom bar — shrink-0 so it never scrolls away (the
            page itself doesn't scroll, `h-dvh` + `overflow-hidden` on the root), matching
            Figma's Chat Section sitting fixed under the flex-[1_0_0] Canvas frame. Capped
            at 45dvh with its own internal scroll so a very long dictionary word/feedback
            text can't push the canvas above it down to nothing. */}
        <section className="shrink-0 w-full px-2 py-3">
          <div className="rounded-[24px] bg-[#161617] border border-[#313131] p-4 space-y-3 max-h-[45dvh] overflow-y-auto shadow-[0px_-4px_16px_0px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.04)]">

            {/* Mode row — static indicator, matching Figma's non-interactive MODE pill */}
            <div className="flex items-center">
              <span style={SHEEN_DARK} className={cn('inline-flex items-center gap-1.5 rounded-full border-2 border-black px-3 py-1 text-caption-2 font-semibold uppercase tracking-widest text-white/40', EMBOSS_DARK, PILL_DROP)}>
                Generate
                <span className="size-2 rounded-full ring-1 ring-white/20" style={{ backgroundColor: colorA, boxShadow: `0 0 6px 0 ${colorA}` }} />
              </span>
            </div>

            {/* Dial row: reset / size-bias screen / commit — same 3-cell shape as the
                Figma reference's cancel / dial / confirm-arrow row, with real actions. */}
            <div className="flex gap-1.5">
              <button
                onClick={() => setParams(p => ({ ...p, midCurve: 50 }))}
                title="Reset size bias to default"
                style={{ backgroundImage: 'linear-gradient(to top, #585657, #646265)' }}
                className={cn('flex items-center justify-center w-24 h-24 shrink-0 rounded-lg border-2 border-black text-caption-2 font-mono font-semibold tracking-widest uppercase text-white transition-all active:translate-y-px', EMBOSS_GRAY_GRADIENT, BUTTON_DROP)}
              >
                Reset
              </button>
              <MidCurveDial
                value={params.midCurve ?? 50}
                onChange={v => setParams(p => ({ ...p, midCurve: v }))}
              />
              <button
                onClick={handleGenerate}
                title="Generate Variation"
                aria-label="Generate Variation"
                style={{ backgroundImage: 'linear-gradient(to top, #e33305, #ff8047)' }}
                className={cn('flex items-center justify-center w-24 h-24 shrink-0 rounded-lg border-2 border-black text-white transition-all active:translate-y-px', EMBOSS_ORANGE_GRADIENT, BUTTON_DROP)}
              >
                <RefreshCw size={18} />
              </button>
            </div>

            {/* Chip row */}
            <ParamChipRow params={params} onSetParam={(key, value) => setParams(p => ({ ...p, [key]: value }))} />

            {/* Keyword lookup — the only generation input, matching Figma's input row
                exactly (no Preset/color-grid alternative, which has no Figma equivalent). */}
            <div className="pt-1">
              <KeywordPanel
                dictWords={dictWords}
                value={keywordInput}
                onChange={setKeywordInput}
                onSubmit={handleKeywordSubmit}
                onShuffle={handleShuffleWord}
                feedback={keywordFeedback}
              />
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}

const BEZEL = 8 // px frame around the canvas screen, see EditorCanvasArea below

// Canvas area (read-only for user view — no painting; eyedropper sampling only)
function EditorCanvasArea({ blocks, rectangles, colorA, colorB, toolMode = 'hand', onSample }) {
  const containerRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const [canvasSize, setCanvasSize] = useState(480)

  // containerRef is the flexible area left over after the caption's own row (a `flex-1
  // min-h-0` box inside a `flex-col` card) — its width and height are both independently
  // real (not aspect-forced), since the card itself is height-constrained by the sticky
  // layout above, so min(width,height) gives the correct square size with no overflow.
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

  // Eyedropper: map the click position to a grid cell and sample straight from the
  // `blocks` buffer already held in PatternBuilder state — matches PatternCanvas's own
  // clientToIdx math (row * cols + col) without needing to touch that component.
  const innerSize = Math.max(1, canvasSize - BEZEL * 2)
  const handleSampleClick = useCallback((e) => {
    if (!onSample) return
    const el = canvasWrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cellSize = Math.max(1, Math.floor(innerSize / Math.max(COLS, ROWS)))
    const col = Math.floor((e.clientX - rect.left) / cellSize)
    const row = Math.floor((e.clientY - rect.top) / cellSize)
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return
    onSample(row * COLS + col)
  }, [onSample, innerSize])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
      <div ref={containerRef} className="w-full flex-1 min-h-0 flex items-center justify-center">
        {/* Bezel: a dark metal-gradient frame around the screen, like a device the
            pattern is "mounted in" — a classic skeuomorphic device-chrome touch. */}
        <div
          className="relative rounded-[26px]"
          style={{
            width: canvasSize,
            height: canvasSize,
            backgroundImage: 'linear-gradient(145deg, #2e2e2e, #0a0a0a)',
            boxShadow: '0px 8px 40px 0px rgba(0,0,0,0.5), inset 0 1px 1px 0px rgba(255,255,255,0.08)',
          }}
        >
          <div
            ref={canvasWrapRef}
            className="absolute rounded-[20px] overflow-hidden shadow-[inset_0_2px_6px_0px_rgba(0,0,0,0.5)]"
            style={{ inset: BEZEL, width: innerSize, height: innerSize }}
          >
            <PatternCanvas
              size={innerSize}
              blocks={blocks}
              rectangles={rectangles}
              colorA={colorA}
              colorB={colorB}
            />
            {toolMode === 'eyedropper' && (
              <button
                onClick={handleSampleClick}
                aria-label="Sample a color from the pattern"
                className="absolute inset-0 cursor-crosshair ring-2 ring-inset ring-white/40"
              />
            )}
          </div>
        </div>
      </div>
      <p className="text-caption-2 text-white/40 shrink-0">1920 × 1920 px export</p>
    </div>
  )
}

// ─── Root: User mode is now just this one screen ─────────────────────────────

export default function UserView({ onSwitchMode }) {
  const [dictWords, setDictWords] = useState(() => loadDictionary().words)

  useEffect(() => {
    fetchSharedDictionary().then(shared => {
      setDictWords(prev => mergeDictionaries(shared, { words: prev }).words)
    })
  }, [])

  return <PatternBuilder dictWords={dictWords} onSwitchMode={onSwitchMode} />
}
