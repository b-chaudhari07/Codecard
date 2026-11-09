import { describe, expect, it } from 'vitest'

import { buildSniper } from './transformers'
import type { CodeforcesSubmission } from './types'

let nextId = 1

interface MakeSubmissionOptions {
  index?: string
  contestId?: number
  name?: string
  verdict?: string
  creationTimeSeconds?: number
  participantType?: string
}

function makeSubmission(options: MakeSubmissionOptions = {}): CodeforcesSubmission {
  const index = options.index ?? 'A'
  const contestId = options.contestId ?? 1000

  return {
    id: nextId++,
    contestId,
    creationTimeSeconds: options.creationTimeSeconds ?? 1700000000,
    relativeTimeSeconds: 0,
    problem: {
      contestId,
      index,
      name: options.name ?? `Problem ${index}`,
      type: 'PROGRAMMING',
      tags: [],
    },
    author: {
      members: [{ handle: 'tester' }],
      participantType: options.participantType ?? 'CONTESTANT',
      ghost: false,
    },
    programmingLanguage: 'GNU C++17',
    verdict: options.verdict ?? 'OK',
    testset: 'TESTS',
    passedTestCount: 0,
    timeConsumedMillis: 0,
    memoryConsumedBytes: 0,
  }
}

describe('buildSniper', () => {
  it('is independent of array order (earliest submission wins)', () => {
    const submissions = [
      // OK is listed first despite the earlier failed attempt below.
      makeSubmission({ index: 'A', verdict: 'OK', creationTimeSeconds: 200 }),
      makeSubmission({
        index: 'A',
        verdict: 'WRONG_ANSWER',
        creationTimeSeconds: 100,
      }),
    ]

    const sniper = buildSniper(submissions, false)
    expect(sniper).toEqual({
      percent: 0,
      firstTry: 0,
      solved: 1,
      partial: false,
    })
  })

  it('counts first-try solves versus retries', () => {
    const submissions = [
      // First-try: first submission is OK.
      makeSubmission({ index: 'A', verdict: 'OK', creationTimeSeconds: 100 }),
      // Retry: first submission is WA, then OK.
      makeSubmission({
        index: 'B',
        verdict: 'WRONG_ANSWER',
        creationTimeSeconds: 100,
      }),
      makeSubmission({ index: 'B', verdict: 'OK', creationTimeSeconds: 200 }),
      makeSubmission({ index: 'B', verdict: 'OK', creationTimeSeconds: 300 }),
    ]

    expect(buildSniper(submissions, false)).toEqual({
      percent: 50,
      firstTry: 1,
      solved: 2,
      partial: false,
    })
  })

  it('ignores a starting compile error when picking the first submission', () => {
    const submissions = [
      makeSubmission({
        index: 'A',
        verdict: 'COMPILATION_ERROR',
        creationTimeSeconds: 100,
      }),
      makeSubmission({ index: 'A', verdict: 'OK', creationTimeSeconds: 200 }),
    ]

    // The compile error never reached the judge, so the OK counts as first-try.
    expect(buildSniper(submissions, false)).toEqual({
      percent: 100,
      firstTry: 1,
      solved: 1,
      partial: false,
    })
  })

  it('ignores practice and virtual submissions', () => {
    const submissions = [
      makeSubmission({ index: 'A', verdict: 'OK', creationTimeSeconds: 100 }),
      makeSubmission({
        index: 'B',
        verdict: 'OK',
        participantType: 'PRACTICE',
        creationTimeSeconds: 300,
      }),
      makeSubmission({
        index: 'C',
        verdict: 'OK',
        participantType: 'VIRTUAL',
        creationTimeSeconds: 300,
      }),
    ]

    // Only the live-contest solve counts; practice/virtual solves are ignored.
    expect(buildSniper(submissions, false)).toEqual({
      percent: 100,
      firstTry: 1,
      solved: 1,
      partial: false,
    })
  })

  it('does not count a problem solved only in practice', () => {
    const submissions = [
      makeSubmission({
        index: 'A',
        verdict: 'OK',
        participantType: 'PRACTICE',
        creationTimeSeconds: 9000,
      }),
    ]

    expect(buildSniper(submissions, false)).toBeNull()
  })

  it('returns null when there are no contest solves', () => {
    expect(buildSniper([], false)).toBeNull()
    expect(
      buildSniper(
        [makeSubmission({ verdict: 'WRONG_ANSWER' })],
        false,
      ),
    ).toBeNull()
  })

  it('propagates the partial flag', () => {
    const sniper = buildSniper(
      [makeSubmission({ index: 'A', verdict: 'OK' })],
      true,
    )
    expect(sniper).toEqual({
      percent: 100,
      firstTry: 1,
      solved: 1,
      partial: true,
    })
  })
})
