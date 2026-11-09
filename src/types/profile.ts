import type { TemplateId } from '../lib/cardTemplates'

export type CodeforcesRank =
  | 'Newbie'
  | 'Pupil'
  | 'Specialist'
  | 'Expert'
  | 'Candidate Master'
  | 'Master'
  | 'International Master'
  | 'Grandmaster'
  | 'International Grandmaster'
  | 'Legendary Grandmaster'

export interface RatingPoint {
  /** ISO date (YYYY-MM-DD) of the contest. */
  date: string
  /** Rating after the contest. */
  rating: number
  /** Rating before the contest. */
  oldRating: number
  /** newRating − oldRating. */
  change: number
  /** Contest placement. */
  rank: number
  contestId: number
  contest: string
}

export interface DifficultyBucket {
  label: string
  solved: number
}

export interface ContestStats {
  total: number
  bestRank: number
  avgChange: number
  bestChange: number
  worstChange: number
  positiveChanges: number
  negativeChanges: number
  recentChanges: number[]
}

export interface TopicStat {
  tag: string
  solved: number
  /** Normalised 0–100 strength relative to the most solved topic. */
  strength: number
}

export interface HeatmapDay {
  /** Local calendar date in YYYY-MM-DD form. */
  date: string
  submissions: number
  accepted: number
}

export interface SubmissionActivity {
  /**
   * Sunday-aligned days covering roughly the last twelve months. Zero-activity
   * days are included so the heatmap grid is continuous.
   */
  days: HeatmapDay[]
  /** Distinct local calendar days with at least one submission (all history). */
  activeDays: number
  /** Longest run of consecutive local calendar days with a submission. */
  longestStreak: number
  /** Submissions in the retrieved history. */
  totalSubmissions: number
  /** Accepted submissions in the retrieved history. */
  acceptedSubmissions: number
  /** Submissions inside the heatmap window. */
  windowSubmissions: number
  /** Accepted submissions inside the heatmap window. */
  windowAcceptedSubmissions: number
  /** Distinct active days inside the heatmap window. */
  windowActiveDays: number
  /** Highest submission count on a single day inside the heatmap window. */
  maxDailySubmissions: number
  windowStart: string
  windowEnd: string
  /** True when the submission history was capped by the API pagination limit. */
  isPartial: boolean
}

export interface PeakDayStat {
  /** Highest number of distinct problems first accepted on one local day. */
  count: number
  /** Local ISO date (YYYY-MM-DD) of that day, or null when nothing was solved. */
  date: string | null
  /** True when the submission history was capped by the API pagination limit. */
  partial: boolean
}

export interface GritStat {
  /** Most non-OK attempts before the first accepted submission on one problem. */
  count: number
  /** Name of the problem that needed the most failed attempts. */
  problemName: string | null
  /** Problem index (e.g. "C") for `problemName`. */
  problemIndex: string | null
  /** True when the submission history was capped by the API pagination limit. */
  partial: boolean
}

export interface SniperStat {
  /** Integer 0-100: first-try share of live-contest solves. */
  percent: number
  /** Problems whose earliest contest submission was accepted. */
  firstTry: number
  /** Problems solved with at least one accepted contest submission. */
  solved: number
  /** True when the submission history was capped by the API pagination limit. */
  partial: boolean
}

export interface TopTagStat {
  tag: string
  solved: number
  /** True when the submission history was capped by the API pagination limit. */
  partial: boolean
}

export interface HardestProblem {
  key: string
  contestId: number | null
  index: string
  name: string
  /** Only rated problems are included, so this is always a real rating. */
  rating: number
  url: string | null
}

/**
 * Application-level profile. Fields are nullable when the corresponding
 * Codeforces endpoint failed or does not expose the value, so the UI can show
 * "unavailable" instead of inventing zeroes.
 */
export interface Profile {
  handle: string
  avatarUrl: string | null
  avatarDataUrl: string | null
  initials: string
  rank: CodeforcesRank | null
  maxRank: CodeforcesRank | null
  rating: number | null
  maxRating: number | null
  problemsSolved: number | null
  ratedContests: number | null
  unratedSolved: number | null
  country: string | null
  organization: string | null
  registrationDate: string | null
  joinedYear: number | null
  contribution: number | null
  ratingHistory: RatingPoint[]
  difficulty: DifficultyBucket[]
  contestStats: ContestStats | null
  topics: TopicStat[]
  submissionActivity: SubmissionActivity | null
  peakDay: PeakDayStat
  grit: GritStat
  sniper: SniperStat | null
  contests: number
  bestComeback: number | null
  topTag: TopTagStat | null
  cardNumber: number
  hardestProblem: HardestProblem | null
  hardestProblems: HardestProblem[]
  ratingHistoryAvailable: boolean
  submissionsAvailable: boolean
  submissionsTruncated: boolean
  warnings: string[]
  isSample: boolean
}

export type RatingRange = '1M' | '6M' | '1Y' | 'ALL'

export type CardThemeId = 'obsidian' | 'minimal'

export type AccentId =
  | 'lavender'
  | 'sapphire'
  | 'gold'
  | 'emerald'
  | 'rose'
  | 'violet'
  | 'amber'
  | 'cyan'

export type DesignationMode = 'auto' | 'custom'

export type BannerPosition = 'top' | 'center' | 'bottom'

export type StatId =
  | 'boss'
  | 'solved'
  | 'streak'
  | 'peakDay'
  | 'grit'
  | 'contests'
  | 'activeDays'
  | 'maxRating'
  | 'sniper'

export interface CardOptions {
  template: TemplateId
  theme: CardThemeId
  accent: AccentId
  /** Use the Codeforces rank colour instead of the manual accent. */
  autoRankColor: boolean
  /** Optional user-picked accent. Takes precedence when rank colour is off. */
  customAccent: string | null
  /** Automatically generated tagline, or the user's own designation. */
  designationMode: DesignationMode
  customDesignation: string
  /** Optional personal quote / motto, kept separate from the designation. */
  customQuote: string
  showQuote: boolean
  showBanner: boolean
  /** Data URL for a user-uploaded banner. */
  customBanner: string | null
  bannerPosition: BannerPosition
  /** Data URL for a user-uploaded profile photo. */
  customPhoto: string | null
  /** Render the classic card's tagline. Ignored by the portrait card. */
  showDesignation: boolean
  /** Which stat tiles to show, in display order. */
  stats: StatId[]
  showRatingChart: boolean
  showHeatmap: boolean
  showHardestProblem: boolean
  showStats: boolean
  showWatermark: boolean
}
