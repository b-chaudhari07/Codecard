import { Tags, TagsIcon } from 'lucide-react'

import { WidgetState } from './ProfileStates'
import { formatNumber } from '../../lib/utils'
import type { Profile } from '../../types/profile'

interface TopicAnalysisProps {
  profile: Profile
}

export function TopicAnalysis({ profile }: TopicAnalysisProps) {
  return (
    <article className="widget animate-fade-up p-6 [animation-delay:180ms] sm:p-7 xl:col-span-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.025] text-silver">
              <Tags size={15} strokeWidth={1.9} />
            </span>
            <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
              Topic Analysis
            </h3>
          </div>
          <p className="mt-2 text-xs text-muted">
            Where your practice is concentrated.
          </p>
        </div>
        <span className="rounded-full border border-line bg-surface/60 px-2.5 py-1 text-[10px] text-muted">
          {profile.submissionsAvailable
            ? `${formatNumber(profile.topics.length)} tags`
            : 'unavailable'}
        </span>
      </div>

      {!profile.submissionsAvailable ? (
        <WidgetState
          icon={TagsIcon}
          title="Topic analysis unavailable"
          description="Submission history could not be loaded, so problem tags cannot be aggregated for this profile."
        />
      ) : profile.topics.length === 0 ? (
        <WidgetState
          icon={TagsIcon}
          title="No topic data yet"
          description="No accepted submissions with problem tags were found in the retrieved history."
        />
      ) : (
        <>
          <div className="mt-7 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {profile.topics.map((topic, index) => (
              <div key={topic.tag} className="flex items-center gap-3">
                <span className="w-[118px] shrink-0 truncate rounded-full border border-line bg-surface/50 px-2.5 py-1 text-[11px] text-silver/90">
                  {topic.tag}
                </span>
                <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-silver/35 to-silver/80"
                    style={{
                      width: `${topic.strength}%`,
                      transition: `width 700ms ease-out ${index * 30}ms`,
                    }}
                  />
                </div>
                <span className="w-7 shrink-0 text-right text-[11px] text-muted tabular">
                  {formatNumber(topic.solved)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-between border-t border-white/[0.05] pt-4 text-[11px] text-muted">
            <span>Strength is relative to your most solved tag.</span>
            <span className="text-silver/80">top 10</span>
          </div>
        </>
      )}
    </article>
  )
}
