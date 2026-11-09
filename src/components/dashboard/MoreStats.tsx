import { BarChart3 } from 'lucide-react'

import { getAvailableStats, selectStats } from '../../lib/cardStats'
import type { StatId, Profile } from '../../types/profile'

interface MoreStatsProps {
  profile: Profile
  selectedStats: StatId[]
  onSelectStat: (statId: StatId) => void
}

export function MoreStats({
  profile,
  selectedStats,
  onSelectStat,
}: MoreStatsProps) {
  const renderedIds = new Set(
    selectStats(profile, selectedStats).map((tile) => tile.id),
  )
  const available = getAvailableStats(profile).filter(
    (stat) => !renderedIds.has(stat.id),
  )

  return (
    <section className="mt-6" aria-labelledby="more-stats-title">
      <div className="mb-3 flex items-center gap-2">
        <BarChart3 size={14} className="text-muted" />
        <h3
          id="more-stats-title"
          className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted"
        >
          More stats
        </h3>
        <span className="text-[10px] text-muted/60">Select to replace the last card tile</span>
      </div>
      {available.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((stat) => (
            <button
              key={stat.id}
              type="button"
              onClick={() => {
                onSelectStat(stat.id as StatId)
                window.requestAnimationFrame(() => {
                  document.getElementById('studio')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  })
                })
              }}
              className="widget flex items-center gap-3 p-3 text-left transition-colors hover:border-silver/30 hover:bg-soft/70"
            >
              <span className="text-lg" aria-hidden="true">{stat.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-[11px] font-medium text-silver">{stat.label}</span>
                  <span className="shrink-0 text-sm font-semibold text-ink tabular">{stat.value}</span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-muted">{stat.caption}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-line bg-widget/50 px-4 py-3 text-xs text-muted">
          All available stats are already on your card.
        </p>
      )}
    </section>
  )
}
