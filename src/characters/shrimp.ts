/**
 * Parametric SVG shrimp. One scalar `condition` (0..100) drives spine curl,
 * face, and color via CSS custom properties. Idle breathe + blink loops run
 * continuously; bounce/deflate are transient event reactions.
 *
 * Anatomy: cephalothorax with rostrum + eye, 4 abdomen plates (overlapping
 * armor), tail fan (telson + 2 uropods), 2 antenna pairs (short antennules
 * + long trailing antennae), swimmerets below body.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="shrimpBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffb199"/>
          <stop offset="55%" stop-color="#ff8d6b"/>
          <stop offset="100%" stop-color="#e36440"/>
        </linearGradient>
        <linearGradient id="shrimpPlate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffc2a8"/>
          <stop offset="100%" stop-color="#ef7a52"/>
        </linearGradient>
      </defs>

      <!-- Antennae (behind body) -->
      <g class="antennae">
        <!-- Long trailing antennae -->
        <path class="antenna long-1" d="M 55 72 Q 20 50 8 20" stroke="#8a3a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path class="antenna long-2" d="M 58 68 Q 35 30 25 6" stroke="#8a3a22" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <!-- Short antennules -->
        <path class="antenna short-1" d="M 50 80 Q 40 62 38 52" stroke="#8a3a22" stroke-width="1.4" fill="none" stroke-linecap="round"/>
        <path class="antenna short-2" d="M 53 82 Q 48 70 48 60" stroke="#8a3a22" stroke-width="1.4" fill="none" stroke-linecap="round"/>
      </g>

      <!-- Body: cephalothorax + abdomen plates (front-to-back ordering) -->
      <g class="body">
        <!-- Swimmerets (legs) under body -->
        <g class="legs">
          <path d="M 72 120 L 70 132" stroke="#b85a3c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M 86 126 L 84 138" stroke="#b85a3c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M 100 130 L 99 142" stroke="#b85a3c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <path d="M 116 132 L 117 144" stroke="#b85a3c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        </g>

        <!-- s1: cephalothorax (head + body shield) with rostrum -->
        <g class="segment s1">
          <!-- Rostrum (pointed spike above head) -->
          <path d="M 48 72 L 20 50 L 42 66 Z" fill="url(#shrimpBody)" stroke="#8a3a22" stroke-width="1.5" stroke-linejoin="round"/>
          <!-- Main head shield -->
          <path d="M 45 70 Q 78 62 82 100 Q 75 122 55 120 Q 38 118 36 98 Q 35 82 45 70 Z"
                fill="url(#shrimpBody)" stroke="#8a3a22" stroke-width="1.8" stroke-linejoin="round"/>
          <!-- Shield highlight -->
          <path d="M 52 78 Q 68 76 72 92" stroke="#ffd4bc" stroke-width="1.5" fill="none" stroke-linecap="round" opacity="0.7"/>
        </g>

        <!-- s2: first abdomen plate -->
        <g class="segment s2">
          <path d="M 78 92 Q 98 88 104 112 Q 102 128 84 128 Q 72 126 72 112 Q 72 100 78 92 Z"
                fill="url(#shrimpPlate)" stroke="#8a3a22" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M 82 98 Q 95 96 98 110" stroke="#ffd4bc" stroke-width="1.2" fill="none" opacity="0.6"/>
        </g>

        <!-- s3: second abdomen plate -->
        <g class="segment s3">
          <path d="M 98 100 Q 118 96 122 120 Q 120 134 104 134 Q 92 132 92 118 Q 92 108 98 100 Z"
                fill="url(#shrimpPlate)" stroke="#8a3a22" stroke-width="1.6" stroke-linejoin="round"/>
          <path d="M 102 106 Q 114 104 117 116" stroke="#ffd4bc" stroke-width="1.2" fill="none" opacity="0.6"/>
        </g>

        <!-- s4: third abdomen plate (smaller, tapering) -->
        <g class="segment s4">
          <path d="M 118 108 Q 136 104 138 124 Q 136 136 122 136 Q 112 134 112 122 Q 112 114 118 108 Z"
                fill="url(#shrimpPlate)" stroke="#8a3a22" stroke-width="1.5" stroke-linejoin="round"/>
          <path d="M 122 114 Q 132 112 135 122" stroke="#ffd4bc" stroke-width="1.1" fill="none" opacity="0.6"/>
        </g>

        <!-- Tail fan: telson (center) + 2 uropods -->
        <g class="tail">
          <!-- Upper uropod -->
          <path d="M 138 118 Q 168 100 180 92 Q 172 112 148 126 Z"
                fill="url(#shrimpBody)" stroke="#8a3a22" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Telson (center) -->
          <path d="M 138 124 Q 172 122 186 120 Q 172 132 146 132 Z"
                fill="url(#shrimpPlate)" stroke="#8a3a22" stroke-width="1.4" stroke-linejoin="round"/>
          <!-- Lower uropod -->
          <path d="M 136 128 Q 166 138 178 146 Q 168 140 146 138 Z"
                fill="url(#shrimpBody)" stroke="#8a3a22" stroke-width="1.4" stroke-linejoin="round"/>
        </g>
      </g>

      <!-- Face: eye + mouth on cephalothorax -->
      <g class="face">
        <g class="eye left">
          <circle class="eye-white" cx="56" cy="88" r="5.5" fill="#ffffff" stroke="#8a3a22" stroke-width="1.2"/>
          <circle class="eyeball" cx="57" cy="89" r="3" fill="#2a2030"/>
          <circle class="eye-shine" cx="58" cy="87" r="1" fill="#ffffff"/>
          <rect class="eyelid" x="49" y="82" width="14" height="13" fill="#ff8d6b"/>
        </g>
        <path class="mouth smile" d="M 58 104 Q 64 109 70 104" stroke="#2a2030" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <path class="mouth frown" d="M 58 108 Q 64 103 70 108" stroke="#2a2030" stroke-width="1.6" fill="none" stroke-linecap="round"/>
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
