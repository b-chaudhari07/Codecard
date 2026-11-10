import { buildCardNumber, buildContestStats } from '../services/codeforces/transformers'
import type {
  HardestProblem,
  HeatmapDay,
  Profile,
  RatingPoint,
  SubmissionActivity,
} from '../types/profile'

type RawRatingPoint = [date: string, rating: number, contest: string]

const RAW_HISTORY: RawRatingPoint[] = [
  ['2023-01-14', 1187, 'Codeforces Round 842 (Div. 2)'],
  ['2023-02-04', 1224, 'Codeforces Round 848 (Div. 2)'],
  ['2023-03-11', 1196, 'Codeforces Round 857 (Div. 2)'],
  ['2023-04-08', 1279, 'Codeforces Round 863 (Div. 3)'],
  ['2023-05-06', 1342, 'Codeforces Round 869 (Div. 2)'],
  ['2023-06-17', 1318, 'Codeforces Round 878 (Div. 3)'],
  ['2023-07-22', 1386, 'Codeforces Round 886 (Div. 4)'],
  ['2023-08-19', 1421, 'Codeforces Round 893 (Div. 2)'],
  ['2023-09-23', 1394, 'Codeforces Round 897 (Div. 2)'],
  ['2023-10-21', 1468, 'Codeforces Round 904 (Div. 2)'],
  ['2023-11-18', 1522, 'Codeforces Round 910 (Div. 2)'],
  ['2023-12-16', 1487, 'Codeforces Round 915 (Div. 2)'],
  ['2024-01-20', 1543, 'Codeforces Round 921 (Div. 2)'],
  ['2024-02-17', 1601, 'Codeforces Round 927 (Div. 3)'],
  ['2024-03-16', 1568, 'Codeforces Round 933 (Div. 3)'],
  ['2024-04-13', 1624, 'Codeforces Round 939 (Div. 2)'],
  ['2024-05-11', 1672, 'Codeforces Round 944 (Div. 4)'],
  ['2024-06-15', 1641, 'Codeforces Round 952 (Div. 4)'],
  ['2024-07-20', 1698, 'Codeforces Round 960 (Div. 2)'],
  ['2024-08-17', 1734, 'Codeforces Round 966 (Div. 3)'],
  ['2024-09-21', 1702, 'Codeforces Round 974 (Div. 3)'],
  ['2024-10-19', 1758, 'Codeforces Round 979 (Div. 2)'],
  ['2024-11-16', 1812, 'Codeforces Round 986 (Div. 2)'],
  ['2024-12-14', 1786, 'Codeforces Round 993 (Div. 4)'],
  ['2025-01-18', 1834, 'Codeforces Round 999 (Div. 2)'],
  ['2025-02-15', 1799, 'Codeforces Round 1005 (Div. 2)'],
  ['2025-03-15', 1851, 'Codeforces Round 1011 (Div. 2)'],
  ['2025-04-19', 1816, 'Codeforces Round 1017 (Div. 2)'],
  ['2025-05-17', 1874, 'Codeforces Round 1023 (Div. 2)'],
  ['2025-06-14', 1912, 'Codeforces Round 1028 (Div. 2)'],
  ['2025-07-19', 1878, 'Codeforces Round 1034 (Div. 2)'],
  ['2025-08-16', 1839, 'Codeforces Round 1040 (Div. 2)'],
  ['2025-09-20', 1886, 'Codeforces Round 1046 (Div. 2)'],
  ['2025-10-18', 1844, 'Codeforces Round 1051 (Div. 2)'],
  ['2025-11-15', 1802, 'Codeforces Round 1057 (Div. 2)'],
  ['2025-12-13', 1858, 'Codeforces Round 1062 (Div. 2)'],
  ['2026-01-17', 1821, 'Codeforces Round 1068 (Div. 2)'],
  ['2026-02-21', 1876, 'Codeforces Round 1074 (Div. 2)'],
  ['2026-03-21', 1834, 'Codeforces Round 1080 (Div. 2)'],
  ['2026-04-18', 1889, 'Codeforces Round 1086 (Div. 2)'],
  ['2026-05-16', 1852, 'Codeforces Round 1092 (Div. 2)'],
  ['2026-06-20', 1898, 'Codeforces Round 1098 (Div. 2)'],
  ['2026-07-18', 1861, 'Codeforces Round 1104 (Div. 2)'],
  ['2026-08-15', 1904, 'Codeforces Round 1110 (Div. 2)'],
  ['2026-09-12', 1872, 'Codeforces Round 1116 (Div. 2)'],
  ['2026-10-03', 1826, 'Codeforces Round 1121 (Div. 2)'],
  ['2026-10-24', 1847, 'Codeforces Round 1124 (Div. 2)'],
]

