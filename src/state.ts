export interface ShrimperSettings {
  minInterval: number // minutes
  maxInterval: number // minutes
}

export interface ShrimperProgress {
  xp: number
  level: number
  completionsToday: number
  streak: number
  lastCompletionDate: string // ISO date string (YYYY-MM-DD)
  consecutiveIgnored: number
}

export interface ShrimperState {
  settings: ShrimperSettings
  progress: ShrimperProgress
}

const STORAGE_KEY = 'shrimper-state'

const DEFAULT_SETTINGS: ShrimperSettings = {
  minInterval: 15,
  maxInterval: 45,
}

const DEFAULT_PROGRESS: ShrimperProgress = {
  xp: 0,
  level: 1,
  completionsToday: 0,
  streak: 0,
  lastCompletionDate: '',
  consecutiveIgnored: 0,
}

export const XP_THRESHOLDS = [0, 50, 150, 400, 1000]
export const STREAK_BONUS_PER = 2
export const STREAK_BONUS_CAP = 10
export const BASE_XP = 10

export function loadState(): ShrimperState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
        progress: { ...DEFAULT_PROGRESS, ...parsed.progress },
      }
    }
  } catch {
    // corrupted data — start fresh
  }
  return {
    settings: { ...DEFAULT_SETTINGS },
    progress: { ...DEFAULT_PROGRESS },
  }
}

export function saveState(state: ShrimperState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function isFirstRun(): boolean {
  return localStorage.getItem(STORAGE_KEY) === null
}

export function resetProgress(state: ShrimperState): ShrimperState {
  return {
    ...state,
    progress: { ...DEFAULT_PROGRESS },
  }
}

export function computeLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i + 1
  }
  return 1
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function addXp(state: ShrimperState, amount: number): ShrimperState {
  const today = todayString()
  const isNewDay = state.progress.lastCompletionDate !== today

  const newXp = state.progress.xp + amount
  const newLevel = computeLevel(newXp)

  return {
    ...state,
    progress: {
      ...state.progress,
      xp: newXp,
      level: newLevel,
      completionsToday: isNewDay ? 1 : state.progress.completionsToday + 1,
      streak: state.progress.streak + 1,
      lastCompletionDate: today,
      consecutiveIgnored: 0,
    },
  }
}

export function recordIgnored(state: ShrimperState): ShrimperState {
  return {
    ...state,
    progress: {
      ...state.progress,
      streak: 0,
      consecutiveIgnored: state.progress.consecutiveIgnored + 1,
    },
  }
}

export function getXpForCompletion(streak: number): number {
  const bonus = Math.min(streak * STREAK_BONUS_PER, STREAK_BONUS_CAP)
  return BASE_XP + bonus
}
