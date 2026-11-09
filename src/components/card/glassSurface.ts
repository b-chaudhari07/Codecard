import type { CSSProperties } from 'react'

import type { CardTheme } from '../../lib/cardThemes'

export function glassSurface(
  theme: CardTheme,
  radius: number,
  elevated = false,
): CSSProperties {
  const shadows = [
    theme.insetHighlight !== 'none' ? theme.insetHighlight : null,
    theme.surfaceShadow !== 'none' ? theme.surfaceShadow : null,
  ].filter((shadow): shadow is string => Boolean(shadow))

  return {
    position: 'relative',
    backgroundColor: elevated ? theme.elevated : theme.surface,
    backgroundImage: theme.surfaceGradient ?? undefined,
    border: `1px solid ${theme.border}`,
    borderRadius: radius,
    boxShadow: shadows.length > 0 ? shadows.join(', ') : 'none',
    overflow: 'hidden',
  }
}
