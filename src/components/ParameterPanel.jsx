import { useState } from 'react'
import { ChevronDown, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROWS, COMPLEXITY, START_HEIGHT_OPTIONS, END_HEIGHT_OPTIONS, BRAND_PALETTE } from '@/utils/gridUtils'

// ─── Switch (toggle) ─────────────────────────────────────────────────────────

function Switch({ checked, onToggle }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        checked
          ? 'bg-white border-neutral-200 dark:border-neutral-800'
          : 'bg-neutral-300 dark:bg-neutral-700 border-transparent'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full shadow-sm transition duration-200 ease-in-out',
          checked ? 'translate-x-4 bg-neutral-950' : 'translate-x-0.5 bg-white'
        )}
      />
    </button>
  )
}

// ─── Segmented button group ───────────────────────────────────────────────────

function SegGroup({ options, value, onChange, disabled = false, cols }) {
  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, 1fr)` }}
    >
      {options.map(opt => (
        <button
          key={opt.value}
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex flex-col items-center justify-center min-w-[40px] h-11 md:h-9 px-2 rounded-md text-footnote font-semibold transition-all border',
            value === opt.value
              ? 'bg-primary text-primary-foreground border-primary shadow-sm'
              : 'bg-muted text-muted-foreground border-border hover:border-ring hover:text-foreground',
            disabled && 'opacity-30 pointer-events-none'
          )}
        >
          <span>{opt.label}</span>
          {opt.sub && (
            <span className={cn('text-caption-2 mt-px font-normal', value === opt.value ? 'text-primary-foreground/70' : 'text-muted-foreground/60')}>
              {opt.sub}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function ParamSlider({ value, min, max, step = 1, onChange, formatLabel }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-4 md:h-1.5 accent-primary cursor-pointer touch-manipulation"
      />
      <span className="text-footnote font-mono text-primary w-10 text-right shrink-0">
        {formatLabel ? formatLabel(value) : value}
      </span>
    </div>
  )
}

// ─── Color swatch row ─────────────────────────────────────────────────────────

function SwatchRow({ family, colors, activeColor, onPick }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-caption-2 text-muted-foreground/60 w-14 flex-shrink-0 text-right">{family}</span>
      <div className="flex gap-1 flex-wrap">
        {colors.map(hex => (
          <button
            key={hex}
            title={hex}
            onClick={() => onPick(hex)}
            className={cn(
              'w-6 h-6 md:w-5 md:h-5 rounded-sm border transition-all hover:scale-110',
              activeColor === hex
                ? 'border-primary shadow-[0_0_0_1px_var(--primary)]'
                : 'border-foreground/10 hover:border-foreground/30'
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParameterPanel({ params, colorA, colorB, onParamsChange, onColorAChange, onColorBChange, paletteA, paletteB, onPaletteAChange, onPaletteBChange }) {
  const { complexity, overlapChance, cornerChance } = params

  function set(key, val) {
    const newParams = { ...params, [key]: val }

    if (key.includes('Max')) {
      const minKey = key.replace('Max', 'Min')
      if (newParams[minKey] > val) newParams[minKey] = val
    } else if (key.includes('Min')) {
      const maxKey = key.replace('Min', 'Max')
      if (newParams[maxKey] < val) newParams[maxKey] = val
    }

    onParamsChange(newParams)
  }

  const effectivePaletteA = paletteA ?? [colorA]
  const effectivePaletteB = paletteB ?? [colorB]

  const [activeSlot, setActiveSlot] = useState('A')
  const [activePaletteIdx, setActivePaletteIdx] = useState(0)
  const [expandedGroup, setExpandedGroup] = useState('pattern')

  function handleSwatchSelect(slot, idx) {
    setActiveSlot(slot)
    setActivePaletteIdx(idx)
  }

  function handleSwatchRemove(slot, idx) {
    if (slot === 'A') {
      const next = effectivePaletteA.filter((_, i) => i !== idx)
      if (next.length === 0) return
      if (onPaletteAChange) onPaletteAChange(next)
      else onColorAChange(next[0])
      if (activePaletteIdx >= next.length) setActivePaletteIdx(next.length - 1)
    } else {
      const next = effectivePaletteB.filter((_, i) => i !== idx)
      if (next.length === 0) return
      if (onPaletteBChange) onPaletteBChange(next)
      else onColorBChange(next[0])
      if (activePaletteIdx >= next.length) setActivePaletteIdx(next.length - 1)
    }
    setActiveSlot(slot)
  }

  function handleSwatchAdd(slot) {
    if (slot === 'A') {
      const base = effectivePaletteA[activePaletteIdx] ?? effectivePaletteA[effectivePaletteA.length - 1]
      const next = [...effectivePaletteA, base]
      if (onPaletteAChange) onPaletteAChange(next)
      setActivePaletteIdx(next.length - 1)
      setActiveSlot('A')
    } else {
      const base = effectivePaletteB[activePaletteIdx] ?? effectivePaletteB[effectivePaletteB.length - 1]
      const next = [...effectivePaletteB, base]
      if (onPaletteBChange) onPaletteBChange(next)
      setActivePaletteIdx(next.length - 1)
      setActiveSlot('B')
    }
  }

  function pickColor(hex) {
    if (activeSlot === 'A') {
      const next = [...effectivePaletteA]
      next[activePaletteIdx] = hex
      if (onPaletteAChange) onPaletteAChange(next)
      onColorAChange(hex)  // always update live canvas preview
    } else {
      const next = [...effectivePaletteB]
      next[activePaletteIdx] = hex
      if (onPaletteBChange) onPaletteBChange(next)
      onColorBChange(hex)  // always update live canvas preview
    }
  }

  return (
    <div className="space-y-4">

      {/* ─── ACCORDION 1: PATTERN LOGIC ─── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandedGroup(expandedGroup === 'pattern' ? null : 'pattern')}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 text-footnote font-bold tracking-widest text-primary uppercase transition-all select-none cursor-pointer"
        >
          <span>Pattern Logic</span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", expandedGroup === 'pattern' && "rotate-180")} />
        </button>
        {expandedGroup === 'pattern' && (
          <div className="p-4 space-y-4 border-t border-border">
            <ParamRow label="2D Overlap Area">
              <Switch
                checked={overlapChance === 1}
                onToggle={() => set('overlapChance', overlapChance === 1 ? 0 : 1)}
              />
            </ParamRow>

            <ParamRow label="Exact Corners">
              <ParamSlider
                value={params.cornerAmount ?? 2}
                min={0}
                max={2}
                onChange={v => set('cornerAmount', v)}
              />
            </ParamRow>

            <ParamRow label="Min Blocks">
              <ParamSlider
                value={params.blockMin ?? 3}
                min={3}
                max={8}
                onChange={v => set('blockMin', v)}
              />
            </ParamRow>
            
            <ParamRow label="Max Blocks">
              <ParamSlider
                value={params.blockMax ?? 8}
                min={3}
                max={8}
                onChange={v => set('blockMax', v)}
              />
            </ParamRow>
          </div>
        )}
      </div>

      {/* ─── ACCORDION 2: START BLOCK ─── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandedGroup(expandedGroup === 'start' ? null : 'start')}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 text-footnote font-bold tracking-widest text-primary uppercase transition-all select-none cursor-pointer"
        >
          <span>Start Block</span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", expandedGroup === 'start' && "rotate-180")} />
        </button>
        {expandedGroup === 'start' && (
          <div className="p-4 space-y-4 border-t border-border">
            <ParamRow label="Start X">
              <ParamSlider value={params.startX ?? 0} min={0} max={15} onChange={v => set('startX', v)} />
            </ParamRow>
            <ParamRow label="Start Y">
              <ParamSlider value={params.startY ?? 15} min={0} max={15} onChange={v => set('startY', v)} />
            </ParamRow>
            <ParamRow label="Min Width">
              <ParamSlider value={params.startMinW ?? 2} min={1} max={14} onChange={v => set('startMinW', v)} />
            </ParamRow>
            <ParamRow label="Max Width">
              <ParamSlider value={params.startMaxW ?? 4} min={1} max={14} onChange={v => set('startMaxW', v)} />
            </ParamRow>
            <ParamRow label="Min Height">
              <ParamSlider value={params.startMinH ?? 4} min={1} max={14} onChange={v => set('startMinH', v)} />
            </ParamRow>
            <ParamRow label="Max Height">
              <ParamSlider value={params.startMaxH ?? 8} min={1} max={14} onChange={v => set('startMaxH', v)} />
            </ParamRow>
          </div>
        )}
      </div>

      {/* ─── ACCORDION 3: MIDDLE BLOCKS ─── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandedGroup(expandedGroup === 'middle' ? null : 'middle')}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 text-footnote font-bold tracking-widest text-primary uppercase transition-all select-none cursor-pointer"
        >
          <span>Middle Blocks</span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", expandedGroup === 'middle' && "rotate-180")} />
        </button>
        {expandedGroup === 'middle' && (
          <div className="p-4 space-y-4 border-t border-border">
            <ParamRow label="Min Width">
              <ParamSlider value={params.midMinW ?? 0} min={0} max={14} onChange={v => set('midMinW', v)} />
            </ParamRow>
            <ParamRow label="Max Width">
              <ParamSlider value={params.midMaxW ?? 0} min={0} max={14} onChange={v => set('midMaxW', v)} />
            </ParamRow>
            <ParamRow label="Min Height">
              <ParamSlider value={params.midMinH ?? 0} min={0} max={14} onChange={v => set('midMinH', v)} />
            </ParamRow>
            <ParamRow label="Max Height">
              <ParamSlider value={params.midMaxH ?? 0} min={0} max={14} onChange={v => set('midMaxH', v)} />
            </ParamRow>
            <ParamRow label="Curve">
              <ParamSlider value={params.midCurve ?? 50} min={0} max={100} onChange={v => set('midCurve', v)} />
            </ParamRow>
          </div>
        )}
      </div>

      {/* ─── ACCORDION 4: END BLOCK ─── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandedGroup(expandedGroup === 'end' ? null : 'end')}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 text-footnote font-bold tracking-widest text-primary uppercase transition-all select-none cursor-pointer"
        >
          <span>End Block</span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", expandedGroup === 'end' && "rotate-180")} />
        </button>
        {expandedGroup === 'end' && (
          <div className="p-4 space-y-4 border-t border-border">
            <ParamRow label="End X">
              <ParamSlider value={params.endX ?? 15} min={0} max={15} onChange={v => set('endX', v)} />
            </ParamRow>
            <ParamRow label="End Y">
              <ParamSlider value={params.endY ?? 5} min={0} max={15} onChange={v => set('endY', v)} />
            </ParamRow>
            <ParamRow label="Min Width">
              <ParamSlider value={params.endMinW ?? 6} min={1} max={14} onChange={v => set('endMinW', v)} />
            </ParamRow>
            <ParamRow label="Max Width">
              <ParamSlider value={params.endMaxW ?? 10} min={1} max={14} onChange={v => set('endMaxW', v)} />
            </ParamRow>
            <ParamRow label="Min Height">
              <ParamSlider value={params.endMinH ?? 4} min={1} max={14} onChange={v => set('endMinH', v)} />
            </ParamRow>
            <ParamRow label="Max Height">
              <ParamSlider value={params.endMaxH ?? 8} min={1} max={14} onChange={v => set('endMaxH', v)} />
            </ParamRow>
          </div>
        )}
      </div>

      {/* ─── ACCORDION 5: COLOR PALETTE ─── */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setExpandedGroup(expandedGroup === 'color' ? null : 'color')}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted/80 text-footnote font-bold tracking-widest text-primary uppercase transition-all select-none cursor-pointer"
        >
          <span>Color Palette</span>
          <ChevronDown size={14} className={cn("transition-transform duration-200", expandedGroup === 'color' && "rotate-180")} />
        </button>
        {expandedGroup === 'color' && (
          <div className="p-4 space-y-4 border-t border-border">
            <ParamRow label="Surface Colors">
              <PaletteSwatchRow
                palette={effectivePaletteA}
                slot="A"
                isActive={activeSlot === 'A'}
                activePaletteIdx={activePaletteIdx}
                onSelect={handleSwatchSelect}
                onRemove={handleSwatchRemove}
                onAdd={handleSwatchAdd}
              />
            </ParamRow>

            <ParamRow label="Background Colors">
              <PaletteSwatchRow
                palette={effectivePaletteB}
                slot="B"
                isActive={activeSlot === 'B'}
                activePaletteIdx={activePaletteIdx}
                onSelect={handleSwatchSelect}
                onRemove={handleSwatchRemove}
                onAdd={handleSwatchAdd}
              />
            </ParamRow>

            <ParamRow label={`Editing ${activeSlot === 'A' ? 'Surface' : 'Background'} · swatch ${(activeSlot === 'A' ? activePaletteIdx : activePaletteIdx) + 1}`}>
              {/* Brand swatches */}
              <div className="space-y-1">
                {Object.entries(BRAND_PALETTE).map(([family, colors]) => (
                  <SwatchRow
                    key={family}
                    family={family}
                    colors={colors}
                    activeColor={activeSlot === 'A' ? effectivePaletteA[activePaletteIdx] : effectivePaletteB[activePaletteIdx]}
                    onPick={pickColor}
                  />
                ))}
              </div>
            </ParamRow>
          </div>
        )}
      </div>

    </div>
  )
}

function PaletteSwatchRow({ palette, slot, isActive, activePaletteIdx, onSelect, onRemove, onAdd }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {palette.map((hex, i) => {
        const focused = isActive && activePaletteIdx === i
        return (
          <div key={i} className="relative group/swatch">
            <button
              onClick={() => onSelect(slot, i)}
              title={hex}
              className={cn(
                'w-7 h-7 rounded-sm border-2 transition-all',
                focused ? 'border-primary shadow-[0_0_0_1px_var(--primary)]' : 'border-foreground/10 hover:border-foreground/30'
              )}
              style={{ backgroundColor: hex }}
            />
            {palette.length > 1 && (
              <button
                onClick={e => { e.stopPropagation(); onRemove(slot, i) }}
                className="absolute -top-1.5 -right-1.5 opacity-0 group-hover/swatch:opacity-100 w-3.5 h-3.5 bg-destructive rounded-full text-destructive-foreground flex items-center justify-center transition-opacity text-[8px] leading-none"
              >×</button>
            )}
          </div>
        )
      })}
      <button
        onClick={() => onAdd(slot)}
        title="Add color"
        className="w-7 h-7 rounded-sm border border-dashed border-foreground/20 text-muted-foreground hover:border-primary hover:text-primary flex items-center justify-center transition-all"
      >
        <Plus size={10}/>
      </button>
    </div>
  )
}

function ParamRow({ label, children }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="min-w-0">
        <span className="text-footnote font-semibold text-foreground">{label}</span>
      </div>
      {children}
    </div>
  )
}
