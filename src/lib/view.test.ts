import { describe, expect, it } from 'vitest'

import { getView } from './view'

const base = {
  status: 'idle' as const,
  isDemo: false,
  searchRequested: false,
  exampleRequested: false,
}

describe('getView', () => {
  it('starts on the landing view and treats an idle requested search as loading', () => {
    expect(getView(base)).toBe('landing')
    expect(getView({ ...base, searchRequested: true })).toBe('loading')
  })

  it('maps live loading and success to their views', () => {
    expect(getView({ ...base, status: 'loading' })).toBe('loading')
    expect(
      getView({ ...base, status: 'success', searchRequested: true }),
    ).toBe('live')
  })

  it('shows the example only when the sample was requested', () => {
    expect(
      getView({
        ...base,
        status: 'success',
        isDemo: true,
        exampleRequested: true,
      }),
    ).toBe('example')
    expect(getView({ ...base, status: 'success', isDemo: true })).toBe(
      'landing',
    )
  })

  it('lets errors win over any stale profile state', () => {
    expect(
      getView({
        ...base,
        status: 'error',
        isDemo: true,
        searchRequested: true,
        exampleRequested: true,
      }),
    ).toBe('error')
  })
})
