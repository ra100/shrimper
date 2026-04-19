/**
 * Parametric SVG shrimp. One scalar `condition` (0..100) drives spine curl,
 * face, and color via CSS custom properties. Idle breathe + blink loops run
 * continuously; bounce/deflate are transient event reactions.
 */

export function renderShrimp(): string {
  return `
    <svg class="shrimp" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-label="Shrimp character">
      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff9a80"/>
          <stop offset="100%" stop-color="#e8734a"/>
        </linearGradient>
      </defs>

      <g class="antennae">
        <path class="antenna left" d="M60 55 Q40 30 30 20" stroke="#b85a3c" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path class="antenna right" d="M68 52 Q55 25 48 12" stroke="#b85a3c" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>

      <g class="body">
        <g class="segment s1">
          <ellipse cx="70" cy="90" rx="28" ry="24" fill="url(#bodyGrad)" stroke="#b85a3c" stroke-width="2"/>
        </g>
        <g class="segment s2">
          <ellipse cx="95" cy="100" rx="20" ry="18" fill="url(#bodyGrad)" stroke="#b85a3c" stroke-width="2"/>
        </g>
        <g class="segment s3">
          <ellipse cx="118" cy="108" rx="18" ry="16" fill="url(#bodyGrad)" stroke="#b85a3c" stroke-width="2"/>
        </g>
        <g class="segment s4">
          <ellipse cx="140" cy="114" rx="16" ry="14" fill="url(#bodyGrad)" stroke="#b85a3c" stroke-width="2"/>
        </g>
        <g class="tail">
          <path d="M156 114 Q178 108 182 90 Q176 124 162 128 Z" fill="url(#bodyGrad)" stroke="#b85a3c" stroke-width="2" stroke-linejoin="round"/>
        </g>
      </g>

      <g class="face">
        <g class="eye left">
          <circle class="eyeball" cx="60" cy="85" r="4" fill="#2a2030"/>
          <rect class="eyelid" x="55" y="79" width="10" height="12" fill="#ff9a80"/>
        </g>
        <g class="eye right">
          <circle class="eyeball" cx="76" cy="82" r="4" fill="#2a2030"/>
          <rect class="eyelid" x="71" y="76" width="10" height="12" fill="#ff9a80"/>
        </g>
        <path class="mouth smile" d="M58 100 Q68 108 78 100" stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path class="mouth frown" d="M58 104 Q68 96 78 104" stroke="#2a2030" stroke-width="2" fill="none" stroke-linecap="round"/>
      </g>
    </svg>
  `
}

export function updateShrimp(root: HTMLElement, condition: number): void {
  const svg = root.querySelector<SVGElement>('.shrimp') ?? (root.matches?.('.shrimp') ? (root as unknown as SVGElement) : null)
  const target = (svg ?? root) as HTMLElement | SVGElement
  const c = Math.max(0, Math.min(1, condition / 100))
  ;(target as HTMLElement).style.setProperty('--c', String(c))
}

export function flashShrimp(root: HTMLElement, kind: 'bounce' | 'deflate'): void {
  const svg = root.querySelector<HTMLElement>('.shrimp') ?? root
  svg.classList.remove(kind)
  // Force reflow to restart animation
  void (svg as unknown as HTMLElement).offsetWidth
  svg.classList.add(kind)
  setTimeout(() => svg.classList.remove(kind), 400)
}
