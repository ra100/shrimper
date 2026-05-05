import { ACHIEVEMENT_META, ACHIEVEMENT_ORDER } from './achievements'
import { APP_VERSION, renderChangelogModal } from './changelog'
import { renderShrimp, updateShrimp } from './characters/shrimp'
import { getDailyChallengeState, getTodayChallenge } from './daily-challenge'
import { type DailySnapshot, getHistory } from './history'
import { getPermissionState } from './notifications'
import { getPerkUsability, PERK_META, PERK_ORDER, PERK_TOKEN_CAP, type PerkId } from './perks'
import { getNextActiveTime } from './schedule'
import type { ShrimperState } from './state'
import { getThought } from './thoughts'
import { getApproxTimeRemaining, type ReminderTimer } from './timer'
import { getQuipForTip, type Tip } from './tips'

let countdownInterval: ReturnType<typeof setInterval> | null = null
let thoughtInterval: ReturnType<typeof setInterval> | null = null
let bubbleTimeout: ReturnType<typeof setTimeout> | null = null
const THOUGHT_INTERVAL_MS = 60_000

function scheduleBubble(): void {
  if (bubbleTimeout) clearTimeout(bubbleTimeout)
  const delay = 1500 + Math.random() * 3500
  bubbleTimeout = setTimeout(() => {
    spawnBubble()
    scheduleBubble()
  }, delay)
}

function spawnBubble(): void {
  const layer = document.getElementById('bubble-layer')
  if (!layer) return
  const b = document.createElement('span')
  b.className = 'bubble'
  const size = 6 + Math.random() * 10
  const x = 10 + Math.random() * 80
  const drift = (Math.random() - 0.5) * 24
  const dur = 3 + Math.random() * 2
  b.style.setProperty('--size', `${size}px`)
  b.style.setProperty('--x', `${x}%`)
  b.style.setProperty('--drift', `${drift}px`)
  b.style.setProperty('--dur', `${dur}s`)
  layer.appendChild(b)
  setTimeout(() => b.remove(), dur * 1000 + 50)
}

function escapeText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function showThought(state: ShrimperState, force = false): void {
  const bubble = document.getElementById('speech-bubble')
  if (!bubble) return
  const text = getThought(state.progress.condition, state.settings.shrimpName)
  if (!text) return
  if (!force && Math.random() > 0.6) return // ~60% chance per tick = natural pacing
  bubble.innerHTML = escapeText(text)
  bubble.classList.remove('visible')
  requestAnimationFrame(() => bubble.classList.add('visible'))
}

export function showCustomThought(text: string): void {
  const bubble = document.getElementById('speech-bubble')
  if (!bubble) return
  bubble.innerHTML = escapeText(text)
  bubble.classList.remove('visible')
  requestAnimationFrame(() => bubble.classList.add('visible'))
}

function stopThoughts(): void {
  if (thoughtInterval) {
    clearInterval(thoughtInterval)
    thoughtInterval = null
  }
}

function startThoughts(state: ShrimperState): void {
  stopThoughts()
  thoughtInterval = setInterval(() => {
    const currentBubble = document.getElementById('speech-bubble')
    if (!currentBubble) {
      stopThoughts()
      return
    }
    showThought(state)
  }, THOUGHT_INTERVAL_MS)
}

function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing element #${id}`)
  return el as T
}

function qs<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector)
  if (!el) throw new Error(`Missing element ${selector}`)
  return el
}

function renderAchievementsGrid(state: ShrimperState): string {
  return `
    <div class="achievements-grid">
      ${ACHIEVEMENT_ORDER.map((id) => {
        const meta = ACHIEVEMENT_META[id]
        const unlockedAt = state.progress.achievements[id]
        if (unlockedAt) {
          return `
            <div class="achievement-tile unlocked" data-id="${id}">
              <span class="ach-icon">${meta.icon}</span>
              <span class="ach-name">${meta.name}</span>
              <span class="ach-date">${unlockedAt}</span>
            </div>
          `
        }
        if (meta.hidden) {
          return `
            <div class="achievement-tile locked hidden-achievement" data-id="${id}" title="Hidden achievement — discover how to unlock it">
              <span class="ach-icon">❓</span>
              <span class="ach-name">${meta.hint ?? '???'}</span>
            </div>
          `
        }
        return `
          <div class="achievement-tile locked" data-id="${id}">
            <span class="ach-icon">🔒</span>
            <span class="ach-name">${meta.name}</span>
          </div>
        `
      }).join('')}
    </div>
  `
}

