import { loadState, saveState, isFirstRun, addXp, recordIgnored, getXpForCompletion, resetProgress, type ShrimperState } from './state'
import { createTimer, type ReminderTimer } from './timer'
import { createEscalation, escalateOnIgnore, deescalateOnComplete, type EscalationState } from './escalation'
import { getRandomTip } from './tips'
import { renderDashboard, renderOverlay, renderOnboarding, renderSettings, hideOverlay, hideSettings, updateStats, updateCharacterMood, showLevelUp } from './ui'
import { startTitleFlash, stopTitleFlash } from './tab-indicator'
import { requestPermission, showNotification, getPermissionState } from './notifications'
import { getQuipForTip } from './tips'

let state: ShrimperState
let escalation: EscalationState
let timer: ReminderTimer
let snoozeCount = 0
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

  // Request permission if not yet decided
  const perm = getPermissionState()
  if (perm === 'default') {
    await requestPermission()
    updateNotificationBanner()
  }

  timer.start()
}

function handleReminder(): void {
  snoozeCount = 0
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

function handleComplete(): void {
  stopTitleFlash()
  const prevLevel = state.progress.level
  const xpGain = getXpForCompletion(state.progress.streak)
  state = addXp(state, xpGain)
  escalation = deescalateOnComplete(escalation, state.settings.maxInterval)
  saveState(state)
  hideOverlay()
  updateStats(state)
  updateCharacterMood(state)

  if (state.progress.level > prevLevel) {
    showLevelUp(state.progress.level)
  }
  timer.scheduleNext()
}

function handleSnooze(minutes: number): void {
  stopTitleFlash()
  snoozeCount++
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
  updateCharacterMood(state)
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
  updateCharacterMood(state)
}
