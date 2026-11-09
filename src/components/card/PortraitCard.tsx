import { forwardRef } from 'react'

import bannerUrl from '../../assets/anime-banner.svg'
import { RatingLineChart } from '../charts/RatingLineChart'
import { ProfileAvatar } from '../ui/ProfileAvatar'
import { selectStats, sanitizeStats } from '../../lib/cardStats'
import { getTemplate } from '../../lib/cardTemplates'
import {
  CARD_THEMES,
  getRarity,
  hasFoil,
  hasInnerGlow,
  mixHex,
  resolveAccent,
  resolveRankAccent,
  withAlpha,
} from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import type { StatTile } from '../../lib/cardStats'
import { formatNumber } from '../../lib/utils'
import type { CardOptions, HeatmapDay, Profile } from '../../types/profile'
import { getHeatmapLevel, handleFontSize } from './cardUtils'
import { GlassPanel } from './glass'
import { RankBadge } from './RankBadge'

interface PortraitCardProps {
  profile: Profile
  options: CardOptions
}

/**
 * Base design geometry: the 1080x1350 portrait. Every other template renders
 * the same design scaled by `s = template.width / 1080`, so portrait itself
 * stays pixel-identical (s = 1) while story / print reuse the single-column
 * layout and the wide link template gets its own two-column arrangement.
 */
const BASE_WIDTH = 1080
const HEATMAP_DAYS = 126
const HEATMAP_WEEKS = 18
const HERO_BOX_HEIGHT = 173
const HERO_BOX_WIDTH = 398
/**
 * Fill opacities per activity level: faint empty cells, scaling up so the
 * busiest days read clearly even behind the sparkline.
 */
const HEATMAP_OPACITY = [0.06, 0.28, 0.5, 0.75]
/** Extra opacity boost (applied linearly) for the four most recent weeks. */
const RECENT_WEEKS_OPACITY_BOOST = 0.1
const RECENT_DAYS = 28
const GRID_TWO_ROW_HEIGHT = 452
const GRID_ONE_ROW_HEIGHT = 214

function ActivityHeatmap({
  days,
  color,
  emptyColor,
  scale,
}: {
  days: HeatmapDay[]
  color: string
  emptyColor: string
  scale: number
}) {
  const recentCutoff =
    days.length > 0
      ? new Date(
          new Date(`${days[days.length - 1].date}T00:00:00`).getTime() -
            (RECENT_DAYS - 1) * 24 * 60 * 60 * 1000,
        )
      : null
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
        gap: 6 * scale,
      }}
    >
      {days.map((day) => {
        const level = getHeatmapLevel(day.submissions)
        let opacity = level === 0 ? 1 : HEATMAP_OPACITY[level]
        const backgroundColor = level === 0 ? emptyColor : color
        if (level > 0 && recentCutoff !== null) {
          // Recent activity pops: +10% for the four newest weeks.
          const dayDate = new Date(`${day.date}T00:00:00`)
          if (dayDate >= recentCutoff) {
            opacity = Math.min(1, opacity + RECENT_WEEKS_OPACITY_BOOST)
          }
        }
        return (
          <div
            key={day.date}
            style={{
              borderRadius: 6 * scale,
              backgroundColor,
              opacity,
            }}
          />
        )
      })}
    </div>
  )
}

interface StatTileSizes {
  label: number
  value: number
  caption: number
  icon: number
  padding: number
  radius: number
}

