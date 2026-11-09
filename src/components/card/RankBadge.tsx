import { Shield } from 'lucide-react'

import { withAlpha } from '../../lib/cardThemes'
import type { CodeforcesRank } from '../../types/profile'

export function RankBadge({
  rank,
  rankColor,
  accent,
  compact = false,
}: {
  rank: CodeforcesRank | null
  rankColor: string
  accent: string
  compact?: boolean
}) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 5 : 7,
        padding: compact ? '4px 10px' : '6px 13px',
        borderRadius: 9999,
        border: `1px solid ${withAlpha(rankColor, 0.55)}`,
        background: `linear-gradient(135deg, ${withAlpha(rankColor, 0.24)}, ${withAlpha(accent, 0.1)})`,
        boxShadow: `0 0 18px ${withAlpha(rankColor, 0.18)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
        color: rankColor,
        fontSize: compact ? 9.5 : 11,
        fontWeight: 700,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      <Shield size={compact ? 10 : 12} strokeWidth={2.2} />
      {rank ?? 'Unrated'}
    </span>
  )
}
