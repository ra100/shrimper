export interface Tip {
  id: string
  text: string
  emoji: string
  quips: string[]
}

const TIPS: Tip[] = [
  {
    id: 'sit-straight',
    text: 'Sit up straight',
    emoji: '🪑',
    quips: [
      "Don't be a shrimp!",
      'Your spine called — it wants attention!',
      'Channel your inner Champion Shrimp!',
    ],
  },
  {
    id: 'shoulders',
    text: 'Pull your shoulders back',
    emoji: '💪',
    quips: [
      'Shoulders back, chest out!',
      'Your shoulders are creeping up again!',
      'Drop those shoulders, friend!',
    ],
  },
  {
    id: 'neck',
    text: "Don't push your neck forward",
    emoji: '🦒',
    quips: ["You're not a turtle!", 'Neck check!', 'Pull that head back!'],
  },
  {
    id: 'stretch',
    text: 'Stand up and stretch',
    emoji: '🙆',
    quips: ['Time to unfurl!', 'Even shrimps need to stretch!', 'Touch the sky!'],
  },
  {
    id: 'eyes',
    text: 'Look away from screen (20-20-20)',
    emoji: '👀',
    quips: ['Give your eyes a vacation!', 'Look at something 20 feet away!', 'Screen break time!'],
  },
  {
    id: 'walk',
    text: 'Take a short walk',
    emoji: '🚶',
    quips: [
      'Adventure awaits (in the hallway)!',
      'Legs were made for walking!',
      'Even a tiny walk counts!',
    ],
  },
  {
    id: 'water',
    text: 'Drink some water',
    emoji: '💧',
    quips: ['Hydration station!', 'Your body is thirsty!', 'Water break!'],
  },
  {
    id: 'monitor',
    text: 'Check your monitor height',
    emoji: '🖥️',
    quips: ['Eyes level with the top edge!', 'Is your screen too low?', 'Monitor check!'],
  },
  {
    id: 'jaw',
    text: 'Unclench your jaw',
    emoji: '😌',
    quips: ['Release that tension!', 'Jaw check — let it relax!', 'Stop grinding, start vibing!'],
  },
  {
    id: 'hands',
    text: 'Relax your hands and wrists',
    emoji: '🤲',
    quips: ['Shake out those hands!', 'Wrist check!', 'Let your fingers breathe!'],
  },
]

let lastTipId: string | null = null

export function getRandomTip(): Tip {
  const available = TIPS.filter((t) => t.id !== lastTipId)
  const tip = available[Math.floor(Math.random() * available.length)]
  lastTipId = tip.id
  return tip
}

export function getQuipForTip(tip: Tip): string {
  return tip.quips[Math.floor(Math.random() * tip.quips.length)]
}

export function getTipById(id: string): Tip | null {
  return TIPS.find((t) => t.id === id) ?? null
}
