import { useLayoutEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'

import { CardCustomizer } from './CardCustomizer'
import { ProfileCard } from './ProfileCard'
import { SectionHeading } from '../ui/SectionHeading'
import { CARD_THEMES, DEFAULT_CARD_OPTIONS } from '../../lib/cardThemes'
import type { CardOptions, Profile } from '../../types/profile'

interface CardStudioProps {
  profile: Profile
}

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1350

export function CardStudio({ profile }: CardStudioProps) {
  const [options, setOptions] = useState<CardOptions>(DEFAULT_CARD_OPTIONS)
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(0.5)

  const previewRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = previewRef.current
    if (!element) return

    const updateScale = () => {
      const width = element.getBoundingClientRect().width
      if (width > 0) setScale(width / CARD_WIDTH)
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const handleDownload = async () => {
    const node = cardRef.current
    if (!node || isExporting) return

    setIsExporting(true)
    setError(null)

    try {
      await document.fonts.ready
      const dataUrl = await toPng(node, {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: CARD_THEMES[options.theme].background,
      })

      const link = document.createElement('a')
      link.download = `codecard-${profile.handle}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (exportError) {
      console.error('Codecard PNG export failed', exportError)
      setError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section
      id="studio"
      className="section-shell scroll-mt-24 py-20 sm:py-24"
    >
      <SectionHeading
        eyebrow="Card Studio"
        title={
          <>
            Your profile.{' '}
            <span className="text-silver">Your identity.</span>
          </>
        }
        description="Choose a mood, tune the accent, and export a card worth sharing. The PNG contains the card only — no dashboard chrome."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-widget px-3 py-1.5 text-[11px] text-muted">
            <span
              className={
                profile.isSample
                  ? 'h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gold'
                  : 'h-1.5 w-1.5 rounded-full bg-emerald-400'
              }
            />
            {profile.isSample ? 'Sample profile' : 'Live profile'}
            <span className="text-line">/</span>
            <span className="text-silver/80">@{profile.handle}</span>
          </div>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="widget animate-fade-up p-3 sm:p-5">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Live preview
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted/70">
              <span className="rounded-full border border-line bg-canvas/40 px-2 py-1">
                4:5
              </span>
              <span className="rounded-full border border-line bg-canvas/40 px-2 py-1 tabular">
                1080 × 1350
              </span>
            </div>
          </div>

          <div
            ref={previewRef}
            className="relative w-full overflow-hidden rounded-[20px] border border-line bg-black/40"
            style={{ aspectRatio: '4 / 5' }}
          >
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transform: `scale(${scale})`,
              }}
            >
              <ProfileCard
                ref={cardRef}
                profile={profile}
                options={options}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-2 pt-4 text-[10px] text-muted/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-silver/50" />
              Export target is isolated from the dashboard
            </span>
            <span className="tabular">{Math.round(scale * 100)}% preview</span>
          </div>
        </div>

        <CardCustomizer
          profile={profile}
          options={options}
          onChange={setOptions}
          onReset={() => {
            setOptions(DEFAULT_CARD_OPTIONS)
            setError(null)
          }}
          onDownload={handleDownload}
          isExporting={isExporting}
          error={error}
        />
      </div>
    </section>
  )
}
