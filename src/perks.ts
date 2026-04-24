import type { ShrimperState } from './state'

export type PerkId = 'firstAid' | 'streakShield' | 'rewind' | 'freeSnooze' | 'skip' | 'graceHour'

interface PerkMeta {
  id: PerkId
  name: string
  icon: string
  blurb: string
}

export const PERK_ORDER: PerkId[] = [
  'firstAid',
  'streakShield',
  'rewind',
  'freeSnooze',
  'skip',
  'graceHour',
]

export const PERK_META: Record<PerkId, PerkMeta> = {
  firstAid: {
    id: 'firstAid',
    name: 'First Aid',
    icon: '🩹',
    blurb: 'Restore posture to 50% (no overheal).',
  },
  streakShield: {
    id: 'streakShield',
    name: 'Streak Shield',
    icon: '🔗',
    blurb: 'Survive one missed day without losing your streak. Armed until used.',
  },
  rewind: {
    id: 'rewind',
    name: 'Rewind',
    icon: '⏪',
    blurb: 'Undo the last ignored reminder — restore posture and combo.',
  },
  freeSnooze: {
    id: 'freeSnooze',
    name: 'Free Snooze',
    icon: '😴',
    blurb: 'Next snooze counts as a full completion (+3 instead of +1).',
  },
  skip: {
    id: 'skip',
    name: 'Skip',
    icon: '⏭️',
    blurb: 'Skip the next reminder — no penalty, no streak break.',
  },
  graceHour: {
    id: 'graceHour',
    name: 'Grace Hour',
    icon: '⏸️',
    blurb: 'Pause auto-decay for 1 hour (reminders keep firing).',
  },
}

export const PERK_TOKEN_CAP = 3
const TOKENS_PER_COMBO = 10 // one token per 10 completions-in-a-row
const IGNORE_REWIND_WINDOW_MS = 5 * 60 * 1000

// --- Earning --------------------------------------------------------------

export function maybeGrantTokenForCombo(state: ShrimperState): {
  state: ShrimperState
  granted: boolean
} {
  const combo = state.progress.completionsInRow
  if (combo <= 0 || combo % TOKENS_PER_COMBO !== 0) return { state, granted: false }
  if (state.progress.perkTokens >= PERK_TOKEN_CAP) return { state, granted: false }
  return {
    state: {
      ...state,
      progress: { ...state.progress, perkTokens: state.progress.perkTokens + 1 },
    },
    granted: true,
  }
}

// --- Usability checks -----------------------------------------------------

interface PerkUsability {
  usable: boolean
  reason?: string
}

export function getPerkUsability(state: ShrimperState, id: PerkId): PerkUsability {
  if (state.progress.perkTokens < 1) return { usable: false, reason: 'No tokens' }
  const p = state.progress
  const a = state.activePerks

  switch (id) {
    case 'firstAid':
      return p.condition < 50
        ? { usable: true }
        : { usable: false, reason: 'Posture already at 50% or higher' }
    case 'streakShield':
      if (a.streakShieldHeld) return { usable: false, reason: 'Shield already armed' }
      return p.streak > 0 ? { usable: true } : { usable: false, reason: 'No streak to protect' }
    case 'rewind': {
      const li = p.lastIgnore
      if (!li) return { usable: false, reason: 'Nothing to rewind' }
      if (Date.now() - li.at > IGNORE_REWIND_WINDOW_MS) {
        return { usable: false, reason: 'Too late — rewind window passed' }
      }
      return { usable: true }
    }
    case 'freeSnooze':
      if (!state.pendingReminder) return { usable: false, reason: 'No active reminder' }
      if (a.freeSnoozeArmed) return { usable: false, reason: 'Already armed' }
      return { usable: true }
    case 'skip':
      return a.skipNext ? { usable: false, reason: 'Skip already armed' } : { usable: true }
    case 'graceHour':
      return a.graceUntil > Date.now()
        ? { usable: false, reason: 'Grace Hour already active' }
        : { usable: true }
  }
}

