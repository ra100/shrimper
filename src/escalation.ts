/**
 * Escalation adjusts the effective max interval based on user behavior.
 *
 * - Each ignored/dismissed reminder reduces the effective max by 25% of the
 *   gap between current effective max and the user-set minimum.
 * - Each completed reminder restores 10% of the gap between current effective
 *   max and the user-set maximum (the original range).
 * - The effective max never goes below the user-set minimum.
 * - The effective max never goes above the user-set maximum.
 */

export interface EscalationState {
  effectiveMax: number // current effective max interval in minutes
}

export function createEscalation(_userMin: number, userMax: number): EscalationState {
  return { effectiveMax: userMax }
}

export function escalateOnIgnore(state: EscalationState, userMin: number): EscalationState {
  const gap = state.effectiveMax - userMin
  const reduction = gap * 0.25
  const newMax = Math.max(userMin, state.effectiveMax - reduction)
  return { effectiveMax: Math.round(newMax * 10) / 10 }
}

export function deescalateOnComplete(state: EscalationState, userMax: number): EscalationState {
  const gap = userMax - state.effectiveMax
  const restoration = gap * 0.1
  const newMax = Math.min(userMax, state.effectiveMax + restoration)
  return { effectiveMax: Math.round(newMax * 10) / 10 }
}
