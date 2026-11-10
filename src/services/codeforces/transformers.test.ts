import { describe, expect, it } from 'vitest'

import {
  buildGrit,
  buildPeakDay,
  buildSubmissionActivity,
  collectSolvedProblems,
  gritLabel,
} from './transformers'
import type { CodeforcesSubmission } from './types'

let nextId = 1

function makeSubmission(
  verdict: string | undefined,
  seconds: number,
  contestId: number,
  index: string,
  name = `Problem ${index}`,
): CodeforcesSubmission {
  return {
    id: nextId++,
    contestId,
    creationTimeSeconds: seconds,
    relativeTimeSeconds: 0,
    problem: {
      contestId,
      index,
      name,
      type: 'PROGRAMMING',
      tags: [],
    },
    author: {
      members: [{ handle: 'tester' }],
      participantType: 'CONTESTANT',
      ghost: false,
    },
    programmingLanguage: 'GNU C++17',
    verdict,
    testset: 'TESTS',
    passedTestCount: 0,
    timeConsumedMillis: 0,
    memoryConsumedBytes: 0,
  }
}

/** Local noon keeps timestamps clear of any timezone date boundary. */
function localSeconds(year: number, month: number, day: number): number {
  return Math.floor(new Date(year, month - 1, day, 12).getTime() / 1000)
}

describe('buildPeakDay', () => {
  it('counts distinct problems first solved on the same local day', () => {
    const day = localSeconds(2026, 3, 21)
    const submissions = [
      makeSubmission('OK', day, 100, 'A'),
      makeSubmission('OK', day + 60, 100, 'B'),
      makeSubmission('OK', day + 120, 101, 'C'),
    ]

    expect(buildPeakDay(submissions, false)).toEqual({
      count: 3,
      date: '2026-03-21',
      partial: false,
    })
  })

  it('counts duplicates across contest and practice only once', () => {
    const day = localSeconds(2026, 4, 2)
    const submissions = [
      makeSubmission('OK', day, 200, 'A'),
      makeSubmission('OK', day + 300, 200, 'A'),
      makeSubmission('OK', day + 600, 200, 'B'),
    ]

    expect(buildPeakDay(submissions, false).count).toBe(2)
  })

  it('keeps a problem on the day it was first solved', () => {
    const firstDay = localSeconds(2026, 5, 1)
    const laterDay = localSeconds(2026, 5, 2)
    const submissions = [
      makeSubmission('OK', firstDay, 300, 'A'),
      makeSubmission('OK', laterDay, 300, 'B'),
      makeSubmission('OK', laterDay + 60, 300, 'A'),
    ]

    expect(buildPeakDay(submissions, false)).toEqual({
      count: 1,
      date: '2026-05-01',
      partial: false,
    })
  })

  it('marks the stat partial when submissions were truncated', () => {
    expect(buildPeakDay([], true)).toEqual({
      count: 0,
      date: null,
      partial: true,
    })
  })
})

describe('buildSubmissionActivity', () => {
  const now = new Date(2026, 10, 15, 12)
  const submissions = [
    // Same local day twice: counts once.
    makeSubmission('OK', localSeconds(2023, 11, 20), 1000, 'A'),
    makeSubmission('WRONG_ANSWER', localSeconds(2023, 11, 20) + 60, 1000, 'A'),
    // Four-day run outside the heatmap window, with a two-problem peak.
    makeSubmission('OK', localSeconds(2024, 6, 1), 1001, 'A'),
    makeSubmission('OK', localSeconds(2024, 6, 2), 1001, 'B'),
    makeSubmission('OK', localSeconds(2024, 6, 2) + 60, 1001, 'C'),
    makeSubmission('OK', localSeconds(2024, 6, 3), 1001, 'D'),
    makeSubmission('OK', localSeconds(2024, 6, 4), 1001, 'E'),
    // Three active days inside the last twelve months.
    makeSubmission('OK', localSeconds(2025, 12, 1), 1002, 'A'),
    makeSubmission('OK', localSeconds(2026, 3, 1), 1003, 'A'),
    makeSubmission('OK', localSeconds(2026, 11, 10), 1004, 'A'),
  ]

  const activity = buildSubmissionActivity(submissions, false, now)

  it('counts distinct active days across all retrieved years', () => {
    expect(activity.activeDays).toBe(8)
  })

  it('limits the heatmap window to the last twelve months', () => {
    expect(activity.windowActiveDays).toBe(3)
    expect(activity.windowStart).toBe('2025-11-09')
    expect(activity.windowEnd).toBe('2026-11-15')
  })

  it('keeps streak and peak day on all retrieved submissions', () => {
    expect(activity.longestStreak).toBe(4)
    expect(buildPeakDay(submissions, false)).toEqual({
      count: 2,
      date: '2024-06-02',
      partial: false,
    })
  })

  it('records the earliest retrieved submission date', () => {
    expect(activity.firstSubmissionDate).toBe('2023-11-20')
  })

  it('marks the activity partial when the history is truncated', () => {
    expect(buildSubmissionActivity(submissions, true, now).isPartial).toBe(true)
  })
})

