import type {
  AccentId,
  CardOptions,
  CardThemeId,
  CodeforcesRank,
} from '../types/profile'

export type ThemeMode = 'dark' | 'light'

export interface CardTheme {
  id: CardThemeId
  name: string
  mode: ThemeMode
  description: string
  background: string
  surface: string
  elevated: string
  text: string
  muted: string
  border: string
  borderStrong: string
  chartGrid: string
  chartLabel: string
  chartDot: string
  /** Neutral cell colour for zero-activity heatmap days. */
  heatmapEmpty: string
  glowPrimary: string
  glowSecondary: string
  /** Optional gradient layered on top of `surface` for glass panels. */
  surfaceGradient: string | null
  surfaceShadow: string
  insetHighlight: string
  signatureAccent: AccentId
}

export interface Accent {
  name: string
  /** Accent for dark surfaces. */
  value: string
  /** Darker accent that keeps contrast on light surfaces. */
  onLight: string
}

export const CARD_THEMES: Record<CardThemeId, CardTheme> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian',
    mode: 'dark',
    description: 'Cinematic glass · emerald light',
    background: '#07080C',
    surface: 'rgba(18, 21, 28, 0.66)',
    elevated: 'rgba(26, 30, 39, 0.78)',
    text: '#F7F8FB',
    muted: '#9BA2B2',
    border: 'rgba(255, 255, 255, 0.10)',
    borderStrong: 'rgba(255, 255, 255, 0.20)',
    chartGrid: 'rgba(255, 255, 255, 0.07)',
    chartLabel: 'rgba(247, 248, 251, 0.38)',
    chartDot: '#07080C',
    heatmapEmpty: '#122019',
    glowPrimary: 'rgba(95, 208, 160, 0.18)',
    glowSecondary: 'rgba(106, 168, 255, 0.12)',
    surfaceGradient:
      'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.025) 38%, rgba(255,255,255,0.055) 100%)',
    surfaceShadow: '0 24px 60px rgba(0, 0, 0, 0.42)',
    insetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.14)',
    signatureAccent: 'emerald',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    mode: 'light',
    description: 'Apple-inspired · frosted daylight',
    background: '#F2F4F7',
    surface: 'rgba(255, 255, 255, 0.78)',
    elevated: 'rgba(255, 255, 255, 0.92)',
    text: '#17171D',
    muted: '#6F7480',
    border: 'rgba(23, 23, 29, 0.08)',
    borderStrong: 'rgba(23, 23, 29, 0.16)',
    chartGrid: 'rgba(23, 23, 29, 0.07)',
    chartLabel: 'rgba(23, 23, 29, 0.42)',
    chartDot: '#FFFFFF',
    heatmapEmpty: '#E3E7EC',
    glowPrimary: 'rgba(95, 208, 160, 0.14)',
    glowSecondary: 'rgba(185, 167, 255, 0.14)',
    surfaceGradient:
      'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.55) 55%, rgba(255,255,255,0.82) 100%)',
    surfaceShadow: '0 20px 50px rgba(23, 23, 29, 0.10)',
    insetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.9)',
    signatureAccent: 'lavender',
  },
}

export const ACCENTS: Record<AccentId, Accent> = {
  lavender: {
    name: 'Lavender',
    value: '#B9A7FF',
    onLight: '#6D5BD0',
  },
  sapphire: {
    name: 'Sapphire',
    value: '#6AA8FF',
    onLight: '#2563C9',
  },
  gold: {
    name: 'Gold',
    value: '#D7B45E',
    onLight: '#9A7420',
  },
  emerald: {
    name: 'Emerald',
    value: '#5FD0A0',
    onLight: '#1F8A5B',
  },
  rose: {
    name: 'Rose',
    value: '#F08A9B',
    onLight: '#C2455C',
  },
  violet: {
    name: 'Violet',
    value: '#A78BFA',
    onLight: '#7C3AED',
  },
  amber: {
    name: 'Amber',
    value: '#F5B94A',
    onLight: '#B7791F',
  },
  cyan: {
    name: 'Cyan',
    value: '#5FE0E8',
    onLight: '#0E8C96',
  },
}

/**
 * Rank colours are tuned separately for dark and light surfaces so the rank
 * accent stays legible without changing the user's manual accent choice.
 */
export const RANK_ACCENTS: Record<
  CodeforcesRank,
  { dark: string; light: string }
> = {
  Newbie: { dark: '#A6ADBB', light: '#6B7280' },
  Pupil: { dark: '#5FD08A', light: '#1F8A4C' },
  Specialist: { dark: '#4FD8CE', light: '#0E8C84' },
  Expert: { dark: '#6AA8FF', light: '#2563C9' },
  'Candidate Master': { dark: '#C08BFF', light: '#8B3FD1' },
  Master: { dark: '#F5C26B', light: '#B7791F' },
  'International Master': { dark: '#F59E5B', light: '#C05621' },
  Grandmaster: { dark: '#FF7A7A', light: '#C53030' },
  'International Grandmaster': { dark: '#FF5C5C', light: '#B91C1C' },
  'Legendary Grandmaster': { dark: '#FF4D4D', light: '#991B1B' },
}

