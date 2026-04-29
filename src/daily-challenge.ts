import type { ShrimperProgress } from './state'

interface DailyChallenge {
  id: string
  text: string
  emoji: string
  check: (progress: ShrimperProgress) => boolean
}

interface DailyChallengeState {
  date: string // YYYY-MM-DD
  challengeId: string
  completed: boolean
  claimed: boolean
  /** Set to true when the early-bird window condition was met during a completion */
  earlyBirdMet?: boolean
}

const STORAGE_KEY = 'shrimper-daily-challenge'

const CHALLENGES: DailyChallenge[] = [
  {
    id: 'five-a-day',
    text: 'Complete 5 reminders today',
    emoji: '\u{1F3AF}',
    check: (p) => p.completionsToday >= 5,
  },
  {
    id: 'three-in-row',
    text: 'Complete 3 in a row',
    emoji: '\u{1F525}',
    check: (p) => p.completionsInRow >= 3,
  },
  {
    id: 'condition-80',
    text: 'Reach 80% posture',
    emoji: '\u{1F4AA}',
    check: (p) => p.condition >= 80,
  },
  {
    id: 'early-bird',
    text: 'Complete a reminder before 9am',
    emoji: '\u{1F305}',
    // Time check handled externally via earlyBirdMet flag
    check: (_p) => false,
  },
  {
    id: 'seven-today',
    text: 'Complete 7 reminders today',
    emoji: '\u{2B50}',
    check: (p) => p.completionsToday >= 7,
  },
  {
    id: 'perfect-posture',
    text: 'Hit 100% posture',
    emoji: '\u{1F451}',
    check: (p) => p.condition >= 100,
  },
]

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function getTodayChallenge(): DailyChallenge {
  const dayHash = todayString()
    .split('')
    .reduce((a, c) => a + c.charCodeAt(0), 0)
  return CHALLENGES[dayHash % CHALLENGES.length]
}

function loadChallengeState(): DailyChallengeState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as DailyChallengeState
  } catch {
    return null
  }
}

function saveChallengeState(cs: DailyChallengeState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cs))
}

export function getDailyChallengeState(): DailyChallengeState {
  const today = todayString()
  const challenge = getTodayChallenge()
  const stored = loadChallengeState()

  if (stored && stored.date === today && stored.challengeId === challenge.id) {
    return stored
  }

  // New day or mismatched challenge — reset
  const fresh: DailyChallengeState = {
    date: today,
    challengeId: challenge.id,
    completed: false,
    claimed: false,
  }
  saveChallengeState(fresh)
  return fresh
}

export function checkAndUpdateChallenge(progress: ShrimperProgress): { justCompleted: boolean } {
  const cs = getDailyChallengeState()
  if (cs.completed) return { justCompleted: false }

  const challenge = getTodayChallenge()
  let met: boolean

  if (challenge.id === 'early-bird') {
    // Mark early-bird met if current hour < 9
    const hour = new Date().getHours()
    if (hour < 9) {
      cs.earlyBirdMet = true
      saveChallengeState(cs)
    }
    met = cs.earlyBirdMet === true
  } else {
    met = challenge.check(progress)
  }

  if (!met) return { justCompleted: false }

  cs.completed = true
  saveChallengeState(cs)
  return { justCompleted: true }
}

export function claimChallengeReward(): boolean {
  const cs = getDailyChallengeState()
  if (!cs.completed || cs.claimed) return false
  cs.claimed = true
  saveChallengeState(cs)
  return true
}