// --- Apply effects --------------------------------------------------------

function spend(state: ShrimperState): ShrimperState {
  return {
    ...state,
    progress: { ...state.progress, perkTokens: Math.max(0, state.progress.perkTokens - 1) },
  }
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n))
}

export function usePerk(
  state: ShrimperState,
  id: PerkId,
): { state: ShrimperState; applied: boolean; effect?: PerkEffect } {
  const usability = getPerkUsability(state, id)
  if (!usability.usable) return { state, applied: false }

  const spent = spend(state)
  switch (id) {
    case 'firstAid': {
      const next: ShrimperState = {
        ...spent,
        progress: { ...spent.progress, condition: Math.max(spent.progress.condition, 50) },
      }
      return { state: next, applied: true, effect: { kind: 'firstAid' } }
    }
    case 'streakShield': {
      const next: ShrimperState = {
        ...spent,
        activePerks: { ...spent.activePerks, streakShieldHeld: true },
      }
      return { state: next, applied: true, effect: { kind: 'streakShield' } }
    }
    case 'rewind': {
      const li = spent.progress.lastIgnore
      if (!li) return { state, applied: false }
      const next: ShrimperState = {
        ...spent,
        progress: {
          ...spent.progress,
          condition: clamp(li.conditionBefore, 0, 100),
          completionsInRow: li.completionsInRowBefore,
          lastIgnore: null,
        },
        pendingReminder: spent.pendingReminder ?? {
          tipId: li.tipId,
          firedAt: Date.now(),
          lastDecayAt: Date.now(),
        },
      }
      return {
        state: next,
        applied: true,
        effect: { kind: 'rewind', tipId: li.tipId, restoredPending: !spent.pendingReminder },
      }
    }
    case 'freeSnooze': {
      const next: ShrimperState = {
        ...spent,
        activePerks: { ...spent.activePerks, freeSnoozeArmed: true },
      }
      return { state: next, applied: true, effect: { kind: 'freeSnooze' } }
    }
    case 'skip': {
      const next: ShrimperState = {
        ...spent,
        activePerks: { ...spent.activePerks, skipNext: true },
      }
      return { state: next, applied: true, effect: { kind: 'skip' } }
    }
    case 'graceHour': {
      const until = Date.now() + 60 * 60 * 1000
      const next: ShrimperState = {
        ...spent,
        activePerks: { ...spent.activePerks, graceUntil: until },
      }
      return { state: next, applied: true, effect: { kind: 'graceHour', until } }
    }
  }
}

type PerkEffect =
  | { kind: 'firstAid' }
  | { kind: 'streakShield' }
  | { kind: 'rewind'; tipId: string; restoredPending: boolean }
  | { kind: 'freeSnooze' }
  | { kind: 'skip' }
  | { kind: 'graceHour'; until: number }

// --- Consumers (called from app flow) -------------------------------------

export function isGraceActive(state: ShrimperState): boolean {
  return state.activePerks.graceUntil > Date.now()
}

export function consumeSkipIfArmed(state: ShrimperState): {
  state: ShrimperState
  skipped: boolean
} {
  if (!state.activePerks.skipNext) return { state, skipped: false }
  return {
    state: { ...state, activePerks: { ...state.activePerks, skipNext: false } },
    skipped: true,
  }
}

export function consumeFreeSnoozeIfArmed(state: ShrimperState): {
  state: ShrimperState
  free: boolean
} {
  if (!state.activePerks.freeSnoozeArmed) return { state, free: false }
  return {
    state: { ...state, activePerks: { ...state.activePerks, freeSnoozeArmed: false } },
    free: true,
  }
}

export function consumeStreakShieldIfArmed(state: ShrimperState): {
  state: ShrimperState
  saved: boolean
} {
  if (!state.activePerks.streakShieldHeld) return { state, saved: false }
  return {
    state: { ...state, activePerks: { ...state.activePerks, streakShieldHeld: false } },
    saved: true,
  }
}
