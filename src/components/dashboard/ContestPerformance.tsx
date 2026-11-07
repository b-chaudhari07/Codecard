import { CalendarX2, Trophy } from 'lucide-react'

import { WidgetState } from './ProfileStates'
import { cn, formatNumber, formatSigned } from '../../lib/utils'
import type { Profile } from '../../types/profile'

interface ContestPerformanceProps {
  profile: Profile
}

export function ContestPerformance({ profile }: ContestPerformanceProps) {
  const contestStats = profile.contestStats

  const maxAbs = contestStats
    ? Math.max(
        1,
        ...contestStats.recentChanges.map((change) => Math.abs(change)),
      )
    : 1

  const stats = contestStats
    ? [
        {
          label: 'Rated contests',
          value: formatNumber(contestStats.total),
          hint: 'rating changes',
        },
        {
          label: 'Best rank',
          value: `#${formatNumber(contestStats.bestRank)}`,
          hint: 'personal best',
        },
        {
          label: 'Avg. change',
          value: formatSigned(contestStats.avgChange, 1),
          hint: 'per contest',
          positive: contestStats.avgChange >= 0,
        },
      ]
    : []

  return (
    <article className="widget animate-fade-up p-6 [animation-delay:120ms] sm:p-7 xl:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-silver">
              <Trophy size={15} strokeWidth={1.9} />
            </span>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Contest Performance
            </h3>
          </div>
          <p className="mt-2 text-xs text-muted">
            Consistency under the clock.
          </p>
        </div>
        {contestStats ? (
          <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-2 py-1 text-[10px] font-medium text-emerald-300/80">
            {formatNumber(contestStats.positiveChanges)}/
            {formatNumber(contestStats.total)} positive
          </span>
        ) : null}
      </div>

      {!contestStats ? (
        <WidgetState
          icon={CalendarX2}
          title={
            profile.ratingHistoryAvailable
              ? 'No rated contests yet'
              : 'Contest statistics unavailable'
          }
          description={
            profile.ratingHistoryAvailable
              ? 'This handle has no rated contest history on Codeforces, so best rank and rating changes cannot be calculated.'
              : 'Rated contest history could not be loaded. Best rank and rating changes are not shown rather than estimated.'
          }
        />
      ) : (
        <>
          <div className="mt-7 grid grid-cols-3 gap-2.5">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/[0.045] bg-white/[0.018] px-3 py-3.5"
              >
                <p
                  className={cn(
                    'text-xl font-semibold tracking-[-0.03em] tabular',
                    stat.positive === false
                      ? 'text-rose-300/90'
                      : 'text-ink',
                  )}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-muted">
                  {stat.label}
                </p>
                <p className="mt-1.5 text-[9px] uppercase tracking-[0.12em] text-muted/50">
                  {stat.hint}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between text-[11px] text-muted">
              <span>Recent form</span>
              <span className="text-muted/60">last 8 rounds</span>
            </div>

            <div className="relative mt-4 h-24">
              <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.06]" />
              <div className="flex h-full items-stretch gap-1.5">
                {contestStats.recentChanges.map((change, index) => {
                  const height = Math.max(
                    6,
                    (Math.abs(change) / maxAbs) * 42,
                  )
                  const isPositive = change >= 0

                  return (
                    <div
                      key={`${change}-${index}`}
                      className="group/round relative flex-1"
                      title={`${formatSigned(change)} rating`}
                    >
                      <div
                        className={cn(
                          'absolute left-1/2 w-full max-w-4 -translate-x-1/2 rounded-[3px] transition-all duration-300 group-hover/round:opacity-100',
                          isPositive
                            ? 'bottom-1/2 bg-emerald-400/60'
                            : 'top-1/2 bg-rose-400/50',
                        )}
                        style={{ height: `${height}px` }}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-4 text-[11px] text-muted">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                Best {formatSigned(contestStats.bestChange)}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400/70" />
                Worst {formatSigned(contestStats.worstChange)}
              </span>
              <span className="tabular">
                avg {formatSigned(contestStats.avgChange, 1)}
              </span>
            </div>
          </div>
        </>
      )}
    </article>
  )
}
