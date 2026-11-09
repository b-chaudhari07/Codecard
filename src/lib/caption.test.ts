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
  it('uses three X lines, plain handle text, and counts the URL as 23', () => {
    const caption = buildCaption(
      profile({ handle: '@@VeryLongHandleVeryLongHandle', rank: 'International Grandmaster' }),
      options(['boss', 'streak', 'sniper', 'solved', 'grit', 'contests']),
      'x',
      url,
    )
    expect(caption.length - url.length + 23).toBeLessThanOrEqual(280)
    expect(caption).toContain(url)
    expect(caption).not.toContain('@')
    expect(caption).toContain('VeryLongHandleVeryLongHandle · International Grandmaster')
    expect(caption).toContain(' on Codeforces 🃏\n')
    expect(caption).toContain('\nMake yours: ')
    expect(caption.split('\n')).toHaveLength(3)
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
    expect(caption.split('\n')).toHaveLength(3)
  })

  it('omits the highlights line when none of the preferred selected stats are available', () => {
    const caption = buildCaption(
      profile({
        hardestProblem: null,
        sniper: null,
        submissionActivity: null,
        submissionsAvailable: false,
        problemsSolved: null,
      }),
      options(['boss', 'sniper', 'streak', 'solved', 'grit', 'contests']),
      'x',
      url,
    )
    expect(caption.split('\n')).toHaveLength(2)
    expect(caption).not.toMatch(/👑|🔥|🎯|✅/)
    expect(caption).toContain(`\nMake yours: ${url}`)
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
    expect(lines.at(-1)).toBe(`Make yours: ${url}`)
    expect(lines[0]).toContain('— my Codeforces journey.')
    expect(caption).not.toContain('@')
    expect(caption).not.toContain('#')
  })
})