function renderDailyChallengeCard(): string {
  const challenge = getTodayChallenge()
  const cs = getDailyChallengeState()
  const completedCls = cs.completed ? ' challenge-complete' : ''
  let action = ''
  if (cs.completed && !cs.claimed) {
    action =
      '<button class="btn btn-small btn-challenge-claim" id="btn-claim-challenge">Claim reward!</button>'
  } else if (cs.claimed) {
    action = '<span class="challenge-claimed">Claimed!</span>'
  }
  return `
    <div class="daily-challenge${completedCls}" id="daily-challenge">
      <div class="challenge-header">
        <span class="challenge-label">Daily Challenge</span>
        <span class="challenge-emoji">${challenge.emoji}</span>
      </div>
      <div class="challenge-text">${escapeText(challenge.text)}</div>
      ${action}
    </div>
  `
}

export function updateDailyChallenge(onClaim: () => void): void {
  const container = document.getElementById('daily-challenge')
  if (!container) return
  const wrapper = container.parentElement
  if (!wrapper) return
  // Re-render the card in place
  const tmp = document.createElement('div')
  tmp.innerHTML = renderDailyChallengeCard()
  const newCard = tmp.firstElementChild as HTMLElement
  if (!newCard) return
  container.replaceWith(newCard)
  const claimBtn = newCard.querySelector<HTMLButtonElement>('#btn-claim-challenge')
  if (claimBtn) claimBtn.addEventListener('click', onClaim)
}

