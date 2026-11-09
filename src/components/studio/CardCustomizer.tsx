import { useRef, useState } from 'react'
import {
  Check,
  Download,
  ImagePlus,
  Loader2,
  Quote,
  RotateCcw,
  Sparkles,
  Trash2,
  Share2,
  Copy,
  ClipboardCopy,
  ExternalLink,
} from 'lucide-react'

import bannerUrl from '../../assets/anime-banner.svg'
import {
  ACCENTS,
  ACCENT_IDS,
  CARD_THEMES,
  THEME_IDS,
  normalizeHex,
  resolveAccent,
  resolveRankAccent,
} from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import { TEMPLATES, TEMPLATE_IDS, getTemplate } from '../../lib/cardTemplates'
import { generateDesignation } from '../../lib/designation'
import {
  STAT_LABELS,
  STAT_POOL,
  sanitizeStats,
  swapStat,
} from '../../lib/cardStats'
import { cn } from '../../lib/utils'
import type {
  AccentId,
  BannerPosition,
  CardOptions,
  Profile,
} from '../../types/profile'

interface CardCustomizerProps {
  profile: Profile
  options: CardOptions
  onChange: (options: CardOptions) => void
  onReset: () => void
  onDownload: () => void
  isExporting: boolean
  error: string | null
  onShare: () => void
  onCopyImage: () => void
  onCopyCaption: () => void
  onPostX: () => void
  onPostLinkedIn: () => void
  shareDisabled: boolean
  canCopyImage: boolean
  shareMessage: string | null
  shareCaption: string | null
  onCopyShareCaption: () => void
}

interface ToggleProps {
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'group flex w-full items-center justify-between gap-4 py-2.5 text-left transition-opacity',
        disabled && 'cursor-not-allowed opacity-45',
      )}
    >
      <span>
        <span className="block text-[12px] font-medium text-silver transition-colors group-hover:text-ink">
          {label}
        </span>
        <span className="mt-0.5 block text-[10px] text-muted/70">
          {description}
        </span>
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-200',
          checked
            ? 'border-silver/40 bg-silver/90'
            : 'border-line bg-soft',
        )}
      >
        <span
          className={cn(
            'absolute top-[2px] h-[14px] w-[14px] rounded-full bg-canvas transition-transform duration-200',
            checked ? 'translate-x-[19px]' : 'translate-x-[3px]',
          )}
        />
      </span>
    </button>
  )
}

function ThemePreview({ theme }: { theme: CardTheme }) {
  const signature =
    ACCENTS[theme.signatureAccent][
      theme.mode === 'light' ? 'onLight' : 'value'
    ]

  return (
    <span
      className="block h-[64px] w-full overflow-hidden rounded-xl border"
      style={{
        backgroundColor: theme.background,
        borderColor: theme.border,
      }}
    >
      <span className="flex h-full flex-col justify-between p-2">
        <span className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: signature }}
            />
            <span
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.85 }}
            />
          </span>
          <span
            className="h-1.5 w-4 rounded-full"
            style={{ backgroundColor: theme.muted, opacity: 0.5 }}
          />
        </span>
        <span
          className="block h-4 rounded-md border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            boxShadow:
              theme.surfaceShadow !== 'none' ? theme.surfaceShadow : undefined,
          }}
        />
        <span className="space-y-1">
          <span
            className="block h-1 w-3/4 rounded-full"
            style={{ backgroundColor: theme.muted, opacity: 0.45 }}
          />
        </span>
      </span>
    </span>
  )
}

function AccentSwatch({
  accentId,
  selected,
  onSelect,
}: {
  accentId: AccentId
  selected: boolean
  onSelect: () => void
}) {
  const accent = ACCENTS[accentId]

  return (
    <button
      type="button"
      onClick={onSelect}
      title={accent.name}
      aria-label={`${accent.name} accent`}
      aria-pressed={selected}
      className="group flex flex-col items-center gap-1.5"
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-200',
          selected
            ? 'scale-110 border-silver/50 ring-2 ring-silver/20'
            : 'border-transparent group-hover:scale-105',
        )}
      >
        <span
          className="h-4.5 w-4.5 rounded-full"
          style={{
            backgroundColor: accent.value,
          }}
        />
      </span>
      <span
        className={cn(
          'text-[9px] transition-colors',
          selected ? 'font-medium text-silver' : 'text-muted/70',
        )}
      >
        {accent.name}
      </span>
    </button>
  )
}

