/**
 * Parametric SVG shrimp — iteration 16.
 *
 * Design follows typical cartoon shrimp clipart:
 *   - Horizontal orientation: body arches like inverted-U (Ω)
 *   - Head front-left at low-front corner of arch
 *   - Body tapers from mid-arch toward tail
 *   - Tail fan tucked DOWN and back-left (curls under body)
 *   - Legs hang down below belly
 *   - Antennae curl forward+up from head
 *
 * ViewBox coordinates reference:
 *   Head:     (50, 120)  — fat round front
 *   Back peak: (110, 50) — top of arch
 *   Tail joint: (170, 100) — narrow back
 *   Tail fan:  (160, 150) — tucked under
 *
 * Curl mechanic: tail fan rotates further under at low condition.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="shBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffc8a8"/>
          <stop offset="40%" stop-color="#ff8658"/>
          <stop offset="100%" stop-color="#c24826"/>
        </linearGradient>
        <linearGradient id="shFan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff9670"/>
          <stop offset="100%" stop-color="#ffc4a8"/>
        </linearGradient>
      </defs>

      <!-- ANTENNAE: 2 graceful feelers arcing up-forward from head -->
      <g class="antennae">
        <path class="antenna long-1"
              d="M 48 108 Q 40 60 70 30"
              stroke="#7a2f1c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path class="antenna long-2"
              d="M 54 100 Q 56 60 90 38"
              stroke="#7a2f1c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </g>

      <!-- LEGS: 5 thin legs hanging below belly (behind body in z-order) -->
      <g class="legs">
        <path d="M 68 138 L 62 162 L 58 164"
              stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 84 146 L 82 170 L 78 172"
              stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 102 150 L 102 174 L 98 176"
              stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 120 148 L 122 172 L 126 174"
              stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 138 142 L 142 166 L 146 168"
              stroke="#8a3a22" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <!-- TAIL FAN: sprouts from tail-end around (166, 120), flared DOWN-BACK -->
      <g class="tail">
        <!-- Tail narrow connecting piece (last segment) -->
        <path d="M 160 124
                 Q 178 128 186 142
                 Q 178 156 160 146 Z"
              fill="url(#shBody)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Upper fan blade -->
        <path d="M 178 132
                 Q 208 134 210 146
                 Q 198 154 178 148 Z"
              fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
        <!-- Center pointed telson -->
        <path d="M 180 142
                 Q 212 156 210 168
                 Q 196 172 178 156 Z"
              fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
        <!-- Lower fan blade -->
        <path d="M 176 150
                 Q 202 168 198 180
                 Q 182 184 172 164 Z"
              fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
        <!-- Fin ribs -->
        <path d="M 184 138 Q 196 142 206 146" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
        <path d="M 186 150 Q 198 160 206 168" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
        <path d="M 180 158 Q 188 168 194 178" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
      </g>

      <!-- MAIN BODY: horizontal Ω arch, fat head-front to narrow tail-back -->
      <g class="body">
        <!-- Draw clockwise from head-front-bottom:
             (46, 136)  head bottom-front
             (108, 150) belly mid (fattest point lower)
             (160, 132) tail joint bottom
             (178, 106) tail joint (tapered)
             (170, 80)  back tail joint
             (150, 58)  back of arch at x=150
             (108, 44)  peak of arch (top)
             (70, 54)   front upper back
             (46, 90)   head back-top
             (38, 118)  head front-top
             (46, 136)  close -->
        <!-- Ω-arch: rounded head-front, gentle dorsal hump, tapering body to tail-back. -->
        <path class="main-body"
              d="M 42 118
                 Q 30 142 60 146
                 Q 108 150 144 140
                 Q 158 134 162 120
                 Q 168 96 158 78
                 Q 144 60 116 56
                 Q 84 54 62 64
                 Q 38 76 32 98
                 Q 30 110 42 118 Z"
              fill="url(#shBody)" stroke="#7a2f1c" stroke-width="2.2" stroke-linejoin="round"/>

        <!-- Segment armor joints (curves from belly to dorsal arch) -->
        <path d="M 64 146 Q 62 100 66 60"
              stroke="#7a2f1c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.45"/>
        <path d="M 90 150 Q 88 96 90 52"
              stroke="#7a2f1c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.45"/>
        <path d="M 116 148 Q 116 96 120 52"
              stroke="#7a2f1c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.45"/>
        <path d="M 140 144 Q 146 100 152 62"
              stroke="#7a2f1c" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.45"/>

        <!-- Dorsal highlight along arch -->
        <path d="M 46 100 Q 104 52 160 88"
              stroke="#ffe8d0" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"/>
      </g>

      <!-- FACE: eye higher on head, mouth below -->
      <g class="face">
        <g class="eye">
          <circle class="eye-white" cx="64" cy="92" r="7" fill="#ffffff" stroke="#7a2f1c" stroke-width="1.4"/>
          <circle class="eyeball" cx="62" cy="93" r="3.8" fill="#2a2030"/>
          <circle class="eye-shine" cx="64" cy="91" r="1.3" fill="#ffffff"/>
          <rect class="eyelid" x="54" y="83" width="18" height="15" fill="#ff8658"/>
        </g>
        <!-- Smile: U-shape -->
        <path class="mouth smile"
              d="M 50 120 Q 58 130 66 120"
              stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Frown: ∩-shape -->
        <path class="mouth frown"
              d="M 50 126 Q 58 116 66 126"
              stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Blush cheek -->
        <ellipse class="blush" cx="70" cy="112" rx="4" ry="2.5" fill="#ff9a88" opacity="0.4"/>
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
