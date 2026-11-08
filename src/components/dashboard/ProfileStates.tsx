import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCw,
  SearchX,
  ShieldAlert,
  Sparkles,
  WifiOff,
} from 'lucide-react'

import type { ProfileFetchStage } from '../../hooks/useCodeforcesProfile'
import type { CodeforcesApiError } from '../../services/codeforces/api'
import { cn } from '../../lib/utils'

const STAGES: Array<{
  id: ProfileFetchStage
  label: string
  endpoint: string
}> = [
  { id: 'info', label: 'Fetching profile', endpoint: 'user.info' },
  { id: 'rating', label: 'Fetching rating history', endpoint: 'user.rating' },
  { id: 'status', label: 'Fetching submissions', endpoint: 'user.status' },
]

interface ProfileLoadingStateProps {
  handle: string | null
  stage: ProfileFetchStage | null
}

export function ProfileLoadingState({
  handle,
  stage,
}: ProfileLoadingStateProps) {
  const activeIndex = stage
    ? STAGES.findIndex((item) => item.id === stage)
    : 0

  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="widget mx-auto max-w-3xl p-7 sm:p-10">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-line bg-surface text-silver">
            <Loader2 size={18} className="animate-spin" />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">Loading profile</p>
            <h2 className="mt-2 truncate text-2xl font-semibold tracking-[-0.03em] text-ink">
              {handle ? `@${handle}` : 'Codeforces profile'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Fetching live data from the Codeforces public API. Requests are
              sent sequentially, one every two seconds, to respect the official
              rate limit.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-2">
          {STAGES.map((item, index) => {
            const done = index < activeIndex
            const active = index === activeIndex

            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  active
                    ? 'border-silver/40 bg-soft-2'
                    : 'border-line bg-soft',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                    done
                      ? 'border-positive/25 bg-positive-soft text-positive'
                      : active
                        ? 'border-silver/25 bg-silver/10 text-silver'
                        : 'border-line bg-surface text-muted/50',
                  )}
                >
                  {done ? (
                    <Check size={12} strokeWidth={2.6} />
                  ) : active ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="h-1 w-1 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={cn(
                    'text-[13px]',
                    active || done ? 'text-silver' : 'text-muted/60',
                  )}
                >
                  {item.label}
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted/50">
                  {item.endpoint}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

interface ProfileErrorStateProps {
  handle: string | null
  error: CodeforcesApiError
  onRetry: () => void
  onDemo: () => void
}

function errorCopy(error: CodeforcesApiError): {
  title: string
  message: string
  icon: LucideIcon
} {
  switch (error.kind) {
    case 'not_found':
      return {
        title: 'Handle not found',
        message: `We couldn't find ${handleLabel(error)} on Codeforces. Check the spelling and try again.`,
        icon: SearchX,
      }
    case 'rate_limit':
      return {
        title: 'Rate limit reached',
        message:
          'Codeforces is limiting requests right now. Wait a few seconds, then retry the profile.',
        icon: ShieldAlert,
      }
    case 'network':
      return {
        title: 'Network error',
        message:
          'Codeforces could not be reached. Check your connection and try again.',
        icon: WifiOff,
      }
    case 'invalid_response':
      return {
        title: 'Invalid API response',
        message:
          'Codeforces returned data that could not be read. Please retry in a moment.',
        icon: AlertTriangle,
      }
    default:
      return {
        title: 'Codeforces error',
        message:
          error.message || 'The Codeforces API returned an unexpected error.',
        icon: AlertTriangle,
      }
  }
}

function handleLabel(error: CodeforcesApiError): string {
  const match = error.message.match(/handle\s+(\S+)\s+not found/i)
  return match ? `@${match[1]}` : 'that handle'
}

export function ProfileErrorState({
  handle,
  error,
  onRetry,
  onDemo,
}: ProfileErrorStateProps) {
  const copy = errorCopy(error)
  const Icon = copy.icon

  return (
    <section className="section-shell py-16 sm:py-20">
      <div className="widget mx-auto max-w-3xl p-7 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-negative/20 bg-negative-soft text-negative">
            <Icon size={19} />
          </span>
          <div className="min-w-0">
            <p className="eyebrow text-negative/80">Unable to load profile</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">
              {copy.title}
            </h2>
            {handle ? (
              <p className="mt-1 text-[13px] text-silver/80">@{handle}</p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {copy.message}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[13px] font-semibold text-canvas transition-all hover:opacity-90"
          >
            <RefreshCw size={14} />
            Try again
          </button>
          <button
            type="button"
            onClick={onDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-silver transition-colors hover:border-silver/25 hover:text-ink"
          >
            <Sparkles size={14} className="text-gold" />
            View demo profile
          </button>
        </div>

        <p className="mt-6 border-t border-line pt-4 text-[11px] text-muted/60">
          Live data is never replaced with sample statistics when a request
          fails.
        </p>
      </div>
    </section>
  )
}

interface ProfileWarningsProps {
  warnings: string[]
  onRetry?: () => void
}

export function ProfileWarnings({
  warnings,
  onRetry,
}: ProfileWarningsProps) {
  if (warnings.length === 0) return null

  return (
    <section className="section-shell pt-12">
      <div className="rounded-2xl border border-warning/20 bg-warning-soft px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={15}
              className="mt-0.5 shrink-0 text-warning"
            />
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-warning/80">
                Partial data
              </p>
              {warnings.map((warning) => (
                <p
                  key={warning}
                  className="text-[12px] leading-relaxed text-muted"
                >
                  {warning}
                </p>
              ))}
            </div>
          </div>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-medium text-muted transition-colors hover:border-silver/25 hover:text-ink"
            >
              <RefreshCw size={11} />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

interface WidgetStateProps {
  icon: LucideIcon
  title: string
  description: string
}

export function WidgetState({
  icon: Icon,
  title,
  description,
}: WidgetStateProps) {
  return (
    <div className="mt-7 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-soft px-6 py-10 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-muted">
        <Icon size={17} strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-[13px] font-medium text-silver">{title}</p>
      <p className="mt-1.5 max-w-[280px] text-[11px] leading-relaxed text-muted/80">
        {description}
      </p>
    </div>
  )
}
