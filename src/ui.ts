import { type ShrimperState, XP_THRESHOLDS } from './state'
import { type ReminderTimer, getApproxTimeRemaining } from './timer'
import { type Tip } from './tips'
import { renderShrimp, getMoodFromBehavior, type Stage } from './characters/shrimp'
import { getQuipForTip } from './tips'

function getLevelName(level: number): string {
  const names = ['Sad Shrimp', 'Waking Shrimp', 'Trying Shrimp', 'Strong Shrimp', 'Champion Shrimp']
  return names[Math.min(level - 1, names.length - 1)]
}

function getXpProgress(xp: number, level: number): { current: number; needed: number; percent: number } {
  const currentThreshold = XP_THRESHOLDS[level - 1] || 0
  const nextThreshold = XP_THRESHOLDS[level] || XP_THRESHOLDS[XP_THRESHOLDS.length - 1]
  const current = xp - currentThreshold
  const needed = nextThreshold - currentThreshold
  const percent = needed > 0 ? Math.min((current / needed) * 100, 100) : 100
  return { current, needed, percent }
}

let countdownInterval: ReturnType<typeof setInterval> | null = null

export function renderDashboard(
  state: ShrimperState,
  timer: ReminderTimer,
  handlers: { onOpenSettings: () => void },
): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  const { percent } = getXpProgress(state.progress.xp, state.progress.level)
  const mood = getMoodFromBehavior(state.progress.consecutiveIgnored)
  const stage = Math.min(state.progress.level, 5) as Stage
  const shrimpSvg = renderShrimp(stage, mood)

  app.innerHTML = `
    <div class="dashboard">
      <button class="settings-btn" id="settings-btn" aria-label="Settings">⚙️</button>

      <div class="character-area">
        <div class="shrimp-character" id="shrimp-character">
          ${shrimpSvg}
        </div>
        <div class="level-label">${getLevelName(state.progress.level)}</div>
      </div>

      <div class="xp-section">
        <div class="xp-bar-container">
          <div class="xp-bar" style="width: ${percent}%"></div>
        </div>
        <div class="xp-label">Level ${state.progress.level} — ${state.progress.xp} XP</div>
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
          <span class="stat-value" id="stat-total">${state.progress.xp}</span>
          <span class="stat-label">Total XP</span>
        </div>
      </div>

      <div class="next-reminder" id="next-reminder">
        Next reminder: <span id="countdown">starting...</span>
      </div>
    </div>
  `

  document.getElementById('settings-btn')!.addEventListener('click', handlers.onOpenSettings)

  // Update countdown periodically
  if (countdownInterval) clearInterval(countdownInterval)
  countdownInterval = setInterval(() => {
    const el = document.getElementById('countdown')
    if (el && timer.isRunning()) {
      el.textContent = getApproxTimeRemaining(timer.getNextFireTime())
    }
  }, 5000)

  // Initial countdown update
  setTimeout(() => {
    const el = document.getElementById('countdown')
    if (el && timer.isRunning()) {
      el.textContent = getApproxTimeRemaining(timer.getNextFireTime())
    }
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

  document.getElementById('btn-complete')!.addEventListener('click', handlers.onComplete)
  document.getElementById('btn-dismiss')!.addEventListener('click', handlers.onDismiss)
  overlay.querySelectorAll('.btn-snooze').forEach(btn => {
    btn.addEventListener('click', () => {
      const minutes = parseInt((btn as HTMLElement).dataset.minutes || '10')
      handlers.onSnooze(minutes)
    })
  })

  // Animate in
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
  const { percent } = getXpProgress(state.progress.xp, state.progress.level)

  const today = document.getElementById('stat-today')
  if (today) today.textContent = String(state.progress.completionsToday)

  const streak = document.getElementById('stat-streak')
  if (streak) streak.textContent = String(state.progress.streak)

  const total = document.getElementById('stat-total')
  if (total) total.textContent = String(state.progress.xp)

  const xpBar = document.querySelector<HTMLDivElement>('.xp-bar')
  if (xpBar) xpBar.style.width = `${percent}%`

  const xpLabel = document.querySelector('.xp-label')
  if (xpLabel) xpLabel.textContent = `Level ${state.progress.level} — ${state.progress.xp} XP`

  const levelLabel = document.querySelector('.level-label')
  if (levelLabel) levelLabel.textContent = getLevelName(state.progress.level)
}

export function updateCharacterMood(state: ShrimperState): void {
  const character = document.getElementById('shrimp-character')
  if (character) {
    const mood = getMoodFromBehavior(state.progress.consecutiveIgnored)
    const stage = Math.min(state.progress.level, 5) as Stage
    character.innerHTML = renderShrimp(stage, mood)
  }
}

export function showLevelUp(level: number): void {
  const levelName = getLevelName(level)
  const stage = Math.min(level, 5) as Stage
  const shrimpSvg = renderShrimp(stage, 'happy')

  const overlay = document.createElement('div')
  overlay.id = 'levelup-overlay'
  overlay.className = 'overlay levelup-overlay'
  overlay.innerHTML = `
    <div class="overlay-content levelup-content">
      <div class="levelup-character">${shrimpSvg}</div>
      <h2 class="levelup-title">Level Up! 🎉</h2>
      <p class="levelup-name">${levelName}</p>
      <p class="levelup-message">Your shrimp evolved!</p>
      <button class="btn btn-primary" id="btn-levelup-close">Amazing!</button>
    </div>
  `

  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('visible'))

  document.getElementById('btn-levelup-close')!.addEventListener('click', () => {
    overlay.classList.remove('visible')
    setTimeout(() => overlay.remove(), 300)
  })
}

