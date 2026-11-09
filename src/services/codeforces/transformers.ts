import type {
  CodeforcesRank,
  ContestStats,
  DifficultyBucket,
  GritStat,
  HardestProblem,
  HeatmapDay,
  PeakDayStat,
  Profile,
  RatingPoint,
  SubmissionActivity,
  TopTagStat,
  TopicStat,
} from '../../types/profile'
import { toCodeforcesAvatarUrl } from './avatar'
import type {
  CodeforcesRatingChange,
  CodeforcesSubmission,
  CodeforcesUser,
} from './types'

const RANK_MAP: Record<string, CodeforcesRank> = {
  newbie: 'Newbie',
  pupil: 'Pupil',
  specialist: 'Specialist',
  expert: 'Expert',
  'candidate master': 'Candidate Master',
  master: 'Master',
  'international master': 'International Master',
  grandmaster: 'Grandmaster',
  'international grandmaster': 'International Grandmaster',
  'legendary grandmaster': 'Legendary Grandmaster',
  // Codeforces reports "tourist" as the max rank for the top-rated user.
  tourist: 'Legendary Grandmaster',
}

export function normalizeRank(value?: string | null): CodeforcesRank | null {
  if (!value) return null
  return RANK_MAP[value.trim().toLowerCase()] ?? null
}

/** Codeforces timestamps are Unix seconds; keep the UTC calendar date. */
export function toIsoDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10)
}

export function buildRatingHistory(
  changes: CodeforcesRatingChange[],
): RatingPoint[] {
  return [...changes]
    .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds)
    .map((change) => ({
      date: toIsoDate(change.ratingUpdateTimeSeconds),
      rating: change.newRating,
      oldRating: change.oldRating,
      change: change.newRating - change.oldRating,
      rank: change.rank,
      contestId: change.contestId,
      contest: change.contestName,
    }))
}

export function buildContestStats(
  history: RatingPoint[],
): ContestStats | null {
  if (history.length === 0) return null

  const changes = history.map((point) => point.change)
  const ranks = history.map((point) => point.rank)
  const totalChange = changes.reduce((sum, value) => sum + value, 0)

  return {
    total: history.length,
    bestRank: Math.min(...ranks),
    avgChange: totalChange / history.length,
    bestChange: Math.max(...changes),
    worstChange: Math.min(...changes),
    positiveChanges: changes.filter((value) => value > 0).length,
    negativeChanges: changes.filter((value) => value < 0).length,
    recentChanges: changes.slice(-8),
  }
}

export interface SolvedProblem {
  key: string
  contestId: number | null
  index: string
  name: string
  rating: number | null
  tags: string[]
  url: string | null
}

function problemUrl(contestId: number | null, index: string): string | null {
  if (contestId === null) return null
  return `https://codeforces.com/problemset/problem/${contestId}/${index}`
}

/**
 * Stable identity for a problem across contest and practice submissions.
 * Codeforces keeps the original contest id on practice submissions, so the
 * contest + index pair is enough to deduplicate them.
 */
function submissionProblemKey(submission: CodeforcesSubmission): string {
  const problem = submission.problem
  const contestId =
    typeof problem.contestId === 'number' ? problem.contestId : null
  const contestKey = contestId ?? problem.problemsetName ?? 'unknown-contest'
  return `${contestKey}:${problem.index}`
}

/**
 * Counts unique accepted problems by contestId + problem index. A problem is
 * only counted once no matter how many times it was accepted.
 */
export function collectSolvedProblems(
  submissions: CodeforcesSubmission[],
): SolvedProblem[] {
  const solved = new Map<string, SolvedProblem>()

  for (const submission of submissions) {
    if (submission.verdict !== 'OK') continue

    const problem = submission.problem
    const contestId =
      typeof problem.contestId === 'number' ? problem.contestId : null
    const key = submissionProblemKey(submission)

    if (solved.has(key)) continue

    solved.set(key, {
      key,
      contestId,
      index: problem.index,
      name: problem.name,
      rating:
        typeof problem.rating === 'number' ? problem.rating : null,
      tags: problem.tags ?? [],
      url: problemUrl(contestId, problem.index),
    })
  }

  return [...solved.values()]
}

/**
 * The hardest uniquely solved problems, sorted by their real Codeforces
 * difficulty rating. Unrated problems are excluded rather than treated as
 * rating zero, and no name or rating is ever fabricated.
 */
