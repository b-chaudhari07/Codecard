import { useState } from 'react'
import type { CSSProperties } from 'react'

interface ProfileAvatarProps {
  src?: string | null
  initials: string
  size: number
  accent?: string
  className?: string
  style?: CSSProperties
  border?: string
  background?: string
  color?: string
}

/**
 * Avatar with a generated initials fallback. The fallback is a plain DOM node,
 * so PNG export always has something safe to rasterise. A real image is only
 * replaced by initials after the browser reports a load error.
 */
export function ProfileAvatar({
  src,
  initials,
  size,
  accent = '#C8D0DC',
  className,
  style,
  border,
  background,
  color,
}: ProfileAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const baseStyle: CSSProperties = {
    width: size,
    height: size,
    fontSize: Math.round(size * 0.34),
    border: border ?? `3px solid ${accent}66`,
    ...style,
  }

  if (src && failedSrc !== src) {
    return (
      <img
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        onError={() => setFailedSrc(src)}
        className={className}
        style={{
          ...baseStyle,
          objectFit: 'cover',
          borderRadius: '9999px',
        }}
      />
    )
  }

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '9999px',
        background:
          background ??
          'radial-gradient(circle at 30% 22%, rgba(215,180,94,0.22), transparent 62%), linear-gradient(145deg, #24272D, #0D0E11)',
        color: color ?? '#EEF1F6',
        fontWeight: 600,
        letterSpacing: '0.04em',
        lineHeight: 1,
      }}
      aria-hidden="true"
    >
      {initials || 'CF'}
    </div>
  )
}
