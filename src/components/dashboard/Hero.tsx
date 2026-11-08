import { useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight, Loader2, Search, Sparkles } from 'lucide-react'

import { CodeforcesMark } from '../ui/CodeforcesMark'
import { cn } from '../../lib/utils'

interface HeroProps {
  onSearch: (handle: string) => void
  isLoading: boolean
  isDemo: boolean
  hasError: boolean
  activeHandle: string | null
}

const HANDLE_PATTERN = /^[a-zA-Z0-9_.-]{3,24}$/

export function Hero({
  onSearch,
  isLoading,
  isDemo,
  hasError,
  activeHandle,
}: HeroProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const handle = value.trim()

    if (!handle) {
      setError('Enter a Codeforces handle to continue.')
      return
    }

    if (!HANDLE_PATTERN.test(handle)) {
      setError('Handles are 3–24 characters: letters, numbers, "_", "." or "-".')
      return
    }

    setError(null)
    onSearch(handle)
  }

  return (
    <section id="top" className="relative pt-16 sm:pt-24">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-widget/70 px-3.5 py-1.5 text-[11px] text-muted backdrop-blur">
            <Sparkles size={12} className="text-gold" />
            Codeforces profile analytics, refined
            <span className="h-1 w-1 rounded-full bg-line" />
            <span className="text-silver/80">Beta</span>
          </div>

          <h1 className="animate-fade-up mt-7 text-[44px] font-semibold leading-[1.03] tracking-[-0.045em] text-ink [animation-delay:80ms] sm:text-6xl lg:text-[76px]">
            Your Codeforces,
            <br />
            <span className="bg-gradient-to-r from-silver via-ink to-silver bg-clip-text text-transparent">
              visualized.
            </span>
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted [animation-delay:140ms] sm:text-lg">
            Your competitive programming journey deserves more than just
            numbers.
          </p>

          <form
            onSubmit={handleSubmit}
            className="animate-fade-up mx-auto mt-10 max-w-xl [animation-delay:200ms]"
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
                className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-ink placeholder:text-muted/55 focus:outline-none disabled:opacity-70"
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
              ) : !isDemo && !hasError && activeHandle ? (
                <p className="animate-fade-in flex items-center gap-1.5 text-xs text-positive">
                  <span className="h-1 w-1 rounded-full bg-positive" />
                  Live profile loaded for @{activeHandle}
                </p>
              ) : null}
            </div>
          </form>

          <div className="animate-fade-up mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted/70 [animation-delay:260ms]">
            <span className="inline-flex items-center gap-1.5">
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  isDemo ? 'bg-gold/80' : 'bg-positive/80',
                )}
              />
              {isDemo ? 'Demo mode · sample statistics' : 'Live · Codeforces API'}
            </span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <span>No login required</span>
            <span className="hidden h-3 w-px bg-line sm:block" />
            <span>PNG export included</span>
          </div>
        </div>
      </div>
    </section>
  )
}
