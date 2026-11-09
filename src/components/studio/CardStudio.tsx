import { useCallback, useLayoutEffect, useRef, useState } from 'react'

import { CardCustomizer } from './CardCustomizer'
import { ProfileCard } from './ProfileCard'
import { SectionHeading } from '../ui/SectionHeading'
import { getTemplate } from '../../lib/cardTemplates'
import { CARD_THEMES, DEFAULT_CARD_OPTIONS } from '../../lib/cardThemes'
import { clearCardOptions } from '../../lib/cardOptionsStorage'
import { buildCaption, getSiteUrl } from '../../lib/caption'
import { chooseSharePath, getShareFileName } from '../../lib/shareActions'
import { renderCardBlob } from '../../services/export/renderCardBlob'
import type { CardOptions, Profile } from '../../types/profile'

function supportsImageClipboard(): boolean {
  const clipboard = navigator.clipboard as unknown as { write?: unknown }
  const globals = globalThis as typeof globalThis & { ClipboardItem?: unknown }
  return typeof clipboard.write === 'function' && typeof globals.ClipboardItem === 'function'
}

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
  const [renderedCard, setRenderedCard] = useState<{ key: string; blob: Blob } | null>(null)
  const [shareMessage, setShareMessage] = useState<string | null>(null)
  const [shareCaption, setShareCaption] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const renderVersion = useRef(0)
  const pendingShare = useRef(false)
  const renderKey = JSON.stringify([profile, options])
  const shareBlob = renderedCard?.key === renderKey ? renderedCard.blob : null

  useLayoutEffect(() => {
    const version = ++renderVersion.current
    const timer = window.setTimeout(() => {
      const node = cardRef.current
      if (!node) return
      void renderCardBlob(
        node,
        template,
        CARD_THEMES[options.theme].background,
      ).then((blob) => {
        if (renderVersion.current === version) {
          setRenderedCard({ key: renderKey, blob })
          if (pendingShare.current) {
            pendingShare.current = false
            setShareMessage('Image ready. Tap Share again.')
          }
        }
      }).catch(() => {
        if (renderVersion.current === version) {
          setShareMessage('Could not prepare the image. Try again.')
        }
      })
    }, 1000)
    return () => {
      window.clearTimeout(timer)
      renderVersion.current += 1
    }
  }, [profile, options, template, renderKey])

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
        window.requestAnimationFrame(() => setScale(newScale))
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
      const blob = await renderCardBlob(
        node,
        template,
        CARD_THEMES[options.theme].background,
      )

      const link = document.createElement('a')
      link.download = `codecard-${options.template}-${profile.handle}.png`
      link.href = URL.createObjectURL(blob)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000)
    } catch (exportError) {
      console.error('Codecard PNG export failed', exportError)
      setError('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const withShareBlob = useCallback(async (
    action: (blob: Blob, file: File, url: string) => Promise<void>,
  ) => {
    if (isExporting) return
    if (profile.isSample) {
      setShareMessage('Search your own handle to share.')
      return
    }
    if (!shareBlob) {
      pendingShare.current = true
      setShareMessage('Preparing image...')
      return
    }
    setIsExporting(true)
    setShareMessage(null)
    try {
      const file = new File(
        [shareBlob],
        getShareFileName(profile.handle, options.template),
        { type: 'image/png' },
      )
      const siteRoot = getSiteUrl().replace(/\/+$/, '')
      const profileUrl = `${siteRoot}/u/${encodeURIComponent(profile.handle)}`
      await action(shareBlob, file, profileUrl)
    } catch {
      setShareMessage('Could not complete that action. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [isExporting, options.template, profile.handle, profile.isSample, shareBlob])

  const writeImage = async (blob: Blob) => {
    if (!supportsImageClipboard()) {
      throw new Error('Image clipboard is unavailable')
    }
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ])
  }

  const writeImageAndText = async (blob: Blob, text: string) => {
    if (!supportsImageClipboard()) {
      throw new Error('Image clipboard is unavailable')
    }
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': blob,
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ])
  }

  const downloadBlob = (blob: Blob) => {
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `codecard-${options.template}-${profile.handle}.png`
    link.href = href
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(href), 1000)
  }

  const handleShare = () => withShareBlob(async (blob, file, url) => {
    setShareCaption(null)
    const caption = buildCaption(profile, options, 'x', url)
    const shareApi = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>
      canShare?: (data?: ShareData) => boolean
    }
    let filesSupported = false
    if (typeof shareApi.canShare === 'function') {
      try {
        filesSupported = shareApi.canShare({ files: [file] })
      } catch {
        filesSupported = false
      }
    }
    const path = chooseSharePath(
      typeof shareApi.share === 'function',
      filesSupported,
    )
    if (path === 'share-files') {
      console.debug('Codecard share path: share with files')
      try {
        await shareApi.share?.({ files: [file], title: 'My Codecard', text: caption })
        setShareCaption(null)
        setShareMessage('Shared image and caption')
        return
      } catch (error) {
        if (
          error !== null &&
          typeof error === 'object' &&
          'name' in error &&
          error.name === 'AbortError'
        ) return
        console.debug('Codecard share path: download fallback after share error')
      }
    }
    console.debug('Codecard share path: download fallback')
    downloadBlob(blob)
    try {
      await navigator.clipboard.writeText(caption)
      console.debug('Codecard clipboard path: copied caption after download fallback')
      setShareMessage("This browser can't share images directly. Image downloaded and caption copied. Attach the image in your post.")
    } catch {
      setShareMessage("This browser can't share images directly. Image downloaded. Copy the caption before posting.")
    }
  })

  const handleCopyImage = () => withShareBlob(async (blob) => {
    await writeImage(blob)
    console.debug('Codecard clipboard path: copied image')
    setShareCaption(null)
    setShareMessage('Image copied.')
  })

  const handleCopyCaption = () => withShareBlob(async (_blob, _file, url) => {
    await navigator.clipboard.writeText(buildCaption(profile, options, 'x', url))
    console.debug('Codecard clipboard path: copied X caption')
    setShareCaption(null)
    setShareMessage('Caption copied.')
  })

  const handlePost = (platform: 'x' | 'linkedin') => withShareBlob(async (blob, _file, url) => {
    setShareCaption(null)
    const linkedinCaption = platform === 'linkedin'
      ? buildCaption(profile, options, 'linkedin', url)
      : null
    let imageCopied = false
    try {
      await writeImage(blob)
      imageCopied = true
      console.debug('Codecard clipboard path: copied image before opening post')
    } catch {
      console.debug('Codecard share path: image clipboard failed; downloading')
      downloadBlob(blob)
    }

    let linkedinCaptionCopied = false
    if (linkedinCaption) {
      if (imageCopied) {
        try {
          await writeImageAndText(blob, linkedinCaption)
          linkedinCaptionCopied = true
          console.debug('Codecard clipboard path: copied LinkedIn caption with image')
        } catch {
          // Preserve the successfully copied image; offer caption inline.
          setShareCaption(linkedinCaption)
        }
      } else {
        try {
          await navigator.clipboard.writeText(linkedinCaption)
          linkedinCaptionCopied = true
          console.debug('Codecard clipboard path: copied LinkedIn caption after image download')
        } catch {
          setShareCaption(linkedinCaption)
        }
      }
    }
    const target = platform === 'x'
      ? `https://x.com/intent/post?text=${encodeURIComponent(buildCaption(profile, options, 'x', url))}&url=${encodeURIComponent(url)}`
      : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
    window.open(target, '_blank', 'noopener,noreferrer')
    setShareMessage(imageCopied
      ? `Image copied. Paste it into the post box (Cmd/Ctrl+V).${linkedinCaptionCopied ? ' LinkedIn caption copied.' : ''}`
      : `Image downloaded. Attach it to your post.${linkedinCaptionCopied ? ' LinkedIn caption copied.' : ''}`)
  })

  const handleCopyLinkedInCaption = () => withShareBlob(async (_blob, _file, url) => {
    const caption = shareCaption ?? buildCaption(profile, options, 'linkedin', url)
    await navigator.clipboard.writeText(caption)
    console.debug('Codecard clipboard path: copied LinkedIn caption')
    setShareCaption(null)
    setShareMessage('LinkedIn caption copied.')
  })

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
          onShare={handleShare}
          onCopyImage={handleCopyImage}
          onCopyCaption={handleCopyCaption}
          onPostX={() => handlePost('x')}
          onPostLinkedIn={() => handlePost('linkedin')}
          shareDisabled={isExporting || profile.isSample}
          canCopyImage={supportsImageClipboard()}
          shareMessage={profile.isSample ? 'Search your own handle to share.' : shareMessage}
          shareCaption={profile.isSample ? null : shareCaption}
          onCopyShareCaption={handleCopyLinkedInCaption}
        />
      </div>
    </section>
  )
}
