import { Shield } from 'lucide-react'

import { withAlpha } from '../../lib/cardThemes'
import type { CodeforcesRank } from '../../types/profile'

export function RankBadge({
  rank,
  rankColor,
  accent,
  compact = false,
  large = false,
  background,
  label,
  scale = 1,
  minFontSize = 0,
  glowRadius,
  glowAlpha,
}: {
  rank: CodeforcesRank | null
  rankColor: string
  accent: string
  compact?: boolean
  large?: boolean
  background?: string
  /** Optional text override, e.g. a rarity tier. */
  label?: string
  /** Multiplies every size so scaled templates stay proportionate. */
  scale?: number
  /** Legibility floor for the rendered text (physical/wide templates). */
  minFontSize?: number
  /** Outer glow radius in base px (scaled); defaults to 18. */
  glowRadius?: number
  /** Outer glow alpha; defaults to 0.18. */
  glowAlpha?: number
}) {
  const isLarge = large && !compact
  const fontSize = Math.max(
    (compact ? 9.5 : isLarge ? 32 : 11) * scale,
    minFontSize,
  )
  const iconSize = Math.max(
    Math.round((compact ? 10 : isLarge ? 26 : 12) * scale),
    Math.round(minFontSize * 0.85),
  )
  const outerGlow = `0 0 ${(glowRadius ?? 18) * scale}px ${withAlpha(
    rankColor,
    glowAlpha ?? 0.18,
  )}`

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: (compact ? 5 : isLarge ? 12 : 7) * scale,
        padding: `${(compact ? 4 : isLarge ? 14 : 6) * scale}px ${
          (compact ? 10 : isLarge ? 28 : 13) * scale
        }px`,
        borderRadius: 9999,
        border: `1px solid ${withAlpha(rankColor, 0.55)}`,
        background:
          background ??
          `linear-gradient(135deg, ${withAlpha(rankColor, 0.24)}, ${withAlpha(accent, 0.1)})`,
        boxShadow: `${outerGlow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
        color: rankColor,
        fontSize,
        fontWeight: 700,
        letterSpacing: isLarge ? '0.02em' : '0.16em',
        textTransform: isLarge ? 'none' : 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <Shield size={iconSize} strokeWidth={2.2} />
      {label ?? rank ?? 'Unrated'}
    </span>
  )
}
