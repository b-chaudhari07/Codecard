interface CodeforcesMarkProps {
  size?: number
  className?: string
}

/**
 * A small, abstract Codeforces-inspired mark: three ascending bars.
 * Deliberately generic so it reads as branding without copying the logo.
 */
export function CodeforcesMark({
  size = 18,
  className,
}: CodeforcesMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="13" width="4.5" height="8" rx="1.4" fill="currentColor" opacity="0.55" />
      <rect x="9.75" y="8" width="4.5" height="13" rx="1.4" fill="currentColor" opacity="0.8" />
      <rect x="16.5" y="3" width="4.5" height="18" rx="1.4" fill="currentColor" />
    </svg>
  )
}
