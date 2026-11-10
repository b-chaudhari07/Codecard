import { describe, expect, it } from 'vitest'

import { selectStats, sanitizeStats, swapStat } from './cardStats'
import type { Profile, StatId } from '../types/profile'

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    handle: 'tester',
    avatarUrl: null,
    avatarDataUrl: null,
    initials: 'T',
    rank: 'Pupil',
    maxRank: null,
    rating: 1200,
    maxRating: 1400,
    problemsSolved: 123,
    ratedContests: 5,
    unratedSolved: 0,
    country: null,
    organization: null,
    registrationDate: null,
    joinedYear: null,
    contribution: 0,
    ratingHistory: [],
    difficulty: [],
    contestStats: null,
    topics: [],
    submissionActivity: null,
    peakDay: { count: 0, date: null, partial: false },
    grit: { count: 0, problemName: null, problemIndex: null, partial: false },
    sniper: null,
    contests: 5,
    bestComeback: null,
    topTag: null,
    cardNumber: 1,
    hardestProblem: null,
    hardestProblems: [],
    ratingHistoryAvailable: true,
    submissionsAvailable: true,
    submissionsTruncated: false,
    warnings: [],
    isSample: false,
    ...overrides,
  }
}

describe('selectStats', () => {
  it('returns the selected stats with values and captions', () => {
    const profile = makeProfile({
      submissionActivity: {
        days: [],
        activeDays: 4,
        firstSubmissionDate: '2026-01-01',
        longestStreak: 3,
        totalSubmissions: 40,
        acceptedSubmissions: 30,
        windowSubmissions: 40,
        windowAcceptedSubmissions: 30,
        windowActiveDays: 4,
        maxDailySubmissions: 6,
        windowStart: '2026-01-01',
        windowEnd: '2026-11-01',
        isPartial: false,
      },
    })

    const tiles = selectStats(profile, ['solved', 'streak'])
    // Two explicit slots, the rest filled from the pool in display order.
    expect(tiles.map((tile) => tile.id).slice(0, 2)).toEqual([
      'solved',
      'streak',
    ])
    expect(tiles[0].value).toBe('123')
    expect(tiles[1].value).toBe('3')
  })

  it('uses all-history active days for the card tile', () => {
    const profile = makeProfile({
      submissionActivity: {
        days: [],
        activeDays: 320,
        firstSubmissionDate: '2020-05-04',
        longestStreak: 10,
        totalSubmissions: 4000,
        acceptedSubmissions: 3000,
        windowSubmissions: 400,
        windowAcceptedSubmissions: 300,
        windowActiveDays: 22,
        maxDailySubmissions: 12,
        windowStart: '2025-11-09',
        windowEnd: '2026-11-15',
        isPartial: false,
      },
    })

    const tile = selectStats(profile, ['activeDays']).find(
      (item) => item.id === 'activeDays',
    )
    expect(tile?.value).toBe('320')
    expect(tile?.caption).toBe('days with submissions since May 2020')
  })

  it('marks a truncated active-days caption as partial', () => {
    const profile = makeProfile({
      submissionActivity: {
        days: [],
        activeDays: 500,
        firstSubmissionDate: '2018-01-15',
        longestStreak: 10,
        totalSubmissions: 30000,
        acceptedSubmissions: 20000,
        windowSubmissions: 400,
        windowAcceptedSubmissions: 300,
        windowActiveDays: 32,
        maxDailySubmissions: 12,
        windowStart: '2025-11-09',
        windowEnd: '2026-11-15',
        isPartial: true,
      },
    })

    const tile = selectStats(profile, ['activeDays']).find(
      (item) => item.id === 'activeDays',
    )
    expect(tile?.caption).toBe(
      'days with submissions since Jan 2018 (partial) ~',
    )
  })

  it('appends a trailing ~ to partial captions', () => {
    const profile = makeProfile({
      peakDay: { count: 7, date: '2026-08-15', partial: true },
    })
    const tiles = selectStats(profile, ['peakDay'])
    expect(tiles[0].caption).toBe('solved on Aug 15 ~')
  })

  it('substitutes the next unused available stat when one is null', () => {
    const profile = makeProfile({
      hardestProblem: null,
      submissionActivity: {
        days: [],
        activeDays: 2,
        firstSubmissionDate: '2026-01-01',
        longestStreak: 1,
        totalSubmissions: 5,
        acceptedSubmissions: 4,
        windowSubmissions: 5,
        windowAcceptedSubmissions: 4,
        windowActiveDays: 2,
        maxDailySubmissions: 3,
        windowStart: '2026-01-01',
        windowEnd: '2026-11-01',
        isPartial: false,
      },
    })

    const tiles = selectStats(profile, ['boss', 'streak'])
    // boss is unavailable -> falls through to the next available pool stat.
    expect(tiles).toHaveLength(6)
    expect(tiles[0].id).toBe('solved')
    expect(tiles[1].id).toBe('streak')
    const ids = tiles.map((tile) => tile.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('shows the unavailable placeholder when every stat is null', () => {
    const profile = makeProfile({
      hardestProblem: null,
      submissionsAvailable: false,
      ratingHistoryAvailable: false,
      contests: 0,
      maxRating: null,
    })

    const tiles = selectStats(profile, ['boss', 'solved', 'contests'])
    expect(tiles).toHaveLength(6)
    for (const tile of tiles) {
      expect(tile.value).toBe('—')
    }
  })

  it('never renders blank values while some substitute remains', () => {
    const profile = makeProfile({
      hardestProblem: null,
      submissionsAvailable: true,
      problemsSolved: 50,
      submissionActivity: {
        days: [],
        activeDays: 1,
        firstSubmissionDate: '2026-01-01',
        longestStreak: 1,
        totalSubmissions: 2,
        acceptedSubmissions: 2,
        windowSubmissions: 2,
        windowAcceptedSubmissions: 2,
        windowActiveDays: 1,
        maxDailySubmissions: 1,
        windowStart: '2026-01-01',
        windowEnd: '2026-11-01',
        isPartial: false,
      },
    })

    const tiles = selectStats(profile, [
      'boss',
      'solved',
      'streak',
      'peakDay',
      'grit',
      'contests',
    ])
    expect(tiles).toHaveLength(6)
    expect(tiles.every((tile) => tile.value !== '—')).toBe(true)
    const ids = tiles.map((tile) => tile.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('swapStat', () => {
  const selection: StatId[] = [
    'boss',
    'solved',
    'streak',
    'peakDay',
    'grit',
    'contests',
  ]

  it('replaces a slot with an unused stat', () => {
    const next = swapStat(selection, 0, 'maxRating')
    expect(next[0]).toBe('maxRating')
    expect(next).not.toContain('boss')
  })

  it('swaps duplicates instead of duplicating a stat', () => {
    const next = swapStat(selection, 1, 'streak')
    expect(next[1]).toBe('streak')
    expect(next[2]).toBe('solved')
    expect(new Set(next).size).toBe(6)
  })

  it('keeps the selection unchanged when picking the same stat', () => {
    expect(swapStat(selection, 2, 'streak')).toBe(selection)
  })
})

describe('sanitizeStats', () => {
  it('removes unknown ids and duplicates, then fills from the pool', () => {
    const result = sanitizeStats([
      'boss',
      'boss',
      'madeUp' as never,
      'grit',
    ])
    expect(result).toHaveLength(6)
    expect(new Set(result).size).toBe(6)
    expect(result[0]).toBe('boss')
    expect(result).toContain('grit')
  })

  it('falls back to the default selection when given nothing valid', () => {
    expect(sanitizeStats([])).toHaveLength(6)
    expect(sanitizeStats(null)).toHaveLength(6)
    expect(sanitizeStats([])[0]).toBe('boss')
  })
})
