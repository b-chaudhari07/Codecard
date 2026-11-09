import { useEffect, useRef, useState } from 'react'

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
import type { CardOptions } from './types/profile'

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
  const [theme, setTheme] = useState<AppTheme>(() => getInitialTheme())
  const [cardOptions, setCardOptions] = useState<CardOptions>(() =>
    loadCardOptions(),
  )
  const scrollPending = useRef(false)

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

  const handleSearch = (handle: string) => {
    scrollPending.current = true
    setHasSearched(true)
    search(handle)
  }

  useEffect(() => {
    if (!hasSearched || !scrollPending.current) return
    if (
      status !== 'loading' &&
      status !== 'error' &&
      status !== 'success'
    ) {
      return
    }

    scrollPending.current = false
    document
      .getElementById('results')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hasSearched, status])

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
              <ProfileOverview profile={profile} />
              <HardestChallenges profile={profile} />
              <Analytics
                profile={profile}
                cardOptions={cardOptions}
                appTheme={theme}
              />
              <CardStudio
                profile={profile}
                options={cardOptions}
                onOptionsChange={setCardOptions}
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
