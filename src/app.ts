import { celebrate } from './achievements'
import { hasSeenCurrentVersion, markVersionSeen, renderChangelogModal } from './changelog'
import { flashShrimp } from './characters/shrimp'
import {
  createEscalation,
  deescalateOnComplete,
  type EscalationState,
  escalateOnIgnore,
} from './escalation'
import { createIdleWatch, type IdleWatch } from './idle-watch'
import { getPermissionState, requestPermission, showNotification } from './notifications'
import {
  isFirstRun,
  loadState,
  recordCompletion,
  recordDecay,
  recordIgnored,
  recordSnooze,
  resetProgress,
  type ShrimperState,
  saveState,
  togglePaused,
} from './state'
import { startTitleFlash, stopTitleFlash } from './tab-indicator'
import { createTimer, type ReminderTimer } from './timer'
import { getQuipForTip, getRandomTip, getTipById, type Tip } from './tips'
import {
  hideOverlay,
  hideSettings,
  renderDashboard,
  renderOnboarding,
  renderOverlay,
  renderSettings,
  showCustomThought,
  showUpdateBanner,
  updatePauseButton,
  updateStats,
} from './ui'
import { startUpdateCheck } from './update-check'

let state: ShrimperState
let escalation: EscalationState
let timer: ReminderTimer
let snoozeCount = 0
let hadSnooze = false
let decayTimerId: ReturnType<typeof setTimeout> | null = null
let idleWatch: IdleWatch | null = null
let lockedNextFire = 0
const MAX_SNOOZES = 2
const DECAY_INTERVAL_MS = 3 * 60 * 1000
// Max backlog of decay ticks applied per catchUp — caps retroactive penalty
// when the wall clock jumps forward (machine sleep, tab throttled in background).
const MAX_CATCHUP_TICKS = 2

export function initApp(): void {
  state = loadState()

  if (isFirstRun()) {
    renderOnboarding(handleOnboardingComplete)
    return
  }

  startDashboard()
}

async function handleOnboardingComplete(
  minInterval: number,
  maxInterval: number,
  shrimpName: string,
): Promise<void> {
  state.settings.minInterval = minInterval
  state.settings.maxInterval = maxInterval
  state.settings.shrimpName = shrimpName
  saveState(state)
  markVersionSeen()
  await requestPermission()
  startDashboard()
}

async function startDashboard(): Promise<void> {
  escalation = createEscalation(state.settings.minInterval, state.settings.maxInterval)

  timer = createTimer(
    () => state.settings.minInterval,
    () => escalation.effectiveMax,
    handleReminder,
  )

  renderDashboard(state, timer, {
    onOpenSettings: () =>
      renderSettings(state, handleSettingsChange, handleResetProgress, handleTestNotification),
    onEnableNotifications: handleEnableNotifications,
    onTogglePause: handlePauseToggle,
  })

  const perm = getPermissionState()
  if (perm === 'default') {
    await requestPermission()
    updateNotificationBanner()
  }

  if (!hasSeenCurrentVersion()) {
    renderChangelogModal(() => markVersionSeen())
  }

  startUpdateCheck((newVersion) => {
    showUpdateBanner(newVersion, () => location.reload())
  })

  initIdleWatch()

  if (state.settings.paused) return

  // Resume pending reminder shown before reload
  if (state.pendingReminder) {
    const tip = getTipById(state.pendingReminder.tipId)
    if (tip) {
      showReminderOverlay(tip, { notify: false, flashTitle: false })
      return
    }
    state.pendingReminder = null
  }

  // Resume timer countdown from persisted target, or schedule fresh
  if (state.nextFireTime > 0 && state.nextFireTime > Date.now()) {
    timer.resumeAt(state.nextFireTime)
  } else {
    timer.start()
    persistSchedule()
  }
}

function persistSchedule(): void {
  state.nextFireTime = timer.getNextFireTime()
  saveState(state)
}

