import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ROWS, COMPLEXITY, START_HEIGHT_OPTIONS, END_HEIGHT_OPTIONS, BRAND_PALETTE, COLOR_PAIRS } from '@/utils/gridUtils'

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
            'flex flex-col items-center justify-center min-w-[40px] h-11 md:h-9 px-2 rounded-md text-xs font-semibold transition-all border',
            value === opt.value
              ? 'bg-[#50cfff] text-[#01172b] border-[#50cfff] shadow-sm'
              : 'bg-[#0c1926] text-slate-400 border-[#1e2d3d] hover:border-[#3a4a5a] hover:text-slate-200',
            disabled && 'opacity-30 pointer-events-none'
          )}
        >
          <span>{opt.label}</span>
          {opt.sub && (
            <span className={cn('text-[9px] mt-px font-normal', value === opt.value ? 'text-[#01172b]/70' : 'text-slate-600')}>
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
        className="flex-1 h-4 md:h-1.5 accent-[#50cfff] cursor-pointer touch-manipulation"
        style={{ accentColor: '#50cfff' }}
      />
      <span className="text-xs font-mono text-[#50cfff] w-10 text-right shrink-0">
        {formatLabel ? formatLabel(value) : value}
      </span>
    </div>
  )
}

// ─── Color pair picker ────────────────────────────────────────────────────────

const COLOR_PAIR_GROUPS = [...new Set(COLOR_PAIRS.map(p => p.group))]

