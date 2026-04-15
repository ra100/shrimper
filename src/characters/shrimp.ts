/**
 * SVG Shrimp characters — 5 evolution stages × 3 moods.
 *
 * Proper shrimp anatomy: segmented curved body, tail fan, walking legs,
 * swimmerets, long antennae, eyes on stalks. Each stage uncurls progressively.
 */

export type Mood = 'happy' | 'neutral' | 'sad'
export type Stage = 1 | 2 | 3 | 4 | 5

interface Colors {
  body: string
  shell: string
  belly: string
  accent: string
}

function colorsForStageAndMood(stage: Stage, mood: Mood): Colors {
  const satMod = mood === 'sad' ? 0.7 : mood === 'neutral' ? 0.85 : 1
  // Warmer and brighter as stage increases
  const bases = [
    { body: '#e8956e', shell: '#d4784a', belly: '#f5c4a8', accent: '#c45a30' },
    { body: '#ee9e6e', shell: '#da8050', belly: '#f7cbb0', accent: '#cc6235' },
    { body: '#f4a86e', shell: '#e08858', belly: '#f9d2b8', accent: '#d46a3a' },
    { body: '#f8b270', shell: '#e69060', belly: '#fbd9c0', accent: '#dc7240' },
    { body: '#ffbe75', shell: '#ee9a65', belly: '#fde0c8', accent: '#e47c45' },
  ]
  const base = bases[stage - 1]
  if (satMod === 1) return base
  // Desaturate by mixing toward gray
  function desat(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const gray = (r + g + b) / 3
    const nr = Math.round(r * satMod + gray * (1 - satMod))
    const ng = Math.round(g * satMod + gray * (1 - satMod))
    const nb = Math.round(b * satMod + gray * (1 - satMod))
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`
  }
  return { body: desat(base.body), shell: desat(base.shell), belly: desat(base.belly), accent: desat(base.accent) }
}

function eyes(mood: Mood, x1: number, y1: number, x2: number, y2: number, size: number): string {
  const s = size
  const shine = s * 0.35
  switch (mood) {
    case 'happy':
      return `
        <circle cx="${x1}" cy="${y1}" r="${s}" fill="#1a1a2e"/>
        <circle cx="${x1 + s * 0.25}" cy="${y1 - s * 0.25}" r="${shine}" fill="#fff"/>
        <circle cx="${x2}" cy="${y2}" r="${s}" fill="#1a1a2e"/>
        <circle cx="${x2 + s * 0.25}" cy="${y2 - s * 0.25}" r="${shine}" fill="#fff"/>`
    case 'neutral':
      return `
        <ellipse cx="${x1}" cy="${y1}" rx="${s}" ry="${s * 0.7}" fill="#1a1a2e"/>
        <circle cx="${x1 + s * 0.2}" cy="${y1 - s * 0.15}" r="${shine * 0.8}" fill="#fff"/>
        <ellipse cx="${x2}" cy="${y2}" rx="${s}" ry="${s * 0.7}" fill="#1a1a2e"/>
        <circle cx="${x2 + s * 0.2}" cy="${y2 - s * 0.15}" r="${shine * 0.8}" fill="#fff"/>`
    case 'sad':
      return `
        <ellipse cx="${x1}" cy="${y1 + 1}" rx="${s * 0.85}" ry="${s * 0.5}" fill="#1a1a2e"/>
        <ellipse cx="${x2}" cy="${y2 + 1}" rx="${s * 0.85}" ry="${s * 0.5}" fill="#1a1a2e"/>`
  }
}

function mouth(mood: Mood, x: number, y: number, size: number): string {
  const s = size
  switch (mood) {
    case 'happy':
      return `<path d="M${x - s},${y} Q${x},${y + s * 1.2} ${x + s},${y}" stroke="#1a1a2e" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
    case 'neutral':
      return `<line x1="${x - s * 0.6}" y1="${y}" x2="${x + s * 0.6}" y2="${y}" stroke="#1a1a2e" stroke-width="1.2" stroke-linecap="round"/>`
    case 'sad':
      return `<path d="M${x - s},${y + s * 0.5} Q${x},${y - s * 0.6} ${x + s},${y + s * 0.5}" stroke="#1a1a2e" stroke-width="1.2" fill="none" stroke-linecap="round"/>`
  }
}

function legs(x: number, y: number, count: number, length: number, color: string, angle: number): string {
  let svg = ''
  for (let i = 0; i < count; i++) {
    const lx = x + i * 5
    const endX = lx + Math.sin((angle + i * 8) * Math.PI / 180) * length
    const endY = y + length * 0.9
    svg += `<line x1="${lx}" y1="${y}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="1.2" stroke-linecap="round"/>`
  }
  return svg
}

