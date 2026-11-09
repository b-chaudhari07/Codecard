const HANDLE_PATTERN = /^[a-zA-Z0-9_.-]{3,24}$/

export function isValidHandle(handle: string): boolean {
  return HANDLE_PATTERN.test(handle)
}

export function parseHandleFromPath(pathname: string): string | null {
  const match = /^\/u\/([^/]+)\/?$/.exec(pathname)
  if (!match || !isValidHandle(match[1])) return null
  return match[1]
}
