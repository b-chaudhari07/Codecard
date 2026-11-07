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
    description: 'Dark glassmorphism · silver & muted gold',
    background: '#090A0C',
    surface: '#151619',
    elevated: '#1B1D22',
    text: '#F5F5F5',
    muted: '#92949A',
    border: '#292B30',
    borderStrong: '#35383F',
    chartGrid: 'rgba(255, 255, 255, 0.06)',
    chartLabel: 'rgba(245, 245, 245, 0.36)',
    chartDot: '#090A0C',
    heatmapEmpty: 'rgba(255, 255, 255, 0.055)',
    glowPrimary: 'rgba(200, 208, 220, 0.16)',
    glowSecondary: 'rgba(215, 180, 94, 0.1)',
    surfaceGradient:
      'linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0.012))',
    surfaceShadow: 'none',
    insetHighlight: 'inset 0 1px 0 rgba(255,255,255,0.045)',
    signatureAccent: 'gold',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    mode: 'light',
    description: 'Apple-inspired · lavender & soft shadows',
    background: '#F5F5F7',
    surface: '#FFFFFF',
    elevated: '#FAFAFC',
    text: '#17171D',
    muted: '#777782',
    border: '#E8E8ED',
    borderStrong: '#D9D9E3',
    chartGrid: '#EFEFF4',
    chartLabel: '#A0A0AB',
    chartDot: '#FFFFFF',
    heatmapEmpty: '#EFEFF4',
    glowPrimary: 'rgba(167, 139, 250, 0.14)',
    glowSecondary: 'rgba(255, 255, 255, 0.9)',
    surfaceGradient: null,
    surfaceShadow: '0 18px 40px rgba(23, 23, 29, 0.06)',
    insetHighlight: 'none',
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

export const THEME_IDS: CardThemeId[] = ['obsidian', 'minimal']
export const ACCENT_IDS: AccentId[] = [
  'lavender',
  'sapphire',
  'gold',
  'emerald',
  'rose',
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
): string {
  return resolveAccentForMode(theme.mode, accentId, autoRankColor, rank)
}

/** Adds an alpha channel to a six-digit hex colour. */
export function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  if (value.length !== 6) return hex
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export const DEFAULT_CARD_OPTIONS: CardOptions = {
  theme: 'obsidian',
  accent: 'gold',
  autoRankColor: true,
  designationMode: 'auto',
  customDesignation: '',
  showRatingChart: true,
  showHeatmap: true,
  showHardestProblem: true,
  showStats: true,
  showWatermark: true,
}
