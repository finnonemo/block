const LOCAL_KEY = 'fnm-gallery-v1'

export const CATEGORIES = [
  { id: 'foundation', label: 'Foundation', description: 'Core brand patterns',    icon: '◆' },
  { id: 'dynamic',    label: 'Dynamic',    description: 'Energetic compositions', icon: '▲' },
  { id: 'minimal',    label: 'Minimal',    description: 'Clean, simple layouts',  icon: '□' },
  { id: 'featured',   label: 'Featured',   description: 'Curated highlights',     icon: '★' },
]

// ─── Local (localStorage) gallery ────────────────────────────────────────────

export function loadGallery() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{"templates":[]}')
  } catch {
    return { templates: [] }
  }
}

function saveLocalGallery(gallery) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(gallery))
}

// ─── Shared gallery (public/gallery.json, served with the app) ───────────────

// Fetches the bundled gallery.json — visible to ALL users on ALL computers.
// Returns empty if the file is missing or malformed.
export async function fetchSharedGallery() {
  try {
    const res = await fetch('/gallery.json', { cache: 'no-cache' })
    if (!res.ok) return { templates: [] }
    const data = await res.json()
    return Array.isArray(data?.templates) ? data : { templates: [] }
  } catch {
    return { templates: [] }
  }
}

// Merge shared + local. Local entries take priority (deduped by ID).
export function mergeGalleries(shared, local) {
  const localIds = new Set(local.templates.map(t => t.id))
  return {
    templates: [
      ...local.templates,
      ...shared.templates.filter(t => !localIds.has(t.id)),
    ],
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// seed-based template (generated pattern):  { name, category, seed }
// blocks-based template (image / painted): { name, category, blocks, colorA, colorB }
export function addTemplate({ name, category, seed = null, blocks = null, colorA = null, colorB = null }) {
  const gallery = loadGallery()
  const base = { id: crypto.randomUUID(), name, category, createdAt: Date.now() }
  const t = seed
    ? { ...base, seed }
    : { ...base, blocks, colorA, colorB }
  gallery.templates = [t, ...gallery.templates]
  saveLocalGallery(gallery)
  return gallery
}

export function removeTemplate(id) {
  const gallery = loadGallery()
  gallery.templates = gallery.templates.filter(t => t.id !== id)
  saveLocalGallery(gallery)
  return gallery
}

// ─── Export / Import ──────────────────────────────────────────────────────────

// Download the provided gallery as gallery.json.
// Admin: export → place file in public/ → redeploy → all users see the templates.
export function exportGalleryFile(gallery) {
  const json = JSON.stringify(gallery, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'gallery.json'
  a.click()
  URL.revokeObjectURL(url)
}

// Replace the local gallery with data from an imported JSON file.
// Returns the parsed gallery, throws if the data is invalid.
export function importGalleryData(data) {
  if (!Array.isArray(data?.templates)) throw new Error('Invalid gallery.json format')
  saveLocalGallery(data)
  return data
}
