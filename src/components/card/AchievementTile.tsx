import type { CSSProperties, ReactNode } from 'react'

import { withAlpha } from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import { glassSurface } from './glassSurface'
import { GlassSheen } from './glass'

export function AchievementTile({
  theme,
  accent,
  label,
  icon,
  children,
  style,
  iconSize = 28,
  iconProminent = false,
}: {
  theme: CardTheme
  accent: string
  label: string
  icon: ReactNode
  children: ReactNode
  style?: CSSProperties
  iconSize?: number
  iconProminent?: boolean
}) {
  const isDark = theme.mode === 'dark'
  const radius = 18

  return (
    <div
      style={{
        ...glassSurface(theme, radius),
        display: 'flex',
        minHeight: 0,
        flexDirection: 'column',
        gap: 8,
        padding: '13px 16px',
        ...style,
      }}
    >
      <GlassSheen accent={accent} radius={radius} isDark={isDark} />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          right: 8,
          bottom: 4,
          color: accent,
          opacity: isDark ? 0.1 : 0.075,
          transform: 'scale(4.8)',
          transformOrigin: 'bottom right',
          pointerEvents: 'none',
        }}
      >
        {icon}
      </span>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: theme.muted,
          }}
        >
          {label}
        </p>
        <span
          style={{
            display: 'flex',
            width: iconSize,
            height: iconSize,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: Math.round(iconSize * 0.34),
            border: `1px solid ${withAlpha(accent, iconProminent ? 0.42 : 0.24)}`,
            backgroundColor: withAlpha(accent, iconProminent ? 0.18 : 0.1),
            boxShadow: iconProminent
              ? `0 0 20px ${withAlpha(accent, 0.26)}, inset 0 1px 0 rgba(255,255,255,0.14)`
              : 'none',
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flex: 1,
          minHeight: 0,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {children}
      </div>
    </div>
  )
}
