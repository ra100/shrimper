type TimerCallback = () => void

export interface ReminderTimer {
  start: () => void
  stop: () => void
  snooze: (minutes: number) => void
  scheduleNext: () => void
  isRunning: () => boolean
  getNextFireTime: () => number
}

function randomInterval(minMinutes: number, maxMinutes: number): number {
  const min = minMinutes * 60 * 1000
  const max = maxMinutes * 60 * 1000
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function createTimer(
  getMinInterval: () => number,
  getMaxInterval: () => number,
  onReminder: TimerCallback,
): ReminderTimer {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let running = false
  let nextFireTime = 0

  function scheduleNext() {
    stop()
    const delay = randomInterval(getMinInterval(), getMaxInterval())
    nextFireTime = Date.now() + delay
    timeoutId = setTimeout(() => {
      onReminder()
    }, delay)
    running = true
  }

  function stop() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    running = false
    nextFireTime = 0
  }

  function start() {
    scheduleNext()
  }

  function snooze(minutes: number) {
    stop()
    const delay = minutes * 60 * 1000
    nextFireTime = Date.now() + delay
    timeoutId = setTimeout(() => {
      onReminder()
    }, delay)
    running = true
  }

  return {
    start,
    stop,
    snooze,
    scheduleNext,
    isRunning: () => running,
    getNextFireTime: () => nextFireTime,
  }
}

export function getApproxTimeRemaining(nextFireTime: number): string {
  const remaining = nextFireTime - Date.now()
  if (remaining <= 0) return 'any moment'
  const minutes = Math.ceil(remaining / 60000)
  if (minutes <= 2) return 'soon'
  if (minutes <= 10) return 'a few minutes'
  return `~${minutes} min`
}
