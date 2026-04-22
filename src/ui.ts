import { ACHIEVEMENT_META, ACHIEVEMENT_ORDER } from './achievements'
import { renderShrimp, updateShrimp } from './characters/shrimp'
import { getPermissionState } from './notifications'
import type { ShrimperState } from './state'
import { getApproxTimeRemaining, type ReminderTimer } from './timer'
import { getQuipForTip, type Tip } from './tips'

let countdownInterval: ReturnType<typeof setInterval> | null = null

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

export function renderDashboard(
  state: ShrimperState,
  timer: ReminderTimer,
  handlers: {
    onOpenSettings: () => void
    onEnableNotifications: () => void
    onTogglePause: () => void
  },
): void {
  const app = qs<HTMLDivElement>('#app')
  const condition = state.progress.condition

  const notifPerm = getPermissionState()
  const showBanner = notifPerm !== 'granted' && notifPerm !== 'unsupported'

  app.innerHTML = `
    <div class="dashboard">
      <button class="settings-btn" id="settings-btn" aria-label="Settings">⚙️</button>

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
        <div class="shrimp-character" id="shrimp-character">
          ${renderShrimp()}
        </div>
      </div>

      <div class="condition-section">
        <div class="condition-bar-container">
          <div class="condition-bar" style="width: ${condition}%"></div>
        </div>
        <div class="condition-label">Posture ${condition}%</div>
      </div>

      <div class="stats" id="stats">
        <div class="stat">
          <span class="stat-value" id="stat-today">${state.progress.completionsToday}</span>
          <span class="stat-label">Today</span>
        </div>
        <div class="stat">
          <span class="stat-value" id="stat-streak">${state.progress.streak}</span>
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
  byId('btn-pause').addEventListener('click', handlers.onTogglePause)

  const enableBtn = document.getElementById('btn-enable-notif')
  if (enableBtn) {
    enableBtn.addEventListener('click', handlers.onEnableNotifications)
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
  if (streak) streak.textContent = String(state.progress.streak)

  const total = document.getElementById('stat-total')
  if (total) total.textContent = String(state.progress.totalCompletions)

  const bar = document.querySelector<HTMLDivElement>('.condition-bar')
  if (bar) bar.style.width = `${state.progress.condition}%`

  const label = document.querySelector('.condition-label')
  if (label) label.textContent = `Posture ${state.progress.condition}%`

  const grid = document.getElementById('achievements-container')
  if (grid) grid.innerHTML = renderAchievementsGrid(state)

  const shrimpEl = document.getElementById('shrimp-character')
  if (shrimpEl) updateShrimp(shrimpEl, state.progress.condition)
}

export function renderSettings(
  state: ShrimperState,
  onSave: (min: number, max: number) => void,
  onReset: () => void,
  onTestNotification: () => void,
): void {
  const existing = document.getElementById('settings-panel')
  if (existing) existing.remove()

  const panel = document.createElement('div')
  panel.id = 'settings-panel'
  panel.className = 'overlay'
  panel.innerHTML = `
    <div class="overlay-content settings-content">
      <h2>Settings</h2>

      <div class="setting-group">
        <label>Min interval: <span id="min-val">${state.settings.minInterval}</span> min</label>
        <input type="range" id="min-slider" min="1" max="60" value="${state.settings.minInterval}">
      </div>

      <div class="setting-group">
        <label>Max interval: <span id="max-val">${state.settings.maxInterval}</span> min</label>
        <input type="range" id="max-slider" min="5" max="120" value="${state.settings.maxInterval}">
      </div>

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

  byId('btn-save-settings').addEventListener('click', () => {
    onSave(parseInt(minSlider.value, 10), parseInt(maxSlider.value, 10))
  })

  byId('btn-cancel-settings').addEventListener('click', () => hideSettings())

  byId('btn-test-notif').addEventListener('click', () => onTestNotification())

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

export function hideSettings(): void {
  const panel = document.getElementById('settings-panel')
  if (panel) {
    panel.classList.remove('visible')
    setTimeout(() => panel.remove(), 300)
  }
}

export function renderOnboarding(onComplete: (min: number, max: number) => void): void {
  const app = qs<HTMLDivElement>('#app')
  app.innerHTML = `
    <div class="onboarding">
      <div class="onboarding-character" id="onboarding-character">${renderShrimp()}</div>
      <h1>Welcome to Shrimper!</h1>
      <p>I'll remind you to sit straight, stretch, and take breaks.<br>Help me straighten up — your care shows in my posture!</p>

      <div class="onboarding-settings">
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

  byId('btn-start').addEventListener('click', () => {
    onComplete(parseInt(minSlider.value, 10), parseInt(maxSlider.value, 10))
  })
}
