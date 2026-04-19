/**
 * Parametric SVG shrimp. One scalar `condition` (0..100) drives spine curl
 * via CSS custom properties.
 *
 * Design: emoji-🦐-style. Body is ONE continuous crescent — head (round fat
 * end) at lower-left, tapering up-right into narrow abdomen, tail fan at
 * upper-right tip. Armor/segments are strokes drawn on top of the crescent.
 *
 * Curl mechanic: tail rotates around its joint. At --c=1 baseline pose;
 * at --c=0 the tail tucks forward, squashing the crescent tighter.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="shBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd4bc"/>
          <stop offset="50%" stop-color="#ff8f68"/>
          <stop offset="100%" stop-color="#bd4d2c"/>
        </linearGradient>
        <linearGradient id="shTail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff9672"/>
          <stop offset="100%" stop-color="#ffb596"/>
        </linearGradient>
      </defs>

      <!-- Antennae (trailing back from head at (60,140), behind body) -->
      <g class="antennae">
        <path class="antenna long-1"
              d="M 58 152 Q 26 180 6 198"
              stroke="#7a2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path class="antenna long-2"
              d="M 52 146 Q 20 150 4 150"
              stroke="#7a2f1c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <path class="antenna short-1"
              d="M 62 124 Q 48 108 42 90"
              stroke="#8a3a22" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        <path class="antenna short-2"
              d="M 74 118 Q 72 100 76 82"
              stroke="#8a3a22" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      </g>

      <g class="body">

        <!-- Pereopods (walking legs hanging down under head, head-bottom ~178) -->
        <g class="pereopods">
          <path d="M 80 178 L 76 192 L 72 194"
                stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M 96 180 L 98 194 L 94 196"
                stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </g>

        <!-- Pleopods (swimmerets under abdomen belly, belly at y~170) -->
        <g class="pleopods">
          <path d="M 116 178 Q 116 188 112 192"
                stroke="#8a3a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <path d="M 134 168 Q 138 180 134 184"
                stroke="#8a3a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
          <path d="M 152 152 Q 158 162 154 168"
                stroke="#8a3a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        </g>

        <!-- Rostrum (small serrated spike pointing forward from between eyes) -->
        <g class="rostrum">
          <path d="M 70 128
                   L 50 94
                   L 66 132 Z"
                fill="url(#shBody)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M 58 108 L 54 104" stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          <path d="M 64 120 L 60 116" stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        </g>

        <!-- MAIN CRESCENT BODY — classic prawn C-arch.
             Head (fat, round): centered at (78, 140), radius ~36
             Abdomen arches upward: peak near (130, 50)
             Tail base (narrow): tapers at (176, 56)
             The OUTLINE: back goes up from head-top (78,108) over peak (130,40) down to tail (176,50).
             Belly goes from tail (176,72) under belly (130,90) down to head-bottom (78,172). -->
        <path class="main-body"
              d="M 60 140
                 Q 42 170 72 180
                 Q 112 186 142 164
                 Q 176 138 184 90
                 Q 188 54 172 48
                 Q 154 48 146 72
                 Q 134 102 116 118
                 Q 96 128 82 124
                 Q 68 118 60 128
                 Q 50 138 60 140 Z"
              fill="url(#shBody)" stroke="#7a2f1c" stroke-width="2" stroke-linejoin="round"/>

        <!-- Segment armor joints (short curves perpendicular to body axis) -->
        <path d="M 98 128 Q 94 146 96 180"
              stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.55"/>
        <path d="M 122 112 Q 118 140 120 180"
              stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.55"/>
        <path d="M 148 88 Q 144 120 146 168"
              stroke="#7a2f1c" stroke-width="1.2" fill="none" stroke-linecap="round" opacity="0.55"/>
        <path d="M 170 62 Q 168 96 168 140"
              stroke="#7a2f1c" stroke-width="1.1" fill="none" stroke-linecap="round" opacity="0.55"/>

        <!-- Dorsal highlight (subtle curve along top of arch) -->
        <path d="M 90 116 Q 138 74 176 62"
              stroke="#fff0e4" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.45"/>

        <!-- Belly highlight (soft) -->
        <path d="M 84 168 Q 128 184 162 158"
              stroke="#fff0e4" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.25"/>

        <!-- TAIL FAN — at tapered end around (180, 50) -->
        <g class="tail">
          <!-- Upper uropod -->
          <path d="M 176 48
                   Q 196 18 200 8
                   Q 202 38 188 64 Z"
                fill="url(#shTail)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Telson (pointed center blade) -->
          <path d="M 178 54
                   Q 202 44 204 50
                   Q 200 72 184 76
                   Q 178 68 178 54 Z"
                fill="url(#shTail)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Lower uropod -->
          <path d="M 178 62
                   Q 200 70 200 82
                   Q 186 86 176 76
                   Q 174 68 178 62 Z"
                fill="url(#shTail)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Fin ribs -->
          <path d="M 180 50 Q 190 30 198 18" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
          <path d="M 182 58 Q 192 54 202 56" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
          <path d="M 182 70 Q 192 72 198 78" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
        </g>
      </g>

      <!-- FACE: eye + mouth on fat head end (around 78,150) -->
      <g class="face">
        <g class="eye">
          <circle class="eye-white" cx="78" cy="148" r="8" fill="#ffffff" stroke="#7a2f1c" stroke-width="1.5"/>
          <circle class="eyeball" cx="79" cy="149" r="4.2" fill="#2a2030"/>
          <circle class="eye-shine" cx="81" cy="147" r="1.5" fill="#ffffff"/>
          <rect class="eyelid" x="67" y="137" width="20" height="17" fill="#ff8f68"/>
        </g>
        <path class="mouth smile"
              d="M 82 168 Q 92 174 102 167"
              stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path class="mouth frown"
              d="M 82 172 Q 92 164 102 174"
              stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <circle class="blush" cx="102" cy="168" r="3.8" fill="#ff6b6b" opacity="0.35"/>
      </g>
    </svg>
  `
}

export function updateShrimp(root: HTMLElement, condition: number): void {
  const target = (root.querySelector<HTMLElement>('.shrimp') ?? root)
  const c = Math.max(0, Math.min(1, condition / 100))
  target.style.setProperty('--c', String(c))
}

export function flashShrimp(root: HTMLElement, kind: 'bounce' | 'deflate'): void {
  const svg = root.querySelector<HTMLElement>('.shrimp') ?? root
  svg.classList.remove(kind)
  void svg.offsetWidth
  svg.classList.add(kind)
  setTimeout(() => svg.classList.remove(kind), 400)
}