function antennae(x: number, y: number, color: string, droop: number): string {
  const d = droop // higher = droopier
  return `
    <path d="M${x},${y} Q${x - 15},${y - 25 + d} ${x - 25},${y - 18 + d * 1.5}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M${x + 2},${y} Q${x + 12},${y - 28 + d} ${x + 28},${y - 22 + d * 1.5}" stroke="${color}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
    <path d="M${x - 1},${y + 1} Q${x - 8},${y - 12 + d} ${x - 14},${y - 8 + d}" stroke="${color}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
    <path d="M${x + 3},${y + 1} Q${x + 8},${y - 14 + d} ${x + 16},${y - 10 + d}" stroke="${color}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>`
}

function tailFan(x: number, y: number, spread: number, color: string, accentColor: string): string {
  const s = spread
  return `
    <ellipse cx="${x}" cy="${y}" rx="${s * 1.2}" ry="${s * 0.5}" fill="${color}" transform="rotate(-10,${x},${y})"/>
    <ellipse cx="${x - s * 0.6}" cy="${y + 2}" rx="${s * 0.7}" ry="${s * 0.35}" fill="${accentColor}" opacity="0.5" transform="rotate(-20,${x - s * 0.6},${y + 2})"/>
    <ellipse cx="${x + s * 0.5}" cy="${y + 1}" rx="${s * 0.6}" ry="${s * 0.3}" fill="${accentColor}" opacity="0.5" transform="rotate(5,${x + s * 0.5},${y + 1})"/>
    <path d="M${x - s * 0.8},${y - 1} L${x + s * 0.8},${y - 1}" stroke="${accentColor}" stroke-width="0.8" opacity="0.4"/>`
}

// Stage 1: Tightly curled C-shape, droopy, clearly a shrimp
function stage1(mood: Mood): string {
  const c = colorsForStageAndMood(1, mood)
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(58,55)">
      ${tailFan(-28, 28, 8, c.shell, c.accent)}
      <!-- Curled body (tight C-shape) -->
      <path d="M-25,25 Q-35,10 -28,-5 Q-18,-22 0,-25 Q18,-22 25,-10 Q28,2 22,15 Q15,25 5,28" fill="${c.body}" stroke="${c.shell}" stroke-width="1"/>
      <!-- Belly (lighter inner curve) -->
      <path d="M-20,22 Q-25,10 -18,0 Q-8,-12 5,-14 Q16,-10 20,-2 Q22,8 18,16 Q12,22 5,24" fill="${c.belly}" opacity="0.6"/>
      <!-- Segment lines -->
      <path d="M-26,18 Q-18,14 -8,16" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M-30,8 Q-18,2 -6,5" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M-26,-4 Q-14,-10 0,-10" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M-16,-16 Q-4,-20 10,-16" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M8,-20 Q18,-16 24,-8" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M22,-2 Q24,6 20,14" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <!-- Legs (dangling under belly) -->
      ${legs(-12, 20, 4, 8, c.accent, 95)}
      <!-- Head area -->
      <circle cx="10" cy="26" r="10" fill="${c.body}" stroke="${c.shell}" stroke-width="0.8"/>
      <!-- Eye stalks + eyes -->
      <line x1="6" y1="20" x2="3" y2="16" stroke="${c.body}" stroke-width="2"/>
      <line x1="14" y1="19" x2="16" y2="15" stroke="${c.body}" stroke-width="2"/>
      ${eyes(mood, 3, 14, 16, 13, 3)}
      <!-- Mouth -->
      ${mouth(mood, 10, 30, 3.5)}
      <!-- Antennae (very droopy) -->
      ${antennae(10, 18, c.accent, 12)}
    </g>
  </svg>`
}

// Stage 2: Less curled, starting to open up
function stage2(mood: Mood): string {
  const c = colorsForStageAndMood(2, mood)
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(55,52)">
      ${tailFan(-30, 20, 10, c.shell, c.accent)}
      <!-- Body (looser C) -->
      <path d="M-28,18 Q-35,2 -25,-12 Q-12,-25 5,-26 Q22,-22 30,-10 Q33,5 28,18" fill="${c.body}" stroke="${c.shell}" stroke-width="1"/>
      <!-- Belly -->
      <path d="M-22,15 Q-26,2 -18,-8 Q-6,-18 8,-18 Q20,-14 25,-5 Q27,6 24,15" fill="${c.belly}" opacity="0.6"/>
      <!-- Segments -->
      <path d="M-30,10 Q-20,5 -10,8" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M-32,-2 Q-20,-8 -8,-5" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M-22,-14 Q-8,-20 6,-18" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M10,-22 Q22,-16 28,-8" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <path d="M30,-2 Q32,8 28,16" stroke="${c.shell}" stroke-width="1.2" fill="none" opacity="0.5"/>
      <!-- Legs -->
      ${legs(-8, 18, 5, 10, c.accent, 90)}
      <!-- Head -->
      <circle cx="20" cy="22" r="12" fill="${c.body}" stroke="${c.shell}" stroke-width="0.8"/>
      <!-- Eye stalks -->
      <line x1="14" y1="16" x2="11" y2="10" stroke="${c.body}" stroke-width="2.5"/>
      <line x1="24" y1="14" x2="27" y2="8" stroke="${c.body}" stroke-width="2.5"/>
      ${eyes(mood, 10, 8, 27, 6, 3.5)}
      ${mouth(mood, 20, 28, 4)}
      ${antennae(18, 12, c.accent, 8)}
    </g>
  </svg>`
}

