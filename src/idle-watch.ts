// Opt-in lock detection via Idle Detection API (Chromium-only).
// Primary purpose: explicitly pause the reminder timer + decay while screen is locked,
// resuming with remaining delay on unlock. Requires user permission grant.

interface IdleDetectorLike extends EventTarget {
  userState: 'active' | 'idle'
  screenState: 'locked' | 'unlocked'
  start(opts: { threshold: number; signal?: AbortSignal }): Promise<void>
}

interface IdleDetectorCtor {
  new (): IdleDetectorLike
  requestPermission(): Promise<PermissionState>
}

declare global {
  interface Window {
    IdleDetector?: IdleDetectorCtor
  }
}

export interface IdleWatch {
  enable: () => Promise<boolean>
  disable: () => void
  isActive: () => boolean
  isSupported: () => boolean
}

interface IdleWatchHandlers {
  onLock: () => void
  onUnlock: (lockedDurationMs: number) => void
}

export function createIdleWatch(handlers: IdleWatchHandlers): IdleWatch {
  let detector: IdleDetectorLike | null = null
  let abort: AbortController | null = null
  let lockedAt = 0

  function isSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.IdleDetector === 'function'
  }

  async function enable(): Promise<boolean> {
    if (!isSupported()) return false
    const Ctor = window.IdleDetector
    if (!Ctor) return false
    try {
      const perm = await Ctor.requestPermission()
      if (perm !== 'granted') return false
      disable()
      abort = new AbortController()
      detector = new Ctor()
      detector.addEventListener('change', onChange)
      await detector.start({ threshold: 60_000, signal: abort.signal })
      return true
    } catch {
      return false
    }
  }

  function disable(): void {
    if (abort) {
      abort.abort()
      abort = null
    }
    if (detector) {
      detector.removeEventListener('change', onChange)
      detector = null
    }
    lockedAt = 0
  }

  function onChange(): void {
    if (!detector) return
    const screen = detector.screenState
    if (screen === 'locked' && lockedAt === 0) {
      lockedAt = Date.now()
      handlers.onLock()
    } else if (screen === 'unlocked' && lockedAt > 0) {
      const duration = Date.now() - lockedAt
      lockedAt = 0
      if (duration > 0) handlers.onUnlock(duration)
    }
  }

  return {
    enable,
    disable,
    isActive: () => detector !== null,
    isSupported,
  }
}