export function renderDashboard(
  state: ShrimperState,
  timer: ReminderTimer,
  handlers: {
    onOpenSettings: () => void
    onEnableNotifications: () => void
    onTogglePause: () => void
    onOpenPerks: () => void
    onOpenStats: () => void
    onClaimChallenge: () => void
  },
): void {
  const app = qs<HTMLDivElement>('#app')
  const condition = state.progress.condition

  const notifPerm = getPermissionState()
  const showBanner = notifPerm !== 'granted' && notifPerm !== 'unsupported'

  const tokens = state.progress.perkTokens
  app.innerHTML = `
    <div class="dashboard">
      <button class="settings-btn" id="settings-btn" aria-label="Settings">⚙️</button>
      <button class="stats-btn" id="stats-btn" aria-label="Weekly Stats">📈</button>
      <button class="perks-btn" id="perks-btn" aria-label="Perks">
        <span class="perks-btn-icon">🎟️</span>
        <span class="perks-btn-count">${tokens}/${PERK_TOKEN_CAP}</span>
      </button>

      ${
        showBanner
          ? `
        <div class="notification-banner ${notifPerm === 'denied' ? 'banner-denied' : 'banner-prompt'}" id="notification-banner">
          ${
            notifPerm === 'denied'
              ? '🔕 Notifications blocked — enable in browser settings for reminders outside this tab'
              : '<button class="btn-enable-notif" id="btn-enable-notif">🔔 Enable notifications to get reminders in other apps</button>'
          }
        </div>
      `
          : ''
      }

      <div class="character-area">
        <div class="speech-bubble" id="speech-bubble"></div>
        <div class="shrimp-stage">
          <div class="bubble-layer" id="bubble-layer" aria-hidden="true"></div>
          <div class="shrimp-character" id="shrimp-character">
            ${renderShrimp()}
          </div>
        </div>
        <div class="shrimp-name" id="shrimp-name">${escapeText(state.settings.shrimpName)}</div>
      </div>

      <div class="condition-section">
        <div class="condition-bar-container">
          <div class="condition-bar" style="width: ${condition}%"></div>
        </div>
        <div class="condition-label">Posture ${condition}%</div>
      </div>

      ${renderDailyChallengeCard()}

      <div class="stats" id="stats">
        <div class="stat">
          <span class="stat-value" id="stat-today">${state.progress.completionsToday}</span>
          <span class="stat-label">Today</span>
        </div>
        <div class="stat${state.activePerks.streakShieldHeld ? ' streak-shielded' : ''}" id="stat-streak-container">
          <span class="stat-value" id="stat-streak">${state.progress.streak}${state.activePerks.streakShieldHeld ? ' <span class="streak-shield-icon" aria-label="Streak shield active">🛡️</span>' : ''}</span>
          <span class="stat-label">Streak</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="stat-total">${state.progress.totalCompletions}</span>
          <span class="stat-label">Total</span>
        </div>
      </div>

      <div id="achievements-container">
        ${renderAchievementsGrid(state)}
      </div>

      <div class="next-reminder" id="next-reminder">
        <span id="countdown">${state.settings.paused ? '⏸ Paused' : 'starting...'}</span>
        <button class="btn-pause" id="btn-pause">${state.settings.paused ? '▶ Resume' : '⏸ Pause'}</button>
      </div>
    </div>
  `

  const shrimpEl = document.getElementById('shrimp-character')
  if (shrimpEl) updateShrimp(shrimpEl, condition)

  byId('settings-btn').addEventListener('click', handlers.onOpenSettings)
  byId('stats-btn').addEventListener('click', handlers.onOpenStats)
  byId('perks-btn').addEventListener('click', handlers.onOpenPerks)
  byId('btn-pause').addEventListener('click', handlers.onTogglePause)

  const enableBtn = document.getElementById('btn-enable-notif')
  if (enableBtn) {
    enableBtn.addEventListener('click', handlers.onEnableNotifications)
  }

  const claimBtn = document.getElementById('btn-claim-challenge')
  if (claimBtn) {
    claimBtn.addEventListener('click', handlers.onClaimChallenge)
  }

  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    const el = document.getElementById('countdown')
    if (el && timer.isRunning()) el.textContent = getApproxTimeRemaining(timer.getNextFireTime())
  }, 5000)

  setTimeout(() => {
    const el = document.getElementById('countdown')
    if (el && timer.isRunning()) el.textContent = getApproxTimeRemaining(timer.getNextFireTime())
  }, 100)

  setTimeout(() => showThought(state, true), 1200)
  startThoughts(state)
  scheduleBubble()
}

export function renderOverlay(
  tip: Tip,
  _state: ShrimperState,
  handlers: { onComplete: () => void; onSnooze: (minutes: number) => void; onDismiss: () => void },
): void {
  const existing = document.getElementById('reminder-overlay')
  if (existing) existing.remove()

  const overlay = document.createElement('div')
  overlay.id = 'reminder-overlay'
  overlay.className = 'overlay'
  overlay.innerHTML = `
    <div class="overlay-content">
      <div class="overlay-emoji">${tip.emoji}</div>
      <h2 class="overlay-tip">${tip.text}</h2>
      <p class="overlay-quip">${getQuipForTip(tip)}</p>

      <div class="overlay-actions">
        <button class="btn btn-primary" id="btn-complete">✅ Done!</button>
        <div class="snooze-group">
          <button class="btn btn-snooze" data-minutes="10">💤 10m</button>
          <button class="btn btn-snooze" data-minutes="30">💤 30m</button>
          <button class="btn btn-snooze" data-minutes="60">💤 1hr</button>
        </div>
        <button class="btn btn-dismiss" id="btn-dismiss">Dismiss</button>
      </div>
    </div>
  `

  document.body.appendChild(overlay)

  byId('btn-complete').addEventListener('click', handlers.onComplete)
  byId('btn-dismiss').addEventListener('click', handlers.onDismiss)
  overlay.querySelectorAll('.btn-snooze').forEach((btn) => {
    btn.addEventListener('click', () => {
      const minutes = parseInt((btn as HTMLElement).dataset.minutes || '10', 10)
      handlers.onSnooze(minutes)
    })
  })

  requestAnimationFrame(() => overlay.classList.add('visible'))
}

