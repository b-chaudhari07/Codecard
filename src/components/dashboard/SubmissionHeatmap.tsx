import { useState } from 'react'
import { AlertCircle, Calendar, CheckCircle2, Flame, Layers } from 'lucide-react'

import { WidgetState } from './ProfileStates'
import { formatNumber, formatShortDate, rankAccent } from '../../lib/utils'
import type { HeatmapDay, Profile } from '../../types/profile'

interface SubmissionHeatmapProps {
  profile: Profile
  accentColor?: string
}

function getIntensityLevel(count: number, maxDaily: number): number {
  if (count <= 0) return 0
  if (maxDaily <= 4) {
    if (count === 1) return 1
    if (count === 2) return 2
    if (count === 3) return 3
    return 4
  }
  const ratio = count / maxDaily
  if (ratio < 0.25) return 1
  if (ratio < 0.5) return 2
  if (ratio < 0.75) return 3
  return 4
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function SubmissionHeatmap({
  profile,
  accentColor,
}: SubmissionHeatmapProps) {
  const activity = profile.submissionActivity
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)

  const accent = accentColor ?? rankAccent(profile.rank)

  if (!profile.submissionsAvailable) {
    return (
      <article className="widget animate-fade-up p-6 sm:p-7 xl:col-span-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-soft text-silver">
            <Calendar size={15} strokeWidth={1.9} />
          </span>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Submission Activity
          </h3>
        </div>
        <WidgetState
          icon={Layers}
          title="Activity heatmap unavailable"
          description="Submission timestamps could not be loaded, so daily activity cannot be plotted for this profile."
        />
      </article>
    )
  }

  if (!activity || activity.days.length === 0) {
    return (
      <article className="widget animate-fade-up p-6 sm:p-7 xl:col-span-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-soft text-silver">
            <Calendar size={15} strokeWidth={1.9} />
          </span>
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
            Submission Activity
          </h3>
        </div>
        <WidgetState
          icon={Calendar}
          title="No submission records"
          description="This profile has no submission history in the analyzed window."
        />
      </article>
    )
  }

  // Chunk days into weeks (columns of 7 days, Sunday to Saturday)
  const weeks: HeatmapDay[][] = []
  let currentWeek: HeatmapDay[] = []

  activity.days.forEach((day, index) => {
    currentWeek.push(day)
    if (currentWeek.length === 7 || index === activity.days.length - 1) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  // Extract month markers above columns
  const monthLabels: Array<{ text: string; weekIndex: number }> = []
  let lastMonth = -1

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0]
    if (firstDay) {
      const month = new Date(`${firstDay.date}T00:00:00`).getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ text: MONTH_NAMES[month], weekIndex })
        lastMonth = month
      }
    }
  })

  const getCellColor = (day: HeatmapDay) => {
    const level = getIntensityLevel(day.submissions, activity.maxDailySubmissions)
    if (level === 0) return 'var(--app-soft)'
    if (level === 1) return `${accent}40`
    if (level === 2) return `${accent}75`
    if (level === 3) return `${accent}b5`
    return accent
  }

  return (
    <article className="widget animate-fade-up p-6 sm:p-7 xl:col-span-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-soft text-silver">
              <Calendar size={15} strokeWidth={1.9} />
            </span>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Submission Activity
            </h3>
            {activity.isPartial ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-warning/25 bg-warning-soft px-2.5 py-0.5 text-[10px] font-medium text-warning">
                <AlertCircle size={10} />
                Partial history
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-muted">
            Daily practice rhythm over the past 12 months. Hover over any day to
            inspect.
          </p>
        </div>

        {/* Metric summary badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-soft px-3 py-1.5 font-medium text-silver">
            <CheckCircle2 size={13} className="text-positive" />
            <strong className="text-ink">{formatNumber(activity.windowActiveDays)}</strong> active days (last 12 months)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-soft px-3 py-1.5 font-medium text-silver">
            <Layers size={13} className="text-silver/70" />
            <strong className="text-ink">{formatNumber(activity.windowSubmissions)}</strong> submissions
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-soft px-3 py-1.5 font-medium text-silver">
            <Flame size={13} style={{ color: accent }} />
            Most submissions in a day:{' '}
            <strong className="text-ink">{formatNumber(activity.maxDailySubmissions)}</strong>
          </span>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="mt-7 overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Month labels */}
          <div className="relative mb-2 h-4 text-[10px] text-muted">
            {monthLabels.map(({ text, weekIndex }, i) => (
              <span
                key={`${text}-${i}`}
                className="absolute"
                style={{ left: `${weekIndex * 14.5 + 28}px` }}
              >
                {text}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between pt-0.5 text-[9px] text-muted/70" style={{ height: '98px' }}>
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3.5px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day) => {
                    return (
                      <div
                        key={day.date}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className="h-[10.5px] w-[10.5px] rounded-[2.5px] transition-all duration-150 hover:scale-125 hover:ring-2 hover:ring-silver/40"
                        style={{
                          backgroundColor: getCellColor(day),
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar: Hover status & Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[11px] text-muted">
        <div className="min-h-5">
          {hoveredDay ? (
            <p className="flex items-center gap-2 text-ink">
              <span className="font-semibold">{formatShortDate(hoveredDay.date)}:</span>
              <span>
                {hoveredDay.submissions === 0
                  ? 'No submissions'
                  : `${hoveredDay.submissions} ${
                      hoveredDay.submissions === 1 ? 'submission' : 'submissions'
                    } (${hoveredDay.accepted} accepted)`}
              </span>
            </p>
          ) : (
            <span>Hover a day to view submission details</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted/70">
          <span>Less</span>
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: 'var(--app-soft)' }}
          />
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: `${accent}40` }}
          />
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: `${accent}75` }}
          />
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: `${accent}b5` }}
          />
          <span
            className="h-2.5 w-2.5 rounded-[2px]"
            style={{ backgroundColor: accent }}
          />
          <span>More</span>
        </div>
      </div>
    </article>
  )
}
