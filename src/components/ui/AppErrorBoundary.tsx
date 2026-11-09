import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface AppErrorBoundaryProps {
  children: ReactNode
  message?: string
}

interface AppErrorBoundaryState {
  hasError: boolean
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error('Codecard rendering error', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          role="alert"
          className="mx-auto my-12 max-w-xl rounded-2xl border border-line bg-widget p-6 text-center text-ink"
        >
          <p className="text-sm text-muted">
            {this.props.message ?? 'Something went wrong while loading this part of Codecard.'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-ink px-4 py-2 text-sm font-semibold text-canvas transition-opacity hover:opacity-90"
          >
            Reload
          </button>
        </section>
      )
    }
    return this.props.children
  }
}
