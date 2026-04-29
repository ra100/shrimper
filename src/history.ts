import type { ShrimperState } from './state'

const HISTORY_KEY = 'shrimper-history'
const MAX_ENTRIES = 90

export interface DailySnapshot {
  date: string // YYYY-MM-DD
  completions: number
  condition: number
  streak: number
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function loadHistory(): DailySnapshot[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as DailySnapshot[]
  } catch {
    return []
  }
}

function saveHistory(history: DailySnapshot[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

/** Upsert today's snapshot with current state values. Cap at MAX_ENTRIES. */
export function recordDaily(state: ShrimperState): void {
  const today = todayString()
  const history = loadHistory()

  const idx = history.findIndex((s) => s.date === today)
  const snapshot: DailySnapshot = {
    date: today,
    completions: state.progress.completionsToday,
    condition: state.progress.condition,
    streak: state.progress.streak,
  }

  if (idx >= 0) {
    history[idx] = snapshot
  } else {
    history.push(snapshot)
  }

  // Trim oldest entries beyond the cap
  while (history.length > MAX_ENTRIES) {
    history.shift()
  }

  saveHistory(history)
}

/** Return last N days of snapshots, filling gaps with zeroes. */
export function getHistory(days: number): DailySnapshot[] {
  const history = loadHistory()
  const map = new Map<string, DailySnapshot>()
  for (const snap of history) {
    map.set(snap.date, snap)
  }

  const result: DailySnapshot[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    result.push(
      map.get(dateStr) ?? {
        date: dateStr,
        completions: 0,
        condition: 0,
        streak: 0,
      },
    )
  }

  return result
}
