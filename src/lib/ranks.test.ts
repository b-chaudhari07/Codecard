import { describe, expect, it } from 'vitest'

import { calculateRankProgress } from './ranks'

describe('calculateRankProgress', () => {
  it('calculates the remaining rating and progress across rank thresholds', () => {
    expect(calculateRankProgress('Specialist', 1507)).toEqual({
      kind: 'progress',
      nextRank: 'Expert',
      remaining: 93,
      progress: 53.5,
      currentThreshold: 1400,
      nextThreshold: 1600,
    })
  })

  it('clamps progress to the current and next rank bounds', () => {
    expect(calculateRankProgress('Expert', 1500)?.kind).toBe('progress')
    expect(calculateRankProgress('Expert', 2000)).toMatchObject({
      remaining: 0,
      progress: 100,
    })
  })

  it('returns null for unrated profiles and top for the highest rank', () => {
    expect(calculateRankProgress(null, null)).toBeNull()
    expect(calculateRankProgress('Expert', null)).toBeNull()
    expect(calculateRankProgress('Legendary Grandmaster', 3200)).toEqual({
      kind: 'top',
    })
  })
})
