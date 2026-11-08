import { BarChart3, ChartNoAxesColumn, Layers } from 'lucide-react'

import { WidgetState } from './ProfileStates'
import { cn, formatNumber } from '../../lib/utils'
import type { Profile } from '../../types/profile'

interface ProblemDistributionProps {
  profile: Profile
}

export function ProblemDistribution({ profile }: ProblemDistributionProps) {
  const ratedSolved = profile.difficulty.reduce(
    (sum, bucket) => sum + bucket.solved,
    0,
  )
  const maxSolved = Math.max(
    1,
    ...profile.difficulty.map((bucket) => bucket.solved),
  )
  const peakBucket = profile.difficulty.find(
    (bucket) => bucket.solved === maxSolved,
  )

  return (
    <article className="widget animate-fade-up p-6 [animation-delay:60ms] sm:p-7 xl:col-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-soft text-silver">
              <BarChart3 size={15} strokeWidth={1.9} />
            </span>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Problem Distribution
            </h3>
          </div>
          <p className="mt-2 text-xs text-muted">
            Unique solved problems across difficulty bands.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold tracking-[-0.03em] text-ink tabular">
            {formatNumber(profile.problemsSolved)}
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted/70">
            solved
          </p>
        </div>
      </div>

      {!profile.submissionsAvailable ? (
        <WidgetState
          icon={Layers}
          title="Submission history unavailable"
          description="The user.status request failed, so solved-problem and topic statistics cannot be calculated for this profile."
        />
      ) : profile.problemsSolved === 0 ? (
        <WidgetState
          icon={ChartNoAxesColumn}
          title="No accepted submissions yet"
          description="This handle has no accepted Codeforces submissions in the retrieved history."
        />
      ) : ratedSolved === 0 ? (
        <WidgetState
          icon={ChartNoAxesColumn}
          title="No rated problems solved"
          description="Accepted problems were found, but none of them carry a difficulty rating. They are not treated as rating zero."
        />
      ) : (
        <>
          <div className="mt-7 space-y-3.5">
            {profile.difficulty.map((bucket, index) => {
              const width = (bucket.solved / maxSolved) * 100
              const isPeak =
                bucket.solved === maxSolved && bucket.solved > 0

              return (
                <div
                  key={bucket.label}
                  className="group/bar flex items-center gap-3"
                >
                  <span className="w-[74px] shrink-0 text-[11px] text-muted tabular">
                    {bucket.label}
                  </span>
                  <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-soft-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        isPeak
                          ? 'bg-gradient-to-r from-silver/70 via-silver to-gold'
                          : 'bg-gradient-to-r from-silver/25 to-silver/60',
                      )}
                      style={{
                        width: `${width}%`,
                        transitionDelay: `${index * 35}ms`,
                      }}
                    />
                  </div>
                  <span
                    className={cn(
                      'w-8 shrink-0 text-right text-[11px] tabular',
                      isPeak ? 'font-semibold text-silver' : 'text-muted',
                    )}
                  >
                    {bucket.solved}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-line pt-4 text-[11px] text-muted">
            <span className="inline-flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold/80" />
              Strongest band
            </span>
            <span className="text-silver/80 tabular">
              {peakBucket?.label ?? '—'}
            </span>
          </div>

          {profile.unratedSolved ? (
            <p className="mt-2 text-[10px] text-muted/60">
              {formatNumber(profile.unratedSolved)} solved problems have no
              difficulty rating and are excluded from these bands.
            </p>
          ) : null}
        </>
      )}
    </article>
  )
}
