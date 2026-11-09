import { forwardRef } from 'react'

import bannerUrl from '../../assets/anime-banner.svg'
import { RatingLineChart } from '../charts/RatingLineChart'
import { ProfileAvatar } from '../ui/ProfileAvatar'
import { getTemplate } from '../../lib/cardTemplates'
import {
  CARD_THEMES,
  resolveAccent,
  resolveRankAccent,
  withAlpha,
} from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import { formatNumber } from '../../lib/utils'
import type { CardOptions, HeatmapDay, Profile } from '../../types/profile'
import { getHeatmapLevel, handleFontSize } from './cardUtils'
import { GlassPanel, GlassSheen } from './glass'
import { glassSurface } from './glassSurface'
import { RankBadge } from './RankBadge'

interface PortraitCardProps {
  profile: Profile
  options: CardOptions
}

const CARD_RADIUS = 76
const CARD_PADDING = 65
const HEATMAP_DAYS = 126
const HEATMAP_WEEKS = 18
const HERO_BOX_HEIGHT = 173
const HERO_BOX_WIDTH = 398
const HERO_BOX_CHART_HEIGHT = Math.round(
  (HERO_BOX_HEIGHT * 1000) / HERO_BOX_WIDTH,
)
const HEATMAP_OPACITY = [0.05, 0.18, 0.34, 0.55]
const GRID_TWO_ROW_HEIGHT = 452
const GRID_ONE_ROW_HEIGHT = 214
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** Compact local date for the peak-day caption, e.g. "Aug 15". */
function compactDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`)
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`
}