export function buildHardestProblems(
  problems: SolvedProblem[],
  limit = 5,
): HardestProblem[] {
  return problems
    .filter(
      (problem): problem is SolvedProblem & { rating: number } =>
        problem.rating !== null,
    )
    .sort(
      (a, b) =>
        b.rating - a.rating ||
        a.name.localeCompare(b.name) ||
        a.index.localeCompare(b.index),
    )
    .slice(0, limit)
    .map((problem) => ({
      key: problem.key,
      contestId: problem.contestId,
      index: problem.index,
      name: problem.name,
      rating: problem.rating,
      url: problem.url,
    }))
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addLocalDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
}

/**
 * Local calendar date, deliberately built from local getters. Using
 * `toISOString()` here would shift submissions around midnight into the wrong
 * day for every timezone west of UTC.
 */
export function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isoDayNumber(date: string): number {
  const [year, month, day] = date.split('-').map(Number)
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000)
}

function longestConsecutiveRun(dates: Iterable<string>): number {
  const sorted = [...new Set(dates)]
    .map(isoDayNumber)
    .sort((a, b) => a - b)

  let longest = 0
  let current = 0
  let previous: number | null = null

  for (const day of sorted) {
    current = previous !== null && day === previous + 1 ? current + 1 : 1
    longest = Math.max(longest, current)
    previous = day
  }

  return longest
}

interface DayCount {
  submissions: number
  accepted: number
}

/**
 * Builds a Sunday-aligned, zero-filled calendar for the last twelve months.
 * Counts come only from the submission records that were actually retrieved;
 * `isPartial` is set when the API pagination cap was hit.
 */
export function buildSubmissionActivity(
  submissions: CodeforcesSubmission[],
  truncated: boolean,
  now = new Date(),
): SubmissionActivity {
  const counts = new Map<string, DayCount>()
  let acceptedSubmissions = 0

  for (const submission of submissions) {
    const date = toLocalIsoDate(
      new Date(submission.creationTimeSeconds * 1000),
    )
    const entry = counts.get(date) ?? { submissions: 0, accepted: 0 }
    entry.submissions += 1
    if (submission.verdict === 'OK') {
      entry.accepted += 1
      acceptedSubmissions += 1
    }
    counts.set(date, entry)
  }

  const end = startOfLocalDay(now)
  const rawStart = new Date(end)
  rawStart.setMonth(rawStart.getMonth() - 12)
  const start = addLocalDays(rawStart, -rawStart.getDay())

  const days: HeatmapDay[] = []
  let maxDailySubmissions = 0
  let windowSubmissions = 0
  let windowAcceptedSubmissions = 0
  let windowActiveDays = 0

  for (
    let cursor = start;
    cursor.getTime() <= end.getTime();
    cursor = addLocalDays(cursor, 1)
  ) {
    const date = toLocalIsoDate(cursor)
    const entry = counts.get(date) ?? { submissions: 0, accepted: 0 }
    maxDailySubmissions = Math.max(maxDailySubmissions, entry.submissions)
    windowSubmissions += entry.submissions
    windowAcceptedSubmissions += entry.accepted
    if (entry.submissions > 0) windowActiveDays += 1
    days.push({
      date,
      submissions: entry.submissions,
      accepted: entry.accepted,
    })
  }

  return {
    days,
    activeDays: counts.size,
    longestStreak: longestConsecutiveRun(counts.keys()),
    totalSubmissions: submissions.length,
    acceptedSubmissions,
    windowSubmissions,
    windowAcceptedSubmissions,
    windowActiveDays,
    maxDailySubmissions,
    windowStart: toLocalIsoDate(start),
    windowEnd: toLocalIsoDate(end),
    isPartial: truncated,
  }
}


/**
 * Highest number of distinct problems first accepted on a single local day.
 * The earliest accepted submission per problem defines that day, so a later
 * re-solve never moves the problem to another date. Ties keep the earliest day.
 */
