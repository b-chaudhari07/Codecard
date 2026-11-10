import { DEFAULT_STATS, sanitizeStats } from './cardStats'
import { DEFAULT_CARD_OPTIONS } from './cardThemes'
import type { CardOptions, StatId } from '../types/profile'

const OPTIONS_STORAGE_KEY = 'codecard.card-options.v1'
/** On-disk version for the options payload; migrations key off this. */
const OPTIONS_STORAGE_VERSION = 2
/** Data URLs larger than this stay in memory only. */
const MAX_PERSISTED_DATA_URL_BYTES = 1024 * 1024

function getStorage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === 'undefined') return null
    return globalThis.localStorage
  } catch {
    return null
  }
}

function isDataUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('data:')
}

/** Drops oversized data URLs so they never hit localStorage. */
function stripLargeDataUrls(options: CardOptions): CardOptions {
  const customPhoto =
    isDataUrl(options.customPhoto) &&
    options.customPhoto.length > MAX_PERSISTED_DATA_URL_BYTES
      ? null
      : options.customPhoto
  const customBanner =
    isDataUrl(options.customBanner) &&
    options.customBanner.length > MAX_PERSISTED_DATA_URL_BYTES
      ? null
      : options.customBanner
  return { ...options, customPhoto, customBanner }
}

/**
 * Fills in anything missing or invalid from the defaults, in particular the
 * six-slot stat selection, so an old or partial payload can never break
 * rendering.
 */
export function migrateCardOptions(
  stored: unknown,
): CardOptions {
  const defaults = DEFAULT_CARD_OPTIONS
  if (!stored || typeof stored !== 'object') {
    return { ...defaults }
  }
  // Strip fields removed in v2 so legacy payloads never leak them back in.
  const clean: Record<string, unknown> = { ...(stored as Record<string, unknown>) }
  delete clean.accent
  delete clean.customAccent
  delete clean.autoRankColor
  const partial = clean as Partial<CardOptions>
  const stats = sanitizeStats(
    Array.isArray(partial.stats) ? (partial.stats as StatId[]) : null,
  )
  return {
    ...defaults,
    ...partial,
    stats: stats.length > 0 ? stats : [...DEFAULT_STATS],
    customPhoto: partial.customPhoto ?? null,
    customBanner: partial.customBanner ?? null,
  }
}

export function loadCardOptions(): CardOptions {
  const storage = getStorage()
  if (!storage) return { ...DEFAULT_CARD_OPTIONS }
  try {
    const raw = storage.getItem(OPTIONS_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_CARD_OPTIONS }
    const parsed = JSON.parse(raw) as { version?: number; options?: unknown }
    if (!parsed || parsed.version !== OPTIONS_STORAGE_VERSION) {
      // Future versions migrate here; unknown versions fall back to defaults.
      return { ...DEFAULT_CARD_OPTIONS }
    }
    return migrateCardOptions(parsed.options)
  } catch {
    return { ...DEFAULT_CARD_OPTIONS }
  }
}

export function persistCardOptions(options: CardOptions): void {
  const storage = getStorage()
  if (!storage) return

  const payload = JSON.stringify({
    version: OPTIONS_STORAGE_VERSION,
    options: stripLargeDataUrls(options),
  })

  try {
    storage.setItem(OPTIONS_STORAGE_KEY, payload)
  } catch {
    // Quota errors (e.g. Safari private mode) are non-fatal; the card keeps
    // working from memory.
    try {
      const fallback = JSON.stringify({
        version: OPTIONS_STORAGE_VERSION,
        options: { ...stripLargeDataUrls(options), customPhoto: null, customBanner: null },
      })
      storage.setItem(OPTIONS_STORAGE_KEY, fallback)
    } catch {
      /* ignore */
    }
  }
}

export function clearCardOptions(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(OPTIONS_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