export function showUpdateBanner(newVersion: string, onReload: () => void): void {
  if (document.getElementById('update-banner')) return
  const banner = document.createElement('div')
  banner.id = 'update-banner'
  banner.className = 'update-banner'
  banner.innerHTML = `
    <span class="update-msg">🦐 v${escapeText(newVersion)} ready!</span>
    <button class="btn btn-primary btn-small" id="btn-reload">Reload</button>
    <button class="update-dismiss" id="btn-update-dismiss" aria-label="Dismiss">✕</button>
  `
  document.body.appendChild(banner)
  requestAnimationFrame(() => banner.classList.add('visible'))
  byId('btn-reload').addEventListener('click', onReload)
  byId('btn-update-dismiss').addEventListener('click', () => {
    banner.classList.remove('visible')
    setTimeout(() => banner.remove(), 300)
  })
}

export function hideOverlay(): void {
  const overlay = document.getElementById('reminder-overlay')
  if (overlay) {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
  }
}

export function updateStats(state: ShrimperState): void {
  const today = document.getElementById('stat-today')
  if (today) today.textContent = String(state.progress.completionsToday)

  const streak = document.getElementById('stat-streak')
  if (streak) {
    streak.innerHTML = state.activePerks.streakShieldHeld
      ? `${state.progress.streak} <span class="streak-shield-icon" aria-label="Streak shield active">🛡️</span>`
      : String(state.progress.streak)
  }

  const streakContainer = document.getElementById('stat-streak-container')
  if (streakContainer) {
    streakContainer.classList.toggle('streak-shielded', state.activePerks.streakShieldHeld)
  }

  const total = document.getElementById('stat-total')
  if (total) total.textContent = String(state.progress.totalCompletions)

  const bar = document.querySelector<HTMLDivElement>('.condition-bar')
  if (bar) bar.style.width = `${state.progress.condition}%`

  const label = document.querySelector('.condition-label')
  if (label) label.textContent = `Posture ${state.progress.condition}%`

  const grid = document.getElementById('achievements-container')
  if (grid) grid.innerHTML = renderAchievementsGrid(state)

  const tokenBadge = document.querySelector<HTMLElement>('.perks-btn-count')
  if (tokenBadge) tokenBadge.textContent = `${state.progress.perkTokens}/${PERK_TOKEN_CAP}`

  const shrimpEl = document.getElementById('shrimp-character')
  if (shrimpEl) updateShrimp(shrimpEl, state.progress.condition)
}

export function renderPerks(state: ShrimperState, onUse: (id: PerkId) => void): void {
  const existing = document.getElementById('perks-panel')
  if (existing) existing.remove()

  const tokens = state.progress.perkTokens
  const panel = document.createElement('div')
  panel.id = 'perks-panel'
  panel.className = 'overlay'
  panel.innerHTML = `
    <div class="overlay-content perks-content">
      <h2>🎟️ Perks</h2>
      <p class="perks-header">Tokens: <strong>${tokens}/${PERK_TOKEN_CAP}</strong> · earn 1 per 10 completions in a row</p>
      <div class="perks-grid">
        ${PERK_ORDER.map((id) => {
          const meta = PERK_META[id]
          const usability = getPerkUsability(state, id)
          const cls = usability.usable ? 'perk-card usable' : 'perk-card disabled'
          const reason = usability.usable
            ? ''
            : `<span class="perk-reason">${escapeText(usability.reason ?? '')}</span>`
          return `
            <div class="${cls}" data-id="${id}">
              <div class="perk-icon">${meta.icon}</div>
              <div class="perk-body">
                <div class="perk-name">${meta.name}</div>
                <div class="perk-blurb">${meta.blurb}</div>
                ${reason}
              </div>
              <button class="btn btn-small btn-perk-use" data-id="${id}" ${usability.usable ? '' : 'disabled'}>Use</button>
            </div>
          `
        }).join('')}
      </div>
      <div class="overlay-actions">
        <button class="btn btn-dismiss" id="btn-close-perks">Close</button>
      </div>
    </div>
  `
  document.body.appendChild(panel)
  requestAnimationFrame(() => panel.classList.add('visible'))

  panel.querySelectorAll<HTMLButtonElement>('.btn-perk-use').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id as PerkId | undefined
      if (!id) return
      onUse(id)
      hidePerks()
    })
  })
  byId('btn-close-perks').addEventListener('click', () => hidePerks())
  panel.addEventListener('click', (e) => {
    if (e.target === panel) hidePerks()
  })
}

