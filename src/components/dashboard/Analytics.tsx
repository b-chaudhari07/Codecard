import { ContestPerformance } from './ContestPerformance'
import { ProblemDistribution } from './ProblemDistribution'
import { RatingHistory } from './RatingHistory'
import { TopicAnalysis } from './TopicAnalysis'
import { SectionHeading } from '../ui/SectionHeading'
import type { Profile } from '../../types/profile'

interface AnalyticsProps {
  profile: Profile
}

export function Analytics({ profile }: AnalyticsProps) {
  return (
    <section
      id="analytics"
      className="section-shell scroll-mt-24 py-20 sm:py-24"
    >
      <SectionHeading
        eyebrow="Analytics"
        title="Performance, in detail."
        description="Rating momentum, difficulty range, contest consistency, and the topics you return to. A complete picture of how you solve."
      />

      <div className="grid gap-4 xl:grid-cols-5">
        <RatingHistory profile={profile} />
        <ProblemDistribution profile={profile} />
        <ContestPerformance profile={profile} />
        <TopicAnalysis profile={profile} />
      </div>
    </section>
  )
}
