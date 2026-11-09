import { selectStats } from './cardStats'
import type { CardOptions, Profile, StatId } from '../types/profile'

export type SharePlatform = 'x' | 'linkedin'

const HIGHLIGHT_PRIORITY: StatId[] = ['boss', 'streak', 'sniper', 'solved']
const X_URL_LENGTH = 23

export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim()
  if (configured) return configured
  return typeof window === 'undefined' ? '' : window.location.origin
}

function getHighlights(profile: Profile, options: CardOptions): string[] {
  const selected = new Set(options.stats)
  const selectedTiles = selectStats(profile, options.stats).filter((tile) =>
    selected.has(tile.id as StatId),
  )
  const byId = new Map(selectedTiles.map((tile) => [tile.id, tile]))

  return HIGHLIGHT_PRIORITY.flatMap((id) => {
    if (!selected.has(id)) return []
    const tile = byId.get(id)
    if (!tile || tile.value === '—' || tile.caption === 'unavailable') return []
    if (id === 'boss') return [`👑 ${tile.value} hardest solved`]
    if (id === 'streak') return [`🔥 ${tile.value}-day streak`]
    if (id === 'sniper') return [`🎯 ${tile.value} first-try contests`]
    return [`✅ ${tile.value} solved`]
  }).slice(0, 2)
}

export function buildCaption(
  profile: Profile,
  options: CardOptions,
  platform: SharePlatform,
  url: string,
): string {
  const rank = profile.rank ?? 'Unrated'
  const rating = profile.rating === null
    ? 'unrated'
    : new Intl.NumberFormat('en-US').format(profile.rating)
  const intro = `${rank}, ${rating} 🃏 @${profile.handle}`
  const highlights = getHighlights(profile, options)
  const ending = `Make my Codecard: ${url}`

  if (platform === 'linkedin') {
    const lines = [intro]
    if (highlights.length) lines.push(highlights.join(' · '))
    lines.push(ending)
    return lines.join('\n')
  }

  for (let count = highlights.length; count >= 0; count--) {
    const middle = highlights.slice(0, count).join(' · ')
    const caption = [intro, middle, ending].filter(Boolean).join(' ')
    if (caption.length - url.length + X_URL_LENGTH <= 280) return caption
  }
  // Keep the never-truncated URL and trim the intro only if unusually long
  // rank/handle values alone exceed the platform limit.
  const fixedEnding = ` ${ending}`
  const allowedIntroLength = Math.max(0, 280 - X_URL_LENGTH - fixedEnding.length)
  return `${intro.slice(0, allowedIntroLength)}${fixedEnding}`
}
