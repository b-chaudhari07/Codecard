import type { ProfileStatus } from '../hooks/useCodeforcesProfile'

/**
 * Top-level page state. `landing` is the untouched entry page, `example` is
 * the sample profile with its explanatory banner, and `live` is a real
 * Codeforces profile.
 */
export type AppView = 'landing' | 'loading' | 'live' | 'example' | 'error'

export interface ViewInput {
  status: ProfileStatus
  isDemo: boolean
  /** A handle search has been started (including a `/u/{handle}` load). */
  searchRequested: boolean
  /** The visitor explicitly asked for the sample profile. */
  exampleRequested: boolean
}

/**
 * Pure view decision shared by `App` and its tests. Errors and loading always
 * win so a stale profile can never flash behind a new request.
 */
export function getView({
  status,
  isDemo,
  searchRequested,
  exampleRequested,
}: ViewInput): AppView {
  if (status === 'error') return 'error'
  if (status === 'loading') return 'loading'

  if (status === 'success') {
    if (exampleRequested && isDemo) return 'example'
    if (searchRequested && !isDemo) return 'live'
    return 'landing'
  }

  // The hook is idle before its first request. A requested search is already
  // loading, which prevents a landing flash on `/u/{handle}` startup.
  return searchRequested ? 'loading' : 'landing'
}