function hidePerks(): void {
  const panel = document.getElementById('perks-panel')
  if (panel) {
    panel.classList.remove('visible')
    setTimeout(() => panel.remove(), 300)
  }
}

export function renderSettings(
  state: ShrimperState,
  onSave: (settings: {
    min: number
    max: number
    shrimpName: string
    pauseOnLock: boolean
    schedule: import('./state').WorkSchedule
  }) => void,
  onReset: () => void,
  onTestNotification: () => void,
): void {
  const idleSupported =
    typeof window !== 'undefined' &&
    typeof (window as unknown as { IdleDetector?: unknown }).IdleDetector === 'function'
  const existing = document.getElementById('settings-panel')
  if (existing) existing.remove()

  const panel = document.createElement('div')
  panel.id = 'settings-panel'
  panel.className = 'overlay'
  panel.innerHTML = `
    <div class="overlay-content settings-content">
      <h2>Settings</h2>

      <div class="setting-group">
        <label for="name-input">Shrimp's name</label>
        <input type="text" id="name-input" maxlength="24" value="${escapeText(state.settings.shrimpName)}" class="text-input">
      </div>

      <div class="setting-group">
        <label>Min interval: <span id="min-val">${state.settings.minInterval}</span> min</label>
        <input type="range" id="min-slider" min="1" max="60" value="${state.settings.minInterval}">
      </div>

      <div class="setting-group">
        <label>Max interval: <span id="max-val">${state.settings.maxInterval}</span> min</label>
        <input type="range" id="max-slider" min="5" max="120" value="${state.settings.maxInterval}">
      </div>

      ${
        idleSupported
          ? `<div class="setting-group">
        <label class="checkbox-label">
          <input type="checkbox" id="pause-on-lock" ${state.settings.pauseOnLock ? 'checked' : ''}>
          Pause reminders while screen is locked
        </label>
        <p class="setting-hint">Uses Chrome's Idle Detection API — asks permission on enable.</p>
      </div>`
          : `<div class="setting-group">
        <label class="checkbox-label checkbox-disabled">
          <input type="checkbox" disabled>
          Pause reminders while screen is locked
        </label>
        <p class="setting-hint">Not supported in this browser (Chrome/Edge only).</p>
      </div>`
      }

      <details class="setting-group schedule-section" ${state.settings.schedule.enabled ? 'open' : ''}>
        <summary class="schedule-summary">
          <span>Work Schedule</span>
          <label class="checkbox-label schedule-toggle" onclick="event.stopPropagation()">
            <input type="checkbox" id="schedule-enabled" ${state.settings.schedule.enabled ? 'checked' : ''}>
            Enable
          </label>
        </summary>
        <div class="schedule-body">
          <div class="schedule-days">
            ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              .map(
                (day, i) =>
                  `<button type="button" class="day-btn ${state.settings.schedule.days[i] ? 'day-active' : ''}" data-day="${i}">${day}</button>`,
              )
              .join('')}
          </div>
          <div class="schedule-blocks">
            <div class="schedule-block">
              <span class="block-label">Morning</span>
              <input type="time" id="block1-start" value="${state.settings.schedule.block1Start}">
              <span class="block-sep">—</span>
              <input type="time" id="block1-end" value="${state.settings.schedule.block1End}">
            </div>
            <div class="schedule-block">
              <span class="block-label">Afternoon</span>
              <input type="time" id="block2-start" value="${state.settings.schedule.block2Start}">
              <span class="block-sep">—</span>
              <input type="time" id="block2-end" value="${state.settings.schedule.block2End}">
            </div>
          </div>
          <p class="setting-hint">Reminders only fire during these hours. Outside schedule, ${escapeText(state.settings.shrimpName)} naps — no penalty.</p>
        </div>
      </details>

      <div class="overlay-actions">
        <button class="btn btn-primary" id="btn-save-settings">Save</button>
        <button class="btn btn-dismiss" id="btn-cancel-settings">Cancel</button>
      </div>

      <hr class="settings-divider">
      <button class="btn btn-secondary" id="btn-test-notif">🔔 Send test notification</button>
      <details class="notif-help">
        <summary>Notifications not showing?</summary>
        <div class="notif-help-body">
          <p><strong>1. Turn off Focus / Do Not Disturb</strong> (most common!) — macOS menu bar → Control Centre → <em>Focus</em>. Windows: taskbar → bell icon → <em>Focus assist</em>. Focus silently swallows notifications.</p>
          <p><strong>2. Browser permission</strong>: click the lock/info icon in the address bar → Site settings → Notifications → <em>Allow</em>. Then reload.</p>
          <p><strong>3. macOS</strong>: System Settings → Notifications → find your browser → enable <em>Allow notifications</em>. Set <em>Alert Style</em> to <strong>Persistent</strong> (not Temporary) — otherwise banners auto-hide in ~5 seconds.</p>
          <p><strong>4. Windows</strong>: Settings → System → Notifications → turn on notifications, then scroll to your browser and enable it.</p>
          <p><em>Safari</em> users: notifications only work on HTTPS and when the site is added as a web app (Share → Add to Dock).</p>
        </div>
      </details>
      <hr class="settings-divider">
      <button class="btn btn-danger" id="btn-reset">Reset All Progress</button>

      <div class="settings-footer">
        <button type="button" class="version-link" id="btn-changelog" title="View changelog">v${APP_VERSION}</button>
      </div>
    </div>
  `

  document.body.appendChild(panel)
  requestAnimationFrame(() => panel.classList.add('visible'))

  const minSlider = byId<HTMLInputElement>('min-slider')
  const maxSlider = byId<HTMLInputElement>('max-slider')
  const minVal = byId('min-val')
  const maxVal = byId('max-val')

  minSlider.addEventListener('input', () => {
    minVal.textContent = minSlider.value
    if (parseInt(minSlider.value, 10) > parseInt(maxSlider.value, 10)) {
      maxSlider.value = minSlider.value
      maxVal.textContent = minSlider.value
    }
  })

  maxSlider.addEventListener('input', () => {
    maxVal.textContent = maxSlider.value
    if (parseInt(maxSlider.value, 10) < parseInt(minSlider.value, 10)) {
      minSlider.value = maxSlider.value
      minVal.textContent = maxSlider.value
    }
  })

  // Day toggle buttons
  const dayBtns = panel.querySelectorAll<HTMLButtonElement>('.day-btn')
  for (const btn of dayBtns) {
    btn.addEventListener('click', () => btn.classList.toggle('day-active'))
  }

  const nameInput = byId<HTMLInputElement>('name-input')
  byId('btn-save-settings').addEventListener('click', () => {
    const name = nameInput.value.trim() || state.settings.shrimpName
    const pauseOnLockEl = document.getElementById('pause-on-lock') as HTMLInputElement | null
    const pauseOnLock = pauseOnLockEl ? pauseOnLockEl.checked : state.settings.pauseOnLock

    const scheduleEnabled = (document.getElementById('schedule-enabled') as HTMLInputElement)
      .checked
    const days = Array.from(dayBtns).map((b) => b.classList.contains('day-active')) as [
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
    ]
    const block1Start = (document.getElementById('block1-start') as HTMLInputElement).value
    const block1End = (document.getElementById('block1-end') as HTMLInputElement).value
    const block2Start = (document.getElementById('block2-start') as HTMLInputElement).value
    const block2End = (document.getElementById('block2-end') as HTMLInputElement).value

    onSave({
      min: parseInt(minSlider.value, 10),
      max: parseInt(maxSlider.value, 10),
      shrimpName: name,
      pauseOnLock,
      schedule: {
        enabled: scheduleEnabled,
        days,
        block1Start,
        block1End,
        block2Start,
        block2End,
      },
    })
  })

  byId('btn-cancel-settings').addEventListener('click', () => hideSettings())

  byId('btn-test-notif').addEventListener('click', () => onTestNotification())

  byId('btn-changelog').addEventListener('click', () => renderChangelogModal())

  byId('btn-reset').addEventListener('click', () => {
    if (
      confirm(
        'Reset all progress? Your condition, streak, and achievements will be lost. This cannot be undone.',
      )
    ) {
      onReset()
    }
  })
}

