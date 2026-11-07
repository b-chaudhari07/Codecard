export interface CodeforcesApiResponse<T> {
  status: 'OK' | 'FAILED'
  comment?: string
  result?: T
}

export interface CodeforcesUser {
  handle: string
  email?: string
  vkId?: number
  openId?: string
  firstName?: string
  lastName?: string
  country?: string
  city?: string
  organization?: string
  contribution: number
  rank?: string
  rating?: number
  maxRank?: string
  maxRating?: number
  lastOnlineTimeSeconds: number
  registrationTimeSeconds: number
  friendOfCount: number
  avatar: string
  titlePhoto: string
}

export interface CodeforcesRatingChange {
  contestId: number
  contestName: string
  handle: string
  rank: number
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export interface CodeforcesProblem {
  contestId?: number
  problemsetName?: string
  index: string
  name: string
  type: string
  points?: number
  rating?: number
  tags: string[]
}

export interface CodeforcesPartyMember {
  handle: string
}

export interface CodeforcesParty {
  contestId?: number
  participantId?: number
  members: CodeforcesPartyMember[]
  participantType: string
  ghost: boolean
  room?: number
  startTimeSeconds?: number
}

export interface CodeforcesSubmission {
  id: number
  contestId?: number
  creationTimeSeconds: number
  relativeTimeSeconds: number
  problem: CodeforcesProblem
  author: CodeforcesParty
  programmingLanguage: string
  verdict?: string
  testset: string
  passedTestCount: number
  timeConsumedMillis: number
  memoryConsumedBytes: number
}
