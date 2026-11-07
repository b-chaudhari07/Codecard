import { Crown, Flag, Target, TrendingUp } from 'lucide-react'

import { MetricCard } from './MetricCard'
import { SectionHeading } from '../ui/SectionHeading'
import { cn, formatLongDate, formatNumber, rankAccent } from '../../lib/utils'
import type { Profile } from '../../types/profile'

interface ProfileOverviewProps {
  profile: Profile
}

export function ProfileOverview({ profile }: ProfileOverviewProps) {
  const ratingAccent = rankAccent(profile.rank)
  const peakGain =
    profile.maxRating !== null && profile.rating !== null
      ? profile.maxRating - profile.rating
      : null

  const metrics = [
    {
      label: 'Current Rating',
      value: formatNumber(profile.rating),
      meta: profile.rank ? `Rank: ${profile.rank}` : 'Unrated or unavailable',
      icon: TrendingUp,
      accent: ratingAccent,
    },
    {
      label: 'Maximum Rating',
      value: formatNumber(profile.maxRating),
      meta:
        peakGain !== null
          ? `+${formatNumber(peakGain)} above current rating`
          : profile.maxRank
            ? `Peak rank: ${profile.maxRank}`
            : 'No rated contests yet',
      icon: Crown,
      accent: '#D7B45E',
    },
    {
      label: 'Problems Solved',
      value: formatNumber(profile.problemsSolved),
      meta: !profile.submissionsAvailable
        ? 'Unavailable'
        : profile.unratedSolved
          ? `${formatNumber(profile.unratedSolved)} without a difficulty rating`
          : 'Distinct problems accepted',
      icon: Target,
      accent: '#C8D0DC',
    },
    {
      label: 'Rated Contests',
      value: formatNumber(profile.ratedContests),
      meta: profile.ratingHistoryAvailable
        ? 'Rated rounds completed'
        : 'Unavailable',
      icon: Flag,
      accent: '#6AA8FF',
    },
  ]

  const details = [
    profile.country,
    profile.maxRank ? `Peak rank: ${profile.maxRank}` : null,
    profile.contribution !== null
      ? `Contribution: ${formatNumber(profile.contribution)}`
      : null,
    profile.registrationDate
      ? `Member since ${formatLongDate(profile.registrationDate)}`
      : null,
    profile.organization,
  ].filter((value): value is string => Boolean(value))

  return (
    <section
      id="overview"
      className="section-shell scroll-mt-24 py-20 sm:py-24"
    >
      <SectionHeading
        eyebrow="Overview"
        title="Your Competitive Journey"
        description="A snapshot of where you are, how far you have come, and what you have built along the way."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-widget px-3 py-1.5 text-[11px] text-muted">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                profile.isSample
                  ? 'animate-pulse-soft bg-gold'
                  : 'bg-emerald-400',
              )}
            />
            {profile.isSample ? 'Sample data' : 'Live data'}
            <span className="text-line">/</span>
            <span className="text-silver/80">@{profile.handle}</span>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.label} {...metric} index={index} />
        ))}
      </div>

      {details.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-widget/60 px-5 py-3 text-[11px] text-muted">
          {details.map((detail) => (
            <span key={detail} className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-silver/40" />
              {detail}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
