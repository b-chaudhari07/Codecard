import { useCallback, useEffect, useRef, useState } from 'react'

import { sampleProfile } from '../data/sampleProfile'
import {
  CodeforcesApiError,
  fetchUserInfo,
  fetchUserRating,
  fetchUserStatus,
  isAbortError,
} from '../services/codeforces/api'
import { fetchAvatarAsDataUrl } from '../services/codeforces/avatar'
import { transformProfile } from '../services/codeforces/transformers'
import type {
  CodeforcesRatingChange,
  CodeforcesSubmission,
} from '../services/codeforces/types'
import type { Profile } from '../types/profile'

export type ProfileStatus = 'idle' | 'loading' | 'success' | 'error'
export type ProfileFetchStage = 'info' | 'rating' | 'status'

interface CachedProfile {
  profile: Profile
  fetchedAt: number
}

const CACHE_TTL_MS = 5 * 60 * 1000

/** Module-level so profiles survive component remounts and tab switches. */
const profileCache = new Map<string, CachedProfile>()

export interface UseCodeforcesProfileResult {
  profile: Profile | null
  status: ProfileStatus
  stage: ProfileFetchStage | null
  error: CodeforcesApiError | null
  activeHandle: string | null
  isDemo: boolean
  search: (handle: string) => void
  retry: () => void
  showDemo: () => void
}

export function useCodeforcesProfile(): UseCodeforcesProfileResult {
  const [profile, setProfile] = useState<Profile | null>(sampleProfile)
  const [status, setStatus] = useState<ProfileStatus>('success')
  const [stage, setStage] = useState<ProfileFetchStage | null>(null)
  const [error, setError] = useState<CodeforcesApiError | null>(null)
  const [activeHandle, setActiveHandle] = useState<string | null>(
    sampleProfile.handle,
  )
  const [isDemo, setIsDemo] = useState(true)

  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  const loadingHandleRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const run = useCallback(
    async (rawHandle: string, force = false) => {
      const handle = rawHandle.trim()
      if (!handle) return

      const key = handle.toLowerCase()
      const cached = profileCache.get(key)

      if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        requestIdRef.current += 1
        abortRef.current?.abort()
        abortRef.current = null
        loadingHandleRef.current = null

        setProfile(cached.profile)
        setActiveHandle(handle)
        setIsDemo(false)
        setError(null)
        setStage(null)
        setStatus('success')
        return
      }

      // Prevent duplicate requests for a handle that is already loading.
      if (!force && loadingHandleRef.current === key) return

      requestIdRef.current += 1
      const requestId = requestIdRef.current

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      loadingHandleRef.current = key

      setActiveHandle(handle)
      setIsDemo(false)
      setError(null)
      setStage('info')
      setStatus('loading')
      setProfile(null)

      try {
        const users = await fetchUserInfo(handle, controller.signal)
        if (requestId !== requestIdRef.current) return

        const user = users[0]
        if (!user) {
          throw new CodeforcesApiError(
            'not_found',
            `User with handle ${handle} not found.`,
          )
        }

        const warnings: string[] = []

        // The avatar is not part of the Codeforces API rate limit, so it can be
        // fetched in parallel with the sequential rating/submission requests.
        const avatarPromise = fetchAvatarAsDataUrl(
          user.titlePhoto || user.avatar,
          controller.signal,
        ).catch(() => null)

        setStage('rating')
        let rating: CodeforcesRatingChange[] | null = null

        try {
          rating = await fetchUserRating(handle, controller.signal)
        } catch (ratingError) {
          if (isAbortError(ratingError)) throw ratingError
          if (
            ratingError instanceof CodeforcesApiError &&
            ratingError.kind === 'not_found'
          ) {
            throw ratingError
          }
          rating = null
          warnings.push(
            'Rating history could not be loaded. Contest statistics are unavailable for this profile.',
          )
        }

        if (requestId !== requestIdRef.current) return

        setStage('status')
        let submissions: CodeforcesSubmission[] | null = null
        let submissionsTruncated = false

        try {
          const result = await fetchUserStatus(handle, controller.signal)
          submissions = result.submissions
          submissionsTruncated = result.truncated
        } catch (statusError) {
          if (isAbortError(statusError)) throw statusError
          if (
            statusError instanceof CodeforcesApiError &&
            statusError.kind === 'not_found'
          ) {
            throw statusError
          }
          submissions = null
          warnings.push(
            'Submission history could not be loaded. Problem and topic statistics are unavailable for this profile.',
          )
        }

        if (requestId !== requestIdRef.current) return

        // The avatar fetch has been running in parallel with the API calls.
        // A null result keeps the direct image URL for display; the card only
        // falls back to initials if that image also fails to load.
        const avatarDataUrl = await avatarPromise

        if (requestId !== requestIdRef.current) return

        const nextProfile = transformProfile({
          user,
          rating,
          submissions,
          submissionsTruncated,
          avatarDataUrl,
          warnings,
        })

        // Only cache complete profiles so a partial failure can be retried by
        // searching the same handle again.
        if (nextProfile.warnings.length === 0) {
          profileCache.set(key, {
            profile: nextProfile,
            fetchedAt: Date.now(),
          })
        }
        loadingHandleRef.current = null

        setProfile(nextProfile)
        setStage(null)
        setStatus('success')
      } catch (caught) {
        if (requestId !== requestIdRef.current) return
        if (isAbortError(caught)) return

        const apiError =
          caught instanceof CodeforcesApiError
            ? caught
            : new CodeforcesApiError(
                'invalid_response',
                'An unexpected error occurred while loading this profile.',
              )

        loadingHandleRef.current = null
        setError(apiError)
        setStage(null)
        setStatus('error')
        setProfile(null)
      }
    },
    [],
  )

  const search = useCallback(
    (handle: string) => {
      void run(handle)
    },
    [run],
  )

  const retry = useCallback(() => {
    if (!activeHandle) return
    profileCache.delete(activeHandle.toLowerCase())
    void run(activeHandle, true)
  }, [activeHandle, run])

  const showDemo = useCallback(() => {
    requestIdRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
    loadingHandleRef.current = null

    setProfile(sampleProfile)
    setStatus('success')
    setStage(null)
    setError(null)
    setIsDemo(true)
    setActiveHandle(sampleProfile.handle)
  }, [])

  return {
    profile,
    status,
    stage,
    error,
    activeHandle,
    isDemo,
    search,
    retry,
    showDemo,
  }
}
