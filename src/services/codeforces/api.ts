import {
  codeforcesEndpoints,
  CODEFORCES_API_MIN_INTERVAL_MS,
  MAX_SUBMISSION_PAGES,
  SUBMISSION_PAGE_SIZE,
} from './endpoints'
import type {
  CodeforcesApiResponse,
  CodeforcesRatingChange,
  CodeforcesSubmission,
  CodeforcesUser,
} from './types'

export type CodeforcesErrorKind =
  | 'not_found'
  | 'rate_limit'
  | 'network'
  | 'invalid_response'
  | 'api_error'
  | 'aborted'

export class CodeforcesApiError extends Error {
  readonly kind: CodeforcesErrorKind
  readonly status?: number

  constructor(kind: CodeforcesErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'CodeforcesApiError'
    this.kind = kind
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  )
}

function abortError(): DOMException {
  return new DOMException('The request was aborted.', 'AbortError')
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError())
      return
    }

    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)

    function handleAbort() {
      window.clearTimeout(timer)
      signal?.removeEventListener('abort', handleAbort)
      reject(abortError())
    }

    signal?.addEventListener('abort', handleAbort, { once: true })
  })
}

/**
 * Serialises API calls and enforces the two-second gap between request starts.
 * This is module-level so every consumer shares the same limiter.
 */
let lastRequestStartedAt = 0
let requestQueue: Promise<void> = Promise.resolve()

function schedule<T>(
  task: () => Promise<T>,
  signal?: AbortSignal,
): Promise<T> {
  const run = async (): Promise<T> => {
    const elapsed = Date.now() - lastRequestStartedAt
    const wait = Math.max(0, CODEFORCES_API_MIN_INTERVAL_MS - elapsed)
    if (wait > 0) await delay(wait, signal)
    if (signal?.aborted) throw abortError()

    lastRequestStartedAt = Date.now()
    return task()
  }

  const result = requestQueue.then(run, run)
  requestQueue = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

async function request<T>(url: string, signal?: AbortSignal): Promise<T> {
  return schedule(async () => {
    let response: Response

    try {
      response = await fetch(url, {
        signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
    } catch (error) {
      if (isAbortError(error)) throw abortError()
      throw new CodeforcesApiError(
        'network',
        'Could not reach Codeforces. Check your connection and try again.',
      )
    }

    const rawBody = await response.text()
    let payload: CodeforcesApiResponse<T>

    try {
      payload = JSON.parse(rawBody) as CodeforcesApiResponse<T>
    } catch {
      if (response.status === 429) {
        throw new CodeforcesApiError(
          'rate_limit',
          'Codeforces rate limit exceeded.',
          response.status,
        )
      }

      throw new CodeforcesApiError(
        response.ok ? 'invalid_response' : 'api_error',
        response.ok
          ? 'Codeforces returned an unreadable response.'
          : `Codeforces request failed (HTTP ${response.status}).`,
        response.status,
      )
    }

    if (payload.status === 'FAILED') {
      const comment = payload.comment ?? ''

      if (/not found|handled to be found/i.test(comment)) {
        throw new CodeforcesApiError('not_found', comment, response.status)
      }

      if (/limit exceeded|too many requests|rate limit/i.test(comment)) {
        throw new CodeforcesApiError('rate_limit', comment, response.status)
      }

      throw new CodeforcesApiError(
        'api_error',
        comment || `Codeforces request failed (HTTP ${response.status}).`,
        response.status,
      )
    }

    if (!response.ok) {
      throw new CodeforcesApiError(
        response.status === 429 ? 'rate_limit' : 'api_error',
        response.status === 429
          ? 'Codeforces rate limit exceeded.'
          : `Codeforces request failed (HTTP ${response.status}).`,
        response.status,
      )
    }

    if (payload.result === undefined) {
      throw new CodeforcesApiError(
        'invalid_response',
        'Codeforces response did not include a result.',
      )
    }

    return payload.result
  }, signal)
}

export function fetchUserInfo(
  handle: string,
  signal?: AbortSignal,
): Promise<CodeforcesUser[]> {
  return request<CodeforcesUser[]>(codeforcesEndpoints.userInfo(handle), signal)
}

export function fetchUserRating(
  handle: string,
  signal?: AbortSignal,
): Promise<CodeforcesRatingChange[]> {
  return request<CodeforcesRatingChange[]>(
    codeforcesEndpoints.userRating(handle),
    signal,
  )
}

export interface UserStatusResult {
  submissions: CodeforcesSubmission[]
  truncated: boolean
}

export async function fetchUserStatus(
  handle: string,
  signal?: AbortSignal,
): Promise<UserStatusResult> {
  const submissions: CodeforcesSubmission[] = []
  let truncated = false

  for (let page = 0; page < MAX_SUBMISSION_PAGES; page += 1) {
    const from = page * SUBMISSION_PAGE_SIZE + 1
    const pageResult = await request<CodeforcesSubmission[]>(
      codeforcesEndpoints.userStatus(handle, from, SUBMISSION_PAGE_SIZE),
      signal,
    )

    submissions.push(...pageResult)

    if (pageResult.length < SUBMISSION_PAGE_SIZE) break
    if (page === MAX_SUBMISSION_PAGES - 1) truncated = true
  }

  return { submissions, truncated }
}


