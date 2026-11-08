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
  formatSigned,
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
  const first = filtered[0]
  const last = filtered[filtered.length - 1]
  const delta = first && last ? last.rating - first.rating : 0
  const isPositive = delta >= 0
  const peak =
    profile.maxRating ??
    (filtered.length > 0
      ? Math.max(...filtered.map((point) => point.rating))
      : null)

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
          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Current rating</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-[34px] font-semibold leading-none tracking-[-0.04em] text-ink tabular">
                  {formatNumber(last.rating)}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-medium tabular',
                    isPositive
                      ? 'border-positive/20 bg-positive-soft text-positive'
                      : 'border-negative/20 bg-negative-soft text-negative',
                  )}
                >
                  {isPositive ? (
                    <TrendingUp size={11} />
                  ) : (
                    <TrendingDown size={11} />
                  )}
                  {formatSigned(delta)} in {range === 'ALL' ? 'total' : range}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="eyebrow">Peak</p>
              <p className="mt-2 text-sm font-medium text-silver tabular">
                {formatNumber(peak)}
              </p>
            </div>
          </div>

          <div key={range} className="animate-fade-in mt-3">
            <RatingLineChart data={filtered} accent={accent} />
          </div>

          <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px] text-muted">
            <div className="flex items-center gap-5">
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                Current {formatNumber(last.rating)}
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full border"
                  style={{ borderColor: accent, opacity: 0.5 }}
                />
                Peak {formatNumber(peak)}
              </span>
            </div>
            <span className="tabular">
              {formatNumber(filtered.length)} rated contests in view
            </span>
          </div>
        </>
      )}
    </article>
  )
}
