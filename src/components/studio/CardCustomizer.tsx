import { Check, Download, Loader2, RotateCcw } from 'lucide-react'

import {
  ACCENTS,
  ACCENT_IDS,
  CARD_THEMES,
  RANK_ACCENTS,
  THEME_IDS,
  resolveAccent,
} from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import { cn } from '../../lib/utils'
import type { AccentId, CardOptions, Profile } from '../../types/profile'

interface CardCustomizerProps {
  profile: Profile
  options: CardOptions
  onChange: (options: CardOptions) => void
  onReset: () => void
  onDownload: () => void
  isExporting: boolean
  error: string | null
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
        'group flex w-full items-center justify-between gap-4 py-2.5 text-left',
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
            ? 'border-silver/30 bg-silver/80'
            : 'border-white/10 bg-white/[0.06]',
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
      className="block h-[76px] w-full overflow-hidden rounded-xl border"
      style={{
        backgroundColor: theme.background,
        borderColor: theme.border,
      }}
    >
      <span className="flex h-full flex-col justify-between p-2.5">
        <span className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: signature }}
            />
            <span
              className="h-1.5 w-9 rounded-full"
              style={{ backgroundColor: theme.text, opacity: 0.85 }}
            />
          </span>
          <span
            className="h-1.5 w-5 rounded-full"
            style={{ backgroundColor: theme.muted, opacity: 0.5 }}
          />
        </span>
        <span
          className="block h-5 rounded-md border"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.border,
            boxShadow:
              theme.surfaceShadow !== 'none' ? theme.surfaceShadow : undefined,
          }}
        />
        <span className="space-y-1">
          <span
            className="block h-1.5 w-4/5 rounded-full"
            style={{ backgroundColor: theme.muted, opacity: 0.45 }}
          />
          <span
            className="block h-1.5 w-1/2 rounded-full"
            style={{ backgroundColor: theme.muted, opacity: 0.28 }}
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
          'flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200',
          selected
            ? 'scale-110 border-white/35'
            : 'border-transparent group-hover:scale-105',
        )}
      >
        <span
          className="h-5 w-5 rounded-full"
          style={{
            backgroundColor: accent.value,
            boxShadow: selected
              ? `0 0 0 2px #151619, 0 0 0 3px ${accent.value}66`
              : undefined,
          }}
        />
      </span>
      <span
        className={cn(
          'text-[9px] transition-colors',
          selected ? 'text-silver' : 'text-muted/70',
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
}: CardCustomizerProps) {
  const update = (patch: Partial<CardOptions>) =>
    onChange({ ...options, ...patch })

  const theme = CARD_THEMES[options.theme]
  const resolvedAccent = resolveAccent(
    theme,
    options.accent,
    options.autoRankColor,
    profile.rank,
  )
  const rankAccent = profile.rank
    ? RANK_ACCENTS[profile.rank].dark
    : ACCENTS[options.accent].value

  const updateTheme = (themeId: CardOptions['theme']) => {
    const nextTheme = CARD_THEMES[themeId]
    // Keep a deliberate manual accent, but move the default accent with the
    // theme so Obsidian opens on gold and Minimal opens on lavender.
    const accent =
      options.accent === theme.signatureAccent
        ? nextTheme.signatureAccent
        : options.accent

    update({ theme: themeId, accent })
  }

  return (
    <aside className="widget p-6 xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Card Studio</p>
          <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-ink">
            Customize
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1.5 text-[10px] text-muted transition-colors hover:text-ink"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Theme
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2.5">
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
                    ? 'border-silver/40 bg-white/[0.04]'
                    : 'border-line bg-white/[0.015] hover:border-white/15',
                )}
                aria-pressed={active}
              >
                <ThemePreview theme={item} />
                <span className="mt-2 flex items-center justify-between gap-2">
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
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
            Accent
          </p>
          <span className="text-[10px] text-muted/60">
            {options.autoRankColor && profile.rank
              ? 'Rank colour active'
              : ACCENTS[options.accent].name}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {ACCENT_IDS.map((accentId) => (
            <AccentSwatch
              key={accentId}
              accentId={accentId}
              selected={options.accent === accentId}
              onSelect={() =>
                update({ accent: accentId, autoRankColor: false })
              }
            />
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-white/[0.05] pt-4">
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
        <div className="mt-1 flex items-center gap-2 rounded-lg border border-line bg-white/[0.015] px-2.5 py-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: rankAccent }}
          />
          <span className="text-[10px] leading-relaxed text-muted/70">
            {options.autoRankColor && profile.rank
              ? 'Rank colour overrides the manual accent while enabled.'
              : 'Manual accent is used on the card.'}
          </span>
          <span
            className="ml-auto h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: resolvedAccent }}
          />
        </div>
      </div>

      <div className="mt-5 border-t border-white/[0.05] pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          Card sections
        </p>
        <div className="mt-1 divide-y divide-white/[0.04]">
          <Toggle
            label="Rating graph"
            description="Contest progression chart"
            checked={options.showRatingChart}
            onChange={(checked) => update({ showRatingChart: checked })}
          />
          <Toggle
            label="Problem statistics"
            description="Solved count and difficulty spread"
            checked={options.showProblemStats}
            onChange={(checked) => update({ showProblemStats: checked })}
          />
          <Toggle
            label="Topic tags"
            description="Your strongest problem tags"
            checked={options.showTopics}
            onChange={(checked) => update({ showTopics: checked })}
          />
          <Toggle
            label="Contest statistics"
            description="Rated contests and best rank"
            checked={options.showContestStats}
            onChange={(checked) => update({ showContestStats: checked })}
          />
          <Toggle
            label="Membership date"
            description="When you joined Codeforces"
            checked={options.showMemberSince}
            onChange={(checked) => update({ showMemberSince: checked })}
          />
          <Toggle
            label="Branding watermark"
            description="Codecard header and footer tagline"
            checked={options.showWatermark}
            onChange={(checked) => update({ showWatermark: checked })}
          />
        </div>
      </div>

      <div className="mt-5">
        <button
          type="button"
          onClick={onDownload}
          disabled={isExporting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 py-3 text-[13px] font-semibold text-[#15130C] shadow-[0_8px_30px_rgba(215,180,94,0.12)] transition-all duration-200 hover:bg-[#E2C374] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} strokeWidth={2.2} />
          )}
          {isExporting ? 'Exporting PNG…' : 'Download PNG'}
        </button>
        {error ? (
          <p className="animate-fade-in mt-2 text-center text-[10px] text-rose-300/90">
            {error}
          </p>
        ) : (
          <p className="mt-2 text-center text-[10px] text-muted/60">
            1080 × 1350 card · 2× PNG (2160 × 2700)
          </p>
        )}
      </div>
    </aside>
  )
}
