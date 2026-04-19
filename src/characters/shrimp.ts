/**
 * Parametric SVG shrimp — iteration 12.
 *
 * Design: head + body are ONE continuous tapering crescent. No separate
 * head bubble. Shape is fat at bottom-left (head) tapering up-right into
 * narrow tail base, where a tail fan flares out. Armor segments are
 * strokes across the body.
 *
 * Curl mechanic: tail fan rotates a bit. Body itself is static geometry.
 * Sad/happy differ by face expression + color filter + eye droop.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="-5 0 215 210" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="shBody" x1="0.2" y1="1" x2="0.8" y2="0">
          <stop offset="0%" stop-color="#ffb896"/>
          <stop offset="35%" stop-color="#ff8258"/>
          <stop offset="100%" stop-color="#c64826"/>
        </linearGradient>
        <linearGradient id="shFan" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#ff9470"/>
          <stop offset="100%" stop-color="#ffc0a0"/>
        </linearGradient>
        <radialGradient id="shBelly" cx="0.4" cy="0.8" r="0.6">
          <stop offset="0%" stop-color="#ffccb0" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#ffccb0" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Antennae: 2 thin whiskers trailing back from head -->
      <g class="antennae">
        <path class="antenna long-1"
              d="M 48 138 Q 18 162 4 196"
              stroke="#7a2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path class="antenna long-2"
              d="M 44 128 Q 14 130 4 124"
              stroke="#7a2f1c" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      </g>

      <g class="body">
        <!-- MAIN SHAPE: one continuous prawn silhouette.
             Head is the FAT ROUND LEFT END. Body arches up-right and tapers.
             Drawing clockwise from bottom of head:

             (55, 170)   -- head bottom
             curve up through belly
             (100, 175)  -- bottom midpoint of belly
             (150, 150)  -- tail joint bottom
             (180, 100)  -- tail base bottom (narrow)
             (185, 70)   -- tail base top (narrow)
             curve back over the arch
             (160, 70)   -- start of back arch
             (110, 60)   -- peak of back arch
             (70, 100)   -- head top
             (48, 120)   -- head left side
             (55, 170)   -- close -->
        <path class="main-body"
              d="M 55 172
                 Q 48 184 70 184
                 Q 110 186 150 164
                 Q 182 140 186 100
                 Q 188 72 174 64
                 Q 158 66 150 82
                 Q 128 116 98 120
                 Q 78 120 68 110
                 Q 54 96 46 112
                 Q 38 138 44 156
                 Q 48 168 55 172 Z"
              fill="url(#shBody)" stroke="#7a2f1c" stroke-width="2.2" stroke-linejoin="round"/>

        <!-- Segment armor joints (4 curves across body, following arch curvature) -->
        <path d="M 80 182 Q 72 150 74 124"
              stroke="#7a2f1c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 108 184 Q 100 148 108 108"
              stroke="#7a2f1c" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 136 174 Q 134 128 148 88"
              stroke="#7a2f1c" stroke-width="1.4" fill="none" stroke-linecap="round" opacity="0.5"/>
        <path d="M 162 152 Q 168 108 178 74"
              stroke="#7a2f1c" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.5"/>

        <!-- Dorsal highlight along outer back arch -->
        <path d="M 56 120 Q 110 64 178 70"
              stroke="#ffe8d6" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.55"/>

        <!-- Belly gradient overlay for depth -->
        <ellipse cx="100" cy="170" rx="60" ry="18" fill="url(#shBelly)"/>

        <!-- TAIL FAN at upper-right tip (around 180, 70) -->
        <g class="tail">
          <!-- Upper blade -->
          <path d="M 172 64
                   Q 194 28 202 14
                   Q 204 44 188 78 Z"
                fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Center blade -->
          <path d="M 178 72
                   Q 206 50 210 56
                   Q 204 80 190 88
                   Q 180 84 178 72 Z"
                fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Lower blade -->
          <path d="M 182 84
                   Q 206 86 206 100
                   Q 188 106 176 94
                   Q 176 88 182 84 Z"
                fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Fin ribs -->
          <path d="M 178 66 Q 188 42 196 22" stroke="#7a2f1c" stroke-width="0.8" fill="none" opacity="0.5"/>
          <path d="M 184 76 Q 194 66 204 62" stroke="#7a2f1c" stroke-width="0.8" fill="none" opacity="0.5"/>
          <path d="M 186 90 Q 196 92 202 96" stroke="#7a2f1c" stroke-width="0.8" fill="none" opacity="0.5"/>
        </g>
      </g>

      <!-- FACE: eye + mouth on head (fat left end, around x=60-80, y=145-170) -->
      <g class="face">
        <g class="eye">
          <circle class="eye-white" cx="72" cy="150" r="7" fill="#ffffff" stroke="#7a2f1c" stroke-width="1.4"/>
          <circle class="eyeball" cx="73" cy="151" r="3.8" fill="#2a2030"/>
          <circle class="eye-shine" cx="75" cy="149" r="1.3" fill="#ffffff"/>
          <rect class="eyelid" x="62" y="140" width="18" height="15" fill="#ff8258"/>
        </g>
        <!-- Smile: U-shape, control point BELOW endpoints -->
        <path class="mouth smile"
              d="M 70 166 Q 78 174 86 166"
              stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Frown: ∩-shape, control point ABOVE endpoints -->
        <path class="mouth frown"
              d="M 70 170 Q 78 162 86 170"
              stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Blush cheek -->
        <ellipse class="blush" cx="88" cy="164" rx="4.5" ry="2.8" fill="#ff6b6b" opacity="0.35"/>
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
