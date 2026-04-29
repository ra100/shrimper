type Mood = 'peak' | 'great' | 'ok' | 'low' | 'critical'

interface Thought {
  moods: Mood[]
  text: string // may contain {name}
  hours?: [number, number] // inclusive hour range, e.g. [6, 9]; supports wrap-around like [21, 4]
}

const THOUGHTS: Thought[] = [
  // Peak (90+)
  { moods: ['peak'], text: 'absolute unit 🦐' },
  { moods: ['peak'], text: 'feeling majestic today' },
  { moods: ['peak'], text: 'posture: flawless. vibes: immaculate.' },
  { moods: ['peak'], text: 'is this what enlightenment feels like?' },

  // Great (65-89)
  { moods: ['great', 'peak'], text: 'stretching is kinda addictive, not gonna lie' },
  { moods: ['great'], text: 'starting to feel limber' },
  { moods: ['great'], text: "we're doing great, {name}" },
  { moods: ['great'], text: 'spine: happy. soul: thriving.' },

  // OK (35-64)
  { moods: ['ok'], text: 'kinda neutral. could stretch.' },
  { moods: ['ok'], text: 'neither here nor there' },
  { moods: ['ok', 'great'], text: 'any stretches coming up?' },
  { moods: ['ok', 'low'], text: 'heyyy {name}... remember me?' },
  { moods: ['ok'], text: 'minding my own business (for now)' },

  // Low (15-34)
  { moods: ['low'], text: 'getting... curly...' },
  { moods: ['low'], text: 'bones? what bones?' },
  { moods: ['low', 'critical'], text: "i'm folding in on myself" },
  { moods: ['low'], text: 'losing shape fast here' },
  { moods: ['low'], text: 'help me help you, {name}' },

  // Critical (<15)
  { moods: ['critical'], text: 'send help. and posture.' },
  { moods: ['critical'], text: 'i am basically a pretzel now' },
  { moods: ['critical'], text: 'this is fine 🔥' },
  { moods: ['critical'], text: 'remember when i could stand up straight? good times.' },

  // Time-aware thoughts (match any mood)

  // Morning (6-9)
  { moods: ['peak', 'great', 'ok', 'low', 'critical'], hours: [6, 9], text: 'morning stretch? ☀️' },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [6, 9],
    text: "good morning, {name}! don't forget to sit up",
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [6, 9],
    text: 'coffee + posture = power combo ☕',
  },

  // Late morning (10-12)
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [10, 12],
    text: 'midmorning slump incoming...',
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [10, 12],
    text: 'stretch before lunch?',
  },

  // Afternoon (13-16)
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [13, 16],
    text: 'post-lunch slouch alert 🥱',
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [13, 16],
    text: "afternoon check: how's the posture?",
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [13, 16],
    text: 'halfway through the day, {name}!',
  },

  // Evening (17-20)
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [17, 20],
    text: 'still here? respect 💪',
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [17, 20],
    text: 'evening stretch hits different',
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [17, 20],
    text: 'wind-down stretch time',
  },

  // Night (21-4)
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [21, 4],
    text: 'late night {name} 🦉',
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [21, 4],
    text: 'even night owls need posture',
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [21, 4],
    text: "it's late — one last stretch?",
  },

  // Early morning (5-6)
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [5, 6],
    text: "you're up early! 🌅",
  },
  {
    moods: ['peak', 'great', 'ok', 'low', 'critical'],
    hours: [5, 6],
    text: 'early bird gets the stretch',
  },
]

function moodFor(condition: number): Mood {
  if (condition >= 90) return 'peak'
  if (condition >= 65) return 'great'
  if (condition >= 35) return 'ok'
  if (condition >= 15) return 'low'
  return 'critical'
}

function isInHourRange(hour: number, range: [number, number]): boolean {
  const [start, end] = range
  if (start <= end) return hour >= start && hour <= end
  // Wrap-around case (e.g. 21-4 spans midnight)
  return hour >= start || hour <= end
}

let lastIdx = -1

export function getThought(condition: number, name: string): string {
  const mood = moodFor(condition)
  const hour = new Date().getHours()
  const pool = THOUGHTS.filter(
    (t) => t.moods.includes(mood) && (t.hours == null || isInHourRange(hour, t.hours)),
  )
  if (pool.length === 0) return ''
  let idx = Math.floor(Math.random() * pool.length)
  const fromIdx = THOUGHTS.indexOf(pool[idx])
  if (pool.length > 1 && fromIdx === lastIdx) {
    idx = (idx + 1) % pool.length
  }
  lastIdx = THOUGHTS.indexOf(pool[idx])
  return pool[idx].text.replaceAll('{name}', name)
}
