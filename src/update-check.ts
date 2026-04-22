import { APP_VERSION } from './changelog'

const CHECK_INTERVAL_MS = 5 * 60 * 1000
const VERSION_URL = `${import.meta.env.BASE_URL}version.json`

let intervalId: ReturnType<typeof setInterval> | null = null
let notified = false
let onUpdateAvailable: ((newVersion: string) => void) | null = null

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${VERSION_URL}?t=${Date.now()}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = (await res.json()) as { version?: string }
    return typeof data.version === 'string' ? data.version : null
  } catch {
    return null
  }
}

async function checkOnce(): Promise<void> {
  if (notified) return
  const latest = await fetchLatestVersion()
  if (!latest) return
  if (latest !== APP_VERSION) {
    notified = true
    onUpdateAvailable?.(latest)
    stopUpdateCheck()
  }
}

export function startUpdateCheck(onAvailable: (newVersion: string) => void): void {
  if (import.meta.env.DEV) return // no version.json in dev
  onUpdateAvailable = onAvailable
  notified = false

  void checkOnce()
  intervalId = setInterval(checkOnce, CHECK_INTERVAL_MS)

  document.addEventListener('visibilitychange', handleVisibility)
}

function handleVisibility(): void {
  if (document.visibilityState === 'visible') void checkOnce()
}

function stopUpdateCheck(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  document.removeEventListener('visibilitychange', handleVisibility)
}
