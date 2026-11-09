import type { CSSProperties, ReactNode } from 'react'

import { withAlpha } from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import { glassSurface } from './glassSurface'

export function GlassSheen({
  accent,
  radius,
  isDark,
}: {
  accent: string
  radius: number
  isDark: boolean
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: radius,
        pointerEvents: 'none',
        background: isDark
          ? `radial-gradient(ellipse at 14% 0%, ${withAlpha(accent, 0.16)}, transparent 46%), linear-gradient(135deg, rgba(255,255,255,0.09), transparent 42%)`
          : 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.22) 45%, rgba(255,255,255,0.62))',
      }}
    />
  )
}

export function GlassPanel({
  theme,
  accent,
  radius,
  style,
  children,
}: {
  theme: CardTheme
  accent: string
  radius: number
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <section style={{ ...glassSurface(theme, radius), ...style }}>
      <GlassSheen accent={accent} radius={radius} isDark={theme.mode === 'dark'} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          height: '100%',
          minHeight: 0,
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </section>
  )
}
