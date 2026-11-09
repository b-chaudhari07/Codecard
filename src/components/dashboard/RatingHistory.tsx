import { useMemo, useState } from 'react'
import {
  Activity,
  CalendarX2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'

import { RatingLineChart } from '../charts/RatingLineChart'
import { WidgetState } from './ProfileStates'
import {
  cn,
  filterRatingHistory,
  formatNumber,
  rankAccent,
} from '../../lib/utils'
import type { Profile, RatingRange } from '../../types/profile'

interface RatingHistoryProps {
  profile: Profile
}

const RANGES: RatingRange[] = ['1M', '6M', '1Y', 'ALL']

export function RatingHistory({ profile }: RatingHistoryProps) {
  const [range, setRange] = useState<RatingRange>('ALL')
  const accent = rankAccent(profile.rank)

  const filtered = useMemo(
    () => filterRatingHistory(profile.ratingHistory, range),
    [profile.ratingHistory, range],
  )

  const hasHistory = profile.ratingHistoryAvailable && filtered.length > 0
  const rangePoints = useMemo(() => {
    if (range === 'ALL' || profile.ratingHistory.length === 0) {
      return profile.ratingHistory
    }
    const months = range === '1M' ? 1 : range === '6M' ? 6 : 12
    const latest = new Date(
      `${profile.ratingHistory[profile.ratingHistory.length - 1].date}T00:00:00`,
    )
    const cutoff = new Date(latest)
    cutoff.setMonth(cutoff.getMonth() - months)
    return profile.ratingHistory.filter(
      (point) => new Date(`${point.date}T00:00:00`) >= cutoff,
    )
  }, [profile.ratingHistory, range])
  const rangeDelta = rangePoints.length >= 2
    ? rangePoints[rangePoints.length - 1].rating - rangePoints[0].rating
    : null

  return (
    <article className="widget animate-fade-up p-6 sm:p-7 xl:col-span-3">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-soft text-silver">
              <Activity size={15} strokeWidth={1.9} />
            </span>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Rating History
            </h3>
          </div>
          <p className="mt-2 text-xs text-muted">
            Contest-by-contest progression. Hover to inspect a round.
          </p>
        </div>

        {hasHistory ? (
          <div className="flex w-fit items-center gap-0.5 rounded-full border border-line bg-canvas/50 p-1">
            {RANGES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRange(option)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors duration-200',
                  range === option
                    ? 'bg-widget text-ink shadow-sm'
                    : 'text-muted hover:text-silver',
                )}
                aria-pressed={range === option}
              >
                {option}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {!profile.ratingHistoryAvailable ? (
        <WidgetState
          icon={CalendarX2}
          title="Rating history unavailable"
          description="The user.rating request failed for this profile. No contest statistics are shown rather than fabricated values."
        />
      ) : filtered.length === 0 ? (
        <WidgetState
          icon={CalendarX2}
          title="No rated contests yet"
          description="This handle has no rated contest history on Codeforces, so there is no rating curve to plot."
        />
      ) : (
        <>
          {rangeDelta !== null ? (
            <div className="mt-7 flex justify-end">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-medium tabular',
                  rangeDelta >= 0
                    ? 'border-positive/20 bg-positive-soft text-positive'
                    : 'border-negative/20 bg-negative-soft text-negative',
                )}
              >
                {rangeDelta >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {rangeDelta > 0 ? '+' : rangeDelta < 0 ? '-' : ''}
                {formatNumber(Math.abs(rangeDelta))} in {range === 'ALL' ? 'total' : range}
              </span>
            </div>
          ) : null}

          <div key={range} className="animate-fade-in mt-3">
            <RatingLineChart data={filtered} accent={accent} />
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px] text-muted">
            <span className="tabular">
              {formatNumber(filtered.length)} rated contests in view
            </span>
          </div>
        </>
      )}
    </article>
  )
}
