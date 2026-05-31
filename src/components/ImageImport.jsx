import { useState, useCallback, useRef, useEffect } from 'react'
import { Upload, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getImagePixels, pixelsToBlocks } from '@/utils/imageUtils'

const GRID = 16

// Inline pixel-level SVG — renders each of the 256 cells individually
function PixelGridPreview({ blocks, colorA, colorB }) {
  return (
    <svg
      viewBox={`0 0 ${GRID} ${GRID}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' }}
    >
      {blocks.map((v, i) => (
        <rect
          key={i}
          x={i % GRID} y={Math.floor(i / GRID)}
          width={1} height={1}
          fill={v === 0 ? colorA : colorB}
        />
      ))}
    </svg>
  )
}

function Toggle({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          'relative w-8 h-4 rounded-full transition-colors shrink-0',
          value ? 'bg-primary' : 'bg-muted'
        )}
      >
        <span className={cn(
          'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all',
          value ? 'left-[18px]' : 'left-0.5'
        )} />
      </button>
      <span className="text-xs text-muted-foreground">{label}</span>
    </label>
  )
}

export function ImageImport({ onApply }) {
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [result, setResult]           = useState(null)   // { blocks, colorA, colorB }
  const [threshold, setThreshold]     = useState(128)
  const [invert, setInvert]           = useState(false)
  const [isDragging, setIsDragging]   = useState(false)
  const [useColors, setUseColors]     = useState(true)
  const [error, setError]             = useState(null)

  const pixelsRef   = useRef(null)   // cached ImageData (reused on threshold/invert change)
  const urlRef      = useRef(null)   // current object URL to revoke on unmount
  const fileInputRef = useRef(null)

  const recompute = useCallback((pixels, t, inv) => {
    if (!pixels) return
    setResult(pixelsToBlocks(pixels, t, inv))
  }, [])

  const handleFile = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, WebP…)')
      return
    }
    setError(null)
    try {
      const pixels = await getImagePixels(file)
      pixelsRef.current = pixels

      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      const url = URL.createObjectURL(file)
      urlRef.current = url
      setPreviewUrl(url)

      recompute(pixels, threshold, invert)
    } catch {
      setError('Could not process image — try another file')
    }
  }, [threshold, invert, recompute])

  // Re-process when threshold/invert change without re-loading the file
  useEffect(() => {
    recompute(pixelsRef.current, threshold, invert)
  }, [threshold, invert, recompute])

  // Cleanup object URL on unmount
  useEffect(() => () => { if (urlRef.current) URL.revokeObjectURL(urlRef.current) }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const activeFg  = result?.blocks.filter(v => v === 0).length ?? 0
  const hasContent = activeFg > 0

  return (
    <div className="p-4 space-y-4">

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
          isDragging
            ? 'border-primary bg-accent'
            : 'border-border hover:border-ring hover:bg-muted'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-xs text-muted-foreground font-medium">
          {previewUrl ? 'Replace image' : 'Drop image or click to browse'}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-1">PNG · JPG · WebP · any size</p>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      {previewUrl && result && (
        <>
          {/* Original + pixelated side-by-side */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                Original
              </p>
              <div className="aspect-square rounded-md overflow-hidden bg-muted border border-border">
                <img
                  src={previewUrl}
                  alt="uploaded"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                Grid 16×16
              </p>
              <div className="aspect-square rounded-md overflow-hidden border border-border">
                <PixelGridPreview
                  blocks={result.blocks}
                  colorA={result.colorA}
                  colorB={result.colorB}
                />
              </div>
            </div>
          </div>

          {/* Threshold slider */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-semibold text-foreground">Threshold</span>
              <span className="text-xs font-mono text-primary">{threshold}</span>
            </div>
            <input
              type="range" min={1} max={254} step={1}
              value={threshold}
              onChange={e => setThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[9px] text-muted-foreground/60 mt-0.5">
              <span>Darker → active</span>
              <span>Lighter → active</span>
            </div>
          </div>

          {/* Invert toggle */}
          <Toggle label="Invert (swap foreground / background)" value={invert} onChange={setInvert} />

          {/* Active cell count */}
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Active cells</span>
            <span className={cn('font-mono font-semibold',
              activeFg > 0 ? 'text-emerald-400' : 'text-amber-400')}>
              {activeFg} / 256
            </span>
          </div>

          {/* Detected colors */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Detected Colors
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                { label: 'Surface (A)', color: result.colorA },
                { label: 'Background (B)', color: result.colorB },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5 bg-muted border border-border rounded px-2 py-1.5">
                  <span className="w-4 h-4 rounded-sm border border-foreground/20 shrink-0" style={{ backgroundColor: color }} />
                  <div className="min-w-0">
                    <p className="text-[8px] text-muted-foreground/60 leading-none mb-0.5">{label}</p>
                    <p className="text-[9px] font-mono text-foreground truncate">{color}</p>
                  </div>
                </div>
              ))}
            </div>
            <Toggle label="Apply detected colors to canvas" value={useColors} onChange={setUseColors} />
          </div>

          {/* Apply */}
          <Button
            className="w-full gap-2 text-xs"
            disabled={!hasContent}
            onClick={() => onApply({
              blocks: result.blocks,
              ...(useColors ? { colorA: result.colorA, colorB: result.colorB } : {}),
            })}
          >
            <LayoutGrid size={13} />
            {hasContent ? 'Apply to Canvas' : 'No active cells — adjust threshold'}
          </Button>
        </>
      )}
    </div>
  )
}
