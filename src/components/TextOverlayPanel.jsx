import { useRef, useState } from 'react'
import { Type, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const FONT_FAMILIES = [
  { value: 'FinnomenaTrek, sans-serif',     label: 'FinnomenaTrek' },
  { value: '"Space Grotesk", sans-serif',   label: 'Space Grotesk' },
  { value: '"Space Mono", monospace',       label: 'Space Mono' },
  { value: 'sans-serif',                    label: 'Sans Serif' },
  { value: 'serif',                         label: 'Serif' },
  { value: 'monospace',                     label: 'Monospace' },
]

const DEFAULT_TEXT_OVERLAY = {
  x: 0.5, y: 0.5,
  fontSize: 0.08,
  fontFamily: 'FinnomenaTrek, sans-serif',
  fontWeight: '700',
  fontStyle: 'normal',
  color: '#ffffff',
  textAnchor: 'middle',
  opacity: 1,
}

function Slider({ label, value, min, max, step, onChange, display }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-footnote font-semibold text-foreground">{label}</span>
        <span className="text-footnote font-mono text-primary">{display ?? value}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex gap-1">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 py-1 rounded text-caption-2 font-semibold border transition-all',
            value === opt.value
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border hover:border-ring'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
      {children}
    </p>
  )
}

export function TextOverlayPanel({ textOverlay, onTextOverlayChange }) {
  const [draft, setDraft] = useState('')

  const set = (field, value) => onTextOverlayChange({ ...textOverlay, [field]: value })

  // ── Empty state ───────────────────────────────────────────────────────────────
  if (!textOverlay) {
    return (
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Enter your text…"
            rows={3}
            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-footnote text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:border-ring transition-colors"
          />
          <Button
            className="w-full gap-2 text-footnote"
            disabled={!draft.trim()}
            onClick={() => onTextOverlayChange({ ...DEFAULT_TEXT_OVERLAY, content: draft.trim() })}
          >
            <Type size={13} />
            Add to Canvas
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
          Text appears on top of the pattern. Adjust position, typography, and style after adding.
        </p>
      </div>
    )
  }

  // ── Active state ──────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">

      {/* Header: editable text + remove */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <input
            value={textOverlay.content}
            onChange={e => set('content', e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-2.5 py-1.5 text-footnote text-foreground focus:outline-none focus:border-ring transition-colors"
            placeholder="Text content…"
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground mt-0.5"
          onClick={() => { onTextOverlayChange(null); setDraft('') }}
          title="Remove text"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Position */}
      <div className="space-y-3">
        <SectionLabel>Position</SectionLabel>
        <Slider
          label="X"
          value={textOverlay.x}
          min={0} max={1} step={0.01}
          display={`${(textOverlay.x * 100).toFixed(0)}%`}
          onChange={v => set('x', v)}
        />
        <Slider
          label="Y"
          value={textOverlay.y}
          min={0} max={1} step={0.01}
          display={`${(textOverlay.y * 100).toFixed(0)}%`}
          onChange={v => set('y', v)}
        />
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <SectionLabel>Typography</SectionLabel>

        {/* Font family */}
        <div>
          <span className="text-footnote font-semibold text-foreground block mb-1.5">Font</span>
          <select
            value={textOverlay.fontFamily}
            onChange={e => set('fontFamily', e.target.value)}
            className="w-full bg-muted border border-border rounded-md px-2.5 py-1.5 text-footnote text-foreground focus:outline-none focus:border-ring transition-colors"
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <Slider
          label="Size"
          value={textOverlay.fontSize}
          min={0.03} max={0.25} step={0.005}
          display={`${(textOverlay.fontSize * 100).toFixed(0)}%`}
          onChange={v => set('fontSize', v)}
        />

        {/* Weight */}
        <div>
          <span className="text-footnote font-semibold text-foreground block mb-1.5">Weight</span>
          <ToggleGroup
            value={textOverlay.fontWeight}
            onChange={v => set('fontWeight', v)}
            options={[
              { value: '400', label: 'Regular' },
              { value: '500', label: 'Medium' },
              { value: '700', label: 'Bold' },
            ]}
          />
        </div>

        {/* Style */}
        <div>
          <span className="text-footnote font-semibold text-foreground block mb-1.5">Style</span>
          <ToggleGroup
            value={textOverlay.fontStyle}
            onChange={v => set('fontStyle', v)}
            options={[
              { value: 'normal', label: 'Normal' },
              { value: 'italic', label: 'Italic' },
            ]}
          />
        </div>

        {/* Alignment */}
        <div>
          <span className="text-footnote font-semibold text-foreground block mb-1.5">Align</span>
          <ToggleGroup
            value={textOverlay.textAnchor}
            onChange={v => set('textAnchor', v)}
            options={[
              { value: 'start',  label: 'Left' },
              { value: 'middle', label: 'Center' },
              { value: 'end',    label: 'Right' },
            ]}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-3">
        <SectionLabel>Appearance</SectionLabel>

        {/* Color */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-footnote font-semibold text-foreground">Color</span>
            <span className="text-footnote font-mono text-primary uppercase">{textOverlay.color}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={textOverlay.color}
              onChange={e => set('color', e.target.value)}
              className="w-8 h-8 rounded border border-border bg-muted cursor-pointer p-0.5"
            />
            <div
              className="flex-1 h-8 rounded border border-border"
              style={{ backgroundColor: textOverlay.color }}
            />
          </div>
        </div>

        {/* Opacity */}
        <Slider
          label="Opacity"
          value={textOverlay.opacity}
          min={0} max={1} step={0.01}
          display={`${Math.round(textOverlay.opacity * 100)}%`}
          onChange={v => set('opacity', v)}
        />
      </div>
    </div>
  )
}