// Stage 3: Half uncurled, hopeful posture
function stage3(mood: Mood): string {
  const c = colorsForStageAndMood(3, mood)
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(52,48)">
      ${tailFan(-22, 30, 11, c.shell, c.accent)}
      <!-- Body (gentle curve, more upright) -->
      <path d="M-20,28 Q-30,12 -22,-5 Q-10,-22 8,-25 Q25,-20 32,-5 Q35,12 30,28" fill="${c.body}" stroke="${c.shell}" stroke-width="1"/>
      <!-- Belly -->
      <path d="M-14,25 Q-20,10 -14,-2 Q-4,-14 10,-16 Q22,-12 27,-2 Q30,12 26,25" fill="${c.belly}" opacity="0.6"/>
      <!-- Segments -->
      <path d="M-22,20 Q-10,15 2,18" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M-26,8 Q-14,2 -2,5" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M-22,-4 Q-8,-12 6,-10" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M-6,-20 Q10,-22 22,-16" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M26,-8 Q32,0 30,12" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <!-- Legs (more defined) -->
      ${legs(-4, 28, 5, 12, c.accent, 85)}
      <!-- Head -->
      <circle cx="22" cy="34" r="13" fill="${c.body}" stroke="${c.shell}" stroke-width="0.8"/>
      <!-- Eye stalks -->
      <line x1="16" y1="26" x2="12" y2="20" stroke="${c.body}" stroke-width="2.5"/>
      <line x1="28" y1="24" x2="32" y2="18" stroke="${c.body}" stroke-width="2.5"/>
      ${eyes(mood, 11, 18, 32, 16, 3.8)}
      ${mouth(mood, 22, 40, 4)}
      ${antennae(20, 22, c.accent, 4)}
      <!-- Little arms waving -->
      <path d="M-16,8 Q-26,2 -24,8" stroke="${c.accent}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M32,4 Q42,-2 40,4" stroke="${c.accent}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`
}

