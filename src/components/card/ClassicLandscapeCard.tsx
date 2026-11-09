import { forwardRef } from 'react'
import {
  CalendarDays,
  Crown,
  Flame,
  Sparkles,
  Trophy,
} from 'lucide-react'

import bannerUrl from '../../assets/anime-banner.svg'
import { RatingLineChart } from '../charts/RatingLineChart'
import { CodeforcesMark } from '../ui/CodeforcesMark'
import { ProfileAvatar } from '../ui/ProfileAvatar'
import { getTemplate } from '../../lib/cardTemplates'
import {
  CARD_THEMES,
  mixHex,
  resolveAccent,
  resolveRankAccent,
  withAlpha,
} from '../../lib/cardThemes'
import { resolveDesignation } from '../../lib/designation'
import { formatNumber } from '../../lib/utils'
import type {
  CardOptions,
  HeatmapDay,
  Profile,
} from '../../types/profile'
import { AchievementTile } from './AchievementTile'
import { getHeatmapLevel, handleFontSize } from './cardUtils'
import { glassSurface } from './glassSurface'
import { GlassPanel, GlassSheen } from './glass'
import { RankBadge } from './RankBadge'

interface ClassicLandscapeCardProps {
  profile: Profile
  options: CardOptions
}

/**
 * The exported artefact. Everything inside this component uses explicit,
 * self-contained styling so the PNG never inherits dashboard chrome.
 *
 * The composition is a 7:5 collectible: a cinematic banner behind a glass
 * identity band, an oversized rating, a tall progress chart, four distinct
 * achievement tiles, a reversed emerald activity calendar, an optional motto,
 * and a quiet footer.
 */
export const ClassicLandscapeCard = forwardRef<
  HTMLDivElement,
  ClassicLandscapeCardProps
