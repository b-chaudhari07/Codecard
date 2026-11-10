import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  clearCardOptions,
  loadCardOptions,
  migrateCardOptions,
  persistCardOptions,
} from './cardOptionsStorage'
import { DEFAULT_CARD_OPTIONS } from './cardThemes'

type Store = Record<string, string>

function makeLocalStorage(initial: Store = {}) {
  let data: Store = { ...initial }
  return {
    getItem: (key: string) => (key in data ? data[key] : null),
    setItem: (key: string, value: string) => {
      data = { ...data, [key]: value }
    },
    removeItem: (key: string) => {
      const next = { ...data }
      delete next[key]
      data = next
    },
    clear: () => {
      data = {}
    },
    key: (index: number) => Object.keys(data)[index] ?? null,
    get length() {
      return Object.keys(data).length
    },
    /** For assertions on what was written. */
    dump: () => data,
  }
}

function setStorage(storage: ReturnType<typeof makeLocalStorage> | null): void {
  activeStorage = storage
  if (storage) {
    vi.stubGlobal('localStorage', storage)
  } else {
    vi.unstubAllGlobals()
  }
}

let activeStorage: ReturnType<typeof makeLocalStorage> | null = null

beforeEach(() => {
  setStorage(makeLocalStorage())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('migrateCardOptions', () => {
  it('fills every missing field from the defaults', () => {
    const migrated = migrateCardOptions({ theme: 'minimal' })
    expect(migrated.theme).toBe('minimal')
    expect(migrated).toEqual({
      ...DEFAULT_CARD_OPTIONS,
      theme: 'minimal',
    })
  })

  it('repairs a broken or partially valid stats selection', () => {
    const migrated = migrateCardOptions({
      stats: ['boss', 'solved', 'nonsense'],
    })
    expect(migrated.stats).toHaveLength(6)
    expect(migrated.stats[0]).toBe('boss')
    expect(new Set(migrated.stats).size).toBe(6)
  })

  it('returns full defaults for nonsense payloads', () => {
    expect(migrateCardOptions(null)).toEqual({ ...DEFAULT_CARD_OPTIONS })
    expect(migrateCardOptions('junk')).toEqual({ ...DEFAULT_CARD_OPTIONS })
  })

  it('drops legacy accent fields during migration', () => {
    const migrated = migrateCardOptions({
      theme: 'minimal',
      accent: 'rose',
      customAccent: '#123456',
      autoRankColor: false,
    })
    expect(migrated.theme).toBe('minimal')
    expect(migrated).not.toHaveProperty('accent')
    expect(migrated).not.toHaveProperty('customAccent')
    expect(migrated).not.toHaveProperty('autoRankColor')
  })
})

describe('loadCardOptions / persistCardOptions', () => {
  it('round-trips options through localStorage', () => {
    const options = {
      ...DEFAULT_CARD_OPTIONS,
      theme: 'minimal' as const,
      showHeatmap: false,
    }
    persistCardOptions(options)
    expect(loadCardOptions()).toEqual(options)
  })

  it('falls back to defaults when nothing or invalid data is stored', () => {
    expect(loadCardOptions()).toEqual({ ...DEFAULT_CARD_OPTIONS })
    setStorage(makeLocalStorage({ 'codecard.card-options.v1': '{broken' }))
    expect(loadCardOptions()).toEqual({ ...DEFAULT_CARD_OPTIONS })
  })

  it('ignores payloads saved with the previous options version', () => {
    setStorage(
      makeLocalStorage({
        'codecard.card-options.v1': JSON.stringify({
          version: 1,
          options: { theme: 'minimal', accent: 'rose' },
        }),
      }),
    )
    expect(loadCardOptions()).toEqual({ ...DEFAULT_CARD_OPTIONS })
  })

  it('keeps oversized data URLs out of localStorage', () => {
    const big = `data:image/png;base64,${'a'.repeat(1024 * 1024 + 10)}`
    persistCardOptions({
      ...DEFAULT_CARD_OPTIONS,
      customPhoto: big,
    })

    const storage = activeStorage as ReturnType<typeof makeLocalStorage>
    const stored = JSON.parse(storage.dump()['codecard.card-options.v1'])
    expect(stored.options.customPhoto).toBeNull()
    expect(stored.options.theme).toBe(DEFAULT_CARD_OPTIONS.theme)
  })

  it('does not crash when the quota is exceeded', () => {
    const failing = makeLocalStorage()
    const originalSetItem = failing.setItem
    failing.setItem = (key: string, value: string) => {
      if (value.length > 5000) {
        throw new Error('QuotaExceededError')
      }
      originalSetItem(key, value)
    }
    setStorage(failing)

    const options = {
      ...DEFAULT_CARD_OPTIONS,
      customBanner: `data:image/png;base64,${'b'.repeat(5000)}`,
    }
    expect(() => persistCardOptions(options)).not.toThrow()
  })
})

describe('clearCardOptions', () => {
  it('removes the saved options', () => {
    persistCardOptions({
      ...DEFAULT_CARD_OPTIONS,
      showStats: false,
    })
    clearCardOptions()
    expect(loadCardOptions()).toEqual({ ...DEFAULT_CARD_OPTIONS })
  })
})