function ActivityHeatmap({
  days,
  color,
}: {
  days: HeatmapDay[]
  color: string
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${HEATMAP_WEEKS}, minmax(0, 1fr))`,
        gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
        gridAutoFlow: 'column',
        gap: 6,
      }}
    >
      {days.map((day) => (
        <div
          key={day.date}
          style={{
            borderRadius: 6,
            backgroundColor: color,
            opacity: HEATMAP_OPACITY[getHeatmapLevel(day.submissions)],
          }}
        />
      ))}
    </div>
  )
}

function StatTile({
  theme,
  rankColor,
  label,
  icon,
  value,
  caption,
  spanAll,
}: {
  theme: CardTheme
  rankColor: string
  label: string
  icon: string
  value: string
  caption: string
  spanAll: boolean
}) {
  return (
    <GlassPanel
      theme={theme}
      accent={rankColor}
      radius={37}
      style={{
        gridColumn: spanAll ? '1 / -1' : undefined,
        height: '100%',
        padding: 26,
        boxSizing: 'border-box',
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 29,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.01em',
            color: rankColor,
          }}
        >
          {label}
        </span>
        <span aria-hidden="true" style={{ fontSize: 34, lineHeight: 1 }}>
          {icon}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          alignItems: 'center',
        }}
      >
        <span
          className="tabular"
          style={{
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 89,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.06em',
            color: theme.text,
          }}
        >
          {value}
        </span>
      </div>
      <span
        style={{
          flexShrink: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 26,
          lineHeight: 1.1,
          color: theme.muted,
        }}
      >
        {caption}
      </span>
    </GlassPanel>
  )
}

function AbilityChip({
  theme,
  rankColor,
  label,
  value,
}: {
  theme: CardTheme
  rankColor: string
  label: string
  value: string
}) {
  return (
    <div
      style={{
        ...glassSurface(theme, 31),
        display: 'inline-flex',
        alignItems: 'center',
        gap: 12,
        padding: '21px 30px',
        boxSizing: 'border-box',
        minWidth: 0,
      }}
    >
      <GlassSheen
        accent={rankColor}
        radius={31}
        isDark={theme.mode === 'dark'}
      />
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          flexShrink: 0,
          fontSize: 29,
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: rankColor,
        }}
      >
        {label}
      </span>
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: 29,
          color: theme.text,
        }}
      >
        {value}
      </span>
    </div>
  )
}

interface TileData {
  label: string
  icon: string
  value: string
  caption: string
}

/**
 * Portrait collectible: 1080x1350. All layout uses explicit inline styles so
 * html-to-image can rasterise the card without dashboard CSS leaking in.
 */
export const PortraitCard = forwardRef<HTMLDivElement, PortraitCardProps>(
  function PortraitCard({ profile, options }, ref) {
    const template = getTemplate('portrait')
    const theme = CARD_THEMES[options.theme]
    const isDark = theme.mode === 'dark'
    const accent = resolveAccent(
      theme,
      options.accent,
      options.autoRankColor,
      profile.rank,
      options.customAccent,
    )
    const rankColor = resolveRankAccent(profile.rank, theme.mode) ?? accent
    const heroShadow = isDark
      ? '0 2px 18px rgba(0,0,0,0.58)'
      : '0 1px 0 rgba(255,255,255,0.72)'
    // The banner is dark in both themes, so the header stays light grey over
    // it and falls back to theme text when the banner is hidden.
    const headerColor = options.showBanner
      ? 'rgba(247,248,251,0.9)'
      : isDark
        ? 'rgba(247,248,251,0.86)'
        : 'rgba(23,23,29,0.78)'
    const headerTextShadow =
      options.showBanner || isDark
        ? '0 2px 12px rgba(0,0,0,0.5)'
        : '0 1px 0 rgba(255,255,255,0.6)'

    const quote = options.customQuote.trim()
    const showQuote = options.showQuote && quote.length > 0

    const bannerPosition =
      options.bannerPosition === 'top'
        ? 'center top'
        : options.bannerPosition === 'bottom'
          ? 'center bottom'
          : 'center center'
    const bannerSource = options.customBanner ?? bannerUrl

    const handleSize =
      profile.handle.length > 16 ? handleFontSize(profile.handle) : 69
    const identityLine = [profile.rank ?? 'Unrated', profile.country]
      .filter(Boolean)
      .join(' · ')

    const heatmapDays = profile.submissionActivity
      ? profile.submissionActivity.days.slice(-HEATMAP_DAYS)
      : []
    const hasHeatmap = options.showHeatmap && heatmapDays.length > 0
    const hasChart =
      options.showRatingChart && profile.ratingHistory.length > 0
    const hasHeroVisual = hasHeatmap || hasChart

    const ratingText = formatNumber(profile.rating)
    const ratingGradient = `linear-gradient(180deg, ${
      isDark ? '#FFFFFF' : theme.text
    } 0%, ${rankColor} 100%)`

    const hardest = profile.hardestProblem
    const peakDayDate = profile.peakDay.date
    const peakDayHasData =
      profile.peakDay.count > 0 && peakDayDate !== null

    const tiles: TileData[] = []
    if (options.showHardestProblem) {
      tiles.push({
        label: 'Boss',
        icon: '👑',
        value: hardest ? formatNumber(hardest.rating) : '—',
        caption: hardest ? hardest.name : 'no rated solve',
      })
    }
    if (options.showStats) {
      tiles.push(
        {
          label: 'Solved',
          icon: '✅',
          value: profile.submissionsAvailable
            ? formatNumber(profile.problemsSolved)
            : '—',
          caption: 'unique problems',
        },
        {
          label: 'Streak',
          icon: '🔥',
          value: profile.submissionsAvailable
            ? formatNumber(profile.submissionActivity?.longestStreak)
            : '—',
          caption: 'days in a row',
        },
        {
          label: 'Peak day',
          icon: '⚡',
          value: peakDayHasData
            ? formatNumber(profile.peakDay.count)
            : '—',
          caption:
            peakDayHasData && peakDayDate
              ? `solved on ${compactDate(peakDayDate)}${
                  profile.peakDay.partial ? ' ~' : ''
                }`
              : `no peak day yet${profile.peakDay.partial ? ' ~' : ''}`,
        },
        {
          label: 'Grit',
          icon: '🧱',
          value: profile.submissionsAvailable
            ? formatNumber(profile.grit.count)
            : '—',
          caption: `wrongs, then AC${profile.grit.partial ? ' ~' : ''}`,
        },
        {
          label: 'Contests',
          icon: '🏁',
          value:
            profile.ratingHistoryAvailable && profile.contests > 0
              ? formatNumber(profile.contests)
              : '—',
          caption: 'rated rounds',
        },
      )
    }

    const chips: Array<{ label: string; value: string }> = []
    if (profile.topTag) {
      chips.push({ label: 'TYPE', value: profile.topTag.tag })
    }
    if (profile.bestComeback !== null) {
      const sign = profile.bestComeback >= 0 ? '+' : ''
      chips.push({
        label: 'MOVE',
        value: `Comeback ${sign}${formatNumber(profile.bestComeback)}`,
      })
    }

    const gridHeight =
      tiles.length === 1 ? GRID_ONE_ROW_HEIGHT : GRID_TWO_ROW_HEIGHT

    return (
      <div
        ref={ref}
        data-codecard-export
        style={{
          width: template.width,
          height: template.height,
          backgroundColor: theme.background,
          color: theme.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
          fontFeatureSettings: "'cv11', 'ss01'",
          position: 'relative',
          overflow: 'hidden',
          borderRadius: CARD_RADIUS,
          border: `1px solid ${withAlpha(rankColor, 0.5)}`,
          boxShadow: `0 0 90px ${withAlpha(
            rankColor,
            isDark ? 0.22 : 0.16,
          )}, inset 0 1px 0 rgba(255,255,255,0.08)`,
        }}
      >
        {/* Ambient rank glow behind the banner */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -180,
            left: '50%',
            width: 920,
            height: 520,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(
              rankColor,
              isDark ? 0.3 : 0.2,
            )}, transparent 68%)`,
            filter: 'blur(64px)',
            opacity: 0.9,
          }}
        />

        {options.showBanner ? (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                backgroundImage: `url("${bannerSource}")`,
                backgroundSize: 'cover',
                backgroundPosition: bannerPosition,
                backgroundRepeat: 'no-repeat',
                opacity: isDark ? 1 : 0.9,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: isDark
                  ? `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 38%, ${withAlpha(
                      theme.background,
                      0.4,
                    )} 72%, ${theme.background} 100%)`
                  : `linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 38%, ${withAlpha(
                      theme.background,
                      0.6,
                    )} 72%, ${theme.background} 100%)`,
              }}
            />
          </div>
        ) : null}

        {/* Bottom ambient glows */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -260,
            right: -180,
            width: 760,
            height: 760,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(
              rankColor,
              isDark ? 0.16 : 0.1,
            )}, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -220,
            left: -200,
            width: 620,
            height: 620,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(
              accent,
              isDark ? 0.12 : 0.08,
            )}, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: CARD_PADDING,
            boxSizing: 'border-box',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: headerColor,
                textShadow: headerTextShadow,
                whiteSpace: 'nowrap',
              }}
            >
              Codeforces · No. {profile.cardNumber}
            </span>
            <RankBadge
              rank={profile.rank}
              rankColor={rankColor}
              accent={accent}
              large
              background={
                isDark
                  ? 'rgba(8, 10, 14, 0.55)'
                  : 'rgba(255, 255, 255, 0.62)'
              }
            />
          </header>

          {/* Flexible spacer keeps the banner area open */}
          <div style={{ flex: 1, minHeight: 0 }} />

          <section
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 38,
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: -16,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${withAlpha(
                    rankColor,
                    isDark ? 0.28 : 0.18,
                  )}, transparent 68%)`,
                  filter: 'blur(20px)',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  padding: 5,
                  borderRadius: '50%',
                  background: `linear-gradient(145deg, ${withAlpha(
                    rankColor,
                    0.95,
                  )}, ${withAlpha(accent, 0.55)} 52%, ${withAlpha(
                    rankColor,
                    0.3,
                  )})`,
                  boxShadow: `0 0 0 1px ${withAlpha(
                    rankColor,
                    0.35,
                  )}, 0 0 40px ${withAlpha(
                    rankColor,
                    isDark ? 0.26 : 0.16,
                  )}`,
                }}
              >
                <ProfileAvatar
                  src={profile.avatarDataUrl ?? profile.avatarUrl}
                  initials={profile.initials}
                  size={184}
                  accent={rankColor}
                  border="none"
                  background={
                    isDark
                      ? 'radial-gradient(circle at 30% 22%, rgba(95,208,160,0.2), transparent 62%), linear-gradient(145deg, #24272D, #0D0E11)'
                      : 'linear-gradient(145deg, #FFFFFF, #F0F0F4)'
                  }
                  color={isDark ? '#EEF1F6' : '#17171D'}
                />
              </div>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: handleSize,
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.045em',
                  color: theme.text,
                  textShadow: heroShadow,
                }}
              >
                <span style={{ color: theme.muted, fontWeight: 600 }}>
                  @
                </span>
                {profile.handle}
              </h2>
              <p
                style={{
                  margin: '10px 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 38,
                  fontWeight: 600,
                  lineHeight: 1.1,
                  color: rankColor,
                  textShadow: heroShadow,
                }}
              >
                {identityLine}
              </p>
            </div>
          </section>

          <section
            style={{
              marginTop: 32,
              display: 'flex',
              alignItems: 'flex-end',
              gap: hasHeroVisual ? 32 : 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                flex: hasHeroVisual ? '0 0 520px' : 1,
                minWidth: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 32,
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  color: theme.muted,
                }}
              >
                Current rating
              </p>
              <div style={{ position: 'relative', marginTop: 6 }}>
                {/* Solid fallback if background-clip:text is unsupported. */}
                <span
                  aria-hidden="true"
                  className="tabular"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: 205,
                    fontWeight: 800,
                    lineHeight: 0.82,
                    letterSpacing: '-0.07em',
                    color: isDark ? '#FFFFFF' : theme.text,
                    filter: `drop-shadow(0 0 30px ${withAlpha(
                      rankColor,
                      isDark ? 0.35 : 0.2,
                    )})`,
                  }}
                >
                  {ratingText}
                </span>
                <span
                  className="tabular"
                  style={{
                    position: 'relative',
                    display: 'block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: 205,
                    fontWeight: 800,
                    lineHeight: 0.82,
                    letterSpacing: '-0.07em',
                    color: 'transparent',
                    backgroundImage: ratingGradient,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                  }}
                >
                  {ratingText}
                </span>
              </div>
            </div>

            {hasHeroVisual ? (
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  minWidth: 0,
                  height: HERO_BOX_HEIGHT,
                }}
              >
                {hasHeatmap ? (
                  <ActivityHeatmap
                    days={heatmapDays}
                    color={rankColor}
                  />
                ) : null}
                {hasChart ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <RatingLineChart
                      data={profile.ratingHistory.slice(-26)}
                      accent={rankColor}
                      compact
                      showAxis={false}
                      showGrid={false}
                      interactive={false}
                      height={HERO_BOX_CHART_HEIGHT}
                      gridColor={theme.chartGrid}
                      labelColor={theme.chartLabel}
                      dotFill={theme.chartDot}
                    />
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          {showQuote ? (
            <p
              style={{
                margin: '24px 0 0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 30,
                fontStyle: 'italic',
                lineHeight: 1.2,
                color: theme.muted,
                flexShrink: 0,
              }}
            >
              &ldquo;{quote}&rdquo;
            </p>
          ) : null}

          {tiles.length > 0 ? (
            <div
              style={{
                marginTop: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateRows:
                  tiles.length === 1 ? '1fr' : '1fr 1fr',
                gap: 24,
                height: gridHeight,
                flexShrink: 0,
              }}
            >
              {tiles.map((tile) => (
                <StatTile
                  key={tile.label}
                  theme={theme}
                  rankColor={rankColor}
                  label={tile.label}
                  icon={tile.icon}
                  value={tile.value}
                  caption={tile.caption}
                  spanAll={tiles.length === 1}
                />
              ))}
            </div>
          ) : null}

          {chips.length > 0 ? (
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                flexShrink: 0,
              }}
            >
              {chips.map((chip) => (
                <AbilityChip
                  key={chip.label}
                  theme={theme}
                  rankColor={rankColor}
                  label={chip.label}
                  value={chip.value}
                />
              ))}
            </div>
          ) : null}

          <footer
            style={{
              marginTop: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 30,
                lineHeight: 1.2,
                color: theme.muted,
              }}
            >
              codeforces.com/profile/
              <span style={{ color: theme.text, fontWeight: 600 }}>
                {profile.handle}
              </span>
            </span>
            {options.showWatermark ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  flexShrink: 0,
                  fontSize: 30,
                  fontWeight: 700,
                  lineHeight: 1.2,
                  letterSpacing: '0.08em',
                  color: rankColor,
                  whiteSpace: 'nowrap',
                }}
              >
                <span aria-hidden="true">✦</span>
                Codecard
              </span>
            ) : null}
          </footer>
        </div>
      </div>
    )
  },
)
