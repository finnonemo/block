import { DEFAULT_PARAMS } from '@/utils/gridUtils'

const LOCAL_KEY = 'fnm-dictionary-v1'

// ─── Local (localStorage) dictionary ─────────────────────────────────────────

export function loadDictionary() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '{"words":[]}')
  } catch {
    return { words: [] }
  }
}

function saveLocalDictionary(dict) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(dict))
}

// ─── Shared dictionary (public/dictionary.json) ───────────────────────────────

export async function fetchSharedDictionary() {
  try {
    const res = await fetch('/dictionary.json', { cache: 'no-cache' })
    if (!res.ok) return { words: [] }
    const data = await res.json()
    return Array.isArray(data?.words) ? data : { words: [] }
  } catch {
    return { words: [] }
  }
}

// Local entries take priority over shared (deduped by ID)
export function mergeDictionaries(shared, local) {
  const localIds = new Set(local.words.map(w => w.id))
  return {
    words: [
      ...local.words,
      ...shared.words.filter(w => !localIds.has(w.id)),
    ],
  }
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export function addWord({ word, description = '', tags = [], params, colorA, colorB, enabled }) {
  const dict  = loadDictionary()
  const entry = {
    id:          crypto.randomUUID(),
    word,
    description,
    tags:        Array.isArray(tags) ? tags : [],
    params:      params ?? { ...DEFAULT_PARAMS },
    colorA:      colorA ?? '#00e76b',
    colorB:      colorB ?? '#01172b',
    // enabled controls which categories are applied when user selects this word
    enabled:     enabled ?? { colors: true, params: true },
    createdAt:   Date.now(),
  }
  dict.words = [entry, ...dict.words]
  saveLocalDictionary(dict)
  return dict
}

export function updateWord(id, patch) {
  const dict = loadDictionary()
  dict.words = dict.words.map(w => w.id === id ? { ...w, ...patch } : w)
  saveLocalDictionary(dict)
  return dict
}

export function removeWord(id) {
  const dict = loadDictionary()
  dict.words = dict.words.filter(w => w.id !== id)
  saveLocalDictionary(dict)
  return dict
}

// ─── Export / Import ──────────────────────────────────────────────────────────

export function exportDictionaryFile(dict) {
  const json = JSON.stringify(dict, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = 'dictionary.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importDictionaryData(data) {
  if (!Array.isArray(data?.words)) throw new Error('Invalid dictionary.json format')
  saveLocalDictionary(data)
  return data
}