function ColorPairPicker({ colorA, colorB, onSelectPair }) {
  const [openGroup, setOpenGroup] = useState(null)
  const activePair = COLOR_PAIRS.find(p => p.surface === colorA && p.background === colorB)

  return (
    <div className="space-y-1.5">
      {COLOR_PAIR_GROUPS.map(group => {
        const pairs   = COLOR_PAIRS.filter(p => p.group === group)
        const hasActive = pairs.some(p => p.id === activePair?.id)
        const isOpen  = openGroup === group || hasActive

        return (
          <div key={group}>
            <button
              onClick={() => setOpenGroup(isOpen && !hasActive ? null : group)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all',
                hasActive ? 'bg-[#0d2035] border border-[#50cfff]/40 text-white' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <span className="font-semibold flex-1 text-left">{group}</span>
              {hasActive && (
                <span className="flex gap-1">
                  <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: colorA }} />
                  <span className="w-3 h-3 rounded-sm border border-white/20" style={{ backgroundColor: colorB }} />
                </span>
              )}
              <span className="text-[10px] opacity-40">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
              <div className="mt-1 space-y-0.5 pl-1">
                {pairs.map(pair => (
                  <button
                    key={pair.id}
                    onClick={() => onSelectPair(pair)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-all border',
                      activePair?.id === pair.id
                        ? 'border-[#50cfff] bg-[#0d2035] text-white'
                        : 'border-transparent text-slate-400 hover:border-[#1e2d3d] hover:text-slate-200'
                    )}
                  >
                    <span className="flex gap-0.5 shrink-0">
                      <span className="w-5 h-5 rounded-sm border border-white/10" style={{ backgroundColor: pair.surface }} />
                      <span className="w-5 h-5 rounded-sm border border-white/10" style={{ backgroundColor: pair.background }} />
                    </span>
                    <span className="flex-1 text-left">{pair.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Color swatch row ─────────────────────────────────────────────────────────

function SwatchRow({ family, colors, activeColor, onPick }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-600 w-14 flex-shrink-0 text-right">{family}</span>
      <div className="flex gap-1 flex-wrap">
        {colors.map(hex => (
          <button
            key={hex}
            title={hex}
            onClick={() => onPick(hex)}
            className={cn(
              'w-6 h-6 md:w-5 md:h-5 rounded-sm border transition-all hover:scale-110',
              activeColor === hex
                ? 'border-[#50cfff] shadow-[0_0_0_1px_#50cfff]'
                : 'border-white/10 hover:border-white/30'
            )}
            style={{ backgroundColor: hex }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParameterPanel({ params, colorA, colorB, onParamsChange, onColorAChange, onColorBChange }) {
  const { complexity, overlapChance, cornerChance } = params

  function set(key, val) {
    const newParams = { ...params, [key]: val }
    
    if (key.includes('Max')) {
      const minKey = key.replace('Max', 'Min')
      if (newParams[minKey] > val && val > 0) {
        newParams[minKey] = val
      }
    } else if (key.includes('Min')) {
      const maxKey = key.replace('Min', 'Max')
      if (newParams[maxKey] > 0 && newParams[maxKey] < val) {
        newParams[maxKey] = val
      }
    }

    onParamsChange(newParams)
  }

  const [activeSlot, setActiveSlot] = useState('A')

  function pickColor(hex) {
    if (activeSlot === 'A') onColorAChange(hex)
    else onColorBChange(hex)
  }

  return (
    <div className="space-y-5">

      {/* ── 2D Overlap Area ───────────────────────────────────────────── */}
      <ParamRow
        label="2D Overlap Area"
        hint="Allow blocks to physically overlap in 2D space"
      >
        <button
          onClick={() => set('overlapChance', overlapChance === 1 ? 0 : 1)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
            overlapChance === 1 ? 'bg-[#50cfff]' : 'bg-[#1e2d3d]'
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
              overlapChance === 1 ? 'translate-x-4' : 'translate-x-0'
            )}
          />
        </button>
      </ParamRow>

      {/* ── Block Amount ────────────────────────────────────────────── */}
      <ParamRow
        label="Min Blocks"
        hint="Minimum number of blocks to generate"
      >
        <ParamSlider
          value={params.blockMin ?? 3}
          min={3}
          max={8}
          onChange={v => set('blockMin', v)}
        />
      </ParamRow>
      <ParamRow
        label="Max Blocks"
        hint="Maximum number of blocks to generate"
      >
        <ParamSlider
          value={params.blockMax ?? 8}
          min={3}
          max={8}
          onChange={v => set('blockMax', v)}
        />
      </ParamRow>





      {/* ── Start Block ────────────────────────────────────────────────── */}
      <div className="space-y-3 bg-[#0c1926] p-3 rounded-lg border border-[#1e2d3d]">
        <h4 className="text-[10px] font-bold tracking-widest text-[#50cfff] uppercase">Start Block</h4>
        <ParamRow label="Start X" hint="X-coordinate for the Bottom-Left corner">
          <ParamSlider value={params.startX ?? 0} min={0} max={15} onChange={v => set('startX', v)} />
        </ParamRow>
        <ParamRow label="Start Y" hint="Y-coordinate for the Bottom-Left corner">
          <ParamSlider value={params.startY ?? 15} min={0} max={15} onChange={v => set('startY', v)} />
        </ParamRow>
        <ParamRow label="Min Width" hint="Minimum width of the first block">
          <ParamSlider value={params.startMinW ?? 2} min={1} max={14} onChange={v => set('startMinW', v)} />
        </ParamRow>
        <ParamRow label="Max Width" hint="Maximum width of the first block">
          <ParamSlider value={params.startMaxW ?? 4} min={1} max={14} onChange={v => set('startMaxW', v)} />
        </ParamRow>
        <ParamRow label="Min Height" hint="Minimum height of the first block">
          <ParamSlider value={params.startMinH ?? 4} min={1} max={14} onChange={v => set('startMinH', v)} />
        </ParamRow>
        <ParamRow label="Max Height" hint="Maximum height of the first block">
          <ParamSlider value={params.startMaxH ?? 8} min={1} max={14} onChange={v => set('startMaxH', v)} />
        </ParamRow>
      </div>

      {/* ── Middle Blocks ────────────────────────────────────────────────── */}
      <div className="space-y-3 bg-[#0c1926] p-3 rounded-lg border border-[#1e2d3d]">
        <h4 className="text-[10px] font-bold tracking-widest text-[#50cfff] uppercase">Middle Blocks</h4>
        <ParamRow label="Min Width" hint="Minimum width of middle blocks (0 = Random)">
          <ParamSlider value={params.midMinW ?? 0} min={0} max={14} onChange={v => set('midMinW', v)} />
        </ParamRow>
        <ParamRow label="Max Width" hint="Maximum width of middle blocks (0 = Random)">
          <ParamSlider value={params.midMaxW ?? 0} min={0} max={14} onChange={v => set('midMaxW', v)} />
        </ParamRow>
        <ParamRow label="Min Height" hint="Minimum height of middle blocks (0 = Random)">
          <ParamSlider value={params.midMinH ?? 0} min={0} max={14} onChange={v => set('midMinH', v)} />
        </ParamRow>
        <ParamRow label="Max Height" hint="Maximum height of middle blocks (0 = Random)">
          <ParamSlider value={params.midMaxH ?? 0} min={0} max={14} onChange={v => set('midMaxH', v)} />
        </ParamRow>
        <ParamRow label="Curve" hint="Growth curve (0 = steep, 50 = linear, 100 = late drop)">
          <ParamSlider value={params.midCurve ?? 50} min={0} max={100} onChange={v => set('midCurve', v)} />
        </ParamRow>
      </div>

      {/* ── End Block ──────────────────────────────────────────────────── */}
      <div className="space-y-3 bg-[#0c1926] p-3 rounded-lg border border-[#1e2d3d]">
        <h4 className="text-[10px] font-bold tracking-widest text-[#50cfff] uppercase">End Block</h4>
        <ParamRow label="End X" hint="X-coordinate for the Top-Right corner">
          <ParamSlider value={params.endX ?? 15} min={0} max={15} onChange={v => set('endX', v)} />
        </ParamRow>
        <ParamRow label="End Y" hint="Y-coordinate for the Top-Right corner">
          <ParamSlider value={params.endY ?? 5} min={0} max={15} onChange={v => set('endY', v)} />
        </ParamRow>
        <ParamRow label="Min Width" hint="Minimum width of the last block">
          <ParamSlider value={params.endMinW ?? 6} min={1} max={14} onChange={v => set('endMinW', v)} />
        </ParamRow>
        <ParamRow label="Max Width" hint="Maximum width of the last block">
          <ParamSlider value={params.endMaxW ?? 10} min={1} max={14} onChange={v => set('endMaxW', v)} />
        </ParamRow>
        <ParamRow label="Min Height" hint="Minimum height of the last block">
          <ParamSlider value={params.endMinH ?? 4} min={1} max={14} onChange={v => set('endMinH', v)} />
        </ParamRow>
        <ParamRow label="Max Height" hint="Maximum height of the last block">
          <ParamSlider value={params.endMaxH ?? 8} min={1} max={14} onChange={v => set('endMaxH', v)} />
        </ParamRow>
      </div>

      {/* ── Color Palette ──────────────────────────────────────────── */}
      <ParamRow label="Color Pairs" hint="Preset brand pairs">
        <ColorPairPicker
          colorA={colorA}
          colorB={colorB}
          onSelectPair={pair => { onColorAChange(pair.surface); onColorBChange(pair.background) }}
        />
      </ParamRow>

      {/* ── Custom Colors ──────────────────────────────────────────── */}
      <ParamRow label="Custom Colors" hint="Pick individual colors">
        {/* Active color slots */}
        <div className="flex gap-2 mb-3">
          {[
            { slot: 'A', label: 'Surface',    color: colorA },
            { slot: 'B', label: 'Background', color: colorB },
          ].map(({ slot, label, color }) => (
            <button
              key={slot}
              onClick={() => setActiveSlot(slot)}
              className={cn(
                'flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium border transition-all',
                activeSlot === slot
                  ? 'border-[#50cfff] bg-[#0d2035] text-white'
                  : 'border-[#1e2d3d] bg-[#0c1926] text-slate-500 hover:border-[#2a3a4a]'
              )}
            >
              <span className="w-3 h-3 rounded-sm flex-shrink-0 border border-white/20" style={{ backgroundColor: color }} />
              <span className="truncate">{label}</span>
              <span className="ml-auto font-mono text-[9px] opacity-50 shrink-0">{color}</span>
            </button>
          ))}
        </div>

        {/* Brand swatches */}
        <div className="space-y-1">
          {Object.entries(BRAND_PALETTE).map(([family, colors]) => (
            <SwatchRow
              key={family}
              family={family}
              colors={colors}
              activeColor={activeSlot === 'A' ? colorA : colorB}
              onPick={pickColor}
            />
          ))}
        </div>
      </ParamRow>

    </div>
  )
}

function ParamRow({ label, hint, children }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-baseline justify-between gap-2 min-w-0">
        <span className="text-xs font-semibold text-slate-300 shrink-0">{label}</span>
        {hint && <span className="text-[10px] text-slate-600 text-right leading-tight min-w-0">{hint}</span>}
      </div>
      {children}
    </div>
  )
}
