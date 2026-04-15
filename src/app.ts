import { loadState, saveState, isFirstRun, addXp, recordIgnored, getXpForCompletion, resetProgress, type ShrimperState } from './state'
import { createTimer, type ReminderTimer } from './timer'
import { createEscalation, escalateOnIgnore, deescalateOnComplete, type EscalationState } from './escalation'
import { getRandomTip } from './tips'
import { renderDashboard, renderOverlay, renderOnboarding, renderSettings, hideOverlay, hideSettings, updateStats, updateCharacterMood } from './ui'
import { startTitleFlash, stopTitleFlash } from './tab-indicator'

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

function handleOnboardingComplete(minInterval: number, maxInterval: number): void {
  state.settings.minInterval = minInterval
  state.settings.maxInterval = maxInterval
  saveState(state)
  startDashboard()
}

function startDashboard(): void {
  escalation = createEscalation(state.settings.minInterval, state.settings.maxInterval)

  timer = createTimer(
    () => state.settings.minInterval,
    () => escalation.effectiveMax,
    handleReminder,
  )

  renderDashboard(state, timer, {
    onOpenSettings: () => renderSettings(state, handleSettingsChange, handleResetProgress),
  })

  timer.start()
}

function handleReminder(): void {
  snoozeCount = 0
  const tip = getRandomTip()

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
  const xpGain = getXpForCompletion(state.progress.streak)
  state = addXp(state, xpGain)
  escalation = deescalateOnComplete(escalation, state.settings.maxInterval)
  saveState(state)
  hideOverlay()
  updateStats(state)
  updateCharacterMood(state)
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
