import { celebrate } from './achievements'
import { flashShrimp } from './characters/shrimp'
import {
  createEscalation,
  deescalateOnComplete,
  type EscalationState,
  escalateOnIgnore,
} from './escalation'
import { getPermissionState, requestPermission, showNotification } from './notifications'
import {
  isFirstRun,
  loadState,
  recordCompletion,
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
  updatePauseButton,
  updateStats,
} from './ui'

let state: ShrimperState
let escalation: EscalationState
let timer: ReminderTimer
let snoozeCount = 0
let hadSnooze = false
const MAX_SNOOZES = 2

export function initApp(): void {
  state = loadState()

  if (isFirstRun()) {
    renderOnboarding(handleOnboardingComplete)
    return
  }

  startDashboard()
}

async function handleOnboardingComplete(minInterval: number, maxInterval: number): Promise<void> {
  state.settings.minInterval = minInterval
  state.settings.maxInterval = maxInterval
  saveState(state)
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

  if (opts.notify) showNotification(`${tip.emoji} ${tip.text}`, getQuipForTip(tip))

  if (opts.flashTitle && !document.hasFocus()) {
    startTitleFlash(`${tip.emoji} ${tip.text}`)
    window.addEventListener('focus', () => stopTitleFlash(), { once: true })
  }

  state.pendingReminder = { tipId: tip.id, firedAt: Date.now() }
  state.nextFireTime = 0
  saveState(state)

  renderOverlay(tip, state, {
    onComplete: () => handleComplete(),
    onSnooze: (minutes: number) => handleSnooze(minutes),
    onDismiss: () => handleDismiss(),
  })
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
  const result = recordCompletion(state, hadSnooze)
  state = result.state
  state.pendingReminder = null
  escalation = deescalateOnComplete(escalation, state.settings.maxInterval)
  hideOverlay()
  updateStats(state)

  const shrimpEl = getShrimpEl()
  if (shrimpEl) flashShrimp(shrimpEl, 'bounce')

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

function handlePauseToggle(): void {
  state = togglePaused(state)
  if (state.settings.paused) {
    timer.stop()
    state.nextFireTime = 0
  } else {
    timer.start()
    state.nextFireTime = timer.getNextFireTime()
  }
  saveState(state)
  updatePauseButton(state.settings.paused)
}

function handleSettingsChange(minInterval: number, maxInterval: number): void {
  state.settings.minInterval = minInterval
  state.settings.maxInterval = maxInterval
  escalation = createEscalation(minInterval, maxInterval)
  saveState(state)
  hideSettings()
}

function handleResetProgress(): void {
  state = resetProgress(state)
  escalation = createEscalation(state.settings.minInterval, state.settings.maxInterval)
  saveState(state)
  hideSettings()
  updateStats(state)
}
