const GALLERY_KEY = 'fnm-gallery-v1'

export const CATEGORIES = [
  { id: 'foundation', label: 'Foundation', description: 'Core brand patterns',    icon: '◆' },
  { id: 'dynamic',    label: 'Dynamic',    description: 'Energetic compositions', icon: '▲' },
  { id: 'minimal',    label: 'Minimal',    description: 'Clean, simple layouts',  icon: '□' },
  { id: 'featured',   label: 'Featured',   description: 'Curated highlights',     icon: '★' },
]

export function loadGallery() {
  try {
    return JSON.parse(localStorage.getItem(GALLERY_KEY) ?? '{"templates":[]}')
  } catch {
    return { templates: [] }
  }
}

function saveGallery(gallery) {
  localStorage.setItem(GALLERY_KEY, JSON.stringify(gallery))
}

export function addTemplate({ name, category, seed }) {
  const gallery = loadGallery()
  const t = { id: crypto.randomUUID(), name, category, seed, createdAt: Date.now() }
  gallery.templates = [t, ...gallery.templates]
  saveGallery(gallery)
  return gallery
}

export function removeTemplate(id) {
  const gallery = loadGallery()
  gallery.templates = gallery.templates.filter(t => t.id !== id)
  saveGallery(gallery)
  return gallery
}
