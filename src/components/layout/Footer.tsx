import { ArrowUpRight, Code2 } from 'lucide-react'

import { CodeforcesMark } from '../ui/CodeforcesMark'

export function Footer() {
  return (
    <footer
      id="about"
      className="mt-8 scroll-mt-24 border-t border-white/[0.05] bg-canvas/60"
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
                  <a href="#overview" className="text-muted transition-colors hover:text-ink">
                    Overview
                  </a>
                </li>
                <li>
                  <a href="#analytics" className="text-muted transition-colors hover:text-ink">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#studio" className="text-muted transition-colors hover:text-ink">
                    Card Studio
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
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted transition-colors hover:text-ink"
                  >
                    <Code2 size={13} />
                    GitHub
                  </a>
                </li>
                <li>
                  <span className="text-muted/50">Privacy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.05] pt-6 text-[11px] text-muted/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Codecard. All rights reserved.</p>
          <p>
            Profile data via the Codeforces public API. Live results are fetched
            directly from Codeforces; the sample fixture is used only in demo
            mode.
          </p>
        </div>
      </div>
    </footer>
  )
}
