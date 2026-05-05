import type { WorkSchedule } from './state'

interface TimeOfDay {
  h: number
  m: number
}

export function parseTime(hhmm: string): TimeOfDay {
  const [h, m] = hhmm.split(':').map(Number)
  return { h, m }
}

function minutesOfDay(h: number, m: number): number {
  return h * 60 + m
}

function nowMinutes(now: Date): number {
  return minutesOfDay(now.getHours(), now.getMinutes())
}

function dayIndex(now: Date): number {
  // JS getDay: 0=Sun, 1=Mon..6=Sat → schedule days array: 0=Mon..6=Sun
  return (now.getDay() + 6) % 7
}

export function isTimeInBlock(now: Date, start: string, end: string): boolean {
  const s = parseTime(start)
  const e = parseTime(end)
  const startMin = minutesOfDay(s.h, s.m)
  const endMin = minutesOfDay(e.h, e.m)
  if (startMin >= endMin) return false
  const cur = nowMinutes(now)
  return cur >= startMin && cur < endMin
}

export function isWithinSchedule(schedule: WorkSchedule, wakeOverrideUntil: number): boolean {
  if (!schedule.enabled) return true
  if (wakeOverrideUntil > 0 && Date.now() < wakeOverrideUntil) return true

  const now = new Date()
  const di = dayIndex(now)
  if (!schedule.days[di]) return false

  return (
    isTimeInBlock(now, schedule.block1Start, schedule.block1End) ||
    isTimeInBlock(now, schedule.block2Start, schedule.block2End)
  )
}

export function getNextActiveTime(schedule: WorkSchedule): Date | null {
  if (!schedule.enabled) return null
  if (!schedule.days.some(Boolean)) return null

  const now = new Date()

  // Check up to 8 days ahead (covers wrapping through a full week + today)
  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(now)
    candidate.setDate(candidate.getDate() + offset)
    candidate.setSeconds(0, 0)

    const di = dayIndex(candidate)
    if (!schedule.days[di]) continue

    const blocks = [
      { start: schedule.block1Start, end: schedule.block1End },
      { start: schedule.block2Start, end: schedule.block2End },
    ]

    for (const block of blocks) {
      const s = parseTime(block.start)
      const e = parseTime(block.end)
      if (minutesOfDay(s.h, s.m) >= minutesOfDay(e.h, e.m)) continue

      candidate.setHours(s.h, s.m, 0, 0)

      if (candidate > now) return candidate

      // If we're currently in this block, we're already active — shouldn't be called
      // but if mid-block, next active is right now
      if (offset === 0 && isTimeInBlock(now, block.start, block.end)) return now
    }
  }

  return null
}

export function getMsUntilTransition(schedule: WorkSchedule, wakeOverrideUntil: number): number {
  if (!schedule.enabled) return Number.MAX_SAFE_INTEGER

  const now = new Date()
  const currentlyActive = isWithinSchedule(schedule, wakeOverrideUntil)

  if (currentlyActive) {
    // Find when current active window ends
    if (wakeOverrideUntil > 0 && Date.now() < wakeOverrideUntil) {
      return wakeOverrideUntil - Date.now()
    }

    const curMin = nowMinutes(now)
    const blocks = [
      { start: schedule.block1Start, end: schedule.block1End },
      { start: schedule.block2Start, end: schedule.block2End },
    ]

    for (const block of blocks) {
      const s = parseTime(block.start)
      const e = parseTime(block.end)
      const startMin = minutesOfDay(s.h, s.m)
      const endMin = minutesOfDay(e.h, e.m)
      if (startMin >= endMin) continue
      if (curMin >= startMin && curMin < endMin) {
        return (endMin - curMin) * 60 * 1000
      }
    }

    // Shouldn't reach here if active, but fallback
    return 60 * 1000
  }

  // Currently inactive — find next active time
  const next = getNextActiveTime(schedule)
  if (!next) return Number.MAX_SAFE_INTEGER
  return Math.max(0, next.getTime() - Date.now())
}
