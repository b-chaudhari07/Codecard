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
}: {
  rank: CodeforcesRank | null
  rankColor: string
  accent: string
  compact?: boolean
  large?: boolean
  background?: string
}) {
  const isLarge = large && !compact

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 5 : isLarge ? 12 : 7,
        padding: compact
          ? '4px 10px'
          : isLarge
            ? '14px 28px'
            : '6px 13px',
        borderRadius: 9999,
        border: `1px solid ${withAlpha(rankColor, 0.55)}`,
        background:
          background ??
          `linear-gradient(135deg, ${withAlpha(rankColor, 0.24)}, ${withAlpha(accent, 0.1)})`,
        boxShadow: `0 0 18px ${withAlpha(rankColor, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
        color: rankColor,
        fontSize: compact ? 9.5 : isLarge ? 32 : 11,
        fontWeight: 700,
        letterSpacing: isLarge ? '0.02em' : '0.16em',
        textTransform: isLarge ? 'none' : 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <Shield size={compact ? 10 : isLarge ? 26 : 12} strokeWidth={2.2} />
      {rank ?? 'Unrated'}
    </span>
  )
}
