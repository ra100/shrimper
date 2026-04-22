export interface ShrimperSettings {
  minInterval: number // minutes
  maxInterval: number // minutes
  paused: boolean
  shrimpName: string
}

export type AchievementId =
  | 'firstStretch'
  | 'threeInRow'
  | 'streak7'
  | 'streak30'
  | 'total100'
  | 'peakCondition'
  | 'nightOwl'
  | 'earlyBird'
  | 'comebackKid'
  | 'speedShrimp'

export type Achievements = Record<AchievementId, string | null>

export interface ShrimperProgress {
  condition: number // 0..100
  totalCompletions: number
  completionsToday: number
  streak: number
  lastCompletionDate: string // YYYY-MM-DD or ""
  completionsInRow: number
  achievements: Achievements
}

export interface PendingReminder {
  tipId: string
  firedAt: number
  lastDecayAt?: number
}

export interface ShrimperState {
  version: 2
  settings: ShrimperSettings
  progress: ShrimperProgress
  pendingReminder: PendingReminder | null
  nextFireTime: number
}

const STORAGE_KEY = 'shrimper-state'
const SCHEMA_VERSION = 2 as const

const DEFAULT_SETTINGS: ShrimperSettings = {
  minInterval: 15,
  maxInterval: 45,
  paused: false,
  shrimpName: 'Kevin',
}

const DEFAULT_ACHIEVEMENTS: Achievements = {
  firstStretch: null,
  threeInRow: null,
  streak7: null,
  streak30: null,
  total100: null,
  peakCondition: null,
  nightOwl: null,
  earlyBird: null,
  comebackKid: null,
  speedShrimp: null,
}

const DEFAULT_PROGRESS: ShrimperProgress = {
  condition: 50,
  totalCompletions: 0,
  completionsToday: 0,
  streak: 0,
  lastCompletionDate: '',
  completionsInRow: 0,
  achievements: { ...DEFAULT_ACHIEVEMENTS },
}

function freshState(): ShrimperState {
  return {
    version: SCHEMA_VERSION,
    settings: { ...DEFAULT_SETTINGS },
    progress: { ...DEFAULT_PROGRESS, achievements: { ...DEFAULT_ACHIEVEMENTS } },
    pendingReminder: null,
    nextFireTime: 0,
  }
}

export function loadState(): ShrimperState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshState()
    const parsed = JSON.parse(raw)
    if (parsed?.version !== SCHEMA_VERSION) return freshState()
    return {
      version: SCHEMA_VERSION,
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
      progress: {
        ...DEFAULT_PROGRESS,
        ...parsed.progress,
        achievements: { ...DEFAULT_ACHIEVEMENTS, ...(parsed.progress?.achievements ?? {}) },
      },
      pendingReminder: parsed.pendingReminder ?? null,
      nextFireTime: parsed.nextFireTime ?? 0,
    }
  } catch {
    return freshState()
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
    version: SCHEMA_VERSION,
    progress: { ...DEFAULT_PROGRESS, achievements: { ...DEFAULT_ACHIEVEMENTS } },
    pendingReminder: null,
    nextFireTime: 0,
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

interface CompletionContext {
  conditionBefore: number
  elapsedMs: number
  completedAt: Date
}

function checkAchievements(progress: ShrimperProgress, ctx: CompletionContext): AchievementId[] {
  const today = todayString()
  const unlocked: AchievementId[] = []
  const a = progress.achievements
  const hour = ctx.completedAt.getHours()

  const triggers: Array<[AchievementId, boolean]> = [
    ['firstStretch', progress.totalCompletions === 1],
    ['threeInRow', progress.completionsInRow === 3],
    ['streak7', progress.streak === 7],
    ['streak30', progress.streak === 30],
    ['total100', progress.totalCompletions === 100],
    ['peakCondition', progress.condition === 100],
    ['nightOwl', hour >= 2 && hour < 5],
    ['earlyBird', hour >= 5 && hour < 7],
    ['comebackKid', ctx.conditionBefore < 20],
    ['speedShrimp', ctx.elapsedMs > 0 && ctx.elapsedMs < 30_000],
  ]

  for (const [id, hit] of triggers) {
    if (hit && a[id] === null) {
      a[id] = today
      unlocked.push(id)
    }
  }
  return unlocked
}

export function recordCompletion(
  state: ShrimperState,
  wasSnoozed: boolean,
  elapsedMs = 0,
): { state: ShrimperState; unlocked: AchievementId[] } {
  const delta = wasSnoozed ? 1 : 3
  const today = todayString()
  const yesterday = yesterdayString()
  const prev = state.progress

  let streak: number
  let completionsToday: number
  if (prev.lastCompletionDate === today) {
    streak = prev.streak
    completionsToday = prev.completionsToday + 1
  } else if (prev.lastCompletionDate === yesterday) {
    streak = prev.streak + 1
    completionsToday = 1
  } else {
    streak = 1
    completionsToday = 1
  }

  const nextProgress: ShrimperProgress = {
    ...prev,
    condition: clamp(prev.condition + delta, 0, 100),
    totalCompletions: prev.totalCompletions + 1,
    completionsInRow: prev.completionsInRow + 1,
    completionsToday,
    streak,
    lastCompletionDate: today,
    achievements: { ...prev.achievements },
  }

  const unlocked = checkAchievements(nextProgress, {
    conditionBefore: prev.condition,
    elapsedMs,
    completedAt: new Date(),
  })

  return {
    state: { ...state, progress: nextProgress },
    unlocked,
  }
}

export function recordIgnored(state: ShrimperState): ShrimperState {
  return {
    ...state,
    progress: {
      ...state.progress,
      condition: clamp(state.progress.condition - 4, 0, 100),
      completionsInRow: 0,
    },
  }
}

export function recordDecay(state: ShrimperState, ticks: number): ShrimperState {
  if (ticks <= 0) return state
  return {
    ...state,
    progress: {
      ...state.progress,
      condition: clamp(state.progress.condition - 3 * ticks, 0, 100),
      completionsInRow: 0,
    },
  }
}

export function recordSnooze(state: ShrimperState): ShrimperState {
  return state
}

export function togglePaused(state: ShrimperState): ShrimperState {
  return {
    ...state,
    settings: { ...state.settings, paused: !state.settings.paused },
  }
}