function StatTile({
  theme,
  rankColor,
  tile,
  sizes,
  spanAll,
}: {
  theme: CardTheme
  rankColor: string
  tile: StatTile
  sizes: StatTileSizes
  spanAll?: boolean
}) {
  const isDark = theme.mode === 'dark'
  // Raised-glass feel: lighter at the top, darker at the bottom, with a
  // brighter 1 px top-edge highlight. Text colours are unchanged, so all
  // label/value/caption pairs keep their theme contrast (AA or better).
  const tileGradient = isDark
    ? 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.015) 34%, rgba(0,0,0,0.16) 100%)'
    : 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.38) 46%, rgba(175,182,196,0.24) 100%)'
  const tileShadow = isDark
    ? 'inset 0 1px 0 rgba(255,255,255,0.32), 0 20px 46px rgba(0, 0, 0, 0.4)'
    : 'inset 0 1px 0 rgba(255,255,255,0.95), 0 18px 40px rgba(23, 23, 29, 0.12)'

  return (
    <GlassPanel
      theme={theme}
      accent={rankColor}
      radius={Math.round(sizes.radius)}
      style={{
        gridColumn: spanAll ? '1 / -1' : undefined,
        height: '100%',
        padding: sizes.padding,
        boxSizing: 'border-box',
        minWidth: 0,
        backgroundImage: tileGradient,
        boxShadow: tileShadow,
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
            fontSize: sizes.label,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '0.01em',
            color: rankColor,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {tile.label}
        </span>
        <span
          aria-hidden="true"
          style={{ fontSize: sizes.icon, lineHeight: 1, flexShrink: 0 }}
        >
          {tile.icon}
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
            fontSize: sizes.value,
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: '-0.06em',
            color: theme.text,
          }}
        >
          {tile.value}
        </span>
      </div>
      <span
        style={{
          flexShrink: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: sizes.caption,
          lineHeight: 1.1,
          color: theme.muted,
        }}
      >
        {tile.caption}
      </span>
    </GlassPanel>
  )
}

/**
 * Collectible card rendered from the shared design for the portrait, story
 * and print templates, plus a dedicated wide layout for the link template.
 * All layout uses explicit inline styles so html-to-image can rasterise the
 * card without dashboard CSS leaking in.
 */