function showReminderOverlay(tip: Tip, opts: { notify: boolean; flashTitle: boolean }): void {
  snoozeCount = 0
  hadSnooze = false

  if (opts.notify) {
    showNotification(`${tip.emoji} ${state.settings.shrimpName}: ${tip.text}`, getQuipForTip(tip))
  }

  if (opts.flashTitle && !document.hasFocus()) {
    startTitleFlash(`${tip.emoji} ${tip.text}`)
    window.addEventListener('focus', () => stopTitleFlash(), { once: true })
  }

  const now = Date.now()
  const existing = state.pendingReminder
  state.pendingReminder = {
    tipId: tip.id,
    firedAt: existing?.tipId === tip.id ? (existing.firedAt ?? now) : now,
    lastDecayAt: existing?.tipId === tip.id ? (existing.lastDecayAt ?? now) : now,
  }
  state.nextFireTime = 0

  catchUpDecay()
  saveState(state)
  scheduleDecayTick()

  renderOverlay(tip, state, {
    onComplete: () => handleComplete(),
    onSnooze: (minutes: number) => handleSnooze(minutes),
    onDismiss: () => handleDismiss(),
  })
}

function catchUpDecay(): void {
  const pending = state.pendingReminder
  if (!pending) return
  const anchor = pending.lastDecayAt ?? pending.firedAt
  const now = Date.now()
  const elapsed = now - anchor
  const rawTicks = Math.floor(elapsed / DECAY_INTERVAL_MS)
  if (rawTicks <= 0) return
  // If the gap is much larger than the decay interval, assume the machine was
  // asleep / locked / tab throttled — cap the penalty and realign the anchor
  // to "now" so decay resumes from this moment rather than back-filling the gap.
  const ticks = Math.min(rawTicks, MAX_CATCHUP_TICKS)
  const sleptThrough = rawTicks > MAX_CATCHUP_TICKS
  state = recordDecay(state, ticks)
  if (state.pendingReminder) {
    state.pendingReminder.lastDecayAt = sleptThrough ? now : anchor + ticks * DECAY_INTERVAL_MS
  }
  const shrimpEl = getShrimpEl()
  if (shrimpEl) flashShrimp(shrimpEl, 'deflate')
  updateStats(state)
}

function scheduleDecayTick(): void {
  clearDecayTimer()
  const pending = state.pendingReminder
  if (!pending) return
  const anchor = pending.lastDecayAt ?? pending.firedAt
  const delay = Math.max(0, anchor + DECAY_INTERVAL_MS - Date.now())
  decayTimerId = setTimeout(onDecayTick, delay)
}

function onDecayTick(): void {
  decayTimerId = null
  if (!state.pendingReminder) return
  catchUpDecay()
  saveState(state)
  scheduleDecayTick()
}

function clearDecayTimer(): void {
  if (decayTimerId !== null) {
    clearTimeout(decayTimerId)
    decayTimerId = null
  }
}

function handleTestNotification(): void {
  const tip = getRandomTip()
  showNotification(`${tip.emoji} ${tip.text}`, getQuipForTip(tip))
}

function handleReminder(): void {
  const tip = getRandomTip()
  showReminderOverlay(tip, { notify: true, flashTitle: true })
}

function getShrimpEl(): HTMLElement | null {
  return document.getElementById('shrimp-character')
}

function handleComplete(): void {
  stopTitleFlash()
  clearDecayTimer()
  const firedAt = state.pendingReminder?.firedAt ?? 0
  const elapsedMs = firedAt > 0 ? Date.now() - firedAt : 0
  const result = recordCompletion(state, hadSnooze, elapsedMs)
  state = result.state
  state.pendingReminder = null
  escalation = deescalateOnComplete(escalation, state.settings.maxInterval)
  hideOverlay()
  updateStats(state)

  const shrimpEl = getShrimpEl()
  if (shrimpEl) flashShrimp(shrimpEl, 'bounce')
  showCustomThought('ahhhh 🫠')

  if (result.unlocked.length > 0) {
    celebrate(result.unlocked)
  }

  hadSnooze = false
  snoozeCount = 0
  timer.scheduleNext()
  persistSchedule()
}

function handleSnooze(minutes: number): void {
  stopTitleFlash()
  clearDecayTimer()
  snoozeCount++
  hadSnooze = true
  state = recordSnooze(state)
  if (snoozeCount >= MAX_SNOOZES) {
    handleDismiss()
    return
  }
  state.pendingReminder = null
  hideOverlay()
  timer.snooze(minutes)
  persistSchedule()
}

