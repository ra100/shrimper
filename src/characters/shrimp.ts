/**
 * Shrimp character: 13-frame posture progression sprite.
 * Frame 0 = worst (crying/pain). Frame 12 = best (celebration).
 * Condition (0..100) → frame index (0..12).
 */

import s00 from '../assets/shrimp/stage-00.png'
import s01 from '../assets/shrimp/stage-01.png'
import s02 from '../assets/shrimp/stage-02.png'
import s03 from '../assets/shrimp/stage-03.png'
import s04 from '../assets/shrimp/stage-04.png'
import s05 from '../assets/shrimp/stage-05.png'
import s06 from '../assets/shrimp/stage-06.png'
import s07 from '../assets/shrimp/stage-07.png'
import s08 from '../assets/shrimp/stage-08.png'
import s09 from '../assets/shrimp/stage-09.png'
import s10 from '../assets/shrimp/stage-10.png'
import s11 from '../assets/shrimp/stage-11.png'
import s12 from '../assets/shrimp/stage-12.png'

const FRAMES: readonly string[] = [
  s00, s01, s02, s03, s04, s05, s06,
  s07, s08, s09, s10, s11, s12,
]

const FRAME_COUNT = FRAMES.length

export function renderShrimp(): string {
  return `<img class="shrimp" alt="Shrimp posture" src="${FRAMES[0]}" draggable="false">`
}

function findImg(root: HTMLElement): HTMLImageElement | null {
  if (root instanceof HTMLImageElement && root.classList.contains('shrimp')) return root
  return root.querySelector<HTMLImageElement>('img.shrimp')
}

export function updateShrimp(root: HTMLElement, condition: number): void {
  const img = findImg(root)
  if (!img) return
  const c = Math.max(0, Math.min(1, condition / 100))
  const idx = Math.min(FRAME_COUNT - 1, Math.floor(c * FRAME_COUNT))
  const src = FRAMES[idx]
  if (img.getAttribute('src') !== src) img.src = src
}

export function flashShrimp(root: HTMLElement, kind: 'bounce' | 'deflate'): void {
  const el: HTMLElement = findImg(root) ?? root
  el.classList.remove(kind)
  void el.offsetWidth
  el.classList.add(kind)
  setTimeout(() => el.classList.remove(kind), 400)
}