export function renderSettings(
  state: ShrimperState,
  onSave: (min: number, max: number) => void,
  onReset: () => void,
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
      <button class="btn btn-danger" id="btn-reset">Reset All Progress</button>
    </div>
  `

  document.body.appendChild(panel)
  requestAnimationFrame(() => panel.classList.add('visible'))

  const minSlider = document.getElementById('min-slider') as HTMLInputElement
  const maxSlider = document.getElementById('max-slider') as HTMLInputElement
  const minVal = document.getElementById('min-val')!
  const maxVal = document.getElementById('max-val')!

  minSlider.addEventListener('input', () => {
    minVal.textContent = minSlider.value
    if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
      maxSlider.value = minSlider.value
      maxVal.textContent = minSlider.value
    }
  })

  maxSlider.addEventListener('input', () => {
    maxVal.textContent = maxSlider.value
    if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
      minSlider.value = maxSlider.value
      minVal.textContent = maxSlider.value
    }
  })

  document.getElementById('btn-save-settings')!.addEventListener('click', () => {
    onSave(parseInt(minSlider.value), parseInt(maxSlider.value))
  })

  document.getElementById('btn-cancel-settings')!.addEventListener('click', () => hideSettings())

  document.getElementById('btn-reset')!.addEventListener('click', () => {
    if (confirm('Reset all progress? Your XP and level will be lost. This cannot be undone.')) {
      onReset()
    }
  })
}

export function hideSettings(): void {
  const panel = document.getElementById('settings-panel')
  if (panel) {
    panel.classList.remove('visible')
    setTimeout(() => panel.remove(), 300)
  }
}

export function renderOnboarding(onComplete: (min: number, max: number) => void): void {
  const app = document.querySelector<HTMLDivElement>('#app')!
  app.innerHTML = `
    <div class="onboarding">
      <div class="onboarding-character">${renderShrimp(1, 'happy')}</div>
      <h1>Welcome to Shrimper!</h1>
      <p>I'll remind you to sit straight, stretch, and take breaks.<br>Help me evolve from a sad shrimp to a champion!</p>

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

  const minSlider = document.getElementById('onboard-min') as HTMLInputElement
  const maxSlider = document.getElementById('onboard-max') as HTMLInputElement
  const minVal = document.getElementById('onboard-min-val')!
  const maxVal = document.getElementById('onboard-max-val')!

  minSlider.addEventListener('input', () => {
    minVal.textContent = minSlider.value
    if (parseInt(minSlider.value) > parseInt(maxSlider.value)) {
      maxSlider.value = minSlider.value
      maxVal.textContent = minSlider.value
    }
  })

  maxSlider.addEventListener('input', () => {
    maxVal.textContent = maxSlider.value
    if (parseInt(maxSlider.value) < parseInt(minSlider.value)) {
      minSlider.value = maxSlider.value
      minVal.textContent = maxSlider.value
    }
  })

  document.getElementById('btn-start')!.addEventListener('click', () => {
    onComplete(parseInt(minSlider.value), parseInt(maxSlider.value))
  })
}
