const ORIGINAL_TITLE = "Shrimper — Don't Be a Shrimp!"
let flashInterval: ReturnType<typeof setInterval> | null = null
let isFlashing = false

export function startTitleFlash(message: string): void {
  if (isFlashing) return
  isFlashing = true
  let showMessage = true

  flashInterval = setInterval(() => {
    document.title = showMessage ? `🦐 ${message}` : ORIGINAL_TITLE
    showMessage = !showMessage
  }, 1000)
}

export function stopTitleFlash(): void {
  if (flashInterval !== null) {
    clearInterval(flashInterval)
    flashInterval = null
  }
  isFlashing = false
  document.title = ORIGINAL_TITLE
}
