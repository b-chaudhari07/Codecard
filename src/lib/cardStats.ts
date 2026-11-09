import { formatNumber } from './utils'
import type { Profile, StatId } from '../types/profile'

/**
 * All selectable stat tiles, in display order. The first six are the default
 * basket used by `DEFAULT_CARD_OPTIONS`.
 */
export const STAT_POOL: StatId[] = [
  'boss',
  'solved',
  'streak',
  'peakDay',
  'grit',
  'contests',
  'activeDays',
  'maxRating',
]

/** Default six-tile selection, in display order. */
export const DEFAULT_STATS: StatId[] = [
  'boss',
  'solved',
  'streak',
  'peakDay',
  'grit',
  'contests',
]

export interface StatTile {
  /** Stat id, or a synthetic id for the unavailable placeholder. */
  id: string
  label: string
  icon: string
  value: string
  caption: string
}

interface StatResolution {
  value: string
  caption: string
  /**
   * True when the underlying submission history was capped by the API
   * pagination limit; captions then carry a trailing "~".
   */
  partial: boolean
}

interface StatDefinition {
  id: StatId
  label: string
  icon: string
  /** Null when the stat cannot be computed for this profile. */
  resolve: (profile: Profile) => StatResolution | null
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Compact local date for the peak-day caption, e.g. "Aug 15". */
function compactDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

const STAT_DEFINITIONS: StatDefinition[] = [
  {
    id: 'boss',
    label: 'Boss',
    icon: '👑',
    resolve: (profile) => {
      const hardest = profile.hardestProblem
      if (!hardest) return null
      return {
        value: formatNumber(hardest.rating),
        caption: hardest.name,
        partial: false,
      }
    },
  },
  {
    id: 'solved',
    label: 'Solved',
    icon: '✅',
    resolve: (profile) => {
      if (!profile.submissionsAvailable || profile.problemsSolved === null) {
        return null
      }
      return {
        value: formatNumber(profile.problemsSolved),
        caption: 'unique problems',
        partial: false,
      }
    },
  },
  {
    id: 'streak',
    label: 'Streak',
    icon: '🔥',
    resolve: (profile) => {
      if (!profile.submissionsAvailable || !profile.submissionActivity) {
        return null
      }
      return {
        value: formatNumber(profile.submissionActivity.longestStreak),
        caption: 'days in a row',
        partial: false,
      }
    },
  },
  {
    id: 'peakDay',
    label: 'Peak day',
    icon: '⚡',
    resolve: (profile) => {
      const hasData = profile.peakDay.count > 0 && profile.peakDay.date !== null
      if (!hasData) return null
      return {
        value: formatNumber(profile.peakDay.count),
        caption: `solved on ${compactDate(profile.peakDay.date as string)}`,
        partial: profile.peakDay.partial,
      }
    },
  },
  {
    id: 'grit',
    label: 'Grit',
    icon: '🧱',
    resolve: (profile) => {
      if (!profile.submissionsAvailable) return null
      return {
        value: formatNumber(profile.grit.count),
        caption: 'wrongs, then AC',
        partial: profile.grit.partial,
      }
    },
  },
  {
    id: 'contests',
    label: 'Contests',
    icon: '🏁',
    resolve: (profile) => {
      if (!profile.ratingHistoryAvailable || profile.contests <= 0) return null
      return {
        value: formatNumber(profile.contests),
        caption: 'rated rounds',
        partial: false,
      }
    },
  },
  {
    id: 'activeDays',
    label: 'Active days',
    icon: '📆',
    resolve: (profile) => {
      if (!profile.submissionsAvailable || !profile.submissionActivity) {
        return null
      }
      const activeDays = profile.submissionActivity.windowActiveDays
      if (activeDays <= 0) return null
      return {
        value: formatNumber(activeDays),
        caption: 'active days',
        partial: false,
      }
    },
  },
  {
    id: 'maxRating',
    label: 'Peak',
    icon: '🏆',
    resolve: (profile) => {
      const maxRating = profile.maxRating ?? null
      if (maxRating === null) return null
      return {
        value: formatNumber(maxRating),
        caption: 'peak rating',
        partial: false,
      }
    },
  },
]

const STAT_BY_ID = new Map(STAT_DEFINITIONS.map((stat) => [stat.id, stat]))

/** Cheap labels for the customizer select controls. */
export const STAT_LABELS: Record<StatId, { label: string; icon: string }> =
  Object.fromEntries(
    STAT_DEFINITIONS.map(({ id, label, icon }) => [id, { label, icon }]),
  ) as Record<StatId, { label: string; icon: string }>

/** The placeholder tile shown only when every stat is unavailable. */
const UNAVAILABLE_TILE: Omit<StatTile, 'id'> = {
  label: '—',
  icon: '—',
  value: '—',
  caption: 'unavailable',
}

/** Every selection shows exactly six tiles. */
export const STAT_POOL_BASE_COUNT = 6

/**
 * Removes duplicates and unknown ids from a selection, filling up to six
 * slots from the pool in display order. Used by migration and defensively by
 * the customizer so a stored selection can never break the card.
 */
export function sanitizeStats(stats: StatId[] | null | undefined): StatId[] {
  const valid = new Set(STAT_POOL)
  const result: StatId[] = []
  for (const id of stats ?? []) {
    if (valid.has(id) && !result.includes(id)) {
      result.push(id)
    }
  }
  for (const id of STAT_POOL) {
    if (result.length >= STAT_POOL_BASE_COUNT) break
    if (!result.includes(id)) result.push(id)
  }
  return result.slice(0, STAT_POOL_BASE_COUNT)
}

/**
 * Swapping a duplicate: assigning `nextId` to a slot that already exists
 * elsewhere trades the two, so no slot is ever left duplicated.
 */
export function swapStat(
  stats: StatId[],
  index: number,
  nextId: StatId,
): StatId[] {
  if (index < 0 || index >= stats.length) return sanitizeStats(stats)
  if (nextId === stats[index]) return stats
  const existing = stats.indexOf(nextId)
  if (existing === -1) {
    const next = [...stats]
    next[index] = nextId
    return next
  }
  const next = [...stats]
  next[existing] = stats[index]
  next[index] = nextId
  return next
}

/**
 * Resolves the visible tiles for a card. Every selection renders exactly six
 * slots. A selected stat that cannot be computed (null) is replaced by the
 * next unused, available stat from the pool. If no substitute exists anywhere,
 * the slot renders the unavailable placeholder instead of a blank tile or a
 * misleading zero.
 */
export function selectStats(profile: Profile, selected: StatId[]): StatTile[] {
  const resolutions = new Map<StatId, StatResolution | null>()
  for (const definition of STAT_DEFINITIONS) {
    resolutions.set(definition.id, definition.resolve(profile))
  }

  const slots = sanitizeStats(selected)
  const used = new Set<StatId>()
  const tiles: StatTile[] = []

  for (let index = 0; index < STAT_POOL_BASE_COUNT; index++) {
    const preferred = slots[index]
    let chosenId: StatId | null = null

    if (preferred && !used.has(preferred) && resolutions.get(preferred)) {
      chosenId = preferred
    } else {
      for (const candidate of STAT_POOL) {
        if (!used.has(candidate) && resolutions.get(candidate)) {
          chosenId = candidate
          break
        }
      }
    }

    if (!chosenId) {
      tiles.push({
        id: preferred ?? `missing-${index}`,
        ...UNAVAILABLE_TILE,
      })
      continue
    }

    const definition = STAT_BY_ID.get(chosenId)
    const resolution = resolutions.get(chosenId) ?? null
    if (!definition || !resolution) {
      // Defensive: marked available but lost between map reads.
      tiles.push({ id: chosenId, ...UNAVAILABLE_TILE })
      continue
    }

    used.add(chosenId)
    tiles.push({
      id: chosenId,
      label: definition.label,
      icon: definition.icon,
      value: resolution.value,
      caption: resolution.partial
        ? `${resolution.caption} ~`
        : resolution.caption,
    })
  }

  return tiles
}