const ratingHistory: RatingPoint[] = RAW_HISTORY.map(
  ([date, rating, contest], index) => {
    const oldRating =
      index === 0 ? rating - 35 : RAW_HISTORY[index - 1][1]

    return {
      date,
      rating,
      oldRating,
      change: rating - oldRating,
      rank: 180 + ((index * 137) % 1240),
      contestId: 842 + index * 6,
      contest,
    }
  },
)

const contestStats = buildContestStats(ratingHistory) ?? {
  total: 0,
  bestRank: 0,
  avgChange: 0,
  bestChange: 0,
  worstChange: 0,
  positiveChanges: 0,
  negativeChanges: 0,
  recentChanges: [],
}

const hardestProblems: HardestProblem[] = [
  {
    key: '1610:E',
    contestId: 1610,
    index: 'E',
    name: 'Amr and Points',
    rating: 2100,
    url: 'https://codeforces.com/problemset/problem/1610/E',
  },
  {
    key: '1748:C',
    contestId: 1748,
    index: 'C',
    name: 'Zero-Sum Prefixes',
    rating: 1900,
    url: 'https://codeforces.com/problemset/problem/1748/C',
  },
  {
    key: '1661:C',
    contestId: 1661,
    index: 'C',
    name: 'Water the Trees',
    rating: 1700,
    url: 'https://codeforces.com/problemset/problem/1661/C',
  },
  {
    key: '1676:G',
    contestId: 1676,
    index: 'G',
    name: 'White-Black Balanced Subtrees',
    rating: 1500,
    url: 'https://codeforces.com/problemset/problem/1676/G',
  },
  {
    key: '1692:F',
    contestId: 1692,
    index: 'F',
    name: '3SUM',
    rating: 1300,
    url: 'https://codeforces.com/problemset/problem/1692/F',
  },
]

