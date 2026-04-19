/**
 * Parametric SVG shrimp. One scalar `condition` (0..100) drives spine curl
 * via CSS custom properties.
 *
 * Design philosophy (iteration 11): simplify to cartoon essentials.
 *   - Big round head bubble at lower-left (holds face)
 *   - One arcing tail body curving up and right
 *   - Dramatic tail fan at upper-right tip
 *   - 2 antennae only (1 long trail, 1 short feeler)
 *   - No legs (reads cleaner, more emoji-like)
 *
 * Curl mechanic: tail rotates at its base. Baseline shape already has
 * strong C-arch, so even at c=1 silhouette is clearly shrimp-like.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="-5 0 215 210" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="shHead" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd8bf"/>
          <stop offset="60%" stop-color="#ff8f68"/>
          <stop offset="100%" stop-color="#c95a34"/>
        </linearGradient>
        <linearGradient id="shTail" x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0%" stop-color="#ff9470"/>
          <stop offset="60%" stop-color="#ff7749"/>
          <stop offset="100%" stop-color="#e8552a"/>
        </linearGradient>
        <linearGradient id="shFan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ffa480"/>
          <stop offset="100%" stop-color="#ffc7ab"/>
        </linearGradient>
      </defs>

      <!-- Antennae: 2 long whiskers trailing back from head -->
      <g class="antennae">
        <path class="antenna long-1"
              d="M 50 130 Q 16 150 6 190"
              stroke="#7a2f1c" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <path class="antenna long-2"
              d="M 46 124 Q 14 126 4 122"
              stroke="#7a2f1c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      </g>

      <g class="body">
        <!-- TAIL BODY: dramatically arched abdomen, head-joint (left-bottom) to tail-base (upper-right) -->
        <g class="curl-section">
          <!-- Main arched abdomen — strong C arching from (82,150) UP over peak (130,40) to tail-base (180,80) -->
          <defs>
            <clipPath id="abdomenClip">
              <path d="M 82 148
                       Q 72 78 140 38
                       Q 188 36 186 78
                       Q 180 110 150 128
                       Q 118 146 90 158
                       Q 74 158 82 148 Z"/>
            </clipPath>
          </defs>

          <path class="abdomen"
                d="M 82 148
                   Q 72 78 140 38
                   Q 188 36 186 78
                   Q 180 110 150 128
                   Q 118 146 90 158
                   Q 74 158 82 148 Z"
                fill="url(#shTail)" stroke="#7a2f1c" stroke-width="2" stroke-linejoin="round"/>

          <!-- Segment armor joints (clipped to stay inside abdomen) -->
          <g clip-path="url(#abdomenClip)">
            <path d="M 94 156 Q 84 104 90 60"
                  stroke="#8a3a22" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.5"/>
            <path d="M 120 150 Q 112 94 124 48"
                  stroke="#8a3a22" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.5"/>
            <path d="M 150 132 Q 150 82 168 42"
                  stroke="#8a3a22" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.5"/>
          </g>

          <!-- Dorsal highlight along arch peak -->
          <path d="M 90 120 Q 130 50 180 64"
                stroke="#ffe8d6" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.5"/>

          <!-- TAIL FAN: big, splayed, 3-blade at tip (~180,76) -->
          <g class="tail">
            <!-- Upper blade (tallest) -->
            <path d="M 172 70
                     Q 192 26 200 12
                     Q 202 44 186 82 Z"
                  fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
            <!-- Center blade (pointed telson) -->
            <path d="M 176 78
                     Q 204 48 206 56
                     Q 202 82 188 92
                     Q 178 86 176 78 Z"
                  fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
            <!-- Lower blade -->
            <path d="M 178 86
                     Q 202 86 204 102
                     Q 186 108 174 96
                     Q 172 90 178 86 Z"
                  fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
            <!-- Fin ribs -->
            <path d="M 178 72 Q 188 50 196 30" stroke="#7a2f1c" stroke-width="1" fill="none" opacity="0.5"/>
            <path d="M 182 82 Q 192 72 202 64" stroke="#7a2f1c" stroke-width="1" fill="none" opacity="0.5"/>
            <path d="M 182 94 Q 192 94 200 96" stroke="#7a2f1c" stroke-width="1" fill="none" opacity="0.5"/>
          </g>
        </g>

        <!-- HEAD BUBBLE: fat round head, anchored (doesn't rotate with curl) -->
        <!-- Rostrum spike (small serrated point between eye and body arch) -->
        <g class="rostrum">
          <path d="M 78 116
                   L 62 82
                   L 76 124 Z"
                fill="url(#shHead)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M 68 94 L 64 90" stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
          <path d="M 72 106 L 68 102" stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round"/>
        </g>
        <g class="head">
          <!-- Fat round head shield -->
          <path d="M 64 118
                   Q 108 106 112 150
                   Q 108 178 78 178
                   Q 48 178 38 156
                   Q 30 134 40 120
                   Q 50 112 64 118 Z"
                fill="url(#shHead)" stroke="#7a2f1c" stroke-width="2" stroke-linejoin="round"/>
          <!-- Head highlight -->
          <path d="M 52 130 Q 72 124 94 146"
                stroke="#ffe8d6" stroke-width="2.5" fill="none" stroke-linecap="round" opacity="0.6"/>
        </g>
      </g>

      <!-- FACE: eye + mouth on head -->
      <g class="face">
        <g class="eye">
          <circle class="eye-white" cx="74" cy="144" r="9" fill="#ffffff" stroke="#7a2f1c" stroke-width="1.6"/>
          <circle class="eyeball" cx="75" cy="145" r="4.8" fill="#2a2030"/>
          <circle class="eye-shine" cx="77" cy="142" r="1.7" fill="#ffffff"/>
          <rect class="eyelid" x="63" y="132" width="22" height="18" fill="#ff8f68"/>
        </g>
        <!-- Smile: curve goes DOWN-UP (U shape) — control y lower than endpoints -->
        <path class="mouth smile"
              d="M 74 162 Q 84 174 94 162"
              stroke="#2a2030" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Frown: inverted arc (∩ shape) — control y higher than endpoints -->
        <path class="mouth frown"
              d="M 74 170 Q 84 158 94 170"
              stroke="#2a2030" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <ellipse class="blush" cx="96" cy="162" rx="5" ry="3" fill="#ff6b6b" opacity="0.35"/>
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
