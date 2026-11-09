import { describe, expect, it } from 'vitest'

import { parseHandleFromPath } from './routing'

describe('parseHandleFromPath', () => {
  it('parses valid handles and preserves case', () => {
    expect(parseHandleFromPath('/u/Benq')).toBe('Benq')
    expect(parseHandleFromPath('/u/AbC_1.-')).toBe('AbC_1.-')
  })
  it('accepts one trailing slash', () => {
    expect(parseHandleFromPath('/u/Benq/')).toBe('Benq')
  })
  it('rejects too-short and too-long handles', () => {
    expect(parseHandleFromPath('/u/ab')).toBeNull()
    expect(parseHandleFromPath(`/u/${'a'.repeat(25)}`)).toBeNull()
  })
  it('rejects bad characters', () => {
    expect(parseHandleFromPath('/u/Bad+Name')).toBeNull()
    expect(parseHandleFromPath('/u/has space')).toBeNull()
  })
  it('rejects wrong prefixes, extra segments and root', () => {
    expect(parseHandleFromPath('/Benq')).toBeNull()
    expect(parseHandleFromPath('/profile/Benq')).toBeNull()
    expect(parseHandleFromPath('/u/Benq/extra')).toBeNull()
    expect(parseHandleFromPath('/')).toBeNull()
  })
})
