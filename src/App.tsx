import { useCallback, useEffect, useRef, useState } from 'react'

import { Analytics } from './components/dashboard/Analytics'
import { HardestChallenges } from './components/dashboard/HardestChallenges'
import { Hero } from './components/dashboard/Hero'
import { ProfileOverview } from './components/dashboard/ProfileOverview'
import {
  ProfileErrorState,
  ProfileLoadingState,
  ProfileWarnings,
} from './components/dashboard/ProfileStates'
import { Footer } from './components/layout/Footer'
import { AppErrorBoundary } from './components/ui/AppErrorBoundary'
import { Header } from './components/layout/Header'
import { CardStudio } from './components/studio/CardStudio'
import { useCodeforcesProfile } from './hooks/useCodeforcesProfile'
import {
  applyTheme,
  getInitialTheme,
  getStoredTheme,
  persistTheme,
} from './lib/appTheme'
import type { AppTheme } from './lib/appTheme'
import { loadCardOptions, persistCardOptions } from './lib/cardOptionsStorage'
import { parseHandleFromPath } from './lib/routing'
import { sanitizeStats, swapStat } from './lib/cardStats'
import type { CardOptions, StatId } from './types/profile'

function App() {
  const {
    profile,
    status,
    stage,
    error,
    activeHandle,
    isDemo,
    search,
    retry,
    showDemo,
  } = useCodeforcesProfile()

  const [hasSearched, setHasSearched] = useState(false)
  const [searchAttempt, setSearchAttempt] = useState(0)
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme())
  const [cardOptions, setCardOptions] = useState<CardOptions>(() =>
    loadCardOptions(),
  )
  const scrollPending = useRef(false)
  const scrollTarget = useRef<'results' | 'studio'>('results')
  const initialPathHandled = useRef(false)
  const updateUrlAfterSearch = useRef(false)

  useEffect(() => {
    applyTheme(theme)
    persistTheme(theme)
  }, [theme])

  useEffect(() => {
    persistCardOptions(cardOptions)
  }, [cardOptions])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const handleChange = (event: MediaQueryListEvent) => {
      if (!getStoredTheme()) {
        setTheme(event.matches ? 'light' : 'dark')
      }
    }

    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [])

  const handleSearch = useCallback((handle: string, fromPath = false) => {
    scrollPending.current = true
    scrollTarget.current = 'studio'
    updateUrlAfterSearch.current = !fromPath
    setHasSearched(true)
    setSearchAttempt((attempt) => attempt + 1)
    search(handle)
  }, [search])

  const handleSelectStat = useCallback((statId: StatId) => {
    setCardOptions((current) => {
      const stats = sanitizeStats(current.stats)
      return {
        ...current,
        stats: swapStat(stats, stats.length - 1, statId),
      }
    })
  }, [])

  useEffect(() => {
    if (initialPathHandled.current) return
    const pathHandle = parseHandleFromPath(window.location.pathname)
    if (!pathHandle) {
      initialPathHandled.current = true
      return
    }
    const timer = window.setTimeout(() => {
      initialPathHandled.current = true
      handleSearch(pathHandle, true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [handleSearch])

  useEffect(() => {
    const handlePopState = () => {
      const pathHandle = parseHandleFromPath(window.location.pathname)
      updateUrlAfterSearch.current = false
      if (pathHandle) {
        handleSearch(pathHandle, true)
      } else {
        scrollPending.current = false
        setHasSearched(false)
        showDemo()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handleSearch, showDemo])

  useEffect(() => {
    if (status !== 'success' || !profile || isDemo) return
    if (!updateUrlAfterSearch.current) return
    updateUrlAfterSearch.current = false
    const nextPath = `/u/${encodeURIComponent(profile.handle)}`
    const currentHandle = parseHandleFromPath(window.location.pathname)
    if (currentHandle?.toLowerCase() === profile.handle.toLowerCase()) {
      window.history.replaceState(null, '', nextPath)
    } else {
      window.history.pushState(null, '', nextPath)
    }
  }, [status, profile, isDemo])

  useEffect(() => {
    if (!hasSearched || !scrollPending.current) return
    if (
      status !== 'loading' &&
      status !== 'error' &&
      status !== 'success'
    ) {
      return
    }

    if (scrollTarget.current === 'studio' && status !== 'success') return
    scrollPending.current = false
    document
      .getElementById(scrollTarget.current)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hasSearched, searchAttempt, status])

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="ambient-glow ambient-glow-one" />
        <div className="ambient-glow ambient-glow-two" />
        <div className="ambient-glow ambient-glow-three" />
      </div>

      <Header
        theme={theme}
        onToggleTheme={() => {
          setTheme((current) => {
            const next = current === 'dark' ? 'light' : 'dark'
            applyTheme(next)
            persistTheme(next)
            return next
          })
        }}
        profile={profile}
      />

      <main>
        <Hero
          onSearch={handleSearch}
          isLoading={status === 'loading'}
          isDemo={isDemo}
          hasError={status === 'error'}
          activeHandle={activeHandle}
        />

        <div id="results" className="scroll-mt-20">
          {status === 'loading' ? (
            <ProfileLoadingState handle={activeHandle} stage={stage} />
          ) : null}

          {status === 'error' && error ? (
            <ProfileErrorState
              handle={activeHandle}
              error={error}
              onRetry={retry}
              onDemo={showDemo}
            />
          ) : null}

          {profile ? (
            <>
              <ProfileWarnings
                warnings={profile.warnings}
                onRetry={profile.isSample ? undefined : retry}
              />
              <AppErrorBoundary message="The card studio hit a snag. Your profile dashboard is still available.">
                <CardStudio
                  profile={profile}
                  options={cardOptions}
                  onOptionsChange={setCardOptions}
                />
              </AppErrorBoundary>
              <ProfileOverview profile={profile} />
              <Analytics
                profile={profile}
                cardOptions={cardOptions}
                appTheme={theme}
                onSelectStat={handleSelectStat}
              />
              <HardestChallenges
                profile={profile}
                selectedStats={cardOptions.stats}
              />
            </>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