export function updatePauseButton(paused: boolean): void {
  const btn = document.getElementById('btn-pause')
  if (btn) btn.textContent = paused ? '▶ Resume' : '⏸ Pause'
  const countdown = document.getElementById('countdown')
  if (countdown && paused) countdown.textContent = '⏸ Paused'
}

export function updateNapState(state: ShrimperState, isActive: boolean, onWake?: () => void): void {
  const napOverlay = document.getElementById('nap-overlay')
  const nextReminder = document.getElementById('next-reminder')

  if (isActive) {
    if (napOverlay) napOverlay.remove()
    if (nextReminder) nextReminder.style.display = ''
    return
  }

  // Show nap state
  if (nextReminder) nextReminder.style.display = 'none'

  if (!napOverlay) {
    const dashboard = document.querySelector('.dashboard')
    if (!dashboard) return

    const next = getNextActiveTime(state.settings.schedule)
    const timeStr = next
      ? next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'later'

    const el = document.createElement('div')
    el.id = 'nap-overlay'
    el.className = 'nap-overlay'
    el.innerHTML = `
      <div class="nap-message">
        <span class="nap-icon">💤</span>
        <span class="nap-text">${escapeText(state.settings.shrimpName)} is napping — back at ${timeStr}</span>
      </div>
      <button class="btn btn-wake" id="btn-wake">☀️ Wake ${escapeText(state.settings.shrimpName)}</button>
    `
    dashboard.appendChild(el)

    if (onWake) {
      const btn = document.getElementById('btn-wake')
      if (btn) btn.addEventListener('click', onWake)
    }
  }
}

