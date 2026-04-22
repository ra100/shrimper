import type { AchievementId } from './state'

export const ACHIEVEMENT_META: Record<
  AchievementId,
  { name: string; icon: string; hidden?: boolean; hint?: string }
> = {
  firstStretch: { name: 'First Stretch', icon: '🌱' },
  threeInRow: { name: 'Triple Threat', icon: '🎯' },
  streak7: { name: 'Weekly Warrior', icon: '📅' },
  streak30: { name: 'Monthly Master', icon: '🏅' },
  total100: { name: 'Century Shrimp', icon: '💯' },
  peakCondition: { name: 'Peak Posture', icon: '👑' },
  nightOwl: { name: 'Night Owl', icon: '🦉', hidden: true, hint: '???' },
  earlyBird: { name: 'Early Bird', icon: '🐦', hidden: true, hint: '???' },
  comebackKid: { name: 'Comeback Kid', icon: '🧗', hidden: true, hint: '???' },
  speedShrimp: { name: 'Speed Shrimp', icon: '⚡', hidden: true, hint: '???' },
}

export const ACHIEVEMENT_ORDER: AchievementId[] = [
  'firstStretch',
  'threeInRow',
  'streak7',
  'streak30',
  'total100',
  'peakCondition',
  'nightOwl',
  'earlyBird',
  'comebackKid',
  'speedShrimp',
]

const CONFETTI_COLORS = ['#e8734a', '#ffc857', '#4caf50', '#42a5f5', '#ab47bc', '#ef5350']
const CONFETTI_COUNT = 30
const DISMISS_MS = 2500

type QueuedId = AchievementId | string
const queue: QueuedId[] = []
let playing = false

export function celebrate(ids: string[]): void {
  for (const id of ids) queue.push(id)
  if (!playing) playNext()
}

function playNext(): void {
  const id = queue.shift()
  if (!id) {
    playing = false
    return
  }
  playing = true
  const meta = ACHIEVEMENT_META[id as AchievementId] ?? { name: id, icon: '🏆' }

  const overlay = document.createElement('div')
  overlay.className = 'achievement-overlay'
  overlay.innerHTML = `
    <div class="achievement-card">
      <div class="ach-overlay-icon">${meta.icon}</div>
      <div class="ach-overlay-name">${meta.name}</div>
      <div class="ach-overlay-tag">Unlocked!</div>
    </div>
    <div class="confetti-layer"></div>
  `

  const confettiLayer = overlay.querySelector<HTMLDivElement>('.confetti-layer')
  if (confettiLayer) {
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const c = document.createElement('span')
      c.className = 'confetti'
      const x = (Math.random() - 0.5) * 400
      const delay = Math.random() * 0.4
      const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length]
      c.setAttribute('style', `--x: ${x}px; --delay: ${delay}s; background: ${color};`)
      confettiLayer.appendChild(c)
    }
  }

  document.body.appendChild(overlay)
  requestAnimationFrame(() => overlay.classList.add('visible'))

  let dismissed = false
  const dismiss = () => {
    if (dismissed) return
    dismissed = true
    overlay.classList.remove('visible')
    setTimeout(() => {
      overlay.remove()
      playNext()
    }, 300)
  }

  overlay.addEventListener('click', dismiss)
  setTimeout(dismiss, DISMISS_MS)
}
