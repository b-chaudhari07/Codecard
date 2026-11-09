import type { CodeforcesRank } from '../types/profile'

export const RANK_THRESHOLDS: Record<CodeforcesRank, number> = {
  Newbie: 0,
  Pupil: 1200,
  Specialist: 1400,
  Expert: 1600,
  'Candidate Master': 1900,
  Master: 2100,
  'International Master': 2300,
  Grandmaster: 2400,
  'International Grandmaster': 2600,
  'Legendary Grandmaster': 3000,
}

export const RANK_ORDER = Object.keys(RANK_THRESHOLDS) as CodeforcesRank[]

export type RankProgress =
  | { kind: 'top' }
  | {
      kind: 'progress'
      nextRank: CodeforcesRank
      remaining: number
      progress: number
      currentThreshold: number
      nextThreshold: number
    }

export function calculateRankProgress(
  rank: CodeforcesRank | null,
  rating: number | null,
): RankProgress | null {
  if (!rank) return null
  const rankIndex = RANK_ORDER.indexOf(rank)
  if (rankIndex < 0) return null
  if (rankIndex === RANK_ORDER.length - 1) return { kind: 'top' }
  if (rating === null) return null

  const nextRank = RANK_ORDER[rankIndex + 1]
  const currentThreshold = RANK_THRESHOLDS[rank]
  const nextThreshold = RANK_THRESHOLDS[nextRank]
  const range = nextThreshold - currentThreshold
  return {
    kind: 'progress',
    nextRank,
    remaining: Math.max(0, nextThreshold - rating),
    progress: Math.min(100, Math.max(0, ((rating - currentThreshold) / range) * 100)),
    currentThreshold,
    nextThreshold,
  }
}