export function hideSettings(): void {
  const panel = document.getElementById('settings-panel')
  if (panel) {
    panel.classList.remove('visible')
    setTimeout(() => panel.remove(), 300)
  }
}

export function renderOnboarding(
  onComplete: (min: number, max: number, shrimpName: string) => void,
): void {
  const app = qs<HTMLDivElement>('#app')
  app.innerHTML = `
    <div class="onboarding">
      <div class="onboarding-character" id="onboarding-character">${renderShrimp()}</div>
      <h1>Welcome to Shrimper!</h1>
      <p>I'll remind you to sit straight, stretch, and take breaks.<br>Help me straighten up — your care shows in my posture!</p>

      <div class="onboarding-settings">
        <div class="setting-group">
          <label for="onboard-name">What should we call your shrimp?</label>
          <input type="text" id="onboard-name" class="text-input" placeholder="Kevin" maxlength="24" value="Kevin">
        </div>

        <div class="setting-group">
          <label>Remind me every <span id="onboard-min-val">15</span> to <span id="onboard-max-val">45</span> minutes</label>
          <div class="range-pair">
            <input type="range" id="onboard-min" min="1" max="60" value="15">
            <input type="range" id="onboard-max" min="5" max="120" value="45">
          </div>
        </div>
      </div>

      <button class="btn btn-primary btn-large" id="btn-start">Let's Go! 🦐</button>
    </div>
  `

  const onboardChar = document.getElementById('onboarding-character')
  if (onboardChar) updateShrimp(onboardChar, 80)

  const minSlider = byId<HTMLInputElement>('onboard-min')
  const maxSlider = byId<HTMLInputElement>('onboard-max')
  const minVal = byId('onboard-min-val')
  const maxVal = byId('onboard-max-val')

  minSlider.addEventListener('input', () => {
    minVal.textContent = minSlider.value
    if (parseInt(minSlider.value, 10) > parseInt(maxSlider.value, 10)) {
      maxSlider.value = minSlider.value
      maxVal.textContent = minSlider.value
    }
  })

  maxSlider.addEventListener('input', () => {
    maxVal.textContent = maxSlider.value
    if (parseInt(maxSlider.value, 10) < parseInt(minSlider.value, 10)) {
      minSlider.value = maxSlider.value
      minVal.textContent = maxSlider.value
    }
  })

  const nameInput = byId<HTMLInputElement>('onboard-name')
  byId('btn-start').addEventListener('click', () => {
    const name = nameInput.value.trim() || 'Kevin'
    onComplete(parseInt(minSlider.value, 10), parseInt(maxSlider.value, 10), name)
  })
}