>(function ClassicLandscapeCard({ profile, options }, ref) {
    const template = getTemplate('classic')
    const theme = CARD_THEMES[options.theme]
    const isDark = theme.mode === 'dark'
    const accent = resolveAccent(
      theme,
      options.accent,
      options.autoRankColor,
      profile.rank,
      options.customAccent,
    )
    const rankColor =
      resolveRankAccent(profile.rank, theme.mode) ?? accent
    const accentSoft = withAlpha(accent, isDark ? 0.15 : 0.11)
    const accentBorder = withAlpha(accent, isDark ? 0.32 : 0.24)
    const heroShadow = isDark
      ? '0 2px 18px rgba(0,0,0,0.58)'
      : '0 1px 0 rgba(255,255,255,0.72)'

    const designation = resolveDesignation(profile, options)
    const quote = options.customQuote.trim()

    const peakRating =
      profile.maxRating ??
      (profile.ratingHistory.length > 0
        ? Math.max(...profile.ratingHistory.map((point) => point.rating))
        : null)

    const identityLine = [
      profile.country,
      profile.joinedYear ? `Member since ${profile.joinedYear}` : null,
    ]
      .filter(Boolean)
      .join(' · ')

    const activity = profile.submissionActivity
    const hardest = profile.hardestProblem

    // Chunk the last 52 * 7 = 364 days into week columns. The header summary
    // is derived from the exact weeks that are rendered so it always matches
    // the visible grid.
    const heatmapDays = activity ? activity.days.slice(-364) : []
    const heatmapWeeks: HeatmapDay[][] = []
    if (heatmapDays.length > 0) {
      let currentWeek: HeatmapDay[] = []
      heatmapDays.forEach((day, index) => {
        currentWeek.push(day)
        if (currentWeek.length === 7 || index === heatmapDays.length - 1) {
          heatmapWeeks.push(currentWeek)
          currentWeek = []
        }
      })
    }
    const displayedWeeks = heatmapWeeks.slice(-52)
    const displayedDays = displayedWeeks.flat()
    const heatmapSubmissions = displayedDays.reduce(
      (sum, day) => sum + day.submissions,
      0,
    )
    const heatmapActiveDays = displayedDays.filter(
      (day) => day.submissions > 0,
    ).length

    const heatmapPalette = {
      zero: theme.heatmapEmpty,
      bright: mixHex(accent, '#FFFFFF', 0.46),
      medium: accent,
      rich: mixHex(accent, '#000000', 0.5),
    }

    const hasRatingChart =
      options.showRatingChart && profile.ratingHistory.length > 0
    const hasHeatmap = options.showHeatmap && Boolean(activity)
    const hasLeftColumn = hasRatingChart || hasHeatmap
    const showSolved = options.showStats
    const showActiveDays = options.showStats
    const showStreak = options.showStats
    const showHardest = options.showHardestProblem
    const hasAchievements =
      showSolved || showActiveDays || showStreak || showHardest
    const showQuote = options.showQuote && quote.length > 0
    const hasRightColumn = hasAchievements || showQuote
    const hasWatermark = options.showWatermark

    const bannerPosition =
      options.bannerPosition === 'top'
        ? 'center top'
        : options.bannerPosition === 'bottom'
          ? 'center bottom'
          : 'center center'
    const bannerSource = options.customBanner ?? bannerUrl

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
        }}
      >
        {options.showBanner ? (
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 640,
                backgroundImage: `url("${bannerSource}")`,
                backgroundSize: 'cover',
                backgroundPosition: bannerPosition,
                backgroundRepeat: 'no-repeat',
                opacity: isDark ? 1 : 0.92,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: isDark
                  ? `linear-gradient(90deg, rgba(7,8,12,0.72) 0%, rgba(7,8,12,0.36) 40%, rgba(7,8,12,0.1) 68%, rgba(7,8,12,0.34) 100%), linear-gradient(180deg, rgba(7,8,12,0.04) 0%, rgba(7,8,12,0.16) 28%, rgba(7,8,12,0.6) 60%, ${theme.background} 90%)`
                  : `linear-gradient(90deg, rgba(242,244,247,0.86) 0%, rgba(242,244,247,0.55) 38%, rgba(242,244,247,0.16) 66%, rgba(242,244,247,0.55) 100%), linear-gradient(180deg, rgba(242,244,247,0.42) 0%, rgba(242,244,247,0.46) 30%, rgba(242,244,247,0.86) 64%, ${theme.background} 92%)`,
              }}
            />
          </div>
        ) : null}

        {/* Controlled ambient lighting */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -210,
            left: -160,
            width: 720,
            height: 720,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(accent, isDark ? 0.2 : 0.13)}, transparent 66%)`,
            filter: 'blur(64px)',
            opacity: isDark ? 0.95 : 0.85,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -260,
            right: -160,
            width: 760,
            height: 760,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${withAlpha(rankColor, isDark ? 0.14 : 0.08)}, transparent 68%)`,
            filter: 'blur(76px)',
            opacity: 0.9,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.025), transparent 30%, rgba(0,0,0,0.18))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.55), transparent 38%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            padding: '36px 48px 30px',
            boxSizing: 'border-box',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent 4%, ${withAlpha(accent, 0.85)} 42%, ${withAlpha(rankColor, 0.8)} 58%, transparent 96%)`,
              opacity: isDark ? 0.9 : 0.55,
            }}
          />

          <header
            style={{
              display: 'flex',
              flexShrink: 0,
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
              textShadow: heroShadow,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span
                style={{
                  display: 'flex',
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  border: `1px solid ${withAlpha(accent, isDark ? 0.28 : 0.22)}`,
                  backgroundColor: isDark
                    ? 'rgba(10, 13, 18, 0.42)'
                    : 'rgba(255,255,255,0.62)',
                  backgroundImage: theme.surfaceGradient ?? undefined,
                  boxShadow: isDark
                    ? `inset 0 1px 0 rgba(255,255,255,0.16), 0 0 24px ${withAlpha(accent, 0.16)}`
                    : '0 8px 20px rgba(23,23,29,0.08)',
                  color: accent,
                  flexShrink: 0,
                }}
              >
                <CodeforcesMark size={21} />
              </span>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: theme.text,
                  }}
                >
                  Codeforces
                </p>
                <p
                  style={{
                    marginTop: 3,
                    fontSize: 9,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                  }}
                >
                  Profile Card
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                textAlign: 'right',
              }}
            >
              {hasWatermark ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 10px',
                    borderRadius: 9999,
                    border: `1px solid ${withAlpha(accent, isDark ? 0.24 : 0.18)}`,
                    backgroundColor: isDark
                      ? 'rgba(9, 12, 17, 0.38)'
                      : 'rgba(255,255,255,0.55)',
                    color: accent,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                  }}
                >
                  <Sparkles size={10} />
                  Codecard
                </span>
              ) : null}
              <p
                style={{
                  fontSize: 11,
                  color: theme.muted,
                  letterSpacing: '0.02em',
                }}
              >
                {profile.isSample ? 'Design preview' : 'Verified profile'}
              </p>
            </div>
          </header>

          {/* Identity and rating band */}
          <section
            style={{
              marginTop: 22,
              display: 'flex',
              flexShrink: 0,
              alignItems: 'center',
              gap: 26,
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: -18,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${withAlpha(rankColor, isDark ? 0.32 : 0.2)}, transparent 68%)`,
                  filter: 'blur(18px)',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  padding: 5,
                  borderRadius: '50%',
                  background: `linear-gradient(145deg, ${withAlpha(rankColor, 0.9)}, ${withAlpha(accent, 0.55)} 52%, ${withAlpha(rankColor, 0.28)})`,
                  boxShadow: `0 0 0 1px ${withAlpha(rankColor, 0.34)}, 0 0 34px ${withAlpha(rankColor, isDark ? 0.24 : 0.16)}, 0 22px 44px rgba(0,0,0,${isDark ? 0.48 : 0.18})`,
                }}
              >
                <div
                  style={{
                    padding: 4,
                    borderRadius: '50%',
                    backgroundColor: isDark ? theme.background : '#F2F4F7',
                  }}
                >
                  <ProfileAvatar
                    src={
                      options.customPhoto ??
                      profile.avatarDataUrl ??
                      profile.avatarUrl
                    }
                    initials={profile.initials}
                    size={156}
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
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  right: 1,
                  bottom: 1,
                  display: 'flex',
                  width: 30,
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  backgroundColor: isDark ? theme.background : '#F2F4F7',
                  border: `1px solid ${withAlpha(rankColor, 0.45)}`,
                  color: rankColor,
                  boxShadow: `0 0 16px ${withAlpha(rankColor, 0.35)}`,
                }}
              >
                <Crown size={14} strokeWidth={2.1} />
              </span>
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <RankBadge
                  rank={profile.rank}
                  rankColor={rankColor}
                  accent={accent}
                />
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                    textShadow: heroShadow,
                  }}
                >
                  {profile.maxRank ? `Peak ${profile.maxRank}` : 'Codeforces'}
                </span>
              </div>

              <h2
                style={{
                  marginTop: 10,
                  fontSize: handleFontSize(profile.handle),
                  fontWeight: 700,
                  lineHeight: 0.98,
                  letterSpacing: '-0.05em',
                  color: theme.text,
                  textShadow: heroShadow,
                  overflowWrap: 'anywhere',
                }}
              >
                <span style={{ color: theme.muted, fontWeight: 500 }}>@</span>
                {profile.handle}
              </h2>

              {options.showDesignation ? (
                <p
                  style={{
                    marginTop: 8,
                    maxWidth: 560,
                    fontSize: 16,
                    fontStyle: 'italic',
                    lineHeight: 1.3,
                    color: theme.muted,
                    textShadow: heroShadow,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  &ldquo;{designation}&rdquo;
                </p>
              ) : null}

              <p
                style={{
                  marginTop: 5,
                  fontSize: 11.5,
                  letterSpacing: '0.02em',
                  color: theme.muted,
                  textShadow: heroShadow,
                }}
              >
                {identityLine || 'Codeforces profile'}
              </p>
            </div>

            <GlassPanel
              theme={theme}
              accent={accent}
              radius={24}
              style={{
                width: 404,
                flexShrink: 0,
                padding: '17px 22px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 20,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: theme.muted,
                    }}
                  >
                    Current rating
                  </p>
                  <div
                    style={{
                      marginTop: 2,
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 8,
                    }}
                  >
                    <span
                      className="tabular"
                      style={{
                        fontSize: 94,
                        fontWeight: 700,
                        lineHeight: 0.82,
                        letterSpacing: '-0.07em',
                        color: theme.text,
                        textShadow: `0 0 32px ${withAlpha(accent, isDark ? 0.34 : 0.18)}`,
                      }}
                    >
                      {formatNumber(profile.rating)}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: rankColor,
                        boxShadow: `0 0 8px ${withAlpha(rankColor, 0.65)}`,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: rankColor,
                      }}
                    >
                      {profile.rank ?? 'Unrated'}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'right',
                    flexShrink: 0,
                    paddingTop: 2,
                  }}
                >
                  <p
                    style={{
                      fontSize: 8.5,
                      fontWeight: 600,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: theme.muted,
                    }}
                  >
                    Max rating
                  </p>
                  <p
                    className="tabular"
                    style={{
                      marginTop: 3,
                      fontSize: 30,
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: '-0.05em',
                      color: accent,
                    }}
                  >
                    {formatNumber(peakRating)}
                  </p>
                  <p
                    style={{
                      marginTop: 5,
                      fontSize: 9.5,
                      color: theme.muted,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.maxRank ?? 'Peak rating'}
                  </p>
                </div>
              </div>
              <div
                aria-hidden="true"
                style={{
                  marginTop: 13,
                  height: 2,
                  borderRadius: 9999,
                  background: `linear-gradient(90deg, ${withAlpha(rankColor, 0.85)}, ${withAlpha(accent, 0.5)} 46%, transparent)`,
                }}
              />
            </GlassPanel>
          </section>

          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns:
                hasLeftColumn && hasRightColumn
                  ? 'minmax(0, 1.55fr) minmax(0, 1fr)'
                  : 'minmax(0, 1fr)',
              gap: 16,
              flex: 1,
              minHeight: 0,
            }}
          >
            {hasLeftColumn ? (
              <div
                style={{
                  display: 'flex',
                  minHeight: 0,
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                {hasRatingChart ? (
                <GlassPanel
                  theme={theme}
                  accent={accent}
                  radius={22}
                  style={{
                    flex: 1,
                    minHeight: 0,
                    padding: '16px 20px 12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: accent,
                          boxShadow: `0 0 10px ${withAlpha(accent, 0.65)}`,
                        }}
                      />
                      <p
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          letterSpacing: '0.24em',
                          textTransform: 'uppercase',
                          color: theme.muted,
                        }}
                      >
                        Rating history
                      </p>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 9px',
                        borderRadius: 9999,
                        border: `1px solid ${accentBorder}`,
                        backgroundColor: accentSoft,
                        fontSize: 9.5,
                        color: theme.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Peak
                      <strong style={{ color: accent, fontWeight: 700 }}>
                        {formatNumber(peakRating)}
                      </strong>
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 2,
                      display: 'flex',
                      flex: 1,
                      minHeight: 0,
                      alignItems: 'center',
                    }}
                  >
                    <RatingLineChart
                      data={profile.ratingHistory.slice(-26)}
                      accent={accent}
                      compact
                      showAxis
                      showGrid
                      interactive={false}
                      height={hasRightColumn ? 430 : 260}
                      labelSize={14}
                      gridColor={theme.chartGrid}
                      labelColor={theme.chartLabel}
                      dotFill={theme.chartDot}
                    />
                  </div>
                </GlassPanel>
              ) : null}

              {hasHeatmap && activity ? (
                <GlassPanel
                  theme={theme}
                  accent={accent}
                  radius={20}
                  style={{
                    flex: hasRatingChart ? '0 0 auto' : 1,
                    minHeight: 0,
                    padding: '14px 20px 12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: heatmapPalette.bright,
                          boxShadow: `0 0 10px ${withAlpha(heatmapPalette.bright, 0.55)}`,
                        }}
                      />
                      <p
                        style={{
                          fontSize: 9.5,
                          fontWeight: 600,
                          letterSpacing: '0.24em',
                          textTransform: 'uppercase',
                          color: theme.muted,
                        }}
                      >
                        52-week activity
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: 10.5,
                        color: theme.muted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <strong style={{ color: theme.text, fontWeight: 600 }}>
                        {formatNumber(heatmapSubmissions)}
                      </strong>{' '}
                      submissions ·{' '}
                      <strong style={{ color: theme.text, fontWeight: 600 }}>
                        {formatNumber(heatmapActiveDays)}
                      </strong>{' '}
                      active days
                      {activity.isPartial ? (
                        <span
                          style={{
                            marginLeft: 8,
                            color: isDark ? '#F5C26B' : '#B45309',
                            fontWeight: 600,
                          }}
                        >
                          Partial history
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    {displayedWeeks.map((week, weekIndex) => (
                      <div
                        key={weekIndex}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        {week.map((day) => {
                          const level = getHeatmapLevel(day.submissions)
                          const cellBg =
                            level === 0
                              ? heatmapPalette.zero
                              : level === 1
                                ? heatmapPalette.bright
                                : level === 2
                                  ? heatmapPalette.medium
                                  : heatmapPalette.rich
                          const glow =
                            level === 1
                              ? `0 0 7px ${withAlpha(heatmapPalette.bright, 0.42)}`
                              : level === 2
                                ? `0 0 5px ${withAlpha(heatmapPalette.medium, 0.24)}`
                                : 'none'

                          return (
                            <div
                              key={day.date}
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: 3,
                                backgroundColor: cellBg,
                                boxShadow: glow,
                              }}
                            />
                          )
                        })}
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 10,
                      marginTop: 9,
                      fontSize: 8.5,
                      color: theme.muted,
                    }}
                  >
                    <span
                      style={{
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        opacity: 0.72,
                      }}
                    >
                      Submissions
                    </span>
                    {[
                      { label: '0', color: heatmapPalette.zero },
                      { label: '1–3', color: heatmapPalette.bright },
                      { label: '4–9', color: heatmapPalette.medium },
                      { label: '10+', color: heatmapPalette.rich },
                    ].map((item) => (
                      <span
                        key={item.label}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span
                          style={{
                            width: 9,
                            height: 9,
                            borderRadius: 2.5,
                            backgroundColor: item.color,
                            boxShadow:
                              item.label === '1–3'
                                ? `0 0 6px ${withAlpha(item.color, 0.45)}`
                                : 'none',
                          }}
                        />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </GlassPanel>
              ) : null}
              </div>
            ) : null}

            {hasRightColumn ? (
              <div
                style={{
                  display: 'flex',
                  minHeight: 0,
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    minHeight: 0,
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {showSolved || showActiveDays ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          showSolved && showActiveDays
                            ? 'minmax(0, 1fr) minmax(0, 1fr)'
                            : 'minmax(0, 1fr)',
                        gap: 12,
                        flex: 1,
                        minHeight: 0,
                      }}
                    >
                      {showSolved ? (
                        <AchievementTile
                          theme={theme}
                          accent={accent}
                          label="Unique solved"
                          icon={<Trophy size={14} strokeWidth={2.1} />}
                        >
                          <p
                            className="tabular"
                            style={{
                              fontSize: 56,
                              fontWeight: 700,
                              lineHeight: 0.92,
                              letterSpacing: '-0.06em',
                              color: theme.text,
                            }}
                          >
                            {formatNumber(profile.problemsSolved)}
                          </p>
                          <p
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: theme.muted,
                            }}
                          >
                            problems accepted
                          </p>
                        </AchievementTile>
                      ) : null}

                      {showActiveDays ? (
                        <AchievementTile
                          theme={theme}
                          accent={accent}
                          label="Active days"
                          icon={<CalendarDays size={14} strokeWidth={2.1} />}
                        >
                          <p
                            className="tabular"
                            style={{
                              fontSize: 56,
                              fontWeight: 700,
                              lineHeight: 0.92,
                              letterSpacing: '-0.06em',
                              color: theme.text,
                            }}
                          >
                            {formatNumber(activity?.activeDays)}
                          </p>
                          <p
                            style={{
                              marginTop: 6,
                              fontSize: 12,
                              color: theme.muted,
                            }}
                          >
                            days with submissions
                          </p>
                        </AchievementTile>
                      ) : null}
                    </div>
                  ) : null}

                  {showHardest ? (
                    <AchievementTile
                      theme={theme}
                      accent={accent}
                      label="Hardest solved"
                      icon={<Crown size={14} strokeWidth={2.1} />}
                      iconSize={30}
                      style={{
                        flex: 1,
                        borderColor: withAlpha(accent, isDark ? 0.26 : 0.2),
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'space-between',
                          gap: 14,
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          {hardest ? (
                            <>
                              <p
                                style={{
                                  fontSize: 26,
                                  fontWeight: 700,
                                  lineHeight: 1.18,
                                  letterSpacing: '-0.03em',
                                  color: theme.text,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {hardest.name}
                              </p>
                              <p
                                style={{
                                  marginTop: 6,
                                  fontSize: 12,
                                  color: theme.muted,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                              >
                                {hardest.contestId
                                  ? `Problem ${hardest.contestId}${hardest.index}`
                                  : hardest.index}
                              </p>
                            </>
                          ) : (
                            <p
                              style={{
                                fontSize: 15,
                                color: theme.muted,
                              }}
                            >
                              No rated solves available
                            </p>
                          )}
                        </div>
                        {hardest ? (
                          <span
                            className="tabular"
                            style={{
                              display: 'inline-flex',
                              flexShrink: 0,
                              alignItems: 'center',
                              padding: '6px 13px',
                              borderRadius: 9999,
                              border: `1px solid ${withAlpha(accent, 0.4)}`,
                              backgroundColor: withAlpha(accent, 0.13),
                              color: accent,
                              fontSize: 20,
                              fontWeight: 700,
                              letterSpacing: '-0.02em',
                            }}
                          >
                            {hardest.rating}
                          </span>
                        ) : null}
                      </div>
                    </AchievementTile>
                  ) : null}

                  {showStreak ? (
                    <AchievementTile
                      theme={theme}
                      accent={accent}
                      label="Longest streak"
                      icon={<Flame size={23} strokeWidth={2.1} />}
                      iconSize={36}
                      iconProminent
                      style={{ flex: 1 }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 10,
                        }}
                      >
                        <p
                          className="tabular"
                          style={{
                            fontSize: 68,
                            fontWeight: 700,
                            lineHeight: 0.88,
                            letterSpacing: '-0.06em',
                            color: theme.text,
                          }}
                        >
                          {formatNumber(activity?.longestStreak)}
                        </p>
                        <span
                          style={{
                            marginBottom: 7,
                            fontSize: 13.5,
                            color: theme.muted,
                          }}
                        >
                          consecutive days
                        </span>
                      </div>
                      <p
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: theme.muted,
                        }}
                      >
                        personal coding rhythm
                      </p>
                    </AchievementTile>
                  ) : null}
                </div>

                {showQuote ? (
                  <div
                    style={{
                      ...glassSurface(theme, 18),
                      display: 'flex',
                      flex: hasAchievements ? '0 0 auto' : 1,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      padding: '14px 18px 14px 20px',
                    }}
                  >
                    <GlassSheen
                      accent={accent}
                      radius={18}
                      isDark={isDark}
                    />
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        width: 2,
                        background: `linear-gradient(180deg, transparent, ${withAlpha(accent, 0.85)}, transparent)`,
                      }}
                    />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <p
                        style={{
                          fontSize: 8.5,
                          fontWeight: 600,
                          letterSpacing: '0.22em',
                          textTransform: 'uppercase',
                          color: theme.muted,
                        }}
                      >
                        Personal motto
                      </p>
                      <p
                        style={{
                          marginTop: 5,
                          fontFamily:
                            "Georgia, 'Times New Roman', 'Iowan Old Style', serif",
                          fontSize: 18,
                          fontStyle: 'italic',
                          lineHeight: 1.3,
                          letterSpacing: '-0.01em',
                          color: theme.text,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        &ldquo;{quote}&rdquo;
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!hasLeftColumn && !hasRightColumn ? (
              <div
                style={{
                  display: 'flex',
                  minHeight: 0,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    aria-hidden="true"
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      color: accent,
                      opacity: isDark ? 0.24 : 0.16,
                    }}
                  >
                    <CodeforcesMark size={76} />
                  </div>
                  <p
                    style={{
                      marginTop: 18,
                      fontSize: 40,
                      fontWeight: 700,
                      letterSpacing: '-0.05em',
                      color: theme.text,
                      opacity: 0.88,
                    }}
                  >
                    @{profile.handle}
                  </p>
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 10,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: theme.muted,
                    }}
                  >
                    Codeforces profile
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <footer
            style={{
              marginTop: 'auto',
              flexShrink: 0,
              paddingTop: 14,
            }}
          >
            <div
              style={{
                height: 1,
                width: '100%',
                backgroundColor: theme.border,
              }}
            />
            <div
              style={{
                marginTop: 11,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              {hasWatermark ? (
                <p
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    color: accent,
                  }}
                >
                  <Sparkles size={11} />
                  Dream. Solve. Repeat.
                </p>
              ) : (
                <span />
              )}
              <p
                style={{
                  marginLeft: 'auto',
                  fontSize: 10.5,
                  color: theme.muted,
                }}
              >
                codeforces.com/profile/{profile.handle}
              </p>
            </div>
          </footer>
        </div>
      </div>
    )
  },
)