function generateSampleSubmissionActivity(): SubmissionActivity {
  // Relative end date so the fixture always lands inside a live 12-month window.
  const now = new Date()
  const days: HeatmapDay[] = []
  let activeDays = 0
  let totalSubmissions = 0
  let acceptedSubmissions = 0
  let maxDailySubmissions = 0
  let currentStreak = 0
  let longestStreak = 0

  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const isoDate = (date: Date) =>
    [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-')
  const rawStart = new Date(end)
  rawStart.setMonth(rawStart.getMonth() - 12)
  const start = new Date(
    rawStart.getFullYear(),
    rawStart.getMonth(),
    rawStart.getDate() - rawStart.getDay(),
  )

  for (
    let cursor = new Date(start);
    cursor.getTime() <= end.getTime();
    cursor.setDate(cursor.getDate() + 1)
  ) {
    const y = cursor.getFullYear()
    const m = String(cursor.getMonth() + 1).padStart(2, '0')
    const d = String(cursor.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${d}`

    const seed =
      (cursor.getFullYear() * 366 +
        cursor.getMonth() * 31 +
        cursor.getDate()) %
      100
    let subs = 0
    let acc = 0
    if (seed < 48) {
      subs = (seed % 6) + 1
      acc = Math.max(1, Math.min(subs, Math.floor(subs * 0.75)))
      activeDays += 1
      totalSubmissions += subs
      acceptedSubmissions += acc
      if (subs > maxDailySubmissions) maxDailySubmissions = subs
      currentStreak += 1
      if (currentStreak > longestStreak) longestStreak = currentStreak
    } else {
      currentStreak = 0
    }
    days.push({ date: dateStr, submissions: subs, accepted: acc })
  }

  return {
    days,
    activeDays,
    firstSubmissionDate:
      days.find((day) => day.submissions > 0)?.date ?? null,
    longestStreak,
    totalSubmissions,
    acceptedSubmissions,
    windowSubmissions: totalSubmissions,
    windowAcceptedSubmissions: acceptedSubmissions,
    windowActiveDays: activeDays,
    maxDailySubmissions,
    windowStart: days[0]?.date ?? isoDate(start),
    windowEnd: days[days.length - 1]?.date ?? isoDate(end),
    isPartial: false,
  }
}

const sampleActivity = generateSampleSubmissionActivity()

/**
 * The busiest sample day, dated inside the activity window. Kept in sync with
 * the generated activity so the fixture never claims a bigger day than the
 * heatmap shows.
 */
const samplePeakDay = sampleActivity.days.reduce(
  (best, day) => (day.accepted > best.accepted ? { ...day } : best),
  { date: '', submissions: 0, accepted: 0 },
)

/**
 * DESIGN PREVIEW FIXTURE — NOT LIVE DATA.
 * Every statistic below is hard-coded sample data for demo mode only.
 * It is intentionally surfaced as "sample data" throughout the interface.
 */
export const sampleProfile: Profile = {
  handle: 'codecard_demo',
  avatarUrl: null,
  avatarDataUrl: null,
  initials: 'CD',
  rank: 'Expert',
  maxRank: 'Candidate Master',
  rating: 1847,
  maxRating: 1912,
  problemsSolved: 684,
  ratedContests: ratingHistory.length,
  unratedSolved: 0,
  country: 'India',
  organization: null,
  registrationDate: '2022-01-15',
  joinedYear: 2022,
  contribution: 12,
  isSample: true,
  ratingHistoryAvailable: true,
  submissionsAvailable: true,
  submissionsTruncated: false,
  warnings: [],
  ratingHistory,
  difficulty: [
    { label: '800–1000', solved: 92 },
    { label: '1000–1200', solved: 128 },
    { label: '1200–1400', solved: 151 },
    { label: '1400–1600', solved: 132 },
    { label: '1600–1800', solved: 98 },
    { label: '1800–2000', solved: 54 },
    { label: '2000–2200', solved: 21 },
    { label: '2200+', solved: 8 },
  ],
  contestStats,
  topics: [
    { tag: 'dp', solved: 148, strength: 100 },
    { tag: 'graphs', solved: 121, strength: 82 },
    { tag: 'greedy', solved: 112, strength: 76 },
    { tag: 'math', solved: 96, strength: 65 },
    { tag: 'data structures', solved: 88, strength: 59 },
    { tag: 'binary search', solved: 74, strength: 50 },
    { tag: 'trees', solved: 61, strength: 41 },
    { tag: 'implementation', solved: 54, strength: 36 },
    { tag: 'number theory', solved: 42, strength: 28 },
    { tag: 'strings', solved: 38, strength: 26 },
  ],
  hardestProblem: hardestProblems[0],
  hardestProblems,
  submissionActivity: sampleActivity,
  peakDay: {
    count: samplePeakDay.accepted,
    date: samplePeakDay.date || null,
    partial: false,
  },
  grit: {
    count: 12,
    problemName: hardestProblems[0].name,
    problemIndex: hardestProblems[0].index,
    partial: false,
  },
  // Live-contest accuracy sample: 45 of 64 contest solves were first-try.
  sniper: { percent: 70, firstTry: 45, solved: 64, partial: false },
  contests: ratingHistory.length,
  bestComeback: Math.max(...ratingHistory.map((point) => point.change)),
  topTag: { tag: 'dp', solved: 148, partial: false },
  cardNumber: buildCardNumber('codecard_demo'),
}
