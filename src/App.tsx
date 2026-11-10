import { useCallback, useEffect, useRef, useState } from 'react'

import { Analytics } from './components/dashboard/Analytics'
import { HardestChallenges } from './components/dashboard/HardestChallenges'
import { ProfileOverview } from './components/dashboard/ProfileOverview'
import {
  ProfileErrorState,
  ProfileWarnings,
} from './components/dashboard/ProfileStates'
import { ExampleBanner } from './components/landing/ExampleBanner'
import { LandingHero } from './components/landing/LandingHero'
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
import { getView } from './lib/view'
import type { CardOptions, StatId } from './types/profile'

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

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
    reset,
  } = useCodeforcesProfile()

  const [initialPathHandle] = useState(() =>
    parseHandleFromPath(window.location.pathname),
  )
  const [searchRequested, setSearchRequested] = useState(
    () => initialPathHandle !== null,
  )
  const [exampleRequested, setExampleRequested] = useState(false)
  const [searchAttempt, setSearchAttempt] = useState(0)
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme())
  const [cardOptions, setCardOptions] = useState<CardOptions>(() =>
    loadCardOptions(),
  )
  const scrollPending = useRef(false)
  const scrollTarget = useRef<'results' | 'studio'>('results')
  const initialPathHandled = useRef(false)
  const updateUrlAfterSearch = useRef(false)

  const view = getView({
    status,
    isDemo,
    searchRequested,
    exampleRequested,
  })

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

  const handleSearch = useCallback(
    (handle: string, fromPath = false) => {
      scrollPending.current = true
      scrollTarget.current = 'studio'
      updateUrlAfterSearch.current = !fromPath
      setSearchRequested(true)
      setExampleRequested(false)
      setSearchAttempt((attempt) => attempt + 1)
      search(handle)
    },
    [search],
  )

  const resetToLanding = useCallback(() => {
    scrollPending.current = false
    updateUrlAfterSearch.current = false
    reset()
    setSearchRequested(false)
    setExampleRequested(false)
  }, [reset])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    })
  }, [])

  const handleBackToStart = useCallback(() => {
    resetToLanding()
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/')
    }
    scrollToTop()
  }, [resetToLanding, scrollToTop])

  const handleExampleStart = useCallback(() => {
    handleBackToStart()
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById('handle')?.focus({ preventScroll: true })
      })
    })
  }, [handleBackToStart])

  const handleSeeExample = useCallback(() => {
    scrollPending.current = false
    updateUrlAfterSearch.current = false
    setSearchRequested(false)
    setExampleRequested(true)
    showDemo()
  }, [showDemo])

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
    if (!initialPathHandle) {
      initialPathHandled.current = true
      return
    }
    const timer = window.setTimeout(() => {
      initialPathHandled.current = true
      handleSearch(initialPathHandle, true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [handleSearch, initialPathHandle])

  useEffect(() => {
    const handlePopState = () => {
      const pathHandle = parseHandleFromPath(window.location.pathname)
      updateUrlAfterSearch.current = false
      if (pathHandle) {
        handleSearch(pathHandle, true)
      } else {
        resetToLanding()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [handleSearch, resetToLanding])

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
    if (!searchRequested || !scrollPending.current) return
    if (status !== 'loading' && status !== 'error' && status !== 'success') {
      return
    }

    if (scrollTarget.current === 'studio' && status !== 'success') return
    scrollPending.current = false
    document
      .getElementById(scrollTarget.current)
      ?.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      })
  }, [searchRequested, searchAttempt, status])

  const isFullView = view === 'live' || view === 'example'
  const showCompactHero = isFullView || view === 'error'

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
        showNav={view !== 'landing'}
        onHome={handleBackToStart}
      />

      <main>
        <LandingHero
          onSearch={handleSearch}
          onSeeExample={handleSeeExample}
          isLoading={view === 'loading'}
          stage={stage}
          activeHandle={activeHandle}
          compact={showCompactHero}
        />

        <div id="results" className="scroll-mt-20">
          {view === 'error' && error ? (
            <ProfileErrorState
              handle={activeHandle}
              error={error}
              onRetry={retry}
              onDemo={handleSeeExample}
              onBackToStart={handleBackToStart}
            />
          ) : null}

          {isFullView && profile ? (
            <div className="animate-fade-in motion-reduce:animate-none">
              {view === 'example' ? (
                <ExampleBanner onStart={handleExampleStart} />
              ) : null}

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
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App
