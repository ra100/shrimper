type Mood = 'peak' | 'great' | 'ok' | 'low' | 'critical'

interface Thought {
  moods: Mood[]
  text: string // may contain {name}
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
]

function moodFor(condition: number): Mood {
  if (condition >= 90) return 'peak'
  if (condition >= 65) return 'great'
  if (condition >= 35) return 'ok'
  if (condition >= 15) return 'low'
  return 'critical'
}

let lastIdx = -1

export function getThought(condition: number, name: string): string {
  const mood = moodFor(condition)
  const pool = THOUGHTS.filter((t) => t.moods.includes(mood))
  if (pool.length === 0) return ''
  let idx = Math.floor(Math.random() * pool.length)
  const fromIdx = THOUGHTS.indexOf(pool[idx])
  if (pool.length > 1 && fromIdx === lastIdx) {
    idx = (idx + 1) % pool.length
  }
  lastIdx = THOUGHTS.indexOf(pool[idx])
  return pool[idx].text.replaceAll('{name}', name)
}
