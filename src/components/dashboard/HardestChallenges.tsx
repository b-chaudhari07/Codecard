import { ArrowUpRight, Flame, Layers, Trophy } from 'lucide-react'

import { SectionHeading } from '../ui/SectionHeading'
import { WidgetState } from './ProfileStates'
import { cn, formatNumber } from '../../lib/utils'
import type { HardestProblem, Profile, StatId } from '../../types/profile'

interface HardestChallengesProps {
  profile: Profile
  selectedStats: StatId[]
}

function problemDifficultyColor(rating: number): string {
  if (rating >= 2400) return '#FF4D4D' // Red / Grandmaster
  if (rating >= 2100) return '#F5C26B' // Master / Gold
  if (rating >= 1900) return '#C08BFF' // Candidate Master / Purple
  if (rating >= 1600) return '#6AA8FF' // Expert / Blue
  if (rating >= 1400) return '#4FD8CE' // Specialist / Cyan
  if (rating >= 1200) return '#5FD08A' // Pupil / Green
  return '#A6ADBB' // Newbie / Gray
}

export function HardestChallenges({ profile, selectedStats }: HardestChallengesProps) {
  const hardest = (profile.hardestProblems ?? []).slice(0, 5)
  const hasProblems = profile.submissionsAvailable && hardest.length > 0

  return (
    <section
      id="challenges"
      className="section-shell scroll-mt-24 py-16 sm:py-20"
    >
      <SectionHeading
        eyebrow="Milestones"
        title="Your Hardest Challenges"
        description="The five toughest problems you've conquered."
        action={
          hasProblems ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-widget px-3.5 py-1.5 text-[11px] text-muted">
              <Trophy size={13} className="text-gold" />
              <span>
                Peak solve:{' '}
                <strong className="font-semibold text-ink tabular">
                  {formatNumber(hardest[0]?.rating)}
                </strong>
              </span>
            </div>
          ) : undefined
        }
      />

      {!profile.submissionsAvailable ? (
        <WidgetState
          icon={Layers}
          title="Submission history unavailable"
          description="Submission data could not be loaded, so hardest challenges cannot be determined for this profile."
        />
      ) : hardest.length === 0 ? (
        <WidgetState
          icon={Trophy}
          title="No rated problems solved yet"
          description="No accepted submissions with official difficulty ratings were found in the retrieved history."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {hardest.map((problem: HardestProblem, index: number) => {
            const ratingColor = problemDifficultyColor(problem.rating)
            const label = problem.contestId
              ? `${problem.contestId}${problem.index}`
              : problem.index

            return (
              <a
                key={problem.key}
                href={problem.url ?? `https://codeforces.com/problemset`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  'widget group relative flex flex-col justify-between p-5 transition-all duration-300',
                  'hover:-translate-y-1 hover:border-silver/30',
                )}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                {/* Subtle accent glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-[0.08] blur-2xl transition-opacity duration-300 group-hover:opacity-20"
                  style={{ backgroundColor: ratingColor }}
                />

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-line bg-soft text-[11px] font-semibold text-muted transition-colors group-hover:text-ink">
                      #{index + 1}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular"
                      style={{
                        backgroundColor: `${ratingColor}1a`,
                        color: ratingColor,
                      }}
                    >
                      <Flame size={11} />
                      {problem.rating}
                    </span>
                  </div>

                  <h4 className="mt-4 line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight text-ink transition-colors group-hover:text-silver">
                    {problem.name}
                  </h4>
                  {index === 0 && selectedStats.includes('boss') ? (
                    <span className="mt-2 inline-flex rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[9px] font-medium text-gold">
                      On your card as Boss
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-line pt-3 text-[11px] text-muted">
                  <span className="font-mono text-[10px] text-muted/70">
                    {label}
                  </span>
                  <span className="inline-flex items-center gap-1 font-medium text-silver/80 transition-colors group-hover:text-ink">
                    <span>Solve</span>
                    <ArrowUpRight
                      size={12}
                      className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </section>
  )
}