export function buildPeakDay(
  submissions: CodeforcesSubmission[],
  partial: boolean,
): PeakDayStat {
  const firstSolveSeconds = new Map<string, number>()

  for (const submission of submissions) {
    if (submission.verdict !== 'OK') continue
    const key = submissionProblemKey(submission)
    const existing = firstSolveSeconds.get(key)
    if (
      existing === undefined ||
      submission.creationTimeSeconds < existing
    ) {
      firstSolveSeconds.set(key, submission.creationTimeSeconds)
    }
  }

  const counts = new Map<string, number>()
  for (const seconds of firstSolveSeconds.values()) {
    const date = toLocalIsoDate(new Date(seconds * 1000))
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }

  let bestDate: string | null = null
  let bestCount = 0
  for (const date of [...counts.keys()].sort()) {
    const count = counts.get(date) ?? 0
    if (count > bestCount) {
      bestCount = count
      bestDate = date
    }
  }

  return { count: bestCount, date: bestDate, partial }
}

/**
 * Compilation errors, TESTING and SKIPPED are not treated as failed attempts:
 * they either never reached the judge or say nothing about the solution. Every
 * other non-OK verdict before the first OK counts toward grit.
 */
const GRIT_IGNORED_VERDICTS = new Set([
  'COMPILATION_ERROR',
  'TESTING',
  'SKIPPED',
])

/**
 * Among problems that were eventually solved, the largest number of non-OK
 * submissions before the first accepted one. Submissions for the same problem
 * from a contest and later practice are grouped together by problem key.
 */
export function buildGrit(
  submissions: CodeforcesSubmission[],
  partial: boolean,
): GritStat {
  const byProblem = new Map<string, CodeforcesSubmission[]>()

  for (const submission of submissions) {
    const key = submissionProblemKey(submission)
    const group = byProblem.get(key)
    if (group) group.push(submission)
    else byProblem.set(key, [submission])
  }

  let best: GritStat = {
    count: 0,
    problemName: null,
    problemIndex: null,
    partial,
  }
  let bestKey: string | null = null

  for (const [key, group] of byProblem) {
    const ordered = [...group].sort(
      (a, b) => a.creationTimeSeconds - b.creationTimeSeconds,
    )
    const firstOk = ordered.findIndex(
      (submission) => submission.verdict === 'OK',
    )
    if (firstOk === -1) continue

    const failures = ordered
      .slice(0, firstOk)
      .filter(
        (submission) =>
          !GRIT_IGNORED_VERDICTS.has(submission.verdict ?? ''),
      ).length

    const better =
      failures > best.count ||
      (failures === best.count &&
        failures > 0 &&
        (bestKey === null || key < bestKey))

    if (better) {
      best = {
        count: failures,
        problemName: ordered[firstOk].problem.name,
        problemIndex: ordered[firstOk].problem.index,
        partial,
      }
      bestKey = key
    }
  }

  return best
}

/** Human label for a grit count. Returns null below the first threshold. */
export function gritLabel(count: number): string | null {
  if (count >= 20) return 'Absolute menace'
  if (count >= 10) return 'Built different'
  if (count >= 5) return 'Stubborn'
  return null
}

/** Most-solved tag, using the already-ranked topic data. */
export function buildTopTag(
  topics: TopicStat[],
  partial: boolean,
): TopTagStat | null {
  let best: TopicStat | null = null

  for (const topic of topics) {
    if (
      !best ||
      topic.solved > best.solved ||
      (topic.solved === best.solved && topic.tag.localeCompare(best.tag) < 0)
    ) {
      best = topic
    }
  }

  if (!best) return null
  return { tag: best.tag, solved: best.solved, partial }
}

/**
 * Stable four-digit card number derived from the handle. FNV-1a keeps it
 * deterministic across sessions and machines, unlike a random id.
 */
