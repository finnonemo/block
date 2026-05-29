import { cn } from '@/lib/utils'
import { ROWS, COMPLEXITY, START_HEIGHT_OPTIONS, END_HEIGHT_OPTIONS, PALETTES, BRAND_PALETTE } from '@/utils/gridUtils'

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

// ─── Palette quick-pick ───────────────────────────────────────────────────────

function PaletteCard({ palette, active, onSelect }) {
  return (
    <button
      onClick={onSelect}
      title={palette.label}
      className={cn(
        'flex flex-col gap-1 p-1.5 rounded-md border transition-all',
        active
          ? 'border-[#50cfff] bg-[#0d2035]'
          : 'border-[#1e2d3d] bg-[#0c1926] hover:border-[#3a4a5a]'
      )}
    >
      <div className="flex gap-0.5">
        <span className="w-6 h-4 rounded-sm border border-white/10" style={{ backgroundColor: palette.background }} />
        <span className="w-6 h-4 rounded-sm border border-white/10" style={{ backgroundColor: palette.surface }} />
      </div>
      <span className="text-[9px] text-slate-500 leading-none">{palette.label}</span>
    </button>
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
  const { complexity, startHeight, endHeight = 0, overlapChance, cornerChance, volatility = 0 } = params

  function set(key, val) {
    onParamsChange({ ...params, [key]: val })
  }

  // Check if current colors match a preset palette
  const activePalette = PALETTES.find(p => p.surface === colorA && p.background === colorB)

  // Color picker active slot state (local to this component)
  const [activeSlot, setActiveSlot] = React.useState('A') // 'A' | 'B'

  function pickColor(hex) {
    if (activeSlot === 'A') onColorAChange(hex)
    else onColorBChange(hex)
  }

  return (
    <div className="space-y-5">

      {/* ── Complexity ─────────────────────────────────────────────── */}
      <ParamRow
        label="Complexity"
        hint={`${COMPLEXITY[complexity].label} · ${COMPLEXITY[complexity].description}`}
      >
        <SegGroup
          cols={4}
          options={Object.entries(COMPLEXITY).map(([v, m]) => ({
            value: Number(v),
            label: m.label,
            sub: m.description,
          }))}
          value={complexity}
          onChange={v => set('complexity', v)}
        />
      </ParamRow>

      {/* ── Start Height ───────────────────────────────────────────── */}
      <ParamRow
        label="Start Height"
        hint="Y-axis entry point for the first block"
      >
        <SegGroup
          options={START_HEIGHT_OPTIONS.map(o => ({ value: o.value, label: o.label, sub: o.sub }))}
          value={startHeight}
          onChange={v => set('startHeight', v)}
        />
      </ParamRow>

      {/* ── End Height ─────────────────────────────────────────────── */}
      <ParamRow
        label="End Height"
        hint="Y-axis exit point for the last block"
      >
        <SegGroup
          options={END_HEIGHT_OPTIONS.map(o => ({ value: o.value, label: o.label, sub: o.sub }))}
          value={endHeight}
          onChange={v => set('endHeight', v)}
        />
      </ParamRow>

      {/* ── Overlap Chance ─────────────────────────────────────────── */}
      <ParamRow
        label="Overlap Chance"
        hint="Horizontal overlap between adjacent groups"
      >
        <ParamSlider
          value={overlapChance}
          min={0}
          max={10}
          onChange={v => set('overlapChance', v)}
          formatLabel={v => `${v * 10}%`}
        />
      </ParamRow>

      {/* ── Corner Chance ──────────────────────────────────────────── */}
      <ParamRow
        label="Corner Chance"
        hint="Exact number of corner-to-corner meets"
      >
        <SegGroup
          options={[
            { value: 0, label: '0', sub: 'None' },
            { value: 1, label: '1', sub: '' },
            { value: 2, label: '2', sub: '' },
            { value: 3, label: '3', sub: 'Max' },
          ]}
          value={cornerChance}
          onChange={v => set('cornerChance', v)}
        />
      </ParamRow>

      {/* ── Trend Volatility ───────────────────────────────────────── */}
      <ParamRow
        label="Trend Volatility"
        hint="Controls block height (up to 14) and Y-step between blocks"
      >
        <ParamSlider
          value={params.volatility ?? 0}
          min={0}
          max={10}
          onChange={v => set('volatility', v)}
          formatLabel={v => v === 0 ? 'Off' : `${v * 10}%`}
        />
        {(params.volatility ?? 0) > 0 && (
          <p className="text-[10px] text-slate-600 mt-1 leading-tight">
            Max block height {Math.min(14, Math.max(2, Math.round((params.volatility / 10) * 14)))} · Y-step ±{Math.max(1, Math.round((params.volatility ?? 0) * 0.4 * ROWS))} rows
          </p>
        )}
      </ParamRow>

      {/* ── Color Palette ──────────────────────────────────────────── */}
      <ParamRow label="Color Palette" hint="Quick picks or select individual colors">

        {/* Preset palettes */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {PALETTES.map(p => (
            <PaletteCard
              key={p.id}
              palette={p}
              active={activePalette?.id === p.id}
              onSelect={() => { onColorAChange(p.surface); onColorBChange(p.background) }}
            />
          ))}
        </div>

        {/* Active color slots */}
        <div className="flex gap-2 mb-3">
          {[
            { slot: 'A', label: 'Surface', color: colorA },
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

// React must be imported for JSX in this file (useState)
import React from 'react'