function dayAbbrev(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
}

function buildBarHtml(snapshots: DailySnapshot[], maxCompletions: number): string {
  return snapshots
    .map((snap) => {
      const pct = maxCompletions > 0 ? Math.round((snap.completions / maxCompletions) * 100) : 0
      // Minimum visible bar of 4px when there are completions
      const height = snap.completions > 0 ? `max(4px, ${pct}%)` : '0%'
      // Opacity scales with condition: 30% base + up to 70% proportional
      const opacity = 0.3 + (snap.condition / 100) * 0.7
      return `
        <div class="stats-bar">
          <div class="stats-bar-fill" style="height: ${height}; opacity: ${opacity}"></div>
          <span class="stats-bar-label">${dayAbbrev(snap.date)}</span>
        </div>
      `
    })
    .join('')
}

export function renderStats(): void {
  const existing = document.getElementById('stats-panel')
  if (existing) existing.remove()

  const week = getHistory(7)
  const maxCompletions = Math.max(1, ...week.map((s) => s.completions))

  // Summary calculations
  const totalWeek = week.reduce((sum, s) => sum + s.completions, 0)
  const daysWithCondition = week.filter((s) => s.completions > 0 || s.condition > 0)
  const avgCondition =
    daysWithCondition.length > 0
      ? Math.round(
          daysWithCondition.reduce((sum, s) => sum + s.condition, 0) / daysWithCondition.length,
        )
      : 0

  let bestDay = week[0]
  for (const snap of week) {
    if (snap.completions > bestDay.completions) bestDay = snap
  }

  const panel = document.createElement('div')
  panel.id = 'stats-panel'
  panel.className = 'overlay'
  panel.innerHTML = `
    <div class="overlay-content stats-content">
      <h2>Weekly Stats</h2>
      <div class="stats-chart">
        ${buildBarHtml(week, maxCompletions)}
      </div>
      <div class="stats-summary">
        <span>Best: ${bestDay.completions} (${dayAbbrev(bestDay.date)})</span>
        <span>Week: ${totalWeek}</span>
        <span>Avg: ${avgCondition}%</span>
      </div>
      <div class="overlay-actions">
        <button class="btn btn-dismiss" id="btn-close-stats">Close</button>
      </div>
    </div>
  `

  document.body.appendChild(panel)
  requestAnimationFrame(() => panel.classList.add('visible'))

  byId('btn-close-stats').addEventListener('click', () => hideStats())
  panel.addEventListener('click', (e) => {
    if (e.target === panel) hideStats()
  })
}

function hideStats(): void {
  const panel = document.getElementById('stats-panel')
  if (panel) {
    panel.classList.remove('visible')
    setTimeout(() => panel.remove(), 300)
  }
}
