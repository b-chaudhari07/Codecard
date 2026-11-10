import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Loader2, Search, Sparkles } from 'lucide-react'

import { FlipCard } from './FlipCard'
import { CodeforcesMark } from '../ui/CodeforcesMark'
import { ProfileLoadingState } from '../dashboard/ProfileStates'
import { cn } from '../../lib/utils'
import { isValidHandle } from '../../lib/routing'
import type { ProfileFetchStage } from '../../hooks/useCodeforcesProfile'

interface LandingHeroProps {
  onSearch: (handle: string) => void
  onSeeExample: () => void
  isLoading: boolean
  stage: ProfileFetchStage | null
  activeHandle: string | null
  compact?: boolean
}

export function LandingHero({
  onSearch,
  onSeeExample,
  isLoading,
  stage,
  activeHandle,
  compact = false,
}: LandingHeroProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const handle = value.trim()

    if (!handle) {
      setError('Enter a Codeforces handle to continue.')
      return
    }

    if (!isValidHandle(handle)) {
      setError('Handles are 3–24 characters: letters, numbers, "_", "." or "-".')
      return
    }

    setError(null)
    onSearch(handle)
  }

  return (
    <section
      id="top"
      className={cn('relative', compact ? 'pt-8 sm:pt-10' : 'pt-16 sm:pt-24')}
    >
      <div className="section-shell">
        <div
          className={cn(
            'mx-auto text-center transition-all duration-300',
            compact ? 'max-w-2xl' : 'max-w-3xl',
          )}
        >
          {!compact ? (
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-widget/70 px-3.5 py-1.5 text-[11px] text-muted backdrop-blur">
              <Sparkles size={12} className="text-gold" />
              Codeforces profile cards
              <span className="h-1 w-1 rounded-full bg-line" />
              <span className="text-silver/80">Beta</span>
            </div>
          ) : null}

          <h1
            className={cn(
              'font-semibold tracking-[-0.045em] text-ink',
              compact
                ? 'animate-fade-in text-2xl leading-tight sm:text-3xl'
                : 'animate-fade-up mt-7 text-[44px] leading-[1.03] sm:text-6xl lg:text-[76px]',
            )}
          >
            Your card.{' '}
            <span className="landing-gradient-text">Your identity.</span>
          </h1>

          {!compact ? (
            <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-silver [animation-delay:140ms] sm:text-lg">
              Turn your Codeforces profile into a collectible card worth
              sharing.
            </p>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className={cn(
              'animate-fade-up mx-auto [animation-delay:200ms]',
              compact ? 'mt-4 max-w-xl' : 'mt-10 max-w-xl',
            )}
            noValidate
          >
            <div
              className={cn(
                'flex items-center gap-2 rounded-2xl border bg-widget/80 p-2 pl-4 shadow-xl shadow-black/10 backdrop-blur transition-all duration-300 dark:shadow-black/40',
                error
                  ? 'border-negative/40 ring-4 ring-negative-soft'
                  : 'border-line focus-within:border-silver/35 focus-within:ring-4 focus-within:ring-silver/[0.06]',
              )}
            >
              <CodeforcesMark
                size={18}
                className="shrink-0 text-silver/60"
              />
              <label htmlFor="handle" className="sr-only">
                Codeforces handle
              </label>
              <input
                id="handle"
                name="handle"
                value={value}
                onChange={(event) => {
                  setValue(event.target.value)
                  if (error) setError(null)
                }}
                placeholder="Enter your Codeforces handle"
                autoComplete="off"
                spellCheck={false}
                disabled={isLoading}
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-silver/80 focus:outline-none disabled:opacity-70"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-[13px] font-semibold text-canvas transition-all duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70 sm:px-5"
              >
                {isLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Search size={15} strokeWidth={2.2} />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? 'Loading' : 'Generate'}
                </span>
                {!isLoading ? (
                  <ArrowRight size={14} className="hidden sm:block" />
                ) : null}
              </button>
            </div>

            <div className="min-h-6 pt-2.5 text-left">
              {error ? (
                <p className="animate-fade-in text-xs text-negative">{error}</p>
              ) : isLoading ? (
                <p className="animate-fade-in flex items-center gap-1.5 text-xs text-silver/80">
                  <Loader2 size={11} className="animate-spin" />
                  Fetching live data from Codeforces. This can take a few
                  seconds.
                </p>
              ) : null}
            </div>
          </form>

          {!compact ? (
            <>
              <div className="animate-fade-up mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-silver/80 [animation-delay:260ms]">
                <span>No login</span>
                <span className="h-1 w-1 rounded-full bg-line" />
                <span>Free</span>
                <span className="h-1 w-1 rounded-full bg-line" />
                <span>PNG export</span>
              </div>

              <button
                type="button"
                onClick={onSeeExample}
                className="animate-fade-up mt-5 rounded-sm text-[12px] font-medium text-positive underline-offset-4 transition-colors hover:underline focus-visible:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-positive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas [animation-delay:300ms]"
              >
                See an example →
              </button>

              {isLoading ? (
                <ProfileLoadingState
                  handle={activeHandle}
                  stage={stage}
                  compact
                />
              ) : null}

              <div className="animate-fade-up mt-8 [animation-delay:360ms]">
                <FlipCard loading={isLoading} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
