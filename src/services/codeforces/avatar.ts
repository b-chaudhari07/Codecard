/**
 * Codeforces avatar loading.
 *
 * `userpic.codeforces.org` is the canonical avatar host, but it currently
 * returns HTTP 503 and does not send CORS headers. The same image is served by
 * `codeforces.com/userpic/...`, which returns 200 but also lacks CORS headers.
 *
 * To keep the avatar inside the exported PNG we fetch the image through a
 * CORS-enabled image proxy and inline it as a data URL. The direct
 * `codeforces.com` URL is kept as the display fallback so the card still shows
 * a real image if the proxy is temporarily unavailable.
 */

const AVATAR_PROXIES = [
  'https://wsrv.nl/',
  'https://images.weserv.nl/',
] as const

const AVATAR_SIZE = 400
const AVATAR_TIMEOUT_MS = 6_000
const MAX_AVATAR_BYTES = 8 * 1024 * 1024

const dataUrlCache = new Map<string, string>()
const inFlight = new Map<string, Promise<string | null>>()

function abortError(): DOMException {
  return new DOMException('The avatar request was aborted.', 'AbortError')
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Converts the API's `userpic.codeforces.org/{id}/title/{hash}.jpg` URL into
 * the equivalent `codeforces.com/userpic/{id}/title/{hash}.jpg` URL, which is
 * reachable even while the userpic host is down.
 */
export function toCodeforcesAvatarUrl(
  rawUrl: string | null | undefined,
): string | null {
  if (!rawUrl) return null

  try {
    const url = new URL(rawUrl)

    if (url.hostname === 'userpic.codeforces.org') {
      return `${url.protocol}//codeforces.com/userpic${url.pathname}${url.search}`
    }

    if (url.hostname === 'codeforces.com') {
      if (url.pathname.startsWith('/userpic/')) return url.toString()
      return `${url.origin}/userpic${url.pathname}${url.search}`
    }

    return url.toString()
  } catch {
    return null
  }
}

function buildProxyUrl(proxy: string, imageUrl: string): string {
  const params = new URLSearchParams({
    url: imageUrl,
    w: String(AVATAR_SIZE),
    h: String(AVATAR_SIZE),
    fit: 'cover',
    output: 'jpg',
    q: '88',
  })
  return `${proxy}?${params.toString()}`
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

async function fetchImageAsDataUrl(
  url: string,
  signal?: AbortSignal,
): Promise<string | null> {
  if (signal?.aborted) throw abortError()

  const controller = new AbortController()
  const abortFromParent = () => controller.abort()
  const timeout = window.setTimeout(
    () => controller.abort(),
    AVATAR_TIMEOUT_MS,
  )

  signal?.addEventListener('abort', abortFromParent, { once: true })

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      cache: 'force-cache',
      headers: { Accept: 'image/*' },
    })

    if (!response.ok) return null

    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) return null
    if (blob.size === 0 || blob.size > MAX_AVATAR_BYTES) return null

    return await blobToDataUrl(blob)
  } catch (error) {
    if (signal?.aborted) throw abortError()
    if (isAbortError(error)) return null
    return null
  } finally {
    window.clearTimeout(timeout)
    signal?.removeEventListener('abort', abortFromParent)
  }
}

/**
 * Returns a square, CORS-safe data URL for the profile avatar. Successful
 * results are cached for the lifetime of the tab. Returns null only when every
 * source fails; the card then keeps the direct URL for display and falls back
 * to initials if the image itself cannot load.
 */
export async function fetchAvatarAsDataUrl(
  rawUrl: string | null | undefined,
  signal?: AbortSignal,
): Promise<string | null> {
  const displayUrl = toCodeforcesAvatarUrl(rawUrl)
  if (!displayUrl) return null

  const cached = dataUrlCache.get(displayUrl)
  if (cached) return cached

  const pending = inFlight.get(displayUrl)
  if (pending) return pending

  const task = (async (): Promise<string | null> => {
    for (const proxy of AVATAR_PROXIES) {
      if (signal?.aborted) throw abortError()

      const dataUrl = await fetchImageAsDataUrl(
        buildProxyUrl(proxy, displayUrl),
        signal,
      )

      if (dataUrl) {
        dataUrlCache.set(displayUrl, dataUrl)
        return dataUrl
      }
    }

    return null
  })().finally(() => {
    inFlight.delete(displayUrl)
  })

  inFlight.set(displayUrl, task)
  return task
}
