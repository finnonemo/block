import { useCallback, useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { loadImageAsDataUrl } from '@/utils/imageUtils'

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

export function ImageOverlayPanel({ imageOverlay, onImageOverlayChange }) {
  const fileInputRef    = useRef(null)
  const changeInputRef  = useRef(null)

  const handleFile = useCallback(async (file) => {
    if (!file?.type.startsWith('image/')) return
    try {
      const { dataUrl, aspectRatio } = await loadImageAsDataUrl(file, 800)
      onImageOverlayChange({ dataUrl, aspectRatio, x: 0, y: 0, scale: 1, opacity: 1 })
    } catch {
      // silently ignore load errors
    }
  }, [onImageOverlayChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const set = useCallback((field, value) => {
    onImageOverlayChange({ ...imageOverlay, [field]: value })
  }, [imageOverlay, onImageOverlayChange])

  // ── Upload state ─────────────────────────────────────────────────────────────
  if (!imageOverlay) {
    return (
      <div className="p-4">
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all border-border hover:border-ring hover:bg-muted"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />
          <Upload size={20} className="mx-auto mb-2 text-muted-foreground" />
          <p className="text-footnote text-muted-foreground font-medium">Drop image or click to browse</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">PNG · JPG · WebP · any size</p>
        </div>
        <p className="text-[10px] text-muted-foreground/50 mt-3 leading-relaxed">
          The image will be clipped to the block pattern shapes. Adjust position, scale, and opacity after uploading.
        </p>
      </div>
    )
  }

  // ── Active state ──────────────────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">
      {/* Header: thumbnail + change + remove */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-md overflow-hidden border border-border shrink-0 bg-muted">
          <img src={imageOverlay.dataUrl} alt="overlay" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-footnote font-semibold text-foreground">Image Fill</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Clipped to block shapes</p>
        </div>
        <input
          ref={changeInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <Button
          size="sm"
          variant="outline"
          className="text-[10px] h-7 px-2 shrink-0"
          onClick={() => changeInputRef.current?.click()}
        >
          <ImageIcon size={11} className="mr-1" />
          Change
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => onImageOverlayChange(null)}
          title="Remove image"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Sliders */}
      <Slider
        label="Position X"
        value={imageOverlay.x}
        min={-0.5} max={0.5} step={0.01}
        display={`${imageOverlay.x >= 0 ? '+' : ''}${(imageOverlay.x * 100).toFixed(0)}%`}
        onChange={v => set('x', v)}
      />
      <Slider
        label="Position Y"
        value={imageOverlay.y}
        min={-0.5} max={0.5} step={0.01}
        display={`${imageOverlay.y >= 0 ? '+' : ''}${(imageOverlay.y * 100).toFixed(0)}%`}
        onChange={v => set('y', v)}
      />
      <Slider
        label="Scale"
        value={imageOverlay.scale}
        min={0.5} max={3} step={0.05}
        display={`${imageOverlay.scale.toFixed(2)}×`}
        onChange={v => set('scale', v)}
      />
      <Slider
        label="Opacity"
        value={imageOverlay.opacity}
        min={0} max={1} step={0.01}
        display={`${Math.round(imageOverlay.opacity * 100)}%`}
        onChange={v => set('opacity', v)}
      />
    </div>
  )
}
