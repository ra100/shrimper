/**
 * Parametric SVG shrimp — iteration 19.
 *
 * Design: shrimp as chain of overlapping armor segments arranged in an arch.
 * Each segment = fat rounded shape. Head (biggest) front-left. Smaller
 * segments arc UP and OVER, descending toward tail fan on right side.
 *
 * Anatomy:
 *   Head bean:   (70, 110)  — big rounded cephalothorax
 *   Seg 2:       (100, 70)  — upper arch left
 *   Seg 3:       (130, 60)  — arch peak
 *   Seg 4:       (158, 80)  — upper arch right
 *   Seg 5:       (172, 110) — pre-tail
 *   Tail fan:    (180, 140) — flared down-back
 *
 * Curl: tail rotates further forward. Body arch itself static.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="shSeg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd4b8"/>
          <stop offset="45%" stop-color="#ff8a5c"/>
          <stop offset="100%" stop-color="#c14822"/>
        </linearGradient>
        <linearGradient id="shHeadGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd8bc"/>
          <stop offset="50%" stop-color="#ff8c60"/>
          <stop offset="100%" stop-color="#c84d24"/>
        </linearGradient>
        <linearGradient id="shFan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff9470"/>
          <stop offset="100%" stop-color="#ffc6a8"/>
        </linearGradient>
      </defs>

      <!-- ANTENNAE: 2 long curving whiskers up-forward -->
      <g class="antennae">
        <path class="antenna long-1"
              d="M 52 100 Q 20 70 30 28"
              stroke="#7a2f1c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path class="antenna long-2"
              d="M 58 92 Q 44 60 70 26"
              stroke="#7a2f1c" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>

      <!-- LEGS: 5 thin legs below body -->
      <g class="legs">
        <path d="M 50 148 L 44 168 L 40 170"
              stroke="#8a3a22" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 66 154 L 62 176 L 58 178"
              stroke="#8a3a22" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 84 156 L 84 180 L 80 182"
              stroke="#8a3a22" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 102 156 L 104 180 L 108 182"
              stroke="#8a3a22" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M 120 150 L 124 174 L 128 176"
              stroke="#8a3a22" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>

      <g class="body">
        <!-- HEAD (largest bean, front-left) — cephalothorax -->
        <g class="segment s1">
          <path d="M 36 112
                   Q 30 154 80 156
                   Q 104 156 104 114
                   Q 100 78 72 76
                   Q 40 80 36 112 Z"
                fill="url(#shHeadGrad)" stroke="#7a2f1c" stroke-width="2.2" stroke-linejoin="round"/>
          <!-- Rostrum: short pointed spike above head front -->
          <path d="M 42 82 L 34 52 L 54 82 Z"
                fill="url(#shHeadGrad)" stroke="#7a2f1c" stroke-width="1.6" stroke-linejoin="round"/>
          <!-- Head highlight -->
          <path d="M 46 96 Q 72 92 96 118"
                stroke="#ffe8d0" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>
        </g>

        <!-- Segment 2 (upper arch left, overlaps head) -->
        <g class="segment s2">
          <path d="M 94 84
                   Q 88 124 124 124
                   Q 142 120 138 82
                   Q 132 56 112 56
                   Q 94 60 94 84 Z"
                fill="url(#shSeg)" stroke="#7a2f1c" stroke-width="2" stroke-linejoin="round"/>
        </g>

        <!-- Segment 3 (arch peak) -->
        <g class="segment s3">
          <path d="M 128 76
                   Q 122 116 154 118
                   Q 170 114 166 78
                   Q 160 54 144 54
                   Q 128 58 128 76 Z"
                fill="url(#shSeg)" stroke="#7a2f1c" stroke-width="1.9" stroke-linejoin="round"/>
        </g>

        <!-- Segment 4 (arch right, smaller) -->
        <g class="segment s4">
          <path d="M 160 86
                   Q 156 120 180 122
                   Q 194 118 190 86
                   Q 184 66 174 66
                   Q 160 70 160 86 Z"
                fill="url(#shSeg)" stroke="#7a2f1c" stroke-width="1.8" stroke-linejoin="round"/>
        </g>

        <!-- Segment 5 (smallest, pre-tail) -->
        <g class="segment s5">
          <path d="M 186 100
                   Q 184 124 202 124
                   Q 212 120 208 100
                   Q 202 84 196 84
                   Q 186 88 186 100 Z"
                fill="url(#shSeg)" stroke="#7a2f1c" stroke-width="1.7" stroke-linejoin="round"/>
        </g>

        <!-- Dorsal highlight arc over top of all segments -->
        <path d="M 60 90 Q 132 44 198 100"
              stroke="#ffe8d0" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0.5"/>
      </g>

      <!-- TAIL FAN: sprouts from segment 5 tip (~210,114), splayed back-down -->
      <g class="tail">
        <!-- Upper blade (flat lobe) -->
        <path d="M 204 104
                 Q 220 94 218 116
                 Q 206 124 202 118 Z"
              fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Center telson (pointed) -->
        <path d="M 206 118
                 Q 224 128 218 150
                 Q 206 152 200 136 Z"
              fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Lower blade -->
        <path d="M 202 128
                 Q 216 150 204 166
                 Q 190 164 192 146 Z"
              fill="url(#shFan)" stroke="#7a2f1c" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Fin ribs -->
        <path d="M 206 110 Q 212 112 216 114" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
        <path d="M 208 126 Q 216 134 218 146" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
        <path d="M 202 140 Q 208 152 204 164" stroke="#7a2f1c" stroke-width="0.9" fill="none" opacity="0.5"/>
      </g>

      <!-- FACE: eye + mouth on head (head roughly x=40-90, y=80-150) -->
      <g class="face">
        <g class="eye">
          <circle class="eye-white" cx="56" cy="108" r="8" fill="#ffffff" stroke="#7a2f1c" stroke-width="1.5"/>
          <circle class="eyeball" cx="54" cy="110" r="4.2" fill="#2a2030"/>
          <circle class="eye-shine" cx="56" cy="108" r="1.5" fill="#ffffff"/>
          <rect class="eyelid" x="46" y="98" width="20" height="16" fill="#ff8c60"/>
        </g>
        <!-- Smile: U -->
        <path class="mouth smile"
              d="M 46 132 Q 56 142 66 132"
              stroke="#2a2030" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Frown: ∩ -->
        <path class="mouth frown"
              d="M 46 138 Q 56 128 66 138"
              stroke="#2a2030" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        <!-- Blush -->
        <ellipse class="blush" cx="72" cy="128" rx="4.5" ry="3" fill="#ff9a88" opacity="0.5"/>
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
