export interface Tip {
  id: string
  text: string
  emoji: string
}

const TIPS: Tip[] = [
  { id: 'sit-straight', text: 'Sit up straight', emoji: '🪑' },
  { id: 'shoulders', text: 'Pull your shoulders back', emoji: '💪' },
  { id: 'neck', text: "Don't push your neck forward", emoji: '🦒' },
  { id: 'stretch', text: 'Stand up and stretch', emoji: '🙆' },
  { id: 'eyes', text: 'Look away from screen (20-20-20)', emoji: '👀' },
  { id: 'walk', text: 'Take a short walk', emoji: '🚶' },
  { id: 'water', text: 'Drink some water', emoji: '💧' },
  { id: 'monitor', text: 'Check your monitor height', emoji: '🖥️' },
  { id: 'jaw', text: 'Unclench your jaw', emoji: '😌' },
  { id: 'hands', text: 'Relax your hands and wrists', emoji: '🤲' },
]

let lastTipId: string | null = null

export function getRandomTip(): Tip {
  const available = TIPS.filter(t => t.id !== lastTipId)
  const tip = available[Math.floor(Math.random() * available.length)]
  lastTipId = tip.id
  return tip
}

export function getAllTips(): Tip[] {
  return [...TIPS]
}