export function buildCardNumber(handle: string): number {
  let hash = 0x811c9dc5
  for (let index = 0; index < handle.length; index += 1) {
    hash ^= handle.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return ((hash >>> 0) % 9000) + 1000
}

interface DifficultyBand {
  label: string
  min: number
  max: number
}

const DIFFICULTY_BANDS: DifficultyBand[] = [
  { label: '800–1000', min: 0, max: 1000 },
  { label: '1000–1200', min: 1000, max: 1200 },
  { label: '1200–1400', min: 1200, max: 1400 },
  { label: '1400–1600', min: 1400, max: 1600 },
  { label: '1600–1800', min: 1600, max: 1800 },
  { label: '1800–2000', min: 1800, max: 2000 },
  { label: '2000–2200', min: 2000, max: 2200 },
  { label: '2200+', min: 2200, max: Number.POSITIVE_INFINITY },
]

/**
 * Problems without a rating are deliberately excluded from the distribution —
 * they are never treated as rating 0. `unratedSolved` reports them separately.
 */
export function buildDifficulty(
  problems: SolvedProblem[],
): DifficultyBucket[] {
  return DIFFICULTY_BANDS.map((band) => ({
    label: band.label,
    solved: problems.filter(
      (problem) =>
        problem.rating !== null &&
        problem.rating >= band.min &&
        problem.rating < band.max,
    ).length,
  }))
}

export function buildTopics(
  problems: SolvedProblem[],
  limit = 10,
): TopicStat[] {
  const counts = new Map<string, number>()

  for (const problem of problems) {
    for (const tag of problem.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }

  const sorted = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)

  const max = sorted[0]?.[1] ?? 0

  return sorted.map(([tag, solved]) => ({
    tag,
    solved,
    strength: max > 0 ? Math.round((solved / max) * 100) : 0,
  }))
}

export function buildInitials(user: CodeforcesUser): string {
  const first = user.firstName?.trim()
  const last = user.lastName?.trim()

  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase()
  }

  if (first) return first.slice(0, 2).toUpperCase()

  const cleaned = user.handle.replace(/[^a-zA-Z0-9]/g, '')
  return (cleaned.slice(0, 2) || 'CF').toUpperCase()
}

export interface TransformProfileInput {
  user: CodeforcesUser
  rating: CodeforcesRatingChange[] | null
  submissions: CodeforcesSubmission[] | null
  submissionsTruncated: boolean
  avatarDataUrl: string | null
  warnings: string[]
}

export function transformProfile({
  user,
  rating,
  submissions,
  submissionsTruncated,
  avatarDataUrl,
  warnings,
}: TransformProfileInput): Profile {
  const ratingHistory = rating ? buildRatingHistory(rating) : []
  const solved = submissions ? collectSolvedProblems(submissions) : []
  const unratedSolved = solved.filter(
    (problem) => problem.rating === null,
  ).length
  const hardestProblems = buildHardestProblems(solved)
  const topics = submissions ? buildTopics(solved) : []
  const submissionActivity = submissions
    ? buildSubmissionActivity(submissions, submissionsTruncated)
    : null
  const peakDay = buildPeakDay(
    submissions ?? [],
    submissionsTruncated,
  )
  const grit = buildGrit(submissions ?? [], submissionsTruncated)
  const bestComeback =
    ratingHistory.length > 0
      ? Math.max(...ratingHistory.map((point) => point.change))
      : null

  const localWarnings = [...warnings]

  if (submissionsTruncated) {
    localWarnings.push(
      'Only the most recent 30,000 submissions were analysed. Older accepted problems may be missing from the counts below.',
    )
  }

  const registrationDate =
    user.registrationTimeSeconds > 0
      ? toIsoDate(user.registrationTimeSeconds)
      : null

  const rank = normalizeRank(user.rank)

  return {
    handle: user.handle,
    // `titlePhoto` is preferred, `avatar` is the documented fallback. The URL
    // is rewritten to the reachable codeforces.com image host.
    avatarUrl: toCodeforcesAvatarUrl(user.titlePhoto || user.avatar),
    avatarDataUrl,
    initials: buildInitials(user),
    rank,
    maxRank: normalizeRank(user.maxRank) ?? rank,
    rating: typeof user.rating === 'number' ? user.rating : null,
    maxRating: typeof user.maxRating === 'number' ? user.maxRating : null,
    problemsSolved: submissions ? solved.length : null,
    ratedContests: rating ? ratingHistory.length : null,
    unratedSolved: submissions ? unratedSolved : null,
    country: user.country ?? null,
    organization: user.organization ?? null,
    registrationDate,
    joinedYear: registrationDate
      ? Number(registrationDate.slice(0, 4))
      : null,
    contribution:
      typeof user.contribution === 'number' ? user.contribution : null,
    ratingHistory,
    difficulty: submissions ? buildDifficulty(solved) : [],
    contestStats: rating ? buildContestStats(ratingHistory) : null,
    topics,
    submissionActivity,
    peakDay,
    grit,
    contests: ratingHistory.length,
    bestComeback,
    topTag: buildTopTag(topics, submissionsTruncated),
    cardNumber: buildCardNumber(user.handle),
    hardestProblem: hardestProblems[0] ?? null,
    hardestProblems,
    ratingHistoryAvailable: rating !== null,
    submissionsAvailable: submissions !== null,
    submissionsTruncated,
    warnings: localWarnings,
    isSample: false,
  }
}