// Stage 4: Mostly upright, confident
function stage4(mood: Mood): string {
  const c = colorsForStageAndMood(4, mood)
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(48,42)">
      ${tailFan(-12, 42, 12, c.shell, c.accent)}
      <!-- Body (mostly straight, slight curve) -->
      <path d="M-10,40 Q-20,22 -15,2 Q-6,-18 12,-22 Q30,-16 36,0 Q38,20 32,40" fill="${c.body}" stroke="${c.shell}" stroke-width="1.2"/>
      <!-- Belly -->
      <path d="M-4,38 Q-12,20 -8,4 Q0,-12 14,-14 Q26,-10 30,2 Q32,20 28,38" fill="${c.belly}" opacity="0.6"/>
      <!-- Segments -->
      <path d="M-14,30 Q0,25 14,28" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M-18,18 Q-4,12 10,15" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M-16,4 Q-2,-4 12,-2" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M-8,-12 Q8,-18 24,-12" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <path d="M28,-6 Q34,6 32,20" stroke="${c.shell}" stroke-width="1.3" fill="none" opacity="0.5"/>
      <!-- Legs (strong) -->
      ${legs(2, 40, 5, 13, c.accent, 82)}
      <!-- Head -->
      <circle cx="24" cy="46" r="14" fill="${c.body}" stroke="${c.shell}" stroke-width="0.8"/>
      <!-- Eye stalks (taller) -->
      <line x1="18" y1="36" x2="13" y2="28" stroke="${c.body}" stroke-width="3"/>
      <line x1="30" y1="34" x2="35" y2="26" stroke="${c.body}" stroke-width="3"/>
      ${eyes(mood, 12, 26, 35, 24, 4)}
      ${mouth(mood, 24, 52, 4.5)}
      ${antennae(22, 30, c.accent, 0)}
      <!-- Arms (confident pose) -->
      <path d="M-14,10 Q-28,4 -24,12" stroke="${c.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36,6 Q50,0 46,8" stroke="${c.accent}" stroke-width="2" fill="none" stroke-linecap="round"/>
    </g>
  </svg>`
}

// Stage 5: Champion — upright, crowned, glowing
function stage5(mood: Mood): string {
  const c = colorsForStageAndMood(5, mood)
  const crown = '#ffd700'
  return `<svg viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="champGlow">
        <stop offset="0%" stop-color="${crown}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${crown}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="68" cy="35" r="30" fill="url(#champGlow)"/>
    <g transform="translate(48,38)">
      ${tailFan(-8, 50, 14, c.shell, c.accent)}
      <!-- Body (tall, proud) -->
      <path d="M-6,48 Q-16,26 -10,4 Q0,-16 16,-20 Q34,-14 40,2 Q42,26 36,48" fill="${c.body}" stroke="${c.shell}" stroke-width="1.2"/>
      <!-- Belly -->
      <path d="M0,46 Q-8,24 -4,6 Q4,-10 18,-12 Q30,-8 34,4 Q36,24 32,46" fill="${c.belly}" opacity="0.6"/>
      <!-- Segments -->
      <path d="M-10,38 Q6,32 20,36" stroke="${c.shell}" stroke-width="1.4" fill="none" opacity="0.5"/>
      <path d="M-14,24 Q2,18 16,22" stroke="${c.shell}" stroke-width="1.4" fill="none" opacity="0.5"/>
      <path d="M-12,10 Q2,2 16,6" stroke="${c.shell}" stroke-width="1.4" fill="none" opacity="0.5"/>
      <path d="M-4,-8 Q12,-16 28,-8" stroke="${c.shell}" stroke-width="1.4" fill="none" opacity="0.5"/>
      <path d="M32,-2 Q38,10 36,26" stroke="${c.shell}" stroke-width="1.4" fill="none" opacity="0.5"/>
      <!-- Legs (champion stance) -->
      ${legs(6, 48, 5, 14, c.accent, 80)}
      <!-- Head -->
      <circle cx="28" cy="54" r="15" fill="${c.body}" stroke="${c.shell}" stroke-width="0.8"/>
      <!-- Crown -->
      <g transform="translate(28,20)">
        <polygon points="-12,4 -8,-5 -4,1 0,-9 4,1 8,-5 12,4" fill="${crown}" stroke="#e6c200" stroke-width="0.5"/>
        <rect x="-12" y="4" width="24" height="5" rx="1.5" fill="${crown}" stroke="#e6c200" stroke-width="0.5"/>
        <circle cx="0" cy="-2" r="2" fill="#ff4444"/>
        <circle cx="-6" cy="1" r="1.5" fill="#44aaff"/>
        <circle cx="6" cy="1" r="1.5" fill="#44ff44"/>
      </g>
      <!-- Eye stalks (proud) -->
      <line x1="20" y1="42" x2="14" y2="32" stroke="${c.body}" stroke-width="3"/>
      <line x1="34" y1="40" x2="40" y2="30" stroke="${c.body}" stroke-width="3"/>
      ${eyes(mood, 13, 30, 40, 28, 4.5)}
      ${mouth(mood, 28, 60, 5)}
      ${antennae(26, 34, c.accent, -4)}
      <!-- Arms (flexing!) -->
      <path d="M-10,14 Q-28,6 -22,16" stroke="${c.accent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="-24" cy="10" r="3" fill="${c.accent}" opacity="0.6"/>
      <path d="M40,10 Q58,2 52,12" stroke="${c.accent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="56" cy="6" r="3" fill="${c.accent}" opacity="0.6"/>
      <!-- Sparkles -->
      <text x="-18" y="-2" font-size="8" opacity="0.7">✨</text>
      <text x="48" y="0" font-size="6" opacity="0.5">✨</text>
    </g>
  </svg>`
}

const STAGE_RENDERERS = [stage1, stage2, stage3, stage4, stage5]

export function renderShrimp(stage: Stage, mood: Mood): string {
  const renderer = STAGE_RENDERERS[stage - 1] || stage1
  return renderer(mood)
}

export function getMoodFromBehavior(consecutiveIgnored: number): Mood {
  if (consecutiveIgnored >= 3) return 'sad'
  if (consecutiveIgnored >= 1) return 'neutral'
  return 'happy'
}
