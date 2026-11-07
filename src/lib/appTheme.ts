export type AppTheme = 'dark' | 'light'

export const APP_THEME_STORAGE_KEY = 'codecard-theme'

function isTheme(value: string | null): value is AppTheme {
  return value === 'dark' || value === 'light'
}

export function getStoredTheme(): AppTheme | null {
  try {
    const stored = window.localStorage.getItem(APP_THEME_STORAGE_KEY)
    return isTheme(stored) ? stored : null
  } catch {
    return null
  }
}

export function getSystemTheme(): AppTheme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

/** Stored preference wins; a first visit follows the operating system. */
export function getInitialTheme(): AppTheme {
  return getStoredTheme() ?? getSystemTheme()
}

export function applyTheme(theme: AppTheme): void {
  document.documentElement.dataset.theme = theme
  document.documentElement.style.colorScheme = theme
}

export function persistTheme(theme: AppTheme): void {
  try {
    window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme)
  } catch {
    // Private browsing can reject storage writes; the theme still applies.
  }
}
