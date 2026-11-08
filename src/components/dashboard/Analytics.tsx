import { ContestPerformance } from './ContestPerformance'
import { ProblemDistribution } from './ProblemDistribution'
import { RatingHistory } from './RatingHistory'
import { SubmissionHeatmap } from './SubmissionHeatmap'
import { TopicAnalysis } from './TopicAnalysis'
import { SectionHeading } from '../ui/SectionHeading'
import type { AppTheme } from '../../lib/appTheme'
import { resolveAccentForMode } from '../../lib/cardThemes'
import type { CardOptions, Profile } from '../../types/profile'

interface AnalyticsProps {
  profile: Profile
  cardOptions?: CardOptions
  appTheme?: AppTheme
}

export function Analytics({ profile, cardOptions, appTheme }: AnalyticsProps) {
  const accentColor = cardOptions
    ? resolveAccentForMode(
        appTheme === 'light' ? 'light' : 'dark',
        cardOptions.accent,
        cardOptions.autoRankColor,
        profile.rank,
      )
    : undefined

  return (
    <section
      id="analytics"
      className="section-shell scroll-mt-24 py-16 sm:py-20"
    >
      <SectionHeading
        eyebrow="Analytics"
        title="Performance, in detail."
        description="Rating momentum, difficulty range, contest consistency, submission rhythm, and the topics you return to. A complete picture of how you solve."
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <SubmissionHeatmap profile={profile} accentColor={accentColor} />
        <RatingHistory profile={profile} />
        <ProblemDistribution profile={profile} />
        <ContestPerformance profile={profile} />
        <TopicAnalysis profile={profile} />
      </div>
    </section>
  )
}
