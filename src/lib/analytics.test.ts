import { describe, expect, it } from 'vitest'

import { sanitizeAnalyticsUrl } from './analytics'

describe('sanitizeAnalyticsUrl', () => {
  it('rewrites profile handles to a placeholder', () => {
    expect(sanitizeAnalyticsUrl('/u/Benq')).toBe('/u/:handle')
    expect(sanitizeAnalyticsUrl('/u/Benq/')).toBe('/u/:handle')
  })

  it('drops query strings and hashes that could carry the handle', () => {
    expect(sanitizeAnalyticsUrl('/u/Benq?x=1')).toBe('/u/:handle')
    expect(sanitizeAnalyticsUrl('/u/Benq#section')).toBe('/u/:handle')
    expect(sanitizeAnalyticsUrl('/u/Benq/?x=1#section')).toBe('/u/:handle')
  })

  it('keeps absolute profile URLs on their origin', () => {
    expect(sanitizeAnalyticsUrl('https://codecard.app/u/Benq?x=1')).toBe(
      'https://codecard.app/u/:handle',
    )
  })

  it('leaves other paths untouched', () => {
    expect(sanitizeAnalyticsUrl('/')).toBe('/')
    expect(sanitizeAnalyticsUrl('/u')).toBe('/u')
    expect(sanitizeAnalyticsUrl('/u/Benq/stats')).toBe('/u/Benq/stats')
    expect(sanitizeAnalyticsUrl('/about?x=1')).toBe('/about?x=1')
  })
})
