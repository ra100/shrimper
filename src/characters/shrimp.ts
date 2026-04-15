/**
 * SVG Shrimp characters — 5 evolution stages × 3 moods.
 *
 * Each stage shows progressive uncurling from a sad shrimp to a champion.
 * Mood affects eyes, mouth, and color saturation via CSS classes.
 */

export type Mood = 'happy' | 'neutral' | 'sad'
export type Stage = 1 | 2 | 3 | 4 | 5

function eyeForMood(mood: Mood): string {
  switch (mood) {
    case 'happy': return `<circle cx="0" cy="0" r="3.5" fill="#333"/>
      <circle cx="1" cy="-1" r="1.2" fill="#fff"/>`
    case 'neutral': return `<ellipse cx="0" cy="0" rx="3.5" ry="2.5" fill="#333"/>
      <circle cx="1" cy="-0.5" r="1" fill="#fff"/>`
    case 'sad': return `<ellipse cx="0" cy="1" rx="3" ry="1.8" fill="#333"/>`
  }
}

function mouthForMood(mood: Mood): string {
  switch (mood) {
    case 'happy': return `<path d="M-4,0 Q0,5 4,0" stroke="#333" stroke-width="1.5" fill="none"/>`
    case 'neutral': return `<line x1="-3" y1="0" x2="3" y2="0" stroke="#333" stroke-width="1.5"/>`
    case 'sad': return `<path d="M-4,3 Q0,-2 4,3" stroke="#333" stroke-width="1.5" fill="none"/>`
  }
}

// Stage 1: Fully curled, droopy — sad little shrimp
function stage1(mood: Mood): string {
  const bodyColor = mood === 'sad' ? '#e8a090' : mood === 'neutral' ? '#f0a08a' : '#f4a589'
  const shellColor = mood === 'sad' ? '#d48878' : mood === 'neutral' ? '#e09078' : '#e8956e'
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(60,65)">
      <!-- Curled body -->
      <ellipse cx="0" cy="5" rx="30" ry="22" fill="${bodyColor}" transform="rotate(15)"/>
      <!-- Shell segments -->
      <path d="M-20,-10 Q-5,-25 15,-15" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M-15,-5 Q0,-18 18,-8" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M-10,2 Q5,-12 20,0" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <!-- Tail (curled in) -->
      <ellipse cx="-22" cy="18" rx="10" ry="6" fill="${shellColor}" transform="rotate(30)"/>
      <!-- Head -->
      <circle cx="20" cy="-8" r="14" fill="${bodyColor}"/>
      <!-- Eyes -->
      <g transform="translate(16,-12)">${eyeForMood(mood)}</g>
      <g transform="translate(26,-10)">${eyeForMood(mood)}</g>
      <!-- Mouth -->
      <g transform="translate(21,-2)">${mouthForMood(mood)}</g>
      <!-- Antennae (droopy) -->
      <path d="M14,-20 Q8,-32 5,-28" stroke="${shellColor}" stroke-width="1.5" fill="none"/>
      <path d="M18,-20 Q22,-34 28,-30" stroke="${shellColor}" stroke-width="1.5" fill="none"/>
    </g>
  </svg>`
}

// Stage 2: Slightly less curled, one eye more open
function stage2(mood: Mood): string {
  const bodyColor = mood === 'sad' ? '#eda090' : mood === 'neutral' ? '#f5a585' : '#f9ac80'
  const shellColor = mood === 'sad' ? '#d89080' : mood === 'neutral' ? '#e59575' : '#ec9a6a'
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(60,65)">
      <!-- Less curled body -->
      <ellipse cx="0" cy="5" rx="32" ry="20" fill="${bodyColor}" transform="rotate(8)"/>
      <!-- Shell segments -->
      <path d="M-22,-8 Q-5,-22 18,-10" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M-18,-2 Q2,-16 20,-3" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M-12,5 Q5,-8 22,5" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <!-- Tail -->
      <ellipse cx="-24" cy="15" rx="11" ry="6" fill="${shellColor}" transform="rotate(20)"/>
      <!-- Head -->
      <circle cx="22" cy="-10" r="15" fill="${bodyColor}"/>
      <!-- Eyes (one bigger) -->
      <g transform="translate(17,-14)">${eyeForMood(mood)}</g>
      <g transform="translate(28,-12)">
        <circle cx="0" cy="0" r="${mood === 'happy' ? 4 : 3.5}" fill="#333"/>
        <circle cx="1" cy="-1" r="1.5" fill="#fff"/>
      </g>
      <!-- Mouth -->
      <g transform="translate(22,-3)">${mouthForMood(mood)}</g>
      <!-- Antennae (slightly raised) -->
      <path d="M15,-23 Q10,-36 8,-33" stroke="${shellColor}" stroke-width="1.5" fill="none"/>
      <path d="M20,-23 Q25,-38 30,-33" stroke="${shellColor}" stroke-width="1.5" fill="none"/>
      <!-- Tiny legs attempting -->
      <line x1="-5" y1="18" x2="-8" y2="25" stroke="${shellColor}" stroke-width="1.5"/>
      <line x1="5" y1="19" x2="3" y2="26" stroke="${shellColor}" stroke-width="1.5"/>
    </g>
  </svg>`
}

