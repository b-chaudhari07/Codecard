/**
 * Removes a public profile handle from a URL before it is sent to analytics.
 * Query strings and hashes are dropped along with the handle so they cannot
 * carry it either.
 */
export function sanitizeAnalyticsUrl(url: string): string {
  const withoutHash = url.split('#')[0]
  const path = withoutHash.split('?')[0]
  const match = /^(.*?)\/u\/[^/]+\/?$/.exec(path)
  if (!match) return url
  return `${match[1]}/u/:handle`
}
