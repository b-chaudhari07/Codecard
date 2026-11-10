import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

import { CodeforcesMark } from '../ui/CodeforcesMark'
import type { AppTheme } from '../../lib/appTheme'
import type { Profile } from '../../types/profile'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { label: 'Card', href: '#studio', id: 'studio' },
  { label: 'Insights', href: '#insights', id: 'insights' },
  { label: 'Challenges', href: '#challenges', id: 'challenges' },
  { label: 'About', href: '#about', id: 'about' },
]

interface HeaderProps {
  theme: AppTheme
  onToggleTheme: () => void
  /**
   * The observed section nodes only exist for a rendered profile and are
   * replaced on every live search, so the observer re-attaches whenever the
   * profile object changes.
   */
  profile: Profile | null
  /** Landing hides the section nav until a profile is on screen. */
  showNav: boolean
  onHome: () => void
}

export function Header({
  theme,
  onToggleTheme,
  profile,
  showNav,
  onHome,
}: HeaderProps) {
  const [activeSection, setActiveSection] = useState('studio')

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.getElementById(item.id),
    ).filter((section): section is HTMLElement => section !== null)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [profile])

  const nextThemeLabel = theme === 'dark' ? 'light' : 'dark'

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-canvas/75 backdrop-blur-xl">
      <div className="section-shell flex h-16 items-center justify-between gap-4">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault()
            onHome()
          }}
          className="group flex items-center gap-2.5"
          aria-label="Codecard home"
        >
          <span className="inset-highlight flex h-8 w-8 items-center justify-center rounded-[10px] border border-line bg-surface text-silver transition-colors group-hover:border-silver/25">
            <CodeforcesMark size={15} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Codecard
          </span>
        </a>

        <nav
          className={cn(
            'hidden items-center gap-1 rounded-full border border-line bg-widget/60 p-1 md:flex',
            !showNav && 'md:hidden',
          )}
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-200',
                activeSection === item.id
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink',
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inset-highlight inline-flex items-center gap-1.5 rounded-full border border-line bg-widget px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-silver/30 hover:text-ink"
            title={`Switch to ${nextThemeLabel} theme`}
            aria-label={`Switch to ${nextThemeLabel} theme`}
          >
            {theme === 'dark' ? (
              <Sun size={12} strokeWidth={1.8} />
            ) : (
              <Moon size={12} strokeWidth={1.8} />
            )}
            <span className="hidden sm:inline">
              {theme === 'dark' ? 'Light' : 'Dark'}
            </span>
          </button>
          {showNav ? (
            <a
              href="#studio"
              className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] font-medium text-silver transition-colors hover:border-silver/25 hover:text-ink md:hidden"
            >
              Card
            </a>
          ) : null}
        </div>
      </div>
    </header>
  )
}