// Stage 3: Upright-ish, wobbly, hopeful
function stage3(mood: Mood): string {
  const bodyColor = mood === 'sad' ? '#f0a888' : mood === 'neutral' ? '#f7b08a' : '#fcb580'
  const shellColor = mood === 'sad' ? '#dc9878' : mood === 'neutral' ? '#ea9e70' : '#f0a468'
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(60,60)">
      <!-- Straighter body -->
      <ellipse cx="0" cy="8" rx="25" ry="28" fill="${bodyColor}" transform="rotate(-5)"/>
      <!-- Shell segments -->
      <path d="M-18,0 Q0,-15 18,0" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M-15,8 Q0,-5 15,8" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M-12,16 Q0,5 12,16" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <!-- Tail -->
      <ellipse cx="0" cy="32" rx="12" ry="7" fill="${shellColor}"/>
      <!-- Head -->
      <circle cx="0" cy="-18" r="16" fill="${bodyColor}"/>
      <!-- Eyes (both open, hopeful) -->
      <g transform="translate(-7,-22)">${eyeForMood(mood)}</g>
      <g transform="translate(7,-22)">${eyeForMood(mood)}</g>
      <!-- Mouth -->
      <g transform="translate(0,-12)">${mouthForMood(mood)}</g>
      <!-- Antennae (perky) -->
      <path d="M-5,-32 Q-12,-46 -10,-42" stroke="${shellColor}" stroke-width="1.5" fill="none"/>
      <path d="M5,-32 Q12,-46 10,-42" stroke="${shellColor}" stroke-width="1.5" fill="none"/>
      <!-- Little arms -->
      <line x1="-20" y1="2" x2="-28" y2="-5" stroke="${shellColor}" stroke-width="2"/>
      <line x1="20" y1="2" x2="28" y2="-5" stroke="${shellColor}" stroke-width="2"/>
    </g>
  </svg>`
}

// Stage 4: Standing tall, confident
function stage4(mood: Mood): string {
  const bodyColor = mood === 'sad' ? '#f2b090' : mood === 'neutral' ? '#fab888' : '#ffbe80'
  const shellColor = mood === 'sad' ? '#e0a078' : mood === 'neutral' ? '#eca870' : '#f2ae65'
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(60,58)">
      <!-- Tall body -->
      <ellipse cx="0" cy="5" rx="22" ry="30" fill="${bodyColor}"/>
      <!-- Shell segments -->
      <path d="M-16,-2 Q0,-18 16,-2" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <path d="M-14,8 Q0,-5 14,8" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <path d="M-12,18 Q0,5 12,18" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <!-- Tail -->
      <ellipse cx="0" cy="33" rx="14" ry="7" fill="${shellColor}"/>
      <!-- Head -->
      <circle cx="0" cy="-22" r="17" fill="${bodyColor}"/>
      <!-- Eyes (confident) -->
      <g transform="translate(-8,-26)">${eyeForMood(mood)}</g>
      <g transform="translate(8,-26)">${eyeForMood(mood)}</g>
      <!-- Mouth (bigger) -->
      <g transform="translate(0,-15)" scale="1.2">${mouthForMood(mood)}</g>
      <!-- Antennae (proud) -->
      <path d="M-6,-37 Q-15,-52 -12,-48" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M6,-37 Q15,-52 12,-48" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <!-- Strong arms -->
      <path d="M-18,-2 Q-30,-10 -26,-5" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <path d="M18,-2 Q30,-10 26,-5" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <!-- Feet -->
      <line x1="-8" y1="35" x2="-12" y2="42" stroke="${shellColor}" stroke-width="2"/>
      <line x1="8" y1="35" x2="12" y2="42" stroke="${shellColor}" stroke-width="2"/>
    </g>
  </svg>`
}

