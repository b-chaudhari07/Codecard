export function getHeatmapLevel(count: number): 0 | 1 | 2 | 3 {
  if (count <= 0) return 0
  if (count <= 3) return 1
  if (count <= 9) return 2
  return 3
}

export function handleFontSize(handle: string): number {
  if (handle.length > 20) return 42
  if (handle.length > 16) return 48
  if (handle.length > 13) return 55
  return 62
}
