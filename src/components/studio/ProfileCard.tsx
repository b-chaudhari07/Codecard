import { forwardRef } from 'react'
import type { CSSProperties } from 'react'

import { RatingLineChart } from '../charts/RatingLineChart'
import { CodeforcesMark } from '../ui/CodeforcesMark'
import { ProfileAvatar } from '../ui/ProfileAvatar'
import {
  CARD_THEMES,
  resolveAccent,
  withAlpha,
} from '../../lib/cardThemes'
import type { CardTheme } from '../../lib/cardThemes'
import { formatNumber, formatShortDate } from '../../lib/utils'
import type { CardOptions, Profile } from '../../types/profile'

interface ProfileCardProps {
  profile: Profile
  options: CardOptions
}

const CARD_WIDTH = 1080
const CARD_HEIGHT = 1350

function handleFontSize(handle: string): number {
  if (handle.length > 20) return 42
  if (handle.length > 16) return 50
  if (handle.length > 13) return 56
  return 64
}

function surfaceStyle(theme: CardTheme, radius: number): CSSProperties {
  const shadows = [
    theme.insetHighlight !== 'none' ? theme.insetHighlight : null,
    theme.surfaceShadow !== 'none' ? theme.surfaceShadow : null,
  ].filter((shadow): shadow is string => Boolean(shadow))

  return {
    backgroundColor: theme.surface,
    backgroundImage: theme.surfaceGradient ?? undefined,
    border: `1px solid ${theme.border}`,
    borderRadius: radius,
    boxShadow: shadows.length > 0 ? shadows.join(', ') : 'none',
  }
}

/**
 * The exported artefact. Everything inside this component uses explicit,
 * self-contained styling so the PNG never inherits dashboard chrome.
 */
