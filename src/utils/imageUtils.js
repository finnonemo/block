// ─── Image utilities ─────────────────────────────────────────────────────────

// Load an image file, resize it so its longest edge is at most maxSize px,
// and return a base64 JPEG data URL plus the image's aspect ratio.
// Used for the Image Fill overlay feature (NOT the Convert-to-Grid tool).
export function loadImageAsDataUrl(file, maxSize = 800) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, maxSize / Math.max(w, h))
      const canvas = document.createElement('canvas')
      canvas.width  = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve({
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        aspectRatio: h / w,
      })
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
    img.src = url
  })
}

// ─── Image → 16×16 Grid conversion utilities ─────────────────────────────────

const GRID = 16  // always 16×16

// Load an image file and scale it to GRID×GRID, returning the raw pixel data.
// The image is center-cropped to a square before scaling.
export function getImagePixels(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = GRID
      canvas.height = GRID
      const ctx = canvas.getContext('2d', { willReadFrequently: true })

      // Center-crop to square
      const sw = img.naturalWidth, sh = img.naturalHeight
      let sx = 0, sy = 0, sdx = sw, sdy = sh
      if (sw > sh) { sdx = sh; sx = (sw - sh) / 2 }
      else if (sh > sw) { sdy = sw; sy = (sh - sw) / 2 }

      ctx.drawImage(img, sx, sy, sdx, sdy, 0, 0, GRID, GRID)
      URL.revokeObjectURL(url)
      resolve(ctx.getImageData(0, 0, GRID, GRID))
    }

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Load failed')) }
    img.src = url
  })
}

// Convert cached pixel data to a blocks array + dominant colors.
// threshold: 0–255 luminance cutoff (pixels below = foreground)
// invert:    flip foreground/background assignment
export function pixelsToBlocks(imageData, threshold = 128, invert = false) {
  const { data } = imageData
  const blocks   = []
  const fgPixels = []
  const bgPixels = []

  for (let i = 0; i < GRID * GRID; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3]

    if (a < 128) {
      blocks.push(1)
      bgPixels.push([r, g, b])
      continue
    }

    const lum  = 0.299 * r + 0.587 * g + 0.114 * b
    const isFg = invert ? lum >= threshold : lum < threshold

    if (isFg) { blocks.push(0); fgPixels.push([r, g, b]) }
    else       { blocks.push(1); bgPixels.push([r, g, b]) }
  }

  return {
    blocks,
    colorA: medianColor(fgPixels) || '#00e76b',
    colorB: medianColor(bgPixels) || '#01172b',
  }
}

// ─── Internal helpers ────────────────────────────────────────────────────────

function medianColor(pixels) {
  if (pixels.length === 0) return null
  return `#${hex(median(pixels.map(p => p[0])))}${hex(median(pixels.map(p => p[1])))}${hex(median(pixels.map(p => p[2])))}`
}

function median(arr) {
  const s   = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 === 0 ? Math.round((s[mid - 1] + s[mid]) / 2) : s[mid]
}

function hex(n) {
  return Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
}