// Stage 5: Champion — fully upright, crown glow
function stage5(mood: Mood): string {
  const bodyColor = mood === 'sad' ? '#f5b890' : mood === 'neutral' ? '#fcc088' : '#ffc575'
  const shellColor = mood === 'sad' ? '#e5a878' : mood === 'neutral' ? '#f0b068' : '#f5b558'
  const crownColor = '#ffd700'
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <!-- Glow -->
    <defs>
      <radialGradient id="glow">
        <stop offset="0%" stop-color="${crownColor}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${crownColor}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="30" r="25" fill="url(#glow)"/>
    <g transform="translate(60,58)">
      <!-- Tall proud body -->
      <ellipse cx="0" cy="2" rx="20" ry="32" fill="${bodyColor}"/>
      <!-- Shell segments -->
      <path d="M-15,-5 Q0,-22 15,-5" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <path d="M-13,6 Q0,-8 13,6" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <path d="M-11,17 Q0,3 11,17" stroke="${shellColor}" stroke-width="2.5" fill="none"/>
      <!-- Tail (proud fan) -->
      <path d="M-14,30 Q0,40 14,30" fill="${shellColor}"/>
      <!-- Head -->
      <circle cx="0" cy="-25" r="18" fill="${bodyColor}"/>
      <!-- Crown -->
      <g transform="translate(0,-42)">
        <polygon points="-10,2 -7,-6 -3,0 0,-8 3,0 7,-6 10,2" fill="${crownColor}"/>
        <rect x="-10" y="2" width="20" height="4" rx="1" fill="${crownColor}"/>
      </g>
      <!-- Eyes (champion) -->
      <g transform="translate(-8,-29)">${eyeForMood(mood)}</g>
      <g transform="translate(8,-29)">${eyeForMood(mood)}</g>
      <!-- Mouth -->
      <g transform="translate(0,-18)">${mouthForMood(mood)}</g>
      <!-- Antennae (majestic) -->
      <path d="M-7,-41 Q-18,-58 -14,-52" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <path d="M7,-41 Q18,-58 14,-52" stroke="${shellColor}" stroke-width="2" fill="none"/>
      <!-- Strong arms (flexing) -->
      <path d="M-16,-5 Q-32,-15 -28,-8" stroke="${shellColor}" stroke-width="3" fill="none"/>
      <path d="M16,-5 Q32,-15 28,-8" stroke="${shellColor}" stroke-width="3" fill="none"/>
      <!-- Confident feet -->
      <line x1="-8" y1="32" x2="-14" y2="40" stroke="${shellColor}" stroke-width="2.5"/>
      <line x1="8" y1="32" x2="14" y2="40" stroke="${shellColor}" stroke-width="2.5"/>
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