export function CardCustomizer({
  profile,
  options,
  onChange,
  onReset,
  onDownload,
  isExporting,
  error,
  onShare,
  onCopyImage,
  onCopyCaption,
  onPostX,
  onPostLinkedIn,
  shareDisabled,
  canCopyImage,
  shareMessage,
  shareCaption,
  onCopyShareCaption,
}: CardCustomizerProps) {
  const update = (patch: Partial<CardOptions>) =>
    onChange({ ...options, ...patch })

  const theme = CARD_THEMES[options.theme]
  const activeTemplate = getTemplate(options.template)
  const resolvedAccent = resolveAccent(
    theme,
    options.accent,
    options.autoRankColor,
    profile.rank,
    options.customAccent,
  )
  const rankAccent =
    resolveRankAccent(profile.rank, theme.mode) ?? resolvedAccent
  const customColorValue =
    normalizeHex(options.customAccent) ??
    resolveAccent(theme, options.accent, false, null)
  const bannerPreview = options.customBanner ?? bannerUrl
  const photoPreview =
    options.customPhoto ?? profile.avatarDataUrl ?? profile.avatarUrl

  const autoTagline = generateDesignation(profile)

  const isClassic = options.template === 'classic'

  const [bannerError, setBannerError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const updateTheme = (themeId: CardOptions['theme']) => {
    // Keep the user's accent across themes; the theme previews still advertise
    // their signature colours, but switching never silently recolours a card.
    update({ theme: themeId })
  }

  const readImageFile = (
    file: File | undefined,
    onDone: (dataUrl: string) => void,
    onError: (message: string) => void,
  ) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      onError('Please choose an image file.')
      return
    }
    if (file.size > 6 * 1024 * 1024) {
      onError('Image must be smaller than 6 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onDone(reader.result)
      } else {
        onError('Could not read that image.')
      }
    }
    reader.onerror = () => onError('Could not read that image.')
    try {
      reader.readAsDataURL(file)
    } catch {
      onError('Could not read that image.')
    }
  }

  const handleBannerUpload = (file: File | undefined) => {
    setBannerError(null)
    readImageFile(
      file,
      (dataUrl) => update({ customBanner: dataUrl, showBanner: true }),
      setBannerError,
    )
  }

  const handlePhotoUpload = (file: File | undefined) => {
    setPhotoError(null)
    readImageFile(file, (dataUrl) => update({ customPhoto: dataUrl }), setPhotoError)
  }

  const bannerPositions: Array<{ id: BannerPosition; label: string }> = [
    { id: 'top', label: 'Top' },
    { id: 'center', label: 'Center' },
    { id: 'bottom', label: 'Bottom' },
  ]

  return (
    <aside className="widget p-5 sm:p-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Card Studio</p>
          <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.02em] text-ink">
            Customize
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-soft px-2.5 py-1 text-[10px] text-muted transition-colors hover:text-ink"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      {/* Template selection */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Template
          </p>
          <span className="text-[10px] text-muted/70">
            {activeTemplate.aspect} · {activeTemplate.width} ×{' '}
            {activeTemplate.height}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {TEMPLATE_IDS.map((templateId) => {
            const template = TEMPLATES[templateId]
            const active = options.template === templateId

            return (
              <button
                key={templateId}
                type="button"
                disabled={!template.available}
                onClick={() => update({ template: templateId })}
                aria-pressed={active}
                title={template.description}
                className={cn(
                  'flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left transition-all duration-200',
                  active
                    ? 'border-silver/40 bg-soft-2 ring-1 ring-silver/20'
                    : 'border-line bg-soft',
                  template.available
                    ? 'hover:border-silver/20'
                    : 'cursor-not-allowed opacity-45',
                  templateId === 'classic' && 'col-span-2',
                )}
              >
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block text-[11px] font-medium',
                      active ? 'text-ink' : 'text-muted',
                    )}
                  >
                    {template.label}
                  </span>
                  <span className="mt-0.5 block text-[9px] leading-tight text-muted/60">
                    {template.aspect} · {template.width}×{template.height}
                  </span>
                </span>
                {template.available ? (
                  active ? (
                    <Check size={11} className="shrink-0 text-silver" />
                  ) : null
                ) : (
                  <span className="shrink-0 rounded-full border border-line px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-muted/70">
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Theme selection */}
      <div className="mt-5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Theme
        </p>
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {THEME_IDS.map((themeId) => {
            const item = CARD_THEMES[themeId]
            const active = options.theme === themeId

            return (
              <button
                key={themeId}
                type="button"
                onClick={() => updateTheme(themeId)}
                className={cn(
                  'rounded-xl border p-2 text-left transition-all duration-200',
                  active
                    ? 'border-silver/40 bg-soft-2 ring-1 ring-silver/20'
                    : 'border-line bg-soft hover:border-silver/20',
                )}
                aria-pressed={active}
              >
                <ThemePreview theme={item} />
                <span className="mt-2 flex items-center justify-between gap-1">
                  <span
                    className={cn(
                      'text-[11px] font-medium',
                      active ? 'text-ink' : 'text-muted',
                    )}
                  >
                    {item.name}
                  </span>
                  {active ? (
                    <Check size={11} className="text-silver" />
                  ) : null}
                </span>
                <span className="mt-0.5 block text-[9px] leading-tight text-muted/60">
                  {item.mode === 'dark' ? 'Cinematic glass' : 'Frosted daylight'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Accent selection */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Accent
          </p>
          <span className="text-[10px] text-muted/70">
            {options.autoRankColor && profile.rank
              ? 'Rank colour active'
              : options.customAccent
                ? 'Custom colour'
                : ACCENTS[options.accent].name}
          </span>
        </div>
        <div className="mt-2.5 grid grid-cols-4 gap-x-1 gap-y-2">
          {ACCENT_IDS.map((accentId) => (
            <AccentSwatch
              key={accentId}
              accentId={accentId}
              selected={
                options.accent === accentId && !options.customAccent
              }
              onSelect={() =>
                update({
                  accent: accentId,
                  customAccent: null,
                  autoRankColor: false,
                })
              }
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-soft px-2.5 py-2">
          <label
            htmlFor="custom-accent"
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-line"
            style={{ backgroundColor: customColorValue }}
            title="Choose a custom accent colour"
          >
            <input
              id="custom-accent"
              type="color"
              value={customColorValue}
              onChange={(event) =>
                update({
                  customAccent: event.target.value,
                  autoRankColor: false,
                })
              }
              className="sr-only"
            />
          </label>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-silver">Custom colour</p>
            <p className="text-[9px] text-muted/60">
              {options.customAccent
                ? options.customAccent.toUpperCase()
                : 'Pick any accent for the whole card'}
            </p>
          </div>
          {options.customAccent ? (
            <button
              type="button"
              onClick={() => update({ customAccent: null })}
              className="rounded-full border border-line px-2 py-1 text-[9px] text-muted transition-colors hover:text-ink"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Rank colour override */}
      <div className="mt-4 border-t border-line pt-3.5">
        <Toggle
          label="Rank colour"
          description={
            profile.rank
              ? `Use your ${profile.rank} rank colour`
              : 'Unrated — manual accent is used'
          }
          checked={Boolean(profile.rank) && options.autoRankColor}
          disabled={!profile.rank}
          onChange={(checked) => update({ autoRankColor: checked })}
        />
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-line bg-soft px-2.5 py-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: rankAccent }}
          />
          <span className="text-[10px] leading-relaxed text-muted/70">
            {options.autoRankColor && profile.rank
              ? 'Rank colour overrides accent on card.'
              : 'Manual accent is active.'}
          </span>
          <span
            className="ml-auto h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: resolvedAccent }}
          />
        </div>
      </div>

      {/* Banner */}
      <div className="mt-4 border-t border-line pt-3.5">
        <Toggle
          label="Cinematic banner"
          description="Anime-inspired hero artwork"
          checked={options.showBanner}
          onChange={(checked) => update({ showBanner: checked })}
        />

        {options.showBanner ? (
          <div className="mt-2">
            <div
              className="relative h-[76px] w-full overflow-hidden rounded-xl border border-line"
              style={{
                backgroundImage: `url("${bannerPreview}")`,
                backgroundSize: 'cover',
                backgroundPosition:
                  options.bannerPosition === 'top'
                    ? 'center top'
                    : options.bannerPosition === 'bottom'
                      ? 'center bottom'
                      : 'center center',
              }}
            >
              <span className="absolute inset-0 bg-gradient-to-t from-canvas/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 rounded-full border border-white/15 bg-black/35 px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.16em] text-white/80 backdrop-blur">
                {options.customBanner ? 'Custom banner' : 'Default banner'}
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-soft px-2.5 py-1.5 text-[10px] font-medium text-silver transition-colors hover:border-silver/30 hover:text-ink"
              >
                <ImagePlus size={11} />
                Upload image
              </button>
              {options.customBanner ? (
                <button
                  type="button"
                  onClick={() => update({ customBanner: null })}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-soft px-2.5 py-1.5 text-[10px] text-muted transition-colors hover:text-ink"
                  title="Remove custom banner"
                >
                  <Trash2 size={11} />
                  Remove
                </button>
              ) : null}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                handleBannerUpload(event.target.files?.[0])
                event.target.value = ''
              }}
            />

            <div className="mt-2 flex items-center gap-1 rounded-lg border border-line bg-soft p-0.5">
              <span className="px-1.5 text-[9px] uppercase tracking-[0.14em] text-muted/60">
                Crop
              </span>
              {bannerPositions.map((position) => (
                <button
                  key={position.id}
                  type="button"
                  onClick={() => update({ bannerPosition: position.id })}
                  className={cn(
                    'flex-1 rounded-md px-2 py-1 text-[9.5px] transition-colors',
                    options.bannerPosition === position.id
                      ? 'bg-widget font-semibold text-ink shadow-xs'
                      : 'text-muted hover:text-ink',
                  )}
                >
                  {position.label}
                </button>
              ))}
            </div>
            {bannerError ? (
              <p className="mt-1.5 text-[9px] text-negative">{bannerError}</p>
            ) : (
              <p className="mt-1.5 text-[9px] leading-relaxed text-muted/60">
                Images are embedded in the PNG export.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {/* Profile photo */}
      <div className="mt-4 border-t border-line pt-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Profile photo
          </p>
          <span className="text-[10px] text-muted/70">
            {options.customPhoto ? 'Custom photo' : 'Codeforces avatar'}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2.5">
          {photoPreview ? (
            <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-line">
              <img
                src={photoPreview}
                alt=""
                draggable={false}
                className="h-full w-full object-cover"
              />
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-line bg-soft px-2.5 py-1.5 text-[10px] font-medium text-silver transition-colors hover:border-silver/30 hover:text-ink"
            >
              <ImagePlus size={11} />
              Upload photo
            </button>
            {options.customPhoto ? (
              <button
                type="button"
                onClick={() => {
                  setPhotoError(null)
                  update({ customPhoto: null })
                }}
                title="Reset to Codeforces avatar"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-line bg-soft px-2.5 py-1.5 text-[10px] text-muted transition-colors hover:text-ink"
              >
                <RotateCcw size={11} />
                Reset
              </button>
            ) : null}
          </div>
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            handlePhotoUpload(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        {photoError ? (
          <p className="mt-1.5 text-[9px] text-negative">{photoError}</p>
        ) : (
          <p className="mt-1.5 text-[9px] leading-relaxed text-muted/60">
            {options.customPhoto
              ? 'Tap Reset to go back to your Codeforces avatar.'
              : 'Replaces the avatar ring on portrait & classic cards.'}
          </p>
        )}
      </div>

      {/* Personal quote */}
      <div className="mt-4 border-t border-line pt-3.5">
        <Toggle
          label="Personal quote"
          description="An optional motto in editorial type"
          checked={options.showQuote}
          onChange={(checked) => update({ showQuote: checked })}
        />
        <div className="relative mt-2">
          <Quote
            size={12}
            className="pointer-events-none absolute left-2.5 top-2.5 text-muted/45"
          />
          <input
            type="text"
            value={options.customQuote}
            onChange={(event) =>
              update({ customQuote: event.target.value.slice(0, 90) })
            }
            placeholder="Stay curious. Keep solving."
            maxLength={90}
            className="h-8 w-full rounded-xl border border-line bg-soft pl-8 pr-3 text-[12px] text-ink placeholder:text-muted/45 focus:border-silver/40 focus:outline-none"
          />
        </div>
        <p className="mt-1 text-right text-[9px] text-muted/60">
          {options.customQuote.length}/90 · hidden when empty
        </p>
      </div>

      {/* Designation / Tagline */}
      <div className="mt-4 border-t border-line pt-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Tagline Designation
          </p>
          <div className="flex rounded-lg border border-line bg-soft p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => update({ designationMode: 'auto' })}
              className={cn(
                'rounded-md px-2 py-0.5 transition-colors',
                options.designationMode === 'auto'
                  ? 'bg-widget font-semibold text-ink shadow-xs'
                  : 'text-muted hover:text-ink',
              )}
            >
              Auto
            </button>
            <button
              type="button"
              onClick={() => update({ designationMode: 'custom' })}
              className={cn(
                'rounded-md px-2 py-0.5 transition-colors',
                options.designationMode === 'custom'
                  ? 'bg-widget font-semibold text-ink shadow-xs'
                  : 'text-muted hover:text-ink',
              )}
            >
              Custom
            </button>
          </div>
        </div>

        {options.designationMode === 'auto' ? (
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-line bg-soft px-3 py-2">
            <Sparkles size={12} className="shrink-0 text-gold" />
            <p className="truncate text-[11px] font-medium text-silver">
              &ldquo;{autoTagline}&rdquo;
            </p>
          </div>
        ) : (
          <div className="mt-2 space-y-1">
            <input
              type="text"
              value={options.customDesignation}
              onChange={(e) =>
                update({ customDesignation: e.target.value.slice(0, 48) })
              }
              placeholder={autoTagline}
              maxLength={48}
              className="h-8 w-full rounded-xl border border-line bg-soft px-3 text-[12px] text-ink placeholder:text-muted/50 focus:border-silver/40 focus:outline-none"
            />
            <p className="text-right text-[9px] text-muted/60">
              {options.customDesignation.length}/48
            </p>
          </div>
        )}

        <div className="mt-1 border-t border-line/60 pt-1">
          <Toggle
            label="Show tagline"
            description={
              options.template === 'classic'
                ? 'Tagline under the handle'
                : 'Classic card only'
            }
            checked={options.showDesignation}
            onChange={(checked) => update({ showDesignation: checked })}
          />
        </div>
      </div>

      {/* Card sections toggles */}
      <div className="mt-4 border-t border-line pt-3.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Card sections
        </p>
        <div className="mt-1 divide-y divide-line">
          <Toggle
            label="Rating graph"
            description="Contest rating curve"
            checked={options.showRatingChart}
            onChange={(checked) => update({ showRatingChart: checked })}
          />
          <Toggle
            label="Activity heatmap"
            description={
              isClassic
                ? '52-week submission calendar'
                : '18-week layer behind the graph'
            }
            checked={options.showHeatmap}
            onChange={(checked) => update({ showHeatmap: checked })}
          />
          <Toggle
            label="Hardest challenge"
            description={
              isClassic
                ? 'Highest-rated solved problem'
                : 'Boss tile (hardest solved)'
            }
            checked={options.showHardestProblem}
            onChange={(checked) => update({ showHardestProblem: checked })}
          />
          <Toggle
            label="Achievement stats"
            description={
              isClassic
                ? 'Solves, active days, streak'
                : 'Solved, streak, peak day, grit, contests'
            }
            checked={options.showStats}
            onChange={(checked) => update({ showStats: checked })}
          />
          <Toggle
            label="Watermark branding"
            description="Codecard footer & tagline"
            checked={options.showWatermark}
            onChange={(checked) => update({ showWatermark: checked })}
          />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-4 border-t border-line pt-3.5">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Stat tiles
          </p>
          <span className="text-[10px] text-muted/70">
            {sanitizeStats(options.stats).length}/6 slots
          </span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {sanitizeStats(options.stats).map((statId, index) => (
            <label
              key={`${index}-${statId}`}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-soft px-2 py-1.5"
              title={`Slot ${index + 1}`}
            >
              <span className="w-3 text-[9px] text-muted/60 tabular">
                {index + 1}
              </span>
              <span className="text-[13px] leading-none">
                {STAT_LABELS[statId].icon}
              </span>
              <select
                value={statId}
                onChange={(event) =>
                  update({
                    stats: swapStat(
                      sanitizeStats(options.stats),
                      index,
                      event.target.value as CardOptions['stats'][number],
                    ),
                  })
                }
                className="min-w-0 flex-1 appearance-none bg-transparent text-[10px] font-medium text-silver focus:outline-none"
              >
                {STAT_POOL.map((id) => (
                  <option key={id} value={id}>
                    {STAT_LABELS[id].label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-[9px] leading-relaxed text-muted/60">
          Duplicate picks swap slots. Unavailable stats are replaced with the
          next available tile.
        </p>
      </div>

      {/* Download button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={onDownload}
          disabled={isExporting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-[13px] font-semibold text-[#15130C] shadow-lg shadow-gold/10 transition-all duration-200 hover:bg-[#E2C374] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isExporting ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Download size={15} strokeWidth={2.2} />
          )}
          {isExporting ? 'Exporting PNG…' : 'Download PNG'}
        </button>
        {error ? (
          <p className="animate-fade-in mt-2 text-center text-[10px] text-negative">
            {error}
          </p>
        ) : (
          <p className="mt-2 text-center text-[10px] text-muted/60">
            {activeTemplate.aspect} · {activeTemplate.pixelRatio}× PNG (
            {activeTemplate.width * activeTemplate.pixelRatio} ×{' '}
            {activeTemplate.height * activeTemplate.pixelRatio})
          </p>
        )}
      </div>

      {/* Sharing */}
      <div className="mt-4 border-t border-line pt-3.5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Share
        </p>
        <div className="flex flex-wrap gap-1.5">
          <ShareButton disabled={shareDisabled} onClick={onShare} icon={<Share2 size={11} />} label="Share" />
          {canCopyImage ? (
            <ShareButton disabled={shareDisabled} onClick={onCopyImage} icon={<ClipboardCopy size={11} />} label="Copy image" />
          ) : null}
          <ShareButton disabled={shareDisabled} onClick={onCopyCaption} icon={<Copy size={11} />} label="Copy caption" />
          <ShareButton disabled={shareDisabled} onClick={onPostX} icon={<ExternalLink size={11} />} label="Post on X" />
          <ShareButton disabled={shareDisabled} onClick={onPostLinkedIn} icon={<ExternalLink size={11} />} label="Post on LinkedIn" />
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-muted/60">
          X and LinkedIn can&apos;t attach images from a link. We copy the image so you can paste it.
        </p>
        {shareMessage ? (
          <div role="status" aria-live="polite" className="mt-2 text-center text-[10px] text-muted">
            <p>{shareMessage}</p>
            {shareCaption ? (
              <div className="mt-2 rounded-lg border border-line bg-soft p-2 text-left">
                <p className="whitespace-pre-line break-words text-[10px] text-silver">
                  {shareCaption}
                </p>
                <button
                  type="button"
                  disabled={shareDisabled}
                  onClick={onCopyShareCaption}
                  className="mt-2 rounded-md border border-line bg-widget px-2 py-1 text-[9px] font-medium text-silver hover:text-ink disabled:opacity-45"
                >
                  Copy caption
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function ShareButton({
  disabled,
  onClick,
  icon,
  label,
}: {
  disabled: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-1 rounded-lg border border-line bg-soft px-2 py-1.5 text-[10px] font-medium text-silver transition-colors hover:border-silver/30 hover:bg-soft-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-45"
    >
      {icon}
      {label}
    </button>
  )
}