describe('buildGrit', () => {
  it('returns zero when every solved problem passed first try', () => {
    const submissions = [
      makeSubmission('OK', localSeconds(2026, 1, 2), 400, 'A'),
    ]

    expect(buildGrit(submissions, false)).toEqual({
      count: 0,
      problemName: null,
      problemIndex: null,
      partial: false,
    })
  })

  it('counts failed attempts before the first OK', () => {
    const day = localSeconds(2026, 2, 3)
    const submissions = [
      makeSubmission('WRONG_ANSWER', day, 500, 'C', 'Hard Problem'),
      makeSubmission(
        'TIME_LIMIT_EXCEEDED',
        day + 60,
        500,
        'C',
        'Hard Problem',
      ),
      makeSubmission('OK', day + 120, 500, 'C', 'Hard Problem'),
    ]

    expect(buildGrit(submissions, false)).toEqual({
      count: 2,
      problemName: 'Hard Problem',
      problemIndex: 'C',
      partial: false,
    })
  })

  it('ignores compilation errors and testing/skipped verdicts', () => {
    const day = localSeconds(2026, 2, 4)
    const submissions = [
      makeSubmission('COMPILATION_ERROR', day, 600, 'B'),
      makeSubmission('TESTING', day + 30, 600, 'B'),
      makeSubmission('SKIPPED', day + 60, 600, 'B'),
      makeSubmission('WRONG_ANSWER', day + 90, 600, 'B'),
      makeSubmission('OK', day + 120, 600, 'B'),
    ]

    expect(buildGrit(submissions, false).count).toBe(1)
  })

  it('does not count unsolved problems, even with many wrong answers', () => {
    const day = localSeconds(2026, 2, 5)
    const submissions = [
      makeSubmission('WRONG_ANSWER', day, 700, 'D'),
      makeSubmission('WRONG_ANSWER', day + 30, 700, 'D'),
      makeSubmission('WRONG_ANSWER', day + 60, 700, 'D'),
    ]

    expect(buildGrit(submissions, false).count).toBe(0)
  })

  it('groups contest and practice attempts for the same problem', () => {
    const day = localSeconds(2026, 2, 6)
    const submissions = [
      makeSubmission('WRONG_ANSWER', day, 800, 'E'),
      makeSubmission('OK', day + 60, 800, 'E'),
      makeSubmission('WRONG_ANSWER', day + 120, 800, 'E'),
    ]

    const result = buildGrit(submissions, false)

    expect(result.count).toBe(1)
    expect(result.problemName).toBe('Problem E')
  })

  it('marks the stat partial when submissions were truncated', () => {
    expect(buildGrit([], true).partial).toBe(true)
  })
})

describe('gritLabel', () => {
  it('maps grit thresholds to labels', () => {
    expect(gritLabel(4)).toBeNull()
    expect(gritLabel(5)).toBe('Stubborn')
    expect(gritLabel(10)).toBe('Built different')
    expect(gritLabel(20)).toBe('Absolute menace')
  })
})

describe('collectSolvedProblems', () => {
  it('deduplicates repeated accepts of the same problem', () => {
    const day = localSeconds(2026, 1, 10)
    const submissions = [
      makeSubmission('OK', day, 900, 'A'),
      makeSubmission('OK', day + 60, 900, 'A'),
    ]

    expect(collectSolvedProblems(submissions)).toHaveLength(1)
  })

  it('ignores non-OK submissions', () => {
    const day = localSeconds(2026, 1, 11)
    const submissions = [
      makeSubmission('WRONG_ANSWER', day, 901, 'A'),
      makeSubmission('OK', day + 60, 901, 'B'),
    ]

    expect(
      collectSolvedProblems(submissions).map((problem) => problem.index),
    ).toEqual(['B'])
  })
})