function handleDismiss(): void {
  stopTitleFlash()
  clearDecayTimer()
  state = recordIgnored(state)
  state.pendingReminder = null
  escalation = escalateOnIgnore(escalation, state.settings.minInterval)
  hideOverlay()
  updateStats(state)

  const shrimpEl = getShrimpEl()
  if (shrimpEl) flashShrimp(shrimpEl, 'deflate')

  hadSnooze = false
  timer.scheduleNext()
  persistSchedule()
}

async function handleEnableNotifications(): Promise<void> {
  const result = await requestPermission()
  updateNotificationBanner()
  if (result === 'granted') {
    showNotification(
      '🦐 Notifications enabled!',
      "Your shrimp will now nudge you even when you're in another app.",
    )
  }
}

function updateNotificationBanner(): void {
  const banner = document.getElementById('notification-banner')
  if (banner) {
    const perm = getPermissionState()
    if (perm === 'granted') {
      banner.style.display = 'none'
    } else if (perm === 'denied') {
      banner.innerHTML =
        '🔕 Notifications blocked — enable in browser settings for reminders outside this tab'
      banner.className = 'notification-banner banner-denied'
    }
  }
}

function initIdleWatch(): void {
  if (idleWatch) idleWatch.disable()
  idleWatch = createIdleWatch({
    onLock: handleLock,
    onUnlock: handleUnlock,
  })
  if (state.settings.pauseOnLock && idleWatch.isSupported()) {
    void idleWatch.enable().then((ok) => {
      if (!ok) {
        state.settings.pauseOnLock = false
        saveState(state)
      }
    })
  }
}

function handleLock(): void {
  if (state.settings.paused) return
  // Remember target so we can resume from the same remaining delay.
  lockedNextFire = timer.getNextFireTime()
  timer.stop()
  clearDecayTimer()
  // Keep nextFireTime persisted — reload during lock will still recover.
  state.nextFireTime = lockedNextFire
  saveState(state)
}

function handleUnlock(lockedDurationMs: number): void {
  if (state.settings.paused) return
  // Shift reminder target forward by the locked duration.
  if (lockedNextFire > 0) {
    const shifted = lockedNextFire + lockedDurationMs
    timer.resumeAt(shifted)
    state.nextFireTime = shifted
  } else if (!state.pendingReminder) {
    timer.start()
    state.nextFireTime = timer.getNextFireTime()
  }
  // Shift decay anchor so the locked span doesn't count toward decay.
  if (state.pendingReminder) {
    const anchor = state.pendingReminder.lastDecayAt ?? state.pendingReminder.firedAt
    state.pendingReminder.lastDecayAt = anchor + lockedDurationMs
    scheduleDecayTick()
  }
  lockedNextFire = 0
  saveState(state)
}

function handlePauseToggle(): void {
  state = togglePaused(state)
  if (state.settings.paused) {
    timer.stop()
    clearDecayTimer()
    state.nextFireTime = 0
  } else {
    timer.start()
    state.nextFireTime = timer.getNextFireTime()
    if (state.pendingReminder) {
      state.pendingReminder.lastDecayAt = Date.now()
      scheduleDecayTick()
    }
  }
  saveState(state)
  updatePauseButton(state.settings.paused)
}

function handleSettingsChange(
  minInterval: number,
  maxInterval: number,
  shrimpName: string,
  pauseOnLock: boolean,
): void {
  const prevPauseOnLock = state.settings.pauseOnLock
  state.settings.minInterval = minInterval
  state.settings.maxInterval = maxInterval
  state.settings.shrimpName = shrimpName
  state.settings.pauseOnLock = pauseOnLock
  escalation = createEscalation(minInterval, maxInterval)
  saveState(state)
  hideSettings()
  const nameEl = document.getElementById('shrimp-name')
  if (nameEl) nameEl.textContent = shrimpName

  if (pauseOnLock !== prevPauseOnLock && idleWatch) {
    if (pauseOnLock) {
      void idleWatch.enable().then((ok) => {
        if (!ok) {
          state.settings.pauseOnLock = false
          saveState(state)
        }
      })
    } else {
      idleWatch.disable()
    }
  }
}

function handleResetProgress(): void {
  clearDecayTimer()
  state = resetProgress(state)
  escalation = createEscalation(state.settings.minInterval, state.settings.maxInterval)
  saveState(state)
  hideSettings()
  updateStats(state)
}