export const ProfileCard = forwardRef<HTMLDivElement, ProfileCardProps>(
  function ProfileCard({ profile, options }, ref) {
    const theme = CARD_THEMES[options.theme]
    const accent = resolveAccent(
      theme,
      options.accent,
      options.autoRankColor,
      profile.rank,
    )
    const isDark = theme.mode === 'dark'
    const accentSoft = withAlpha(accent, isDark ? 0.15 : 0.11)
    const accentBorder = withAlpha(accent, isDark ? 0.32 : 0.24)

    const peakRating =
      profile.maxRating ??
      (profile.ratingHistory.length > 0
        ? Math.max(...profile.ratingHistory.map((point) => point.rating))
        : null)

    const showMemberSince = options.showMemberSince
    const memberSinceLabel = profile.registrationDate
      ? formatShortDate(profile.registrationDate)
      : (profile.joinedYear?.toString() ?? '—')

    const identityLine = [
      profile.country,
      showMemberSince && profile.joinedYear
        ? `Member since ${profile.joinedYear}`
        : null,
    ]
      .filter(Boolean)
      .join(' · ')

    const stats: Array<{
      label: string
      value: string
      highlight?: boolean
    }> = []

    if (options.showProblemStats) {
      stats.push({
        label: 'Problems solved',
        value: formatNumber(profile.problemsSolved),
      })
    }

    if (options.showContestStats) {
      stats.push({
        label: 'Rated contests',
        value: formatNumber(profile.ratedContests),
      })
      stats.push({
        label: 'Best rank',
        value: profile.contestStats
          ? `#${formatNumber(profile.contestStats.bestRank)}`
          : '—',
        highlight: true,
      })
    }

    const hasRatingChart =
      options.showRatingChart && profile.ratingHistory.length > 0
    const hasTopics = options.showTopics && profile.topics.length > 0
    const hasStats = stats.length > 0

    const difficultyTotal = profile.difficulty.reduce(
      (sum, bucket) => sum + bucket.solved,
      0,
    )
    const peakBucket = profile.difficulty.reduce(
      (best, bucket) => (bucket.solved > best.solved ? bucket : best),
      profile.difficulty[0],
    )
    const hasDifficulty =
      options.showProblemStats &&
      difficultyTotal > 0 &&
      peakBucket !== undefined

    const hasWatermark = options.showWatermark

    return (
      <div
        ref={ref}
        data-codecard-export
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          backgroundColor: theme.background,
          color: theme.text,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
          fontFeatureSettings: "'cv11', 'ss01'",
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient light — stronger and cooler on Obsidian, soft lavender on Minimal. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -190,
            right: -160,
            width: 660,
            height: 660,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glowPrimary}, transparent 68%)`,
            filter: 'blur(58px)',
            opacity: isDark ? 1 : 0.9,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '36%',
            left: -220,
            width: 580,
            height: 580,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glowSecondary}, transparent 68%)`,
            filter: 'blur(68px)',
            opacity: isDark ? 0.95 : 1,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: isDark
              ? 'linear-gradient(180deg, rgba(255,255,255,0.018), transparent 34%)'
              : 'linear-gradient(180deg, rgba(255,255,255,0.65), transparent 42%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            height: '100%',
            flexDirection: 'column',
            padding: isDark ? '56px 76px' : '56px 80px',
          }}
        >
          {/* Top accent rule */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, transparent 6%, ${accent} 50%, transparent 94%)`,
              opacity: isDark ? 0.75 : 0.5,
            }}
          />

          <header
            style={{
              display: 'flex',
              flexShrink: 0,
              alignItems: 'flex-start',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <span
                style={{
                  display: 'flex',
                  width: 54,
                  height: 54,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 17,
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.surface,
                  backgroundImage: theme.surfaceGradient ?? undefined,
                  boxShadow: isDark
                    ? theme.insetHighlight
                    : '0 8px 20px rgba(23,23,29,0.06)',
                  color: accent,
                }}
              >
                <CodeforcesMark size={25} />
              </span>
              <div>
                <p
                  style={{
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: theme.text,
                  }}
                >
                  Codeforces
                </p>
                <p
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                  }}
                >
                  Profile Card
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {hasWatermark ? (
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                  }}
                >
                  Codecard
                </p>
              ) : null}
              <p
                style={{
                  marginTop: hasWatermark ? 6 : 0,
                  fontSize: 13,
                  color: theme.muted,
                }}
              >
                {profile.isSample ? 'Design preview' : 'Verified profile'}
              </p>
            </div>
          </header>

          <section
            style={{
              marginTop: isDark ? 44 : 46,
              display: 'flex',
              flexShrink: 0,
              alignItems: 'center',
              gap: 40,
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: isDark ? -12 : -16,
                  borderRadius: '50%',
                  background: isDark
                    ? `radial-gradient(circle, ${withAlpha(accent, 0.3)}, transparent 70%)`
                    : 'radial-gradient(circle, rgba(167,139,250,0.16), transparent 72%)',
                  filter: 'blur(16px)',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  padding: isDark ? 4 : 5,
                  borderRadius: '50%',
                  background: isDark
                    ? 'linear-gradient(145deg, rgba(255,255,255,0.24), rgba(255,255,255,0.03))'
                    : '#FFFFFF',
                  boxShadow: isDark
                    ? '0 0 0 1px rgba(255,255,255,0.06), 0 24px 50px rgba(0,0,0,0.48)'
                    : '0 18px 40px rgba(23,23,29,0.12), 0 0 0 1px #E8E8ED',
                }}
              >
                <div
                  style={{
                    padding: 3,
                    borderRadius: '50%',
                    backgroundColor: isDark ? theme.background : '#F5F5F7',
                  }}
                >
                  <ProfileAvatar
                    src={profile.avatarDataUrl ?? profile.avatarUrl}
                    initials={profile.initials}
                    size={168}
                    accent={accent}
                    border="none"
                    background={
                      isDark
                        ? 'radial-gradient(circle at 30% 22%, rgba(215,180,94,0.22), transparent 62%), linear-gradient(145deg, #24272D, #0D0E11)'
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
                  right: isDark ? 2 : 4,
                  bottom: isDark ? 2 : 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: accent,
                  border: `4px solid ${isDark ? theme.background : '#FFFFFF'}`,
                }}
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '7px 14px',
                  borderRadius: 9999,
                  border: `1px solid ${accentBorder}`,
                  backgroundColor: accentSoft,
                  color: accent,
                  fontSize: 12,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: accent,
                  }}
                />
                {profile.rank ?? 'Unrated'}
              </span>

              <h2
                style={{
                  marginTop: 16,
                  fontSize: handleFontSize(profile.handle),
                  fontWeight: 600,
                  lineHeight: 1.02,
                  letterSpacing: '-0.045em',
                  color: theme.text,
                  overflowWrap: 'anywhere',
                }}
              >
                @{profile.handle}
              </h2>

              <p
                style={{
                  marginTop: 12,
                  fontSize: 15,
                  letterSpacing: '0.01em',
                  color: theme.muted,
                }}
              >
                {identityLine || 'Codeforces profile'}
              </p>
            </div>
          </section>

          <div
            style={{
              marginTop: isDark ? 30 : 32,
              height: 1,
              flexShrink: 0,
              width: '100%',
              backgroundColor: theme.border,
            }}
          />

          <section
            style={{
              marginTop: isDark ? 28 : 30,
              display: 'flex',
              flexShrink: 0,
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 40,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: theme.muted,
                }}
              >
                Current rating
              </p>
              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 20,
                }}
              >
                <span
                  className="tabular"
                  style={{
                    fontSize: 128,
                    fontWeight: 600,
                    lineHeight: 0.82,
                    letterSpacing: '-0.065em',
                    color: theme.text,
                  }}
                >
                  {formatNumber(profile.rating)}
                </span>
                <span
                  style={{
                    marginBottom: 10,
                    fontSize: 17,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    color: accent,
                  }}
                >
                  {profile.rank ?? 'Unrated'}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: isDark ? 48 : 52,
                paddingBottom: 8,
                textAlign: 'right',
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.24em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                  }}
                >
                  Max rating
                </p>
                <p
                  className="tabular"
                  style={{
                    marginTop: 8,
                    fontSize: 38,
                    fontWeight: 600,
                    lineHeight: 1,
                    letterSpacing: '-0.04em',
                    color: accent,
                  }}
                >
                  {formatNumber(profile.maxRating)}
                </p>
              </div>
              {showMemberSince ? (
                <div>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.24em',
                      textTransform: 'uppercase',
                      color: theme.muted,
                    }}
                  >
                    Member since
                  </p>
                  <p
                    className="tabular"
                    style={{
                      marginTop: 8,
                      fontSize: 24,
                      fontWeight: 500,
                      lineHeight: 1,
                      color: theme.text,
                    }}
                  >
                    {memberSinceLabel}
                  </p>
                </div>
              ) : null}
            </div>
          </section>

          {hasRatingChart ? (
            <section
              style={{
                ...surfaceStyle(theme, 28),
                marginTop: 24,
                flexShrink: 0,
                padding: isDark ? '22px 24px 18px' : '24px 26px 20px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                  }}
                >
                  Rating history
                </p>
                <p style={{ fontSize: 12, color: theme.muted }}>
                  Peak{' '}
                  <span style={{ color: theme.text }}>
                    {formatNumber(peakRating)}
                  </span>
                </p>
              </div>
              <div style={{ marginTop: 4 }}>
                <RatingLineChart
                  data={profile.ratingHistory.slice(-26)}
                  accent={accent}
                  compact
                  showAxis
                  showGrid
                  interactive={false}
                  gridColor={theme.chartGrid}
                  labelColor={theme.chartLabel}
                  dotFill={theme.chartDot}
                />
              </div>
            </section>
          ) : null}

          {hasStats ? (
            <section
              style={{
                ...surfaceStyle(theme, 24),
                marginTop: 24,
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
                }}
              >
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    style={{
                      padding: isDark ? '24px 26px' : '26px 28px',
                      borderLeft:
                        index === 0 ? 'none' : `1px solid ${theme.border}`,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: theme.muted,
                      }}
                    >
                      {stat.label}
                    </p>
                    <p
                      className="tabular"
                      style={{
                        marginTop: 10,
                        fontSize: 38,
                        fontWeight: 600,
                        lineHeight: 1,
                        letterSpacing: '-0.045em',
                        color: stat.highlight ? accent : theme.text,
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {hasDifficulty && peakBucket ? (
                <div
                  style={{
                    borderTop: `1px solid ${theme.border}`,
                    padding: isDark ? '16px 26px 18px' : '18px 28px 20px',
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
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: theme.muted,
                      }}
                    >
                      Difficulty spread
                    </p>
                    <p style={{ fontSize: 11, color: theme.muted }}>
                      {profile.unratedSolved
                        ? `${formatNumber(profile.unratedSolved)} unrated · `
                        : ''}
                      Peak{' '}
                      <span style={{ color: theme.text }}>
                        {peakBucket.label}
                      </span>
                    </p>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: 'flex',
                      height: 8,
                      gap: 3,
                      overflow: 'hidden',
                      borderRadius: 9999,
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.045)'
                        : '#F0F0F4',
                    }}
                  >
                    {profile.difficulty.map((bucket, index) => (
                      <div
                        key={bucket.label}
                        style={{
                          width: `${(bucket.solved / difficultyTotal) * 100}%`,
                          backgroundColor: withAlpha(
                            accent,
                            0.2 + (index / 7) * 0.72,
                          ),
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}

          {hasTopics ? (
            <section style={{ marginTop: 24, flexShrink: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.26em',
                    textTransform: 'uppercase',
                    color: theme.muted,
                  }}
                >
                  Top problem topics
                </p>
                <p style={{ fontSize: 12, color: theme.muted }}>
                  {profile.topics.length} tags explored
                </p>
              </div>
              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {profile.topics.slice(0, 5).map((topic) => (
                  <span
                    key={topic.tag}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 14px',
                      borderRadius: 9999,
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.elevated,
                      color: theme.text,
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: accent,
                        opacity: 0.85,
                      }}
                    />
                    {topic.tag}
                    <span
                      className="tabular"
                      style={{ color: theme.muted }}
                    >
                      {topic.solved}
                    </span>
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <footer
            style={{ marginTop: 'auto', flexShrink: 0, paddingTop: 26 }}
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
                marginTop: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 24,
              }}
            >
              {hasWatermark ? (
                <p
                  style={{
                    fontSize: 17,
                    fontWeight: 500,
                    letterSpacing: '0.01em',
                    color: accent,
                  }}
                >
                  Dream. Solve. Repeat.
                </p>
              ) : (
                <span />
              )}
              <p
                style={{
                  marginLeft: 'auto',
                  fontSize: 12,
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
