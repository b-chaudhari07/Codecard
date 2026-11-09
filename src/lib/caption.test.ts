import { describe, expect, it } from 'vitest'

import { buildCaption } from './caption'
import { DEFAULT_CARD_OPTIONS } from './cardThemes'
import { sampleProfile } from '../data/sampleProfile'
import type { CardOptions, Profile } from '../types/profile'

const url = 'https://example.com/u/handle'

function profile(overrides: Partial<Profile> = {}): Profile {
  return { ...sampleProfile, ...overrides }
}

function options(stats: CardOptions['stats']): CardOptions {
  return { ...DEFAULT_CARD_OPTIONS, stats }
}

describe('buildCaption', () => {
  it('keeps X captions within 280 characters using the 23-character URL rule', () => {
    const caption = buildCaption(
      profile({ handle: 'VeryLongHandle'.repeat(12), rank: 'International Grandmaster' }),
      options(['boss', 'streak', 'sniper', 'solved', 'grit', 'contests']),
      'x',
      url,
    )
    expect(caption.length - url.length + 23).toBeLessThanOrEqual(280)
    expect(caption).toContain(url)
  })

  it('skips unavailable selected stats and uses preferred available stats', () => {
    const caption = buildCaption(
      profile({ hardestProblem: null, sniper: null }),
      options(['boss', 'streak', 'sniper', 'solved', 'grit', 'contests']),
      'x',
      url,
    )
    expect(caption).toContain('🔥')
    expect(caption).toContain('✅')
    expect(caption).not.toContain('👑')
    expect(caption).not.toContain('🎯')
  })

  it('includes only one highlight when only one selected stat is available', () => {
    const caption = buildCaption(
      profile({
        hardestProblem: null,
        sniper: null,
        submissionActivity: null,
        submissionsAvailable: true,
        problemsSolved: 321,
      }),
      options(['boss', 'sniper', 'streak', 'solved', 'grit', 'contests']),
      'x',
      url,
    )
    expect(caption.match(/👑|🔥|🎯|✅/g)).toHaveLength(1)
  })

  it('handles no rated contests without inventing a contest highlight', () => {
    const caption = buildCaption(
      profile({ contests: 0, ratingHistory: [], ratingHistoryAvailable: true, sniper: null }),
      options(['contests', 'sniper', 'boss', 'streak', 'solved', 'grit']),
      'x',
      url,
    )
    expect(caption).not.toContain('rated rounds')
    expect(caption).not.toContain('first-try contests')
  })

  it('formats LinkedIn as two or three short lines', () => {
    const caption = buildCaption(
      profile(),
      options(['boss', 'streak', 'sniper', 'solved', 'grit', 'contests']),
      'linkedin',
      url,
    )
    const lines = caption.split('\n')
    expect(lines.length).toBeGreaterThanOrEqual(2)
    expect(lines.length).toBeLessThanOrEqual(3)
    expect(lines.at(-1)).toBe(`Make my Codecard: ${url}`)
  })
})
