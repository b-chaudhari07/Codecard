import { formatLongDate, formatNumber } from '../../lib/utils'
import { calculateRankProgress } from '../../lib/ranks'
import type { Profile } from '../../types/profile'

interface ProfileOverviewProps {
  profile: Profile
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const progress = calculateRankProgress(profile.rank, profile.rating)
  const details = [
    profile.country ? { label: 'Country', value: profile.country } : null,
    profile.registrationDate
      ? { label: 'Member since', value: formatLongDate(profile.registrationDate) }
      : null,
    profile.contribution !== null
      ? { label: 'Contribution', value: formatNumber(profile.contribution) }
      : null,
    profile.maxRank ? { label: 'Peak rank', value: profile.maxRank } : null,
  ].filter((item): item is { label: string; value: string } => item !== null)

  return (
    <section
      id="profile-strip"
      aria-label="Profile details"
      className="section-shell py-4 sm:py-5"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-widget/60 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {details.map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted/70">
                {label}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-silver">{value}</p>
            </div>
          ))}
        </div>

        {progress?.kind === 'top' ? (
          <p className="shrink-0 text-[11px] font-medium text-silver">
            Top rank reached
          </p>
        ) : progress?.kind === 'progress' ? (
          <div className="w-full max-w-xs shrink-0">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-[10px]">
              <span className="font-medium text-silver">
                {formatNumber(progress.remaining)} rating to {progress.nextRank}
              </span>
              <span className="text-muted">
                {progress.currentThreshold}–{progress.nextThreshold}
              </span>
            </div>
            <div
              role="progressbar"
              aria-label={`Progress to ${progress.nextRank}`}
              aria-valuemin={progress.currentThreshold}
              aria-valuemax={progress.nextThreshold}
              aria-valuenow={Math.min(
                progress.nextThreshold,
                Math.max(progress.currentThreshold, profile.rating ?? progress.currentThreshold),
              )}
              className="h-1.5 overflow-hidden rounded-full bg-soft-2"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-silver/70 to-gold"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