export const PortraitCard = forwardRef<HTMLDivElement, PortraitCardProps>(
  function PortraitCard({ profile, options }, ref) {
    const template = getTemplate(options.template)
    const theme = CARD_THEMES[options.theme]
    const isDark = theme.mode === 'dark'
    const isLink = template.id === 'link'
    const isStory = template.id === 'story'
    const accent = resolveAccent(
      theme,
      options.accent,
      options.autoRankColor,
      profile.rank,
      options.customAccent,
    )
    const rankColor = resolveRankAccent(profile.rank, theme.mode) ?? accent
    const rarity = getRarity(profile.rank)
    const foil = hasFoil(profile.rank)
    const innerGlow = hasInnerGlow(profile.rank)
    // LEGENDARY / MYTHIC badges get a stronger outer halo in the rank colour.
    const highRarity = rarity === 'LEGENDARY' || rarity === 'MYTHIC'
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
    // Lighten the gradient end ~25% toward white so low-saturation ranks
    // (Newbie, Pupil) still read vivid on both themes.
    const ratingGradient = `linear-gradient(180deg, ${
      isDark ? '#FFFFFF' : theme.text
    } 0%, ${mixHex(rankColor, '#FFFFFF', 0.25)} 100%)`

    // The stat pool is filtered by the section toggles: `boss` follows the
    // hardest-problem toggle, everything else follows the stats toggle —
    // matching the pre-registry behaviour.
    const requestedStats = sanitizeStats(options.stats).filter((id) =>
      id === 'boss' ? options.showHardestProblem : options.showStats,
    )
    const tiles = selectStats(profile, requestedStats)

    const scale = template.width / BASE_WIDTH
    // Physical / wide formats need a legible lower bound for the smallest
    // text (captions, footer); screen templates scale freely.
    const minFont = isLink || template.id === 'print' ? 22 : 0
    const px = (value: number) => value * scale
    const ft = (value: number) => Math.max(value * scale, minFont)
    // Story banners breathe more: the banner is shorter and section spacing
    // grows instead of stretching text.
    const spacingScale = isStory ? 1.5 : 1
    const sp = (value: number) => px(value * spacingScale)

    const headerRow = (
      <>
        <span
          style={{
            fontSize: isLink ? 24 : ft(36),
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
          large={!isLink}
          scale={scale}
          minFontSize={isLink ? 22 : minFont}
          label={rarity}
          glowRadius={highRarity ? 30 : 18}
          glowAlpha={highRarity ? 0.42 : 0.18}
          background="rgba(8, 10, 14, 0.55)"
        />
      </>
    )

    const heroBoxHeight = px(HERO_BOX_HEIGHT)
    const heroBoxWidth = px(HERO_BOX_WIDTH)
    const heroBoxChartHeight = Math.round(
      (heroBoxHeight * 1000) / Math.max(1, heroBoxWidth),
    )

    const heroVisualBox = hasHeroVisual ? (
      <div
        style={{
          position: 'relative',
          flex: 1,
          minWidth: 0,
          height: isLink ? 132 : heroBoxHeight,
        }}
      >
        {hasHeatmap ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
            }}
          >
            <ActivityHeatmap
              days={heatmapDays}
              color={rankColor}
              emptyColor={theme.heatmapEmpty}
              scale={isLink ? scale * 0.6 : scale}
            />
          </div>
        ) : null}
        {hasChart ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
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
              height={isLink ? 118 : heroBoxChartHeight}
              gridColor={theme.chartGrid}
              labelColor={theme.chartLabel}
              dotFill={theme.chartDot}
              underStrokeColor="rgba(0, 0, 0, 0.32)"
            />
          </div>
        ) : null}
      </div>
    ) : null

    const bannerLayers = (
      <>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: isLink ? '100%' : isStory ? '36%' : '40%',
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
            height: isLink ? '100%' : isStory ? '36%' : '40%',
            background: isLink
              ? isDark
                ? `linear-gradient(90deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 28%, ${withAlpha(
                    theme.background,
                    0.62,
                  )} 52%, ${theme.background} 86%)`
                : `linear-gradient(90deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 28%, ${withAlpha(
                    theme.background,
                    0.72,
                  )} 52%, ${theme.background} 86%)`
              : isDark
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
      </>
    )

    const cardRadius = isLink ? 40 : px(76)

    if (isLink) {
      // ── Wide link-preview layout: two columns, 1200x630 ──────────────
      const statSizes: StatTileSizes = {
        label: 22,
        value: 44,
        caption: 22,
        icon: 24,
        padding: 18,
        radius: 20,
      }
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
            borderRadius: cardRadius,
            border: `1px solid ${withAlpha(rankColor, 0.5)}`,
            boxShadow: `0 0 60px ${withAlpha(
              rankColor,
              isDark ? 0.2 : 0.14,
            )}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        >
          {/* Ambient rank glow behind the banner */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: -120,
              left: '30%',
              width: 820,
              height: 520,
              transform: 'translateX(-50%)',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${withAlpha(
                rankColor,
                isDark ? 0.28 : 0.18,
              )}, transparent 68%)`,
              filter: 'blur(56px)',
              opacity: 0.9,
            }}
          />

          {options.showBanner ? (
            <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
              {bannerLayers}
            </div>
          ) : null}

          {foil ? (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                background: `linear-gradient(115deg, transparent 16%, ${withAlpha(
                  '#FFFFFF',
                  0.24,
                )} 32%, ${withAlpha(rankColor, 0.22)} 44%, ${withAlpha(
                  '#FFFFFF',
                  0.1,
                )} 54%, transparent 66%, ${withAlpha(
                  rankColor,
                  0.14,
                )} 80%, transparent 92%)`,
                mixBlendMode: 'screen',
                opacity: isDark ? 0.9 : 0.72,
              }}
            />
          ) : null}
          {innerGlow ? (
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                borderRadius: cardRadius,
                boxShadow: `inset 0 0 70px ${withAlpha(
                  rankColor,
                  isDark ? 0.28 : 0.2,
                )}, inset 0 0 0 2px ${withAlpha(rankColor, 0.4)}`,
              }}
            />
          ) : null}

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              padding: 44,
              boxSizing: 'border-box',
            }}
          >
            <header
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexShrink: 0,
              }}
            >
              {headerRow}
            </header>

            <section
              style={{
                marginTop: 26,
                display: 'flex',
                gap: 34,
                flex: 1,
                minHeight: 0,
              }}
            >
              {/* Left column: identity and rating hero */}
              <div
                style={{
                  flex: '0 0 54%',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 26,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        inset: -12,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${withAlpha(
                          rankColor,
                          isDark ? 0.28 : 0.18,
                        )}, transparent 68%)`,
                        filter: 'blur(16px)',
                      }}
                    />
                    <div
                      style={{
                        position: 'relative',
                        padding: 4,
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
                        )}, 0 0 30px ${withAlpha(rankColor, isDark ? 0.26 : 0.16)}`,
                      }}
                    >
                      <ProfileAvatar
                        src={
                          options.customPhoto ??
                          profile.avatarDataUrl ??
                          profile.avatarUrl
                        }
                        initials={profile.initials}
                        size={108}
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
                        fontSize: 48,
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
                        margin: '8px 0 0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 22,
                        fontWeight: 600,
                        lineHeight: 1.1,
                        color: rankColor,
                        textShadow: heroShadow,
                      }}
                    >
                      {identityLine}
                    </p>
                  </div>
                </div>

                {showQuote ? (
                  <p
                    style={{
                      margin: '14px 0 0',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: 22,
                      fontStyle: 'italic',
                      lineHeight: 1.2,
                      color: theme.muted,
                      flexShrink: 0,
                    }}
                  >
                    &ldquo;{quote}&rdquo;
                  </p>
                ) : null}

                {/* Rating hero with sparkline; heatmap sits behind it */}
                <div
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 26,
                  }}
                >
                  <div style={{ flexShrink: 0, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 22,
                        lineHeight: 1,
                        letterSpacing: '0.02em',
                        color: theme.muted,
                      }}
                    >
                      Current rating
                    </p>
                    <div style={{ position: 'relative', marginTop: 4 }}>
                      {/* Solid fallback if background-clip:text unsupported. */}
                      <span
                        aria-hidden="true"
                        className="tabular"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          fontSize: 108,
                          fontWeight: 800,
                          lineHeight: 0.82,
                          letterSpacing: '-0.07em',
                          color: isDark ? '#FFFFFF' : theme.text,
                          filter: `drop-shadow(0 0 24px ${withAlpha(
                            rankColor,
                            isDark ? 0.42 : 0.24,
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
                          fontSize: 108,
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
                  {heroVisualBox}
                </div>
              </div>

              {/* Right column: stat tiles */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
                    gap: 16,
                    flex: 1,
                    minHeight: 0,
                  }}
                >
                  {tiles.map((tile) => (
                    <StatTile
                      key={tile.id}
                      theme={theme}
                      rankColor={rankColor}
                      tile={tile}
                      sizes={statSizes}
                      spanAll={tiles.length === 1}
                    />
                  ))}
                </div>
              </div>
            </section>

            <footer
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 20,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: 22,
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
                    gap: 8,
                    flexShrink: 0,
                    fontSize: 22,
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
    }

    // ── Columnar layout shared by portrait / story / print ───────────
    const statSizes: StatTileSizes = {
      label: ft(29),
      value: ft(89),
      caption: ft(26),
      icon: ft(34),
      padding: px(26),
      radius: px(37),
    }
    const gridHeight =
      tiles.length === 1 ? px(GRID_ONE_ROW_HEIGHT) : px(GRID_TWO_ROW_HEIGHT)

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
          borderRadius: cardRadius,
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
            top: px(-180),
            left: '50%',
            width: px(920),
            height: px(520),
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
            {bannerLayers}
          </div>
        ) : null}

        {/* Bottom ambient glows */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: px(-260),
            right: px(-180),
            width: px(760),
            height: px(760),
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
            bottom: px(-220),
            left: px(-200),
            width: px(620),
            height: px(620),
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(
              accent,
              isDark ? 0.12 : 0.08,
            )}, transparent 70%)`,
            filter: 'blur(70px)',
          }}
        />

        {/* Static holographic foil: above the background, below the content. */}
        {foil ? (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              background: `linear-gradient(115deg, transparent 16%, ${withAlpha(
                '#FFFFFF',
                0.24,
              )} 32%, ${withAlpha(rankColor, 0.22)} 44%, ${withAlpha(
                '#FFFFFF',
                0.1,
              )} 54%, transparent 66%, ${withAlpha(
                rankColor,
                0.14,
              )} 80%, transparent 92%)`,
              mixBlendMode: 'screen',
              opacity: isDark ? 0.9 : 0.72,
            }}
          />
        ) : null}
        {innerGlow ? (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              borderRadius: cardRadius,
              boxShadow: `inset 0 0 90px ${withAlpha(
                rankColor,
                isDark ? 0.28 : 0.2,
              )}, inset 0 0 0 2px ${withAlpha(rankColor, 0.4)}`,
            }}
          />
        ) : null}

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: px(65),
            boxSizing: 'border-box',
          }}
        >
          <header
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: px(24),
              flexShrink: 0,
            }}
          >
            {headerRow}
          </header>

          {/* Flexible spacer keeps the banner area open */}
          <div style={{ flex: 1, minHeight: 0 }} />

          <section
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: px(38),
              flexShrink: 0,
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: px(-16),
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
                  padding: px(5),
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
                  )}, 0 0 46px ${withAlpha(
                    rankColor,
                    isDark ? 0.26 : 0.16,
                  )}`,
                }}
              >
                <ProfileAvatar
                  src={
                    options.customPhoto ??
                    profile.avatarDataUrl ??
                    profile.avatarUrl
                  }
                  initials={profile.initials}
                  size={px(184)}
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
                  fontSize:
                    profile.handle.length > 16
                      ? ft(handleFontSize(profile.handle))
                      : ft(69),
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: '-0.045em',
                  color: theme.text,
                  textShadow: heroShadow,
                }}
              >
                <span style={{ color: theme.muted, fontWeight: 600 }}>@</span>
                {profile.handle}
              </h2>
              <p
                style={{
                  margin: `${px(10)}px 0 0`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontSize: ft(38),
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
              marginTop: sp(32),
              display: 'flex',
              alignItems: 'flex-end',
              gap: hasHeroVisual ? px(32) : 0,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                flex: hasHeroVisual ? `0 0 ${px(520)}px` : 1,
                minWidth: 0,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: ft(32),
                  lineHeight: 1,
                  letterSpacing: '0.02em',
                  color: theme.muted,
                }}
              >
                Current rating
              </p>
              <div style={{ position: 'relative', marginTop: px(6) }}>
                {/* Solid fallback if background-clip:text is unsupported. */}
                <span
                  aria-hidden="true"
                  className="tabular"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    fontSize: ft(205),
                    fontWeight: 800,
                    lineHeight: 0.82,
                    letterSpacing: '-0.07em',
                    color: isDark ? '#FFFFFF' : theme.text,
                    filter: `drop-shadow(0 0 30px ${withAlpha(
                      rankColor,
                      isDark ? 0.42 : 0.24,
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
                    fontSize: ft(205),
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

            {heroVisualBox}
          </section>

          {showQuote ? (
            <p
              style={{
                margin: `${sp(24)}px 0 0`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: ft(30),
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
                marginTop: sp(24),
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gridTemplateRows:
                  tiles.length === 1 ? '1fr' : tiles.length <= 3 ? '1fr' : '1fr 1fr',
                gap: px(24),
                height: gridHeight,
                flexShrink: 0,
              }}
            >
              {tiles.map((tile) => (
                <StatTile
                  key={tile.id}
                  theme={theme}
                  rankColor={rankColor}
                  tile={tile}
                  sizes={statSizes}
                  spanAll={tiles.length === 1}
                />
              ))}
            </div>
          ) : null}

          <footer
            style={{
              marginTop: sp(36),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: px(24),
              flexShrink: 0,
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: ft(30),
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
                  gap: px(10),
                  flexShrink: 0,
                  fontSize: ft(30),
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
