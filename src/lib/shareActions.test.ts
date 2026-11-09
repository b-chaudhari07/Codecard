import { describe, expect, it } from 'vitest'

import { chooseSharePath, getShareFileName } from './shareActions'

describe('share action helpers', () => {
  it('chooses native file sharing only when available and supported', () => {
    expect(chooseSharePath(true, true)).toBe('share-files')
    expect(chooseSharePath(false, true)).toBe('download-fallback')
    expect(chooseSharePath(true, false)).toBe('download-fallback')
  })

  it('builds the share file name from handle then template', () => {
    expect(getShareFileName('tourist', 'link')).toBe('codecard-tourist-link.png')
  })
})
