import { RANK_ACCENTS } from './cardThemes'
import type {
  CodeforcesRank,
  Profile,
  RatingPoint,
  RatingRange,
} from '../types/profile'

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}

const numberFormatter = new Intl.NumberFormat('en-US')

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }
  return numberFormatter.format(value)
}

export function formatSigned(
  value: number | null | undefined,
  fractionDigits = 0,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—'
  }

  const formatted = Math.abs(value).toFixed(fractionDigits)
  if (value > 0) return `+${formatted}`
  if (value < 0) return `−${formatted}`
  return formatted
}

export function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = String(date.getFullYear()).slice(2)
  return `${month} '${year}`
}

export function formatLongDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const RANGE_MONTHS: Record<RatingRange, number | null> = {
  '1M': 1,
  '6M': 6,
  '1Y': 12,
  ALL: null,
}

/**
 * Filters a rating history by a window ending at the latest contest.
 * Always keeps at least two points so the chart can draw a line.
 */
export function filterRatingHistory(
  history: RatingPoint[],
  range: RatingRange,
): RatingPoint[] {
  const months = RANGE_MONTHS[range]
  if (months === null || history.length <= 2) return history

  const latest = new Date(`${history[history.length - 1].date}T00:00:00`)
  const cutoff = new Date(latest)
  cutoff.setMonth(cutoff.getMonth() - months)

  const filtered = history.filter(
    (point) => new Date(`${point.date}T00:00:00`) >= cutoff,
  )

  if (filtered.length >= 2) return filtered

  const lastIndex = history.length - 1
  return history.slice(Math.max(0, lastIndex - 1))
}

/** Dashboard rank colour, using the dark-surface variant. */
export function rankAccent(rank: CodeforcesRank | null): string {
  if (!rank) return '#C8D0DC'
  return RANK_ACCENTS[rank].dark
}

export function formatMemberSince(profile: Profile): string {
  if (!profile.registrationDate) return 'Member since unavailable'
  return `Member since ${formatLongDate(profile.registrationDate)}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
