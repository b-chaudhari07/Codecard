import { useLayoutEffect, useRef, useState } from 'react'
import { toPng } from 'html-to-image'

import { CardCustomizer } from './CardCustomizer'
import { ProfileCard } from './ProfileCard'
import { SectionHeading } from '../ui/SectionHeading'
import { getTemplate } from '../../lib/cardTemplates'
import { CARD_THEMES, DEFAULT_CARD_OPTIONS } from '../../lib/cardThemes'
import { clearCardOptions } from '../../lib/cardOptionsStorage'
import type { CardOptions, Profile } from '../../types/profile'

interface CardStudioProps {
  profile: Profile
  options?: CardOptions
  onOptionsChange?: (options: CardOptions) => void
}

export function CardStudio({
  profile,
  options: externalOptions,
  onOptionsChange: externalOnChange,
}: CardStudioProps) {
  const [internalOptions, setInternalOptions] =
    useState<CardOptions>(DEFAULT_CARD_OPTIONS)

  const options = externalOptions ?? internalOptions
  const setOptions = externalOnChange ?? setInternalOptions
  const template = getTemplate(options.template)

  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scale, setScale] = useState(0.45)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return

    const updateScale = () => {
      const rect = element.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      const style = window.getComputedStyle(element)
      const padX =
        Number.parseFloat(style.paddingLeft || '0') +
        Number.parseFloat(style.paddingRight || '0')
      const padY =
        Number.parseFloat(style.paddingTop || '0') +
        Number.parseFloat(style.paddingBottom || '0')

      const availableWidth = Math.max(80, rect.width - padX)
      const availableHeight = Math.max(80, rect.height - padY)

      const scaleByWidth = availableWidth / template.width
      const scaleByHeight = availableHeight / template.height
      const newScale = Math.min(scaleByWidth, scaleByHeight)

      if (newScale > 0 && Number.isFinite(newScale)) {
        setScale(newScale)
      }
    }

    updateScale()
    const observer = new ResizeObserver(updateScale)
    observer.observe(element)
    window.addEventListener('resize', updateScale)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [template.width, template.height])

  const handleDownload = async () => {
    const node = cardRef.current
    if (!node || isExporting) return

    setIsExporting(true)
    setError(null)

    try {
      await document.fonts.ready
      const dataUrl = await toPng(node, {
        width: template.width,
        height: template.height,
        pixelRatio: template.pixelRatio,
        cacheBust: true,
        backgroundColor: CARD_THEMES[options.theme].background,
      })

      const link = document.createElement('a')
      link.download = `codecard-${options.template}-${profile.handle}.png`
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

  const displayWidth = Math.round(template.width * scale)
  const displayHeight = Math.round(template.height * scale)

  return (
    <section
      id="studio"
      className="section-shell scroll-mt-24 py-16 sm:py-20"
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
                  : 'h-1.5 w-1.5 rounded-full bg-positive'
              }
            />
            {profile.isSample ? 'Sample profile' : 'Live profile'}
            <span className="text-line">/</span>
            <span className="text-silver/80">@{profile.handle}</span>
          </div>
        }
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="widget animate-fade-up p-3 sm:p-5">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-positive" />
              Live preview
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted/70">
              <span className="rounded-full border border-line bg-surface px-2 py-1">
                {template.aspect}
              </span>
              <span className="rounded-full border border-line bg-surface px-2 py-1 tabular">
                {template.width} × {template.height}
              </span>
            </div>
          </div>

          {/* Sizing & centering container */}
          <div
            ref={containerRef}
            className="relative mx-auto flex w-full items-center justify-center overflow-hidden rounded-[20px] border border-line bg-soft p-3 sm:p-5"
            style={{
              aspectRatio: template.aspect.replace(':', ' / '),
              maxHeight: 'min(72vh, 620px)',
            }}
          >
            {/* Exactly sized scaled bounding box */}
            <div
              style={{
                width: displayWidth,
                height: displayHeight,
                position: 'relative',
                flexShrink: 0,
              }}
            >
              {/* Unscaled template node transformed from top-left */}
              <div
                style={{
                  width: template.width,
                  height: template.height,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              >
                <ProfileCard
                  ref={cardRef}
                  profile={profile}
                  options={options}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-2 pt-3 text-[10px] text-muted/60">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-silver/50" />
              Export target: {template.width * template.pixelRatio} ×{' '}
              {template.height * template.pixelRatio} ({template.pixelRatio}×)
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
            clearCardOptions()
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
