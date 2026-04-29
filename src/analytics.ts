declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string | number>) => void }
  }
}

function track(event: string, data?: Record<string, string | number>): void {
  window.umami?.track(event, data)
}

export function trackComplete(tipId: string, hadSnooze: boolean): void {
  track('reminder-complete', { tip: tipId, snoozed: hadSnooze ? 'yes' : 'no' })
}

export function trackSnooze(tipId: string, minutes: number): void {
  track('reminder-snooze', { tip: tipId, minutes })
}

export function trackDismiss(tipId: string): void {
  track('reminder-dismiss', { tip: tipId })
}

export function trackAchievement(id: string): void {
  track('achievement-unlock', { id })
}

export function trackPerk(id: string): void {
  track('perk-use', { id })
}

export function trackPause(paused: boolean): void {
  track(paused ? 'pause' : 'resume')
}

export function trackDailyChallengeComplete(id: string): void {
  track('daily-challenge-complete', { id })
}

export function trackDailyChallengeClaim(id: string): void {
  track('daily-challenge-claim', { id })
}
