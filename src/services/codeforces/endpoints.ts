export const CODEFORCES_API_BASE = 'https://codeforces.com/api'

/** Official limit: at most one API call every two seconds. */
export const CODEFORCES_API_MIN_INTERVAL_MS = 2_000

/** Codeforces caps `user.status` at 10,000 submissions per request. */
export const SUBMISSION_PAGE_SIZE = 10_000

/** Safety cap for pagination (30,000 most recent submissions). */
export const MAX_SUBMISSION_PAGES = 3

export const codeforcesEndpoints = {
  userInfo: (handle: string) =>
    `${CODEFORCES_API_BASE}/user.info?handles=${encodeURIComponent(handle)}`,
  userRating: (handle: string) =>
    `${CODEFORCES_API_BASE}/user.rating?handle=${encodeURIComponent(handle)}`,
  userStatus: (handle: string, from = 1, count = SUBMISSION_PAGE_SIZE) =>
    `${CODEFORCES_API_BASE}/user.status?handle=${encodeURIComponent(handle)}&from=${from}&count=${count}`,
} as const
