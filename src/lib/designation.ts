import type { CardOptions, Profile } from '../types/profile'

/**
 * A deterministic, rank-aware tagline used when the user has not written one.
 * It is intentionally descriptive rather than a fake achievement.
 */
export function generateDesignation(
  profile: Pick<
    Profile,
    'rank' | 'maxRank' | 'rating' | 'maxRating' | 'problemsSolved' | 'ratedContests'
  >,
): string {
  const rank = profile.maxRank ?? profile.rank
  const peak = profile.maxRating ?? profile.rating

  if (rank === 'Legendary Grandmaster') return 'A legend of the arena'
  if (rank === 'International Grandmaster' || rank === 'Grandmaster') {
    return 'Grandmaster of algorithms'
  }
  if (rank === 'International Master' || rank === 'Master') {
    return 'Master of the craft'
  }
  if (rank === 'Candidate Master' || rank === 'Expert') {
    return 'Precision under pressure'
  }
  if (rank === 'Specialist') return 'A consistent competitor'
  if (rank === 'Pupil') return 'Rising through the ranks'
  if (rank === 'Newbie') return 'Every problem is progress'

  if (typeof peak === 'number') {
    if (peak >= 2400) return 'Grandmaster of algorithms'
    if (peak >= 2100) return 'Master of the craft'
    if (peak >= 1900) return 'Precision under pressure'
    if (peak >= 1600) return 'Rising through the ranks'
    if (peak >= 1400) return 'Every problem is progress'
  }

  if (profile.problemsSolved && profile.problemsSolved > 0) {
    return 'Built one solve at a time'
  }

  return 'The journey begins here'
}

export function resolveDesignation(
  profile: Profile,
  options: Pick<CardOptions, 'designationMode' | 'customDesignation'>,
): string {
  const custom = options.customDesignation.trim()
  if (options.designationMode === 'custom' && custom) return custom
  return generateDesignation(profile)
}
