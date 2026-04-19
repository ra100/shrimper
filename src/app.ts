import { loadState, saveState, isFirstRun, recordCompletion, recordIgnored, recordSnooze, resetProgress, type ShrimperState } from './state'
import { createTimer, type ReminderTimer } from './timer'
import { createEscalation, escalateOnIgnore, deescalateOnComplete, type EscalationState } from './escalation'
import { getRandomTip, getQuipForTip } from './tips'
import { renderDashboard, renderOverlay, renderOnboarding, renderSettings, hideOverlay, hideSettings, updateStats } from './ui'
import { flashShrimp } from './characters/shrimp'
import { celebrate } from './achievements'
import { startTitleFlash, stopTitleFlash } from './tab-indicator'
import { requestPermission, showNotification, getPermissionState } from './notifications'

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
    onOpenSettings: () => renderSettings(state, handleSettingsChange, handleResetProgress),
    onEnableNotifications: handleEnableNotifications,
  })

  const perm = getPermissionState()
  if (perm === 'default') {
    await requestPermission()
    updateNotificationBanner()
  }

  timer.start()
}

function handleReminder(): void {
  snoozeCount = 0
  hadSnooze = false
  const tip = getRandomTip()

  showNotification(`${tip.emoji} ${tip.text}`, getQuipForTip(tip))

  if (!document.hasFocus()) {
    startTitleFlash(tip.emoji + ' ' + tip.text)
    window.addEventListener('focus', () => stopTitleFlash(), { once: true })
  }

  renderOverlay(tip, state, {
    onComplete: () => handleComplete(),
    onSnooze: (minutes: number) => handleSnooze(minutes),
    onDismiss: () => handleDismiss(),
  })
}

function getShrimpEl(): HTMLElement | null {
  return document.getElementById('shrimp-character')
}

function handleComplete(): void {
  stopTitleFlash()
  const result = recordCompletion(state, hadSnooze)
  state = result.state
  escalation = deescalateOnComplete(escalation, state.settings.maxInterval)
  saveState(state)
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
  hideOverlay()
  timer.snooze(minutes)
}

function handleDismiss(): void {
  stopTitleFlash()
  state = recordIgnored(state)
  escalation = escalateOnIgnore(escalation, state.settings.minInterval)
  saveState(state)
  hideOverlay()
  updateStats(state)

  const shrimpEl = getShrimpEl()
  if (shrimpEl) flashShrimp(shrimpEl, 'deflate')

  hadSnooze = false
  timer.scheduleNext()
}

async function handleEnableNotifications(): Promise<void> {
  const result = await requestPermission()
  updateNotificationBanner()
  if (result === 'granted') {
    showNotification('🦐 Notifications enabled!', 'Your shrimp will now nudge you even when you\'re in another app.')
  }
}

function updateNotificationBanner(): void {
  const banner = document.getElementById('notification-banner')
  if (banner) {
    const perm = getPermissionState()
    if (perm === 'granted') {
      banner.style.display = 'none'
    } else if (perm === 'denied') {
      banner.innerHTML = '🔕 Notifications blocked — enable in browser settings for reminders outside this tab'
      banner.className = 'notification-banner banner-denied'
    }
  }
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
