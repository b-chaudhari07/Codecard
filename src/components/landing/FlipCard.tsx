import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'

import './flip-card.css'

import { PortraitCard } from '../card/PortraitCard'
import { CodeforcesMark } from '../ui/CodeforcesMark'
import { sampleProfile } from '../../data/sampleProfile'
import {
  DEFAULT_CARD_OPTIONS,
  resolveRankAccent,
  withAlpha,
} from '../../lib/cardThemes'
import { getTemplate } from '../../lib/cardTemplates'
import type { CardOptions } from '../../types/profile'

const PREVIEW_SCALE = 0.26
const PAUSE_AFTER_FLIP_MS = 6000

const SHOWCASE_OPTIONS: CardOptions = {
  ...DEFAULT_CARD_OPTIONS,
  template: 'portrait',
  showQuote: false,
}

const template = getTemplate('portrait')
const previewWidth = template.width * PREVIEW_SCALE
const previewHeight = template.height * PREVIEW_SCALE
const rankColor = resolveRankAccent(sampleProfile.rank, 'dark')

interface FlipCardProps {
  loading?: boolean
}

export function FlipCard({ loading = false }: FlipCardProps) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [manualFlip, setManualFlip] = useState<boolean | null>(null)
  const pauseTimer = useRef<number | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    return () => {
      if (pauseTimer.current !== null) {
        window.clearTimeout(pauseTimer.current)
      }
    }
  }, [])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse') return
    const rect = wrapperRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -16, y: px * 16 })
  }

  const handlePointerLeave = () => setTilt({ x: 0, y: 0 })

  const handleFlip = () => {
    if (reducedMotion) return
    setManualFlip((current) => !(current ?? false))
    if (pauseTimer.current !== null) {
      window.clearTimeout(pauseTimer.current)
    }
    pauseTimer.current = window.setTimeout(() => {
      setManualFlip(null)
      pauseTimer.current = null
    }, PAUSE_AFTER_FLIP_MS)
  }

  const effectiveManualFlip = reducedMotion ? null : manualFlip
  const tiltStyle: CSSProperties = {
    transform: reducedMotion
      ? 'none'
      : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
  }
  const innerStyle: CSSProperties | undefined =
    effectiveManualFlip === null
      ? undefined
      : {
          animation: 'none',
          transform: `rotateY(${effectiveManualFlip ? 180 : 0}deg)`,
        }

  return (
    <div
      ref={wrapperRef}
      role="img"
      aria-label="Example Codecard flipping between front and back"
      className="flipcard"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div
        aria-hidden="true"
        className="flipcard-glow"
        style={{
          width: previewWidth * 1.25,
          height: previewHeight * 0.95,
          background: `radial-gradient(circle, ${withAlpha(rankColor, 0.4)}, transparent 68%)`,
        }}
      />

      <div className="flipcard-float">
        <div className="flipcard-tilt" style={tiltStyle}>
          <div
            className="flipcard-scene"
            style={{ width: previewWidth, height: previewHeight }}
            onClick={handleFlip}
          >
            <div
              className="flipcard-inner"
              style={{ width: previewWidth, height: previewHeight, ...innerStyle }}
            >
              <div
                aria-hidden="true"
                className="flipcard-face flipcard-front"
              >
                <div
                  style={{
                    width: previewWidth,
                    height: previewHeight,
                    overflow: 'hidden',
                    borderRadius: 20,
                  }}
                >
                  <div
                    style={{
                      width: template.width,
                      height: template.height,
                      transform: `scale(${PREVIEW_SCALE})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <PortraitCard
                      profile={sampleProfile}
                      options={SHOWCASE_OPTIONS}
                    />
                  </div>
                </div>
                <span
                  className={
                    loading
                      ? 'flipcard-sheen flipcard-sheen-fast'
                      : 'flipcard-sheen'
                  }
                />
              </div>

              <div
                aria-hidden="true"
                className="flipcard-face flipcard-back"
                style={{
                  width: previewWidth,
                  height: previewHeight,
                  borderRadius: 20,
                  backgroundColor: '#07080C',
                  border: `1px solid ${withAlpha(rankColor, 0.45)}`,
                  boxShadow: `0 0 50px ${withAlpha(rankColor, 0.22)}`,
                }}
              >
                <div
                  className="flipcard-back-pattern"
                  style={{
                    backgroundImage: `repeating-linear-gradient(135deg, ${withAlpha(
                      rankColor,
                      0.07,
                    )} 0 1px, transparent 1px 13px)`,
                  }}
                />
                <div className="flipcard-back-content">
                  <span
                    className="flipcard-rank-ring"
                    style={{
                      color: rankColor,
                      borderColor: withAlpha(rankColor, 0.55),
                      boxShadow: `0 0 34px ${withAlpha(
                        rankColor,
                        0.45,
                      )}, inset 0 0 18px ${withAlpha(rankColor, 0.18)}`,
                    }}
                  >
                    <CodeforcesMark size={26} />
                  </span>
                  <p className="flipcard-back-title">CODECARD</p>
                  <p className="flipcard-back-line">Dream. Solve. Repeat.</p>
                </div>
                <span
                  className={
                    loading
                      ? 'flipcard-sheen flipcard-sheen-fast'
                      : 'flipcard-sheen'
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