export type CardRarity =
  | 'COMMON'
  | 'UNCOMMON'
  | 'RARE'
  | 'EPIC'
  | 'EPIC+'
  | 'LEGENDARY'
  | 'MYTHIC'

/**
 * Rarity is derived from the Codeforces rank alone. It never implies an
 * achievement beyond what the rank itself represents.
 */
export const RARITY_BY_RANK: Record<CodeforcesRank, CardRarity> = {
  Newbie: 'COMMON',
  Pupil: 'UNCOMMON',
  Specialist: 'RARE',
  Expert: 'EPIC',
  'Candidate Master': 'EPIC+',
  Master: 'LEGENDARY',
  'International Master': 'LEGENDARY',
  Grandmaster: 'MYTHIC',
  'International Grandmaster': 'MYTHIC',
  'Legendary Grandmaster': 'MYTHIC',
}

export function getRarity(rank: CodeforcesRank | null): CardRarity {
  return rank ? RARITY_BY_RANK[rank] : 'COMMON'
}

/** Foil begins at Expert and gets richer with the rank tier. */
export function hasFoil(rank: CodeforcesRank | null): boolean {
  return (
    rank === 'Expert' ||
    rank === 'Candidate Master' ||
    rank === 'Master' ||
    rank === 'International Master' ||
    rank === 'Grandmaster' ||
    rank === 'International Grandmaster' ||
    rank === 'Legendary Grandmaster'
  )
}

/** The strongest ranks also get an inset rank-colour glow. */
export function hasInnerGlow(rank: CodeforcesRank | null): boolean {
  return (
    rank === 'Master' ||
    rank === 'International Master' ||
    rank === 'Grandmaster' ||
    rank === 'International Grandmaster' ||
    rank === 'Legendary Grandmaster'
  )
}

export const THEME_IDS: CardThemeId[] = ['obsidian', 'minimal']
export const ACCENT_IDS: AccentId[] = [
  'emerald',
  'sapphire',
  'violet',
  'rose',
  'amber',
  'cyan',
  'lavender',
  'gold',
]

export function resolveRankAccent(
  rank: CodeforcesRank | null,
  mode: ThemeMode,
): string | null {
  if (!rank) return null
  return mode === 'light' ? RANK_ACCENTS[rank].light : RANK_ACCENTS[rank].dark
}

/**
 * Resolves the colour used for accents on a surface with the given mode.
 * Manual accent selection is preserved in `CardOptions`; rank colouring only
 * changes the resolved value.
 */
export function resolveAccentForMode(
  mode: ThemeMode,
  accentId: AccentId,
  autoRankColor: boolean,
  rank: CodeforcesRank | null,
): string {
  if (autoRankColor) {
    const rankAccent = resolveRankAccent(rank, mode)
    if (rankAccent) return rankAccent
  }

  return mode === 'light' ? ACCENTS[accentId].onLight : ACCENTS[accentId].value
}

export function resolveAccent(
  theme: CardTheme,
  accentId: AccentId,
  autoRankColor: boolean,
  rank: CodeforcesRank | null,
  customAccent: string | null = null,
): string {
  if (autoRankColor) {
    const rankAccent = resolveRankAccent(rank, theme.mode)
    if (rankAccent) return rankAccent
  }

  const custom = normalizeHex(customAccent)
  if (custom) {
    return theme.mode === 'light' ? mixHex(custom, '#000000', 0.16) : custom
  }

  return resolveAccentForMode(theme.mode, accentId, false, rank)
}

function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim().replace('#', '')
  if (value.length === 3) {
    const [r, g, b] = value.split('')
    return [
      Number.parseInt(`${r}${r}`, 16),
      Number.parseInt(`${g}${g}`, 16),
      Number.parseInt(`${b}${b}`, 16),
    ]
  }
  if (value.length !== 6) return null
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  if ([r, g, b].some((channel) => Number.isNaN(channel))) return null
  return [r, g, b]
}

export function normalizeHex(hex: string | null | undefined): string | null {
  if (!hex) return null
  const parsed = parseHex(hex)
  if (!parsed) return null
  return `#${parsed
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

/** Adds an alpha channel to a hex colour. */
export function withAlpha(hex: string, alpha: number): string {
  const parsed = parseHex(hex)
  if (!parsed) return hex
  const [r, g, b] = parsed
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Blends `hex` toward `target` by `amount` (0–1). */
export function mixHex(hex: string, target: string, amount: number): string {
  const from = parseHex(hex)
  const to = parseHex(target)
  if (!from || !to) return hex
  const ratio = Math.min(1, Math.max(0, amount))
  const channels = from.map((channel, index) =>
    Math.round(channel + (to[index] - channel) * ratio),
  )
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

export const DEFAULT_CARD_OPTIONS: CardOptions = {
  template: 'portrait',
  theme: 'obsidian',
  accent: 'emerald',
  autoRankColor: false,
  customAccent: null,
  designationMode: 'auto',
  customDesignation: '',
  customQuote: '',
  showQuote: true,
  showBanner: true,
  customBanner: null,
  bannerPosition: 'center',
  customPhoto: null,
  showDesignation: true,
  showRatingChart: true,
  showHeatmap: true,
  showHardestProblem: true,
  showStats: true,
  showWatermark: true,
}
