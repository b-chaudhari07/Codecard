export type SharePath = 'share-files' | 'download-fallback'

export function chooseSharePath(
  canShareAvailable: boolean,
  filesSupported: boolean,
): SharePath {
  return canShareAvailable && filesSupported
    ? 'share-files'
    : 'download-fallback'
}

export function getShareFileName(handle: string, template: string): string {
  return `codecard-${handle}-${template}.png`
}
