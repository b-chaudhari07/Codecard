import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Code2, X } from 'lucide-react'

import { CodeforcesMark } from '../ui/CodeforcesMark'

export function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false)
  const privacyTrigger = useRef<HTMLButtonElement>(null)
  const privacyClose = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!privacyOpen) return
    const trigger = privacyTrigger.current
    privacyClose.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPrivacyOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      trigger?.focus()
    }
  }, [privacyOpen])

  const githubUrl = import.meta.env.VITE_GITHUB_URL?.trim()

  return (
    <footer
      id="about"
      className="mt-8 scroll-mt-24 border-t border-line bg-canvas/60"
    >
      <div className="section-shell py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-line bg-surface text-silver">
                <CodeforcesMark size={15} />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                Codecard
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              A calmer way to look at your competitive programming journey.
              Built for the people who keep showing up.
            </p>
            <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-silver/70">
              Dream. Solve. Repeat.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:gap-x-20">
            <div>
              <p className="eyebrow">Product</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="#studio" className="text-muted transition-colors hover:text-ink">
                    Card
                  </a>
                </li>
                <li>
                  <a href="#challenges" className="text-muted transition-colors hover:text-ink">
                    Challenges
                  </a>
                </li>
                <li>
                  <a href="#insights" className="text-muted transition-colors hover:text-ink">
                    Insights
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="eyebrow">Resources</p>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a
                    href="https://codeforces.com/apiHelp"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
                  >
                    Codeforces API
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                {githubUrl ? (
                  <li>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
                    >
                      <Code2 size={13} />
                      GitHub
                    </a>
                  </li>
                ) : null}
                <li>
                  <button
                    ref={privacyTrigger}
                    type="button"
                    onClick={() => setPrivacyOpen(true)}
                    aria-haspopup="dialog"
                    className="text-muted transition-colors hover:text-ink"
                  >
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[11px] text-muted/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Codecard. All rights reserved.</p>
          <p>
            Profile data via the Codeforces public API. Live results are fetched
            directly from Codeforces; the sample fixture is used only in
            example mode.
          </p>
        </div>
      </div>
      {privacyOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPrivacyOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="privacy-title"
            className="w-full max-w-lg rounded-2xl border border-line bg-widget p-5 text-ink shadow-2xl sm:p-6"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Codecard</p>
                <h2 id="privacy-title" className="mt-1 text-lg font-semibold">
                  Privacy
                </h2>
              </div>
              <button
                ref={privacyClose}
                type="button"
                onClick={() => setPrivacyOpen(false)}
                aria-label="Close privacy information"
                className="rounded-lg border border-line bg-soft p-2 text-muted transition-colors hover:text-ink"
              >
                <X size={16} />
              </button>
            </header>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
              <li>We use privacy-friendly visit counts (Vercel Web Analytics): no cookies, no profile data, and handles are removed from tracked pages. No accounts, and your card settings stay in your browser.</li>
              <li>Profile data is fetched directly from the public Codeforces API in your browser.</li>
              <li>Your avatar is fetched through the third-party wsrv.nl image proxy so it can be included in the downloaded image.</li>
              <li>Card settings and small uploaded photos or banners are saved in this browser&apos;s local storage only. Large uploads stay in memory and are not saved.</li>
              <li>Codecard is not affiliated with or endorsed by Codeforces.</li>
            </ul>
          </section>
        </div>
      ) : null}
    </footer>
  )
}
