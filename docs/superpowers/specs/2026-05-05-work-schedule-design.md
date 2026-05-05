# Work Schedule Feature — Design Spec

## Summary

Allow users to configure active work hours and days so Shrimper only fires reminders (and applies decay penalties) during scheduled periods. Outside those windows, Kevin naps — no reminders, no penalty. User can manually wake Kevin to override.

## Data Model

Added to `ShrimperSettings`:

```ts
interface WorkSchedule {
  enabled: boolean
  days: [boolean, boolean, boolean, boolean, boolean, boolean, boolean] // Mon..Sun
  block1Start: string // "09:00" HH:MM 24h local
  block1End: string   // "12:00"
  block2Start: string // "13:00"
  block2End: string   // "17:00"
}
```

Defaults: `enabled: true`, Mon-Fri active, blocks 9-12 / 13-17.

Added to `ShrimperState` (top-level):

```ts
wakeOverrideUntil: number // epoch ms; 0 when inactive
```

## State Migration

Schema version 3 → 4. `loadState` migrates:
- Add `schedule` to settings with defaults (enabled, Mon-Fri, 9-12/13-17)
- Add `wakeOverrideUntil: 0` to state
- Preserve all existing data

## Core Module — `src/schedule.ts`

Pure functions, no side effects:

| Function | Purpose |
|----------|---------|
| `isWithinSchedule(schedule, wakeOverrideUntil): boolean` | True if current local time falls within an active block on an active day, OR wake override is active |
| `getNextActiveTime(schedule): Date \| null` | Start of next active window from now (for nap display). Null if no days enabled |
| `getMsUntilTransition(schedule): number` | Ms until next on→off or off→on boundary. Used to schedule transition checks |
| `parseTime(hhmm: string): { h: number, m: number }` | Parse "HH:MM" string |
| `isTimeInBlock(now: Date, start: string, end: string): boolean` | Check if time-of-day falls within a single block |

## Integration — `app.ts`

### Transition Timer

- On dashboard start and after each transition: schedule a `setTimeout` for `getMsUntilTransition()`.
- When off-hours start: enter nap state (stop reminder timer, stop decay timer, update dashboard).
- When active window starts: exit nap (resume reminder timer, clear wake override).

### Reminder Gating

- `handleReminder()`: before showing overlay, check `isWithinSchedule()`. If outside schedule, don't fire — instead schedule next reminder at `getNextActiveTime()`.
- Timer `scheduleNext()` call: if next fire time lands outside schedule, shift to next active window start.

### Existing Overlay (Decision B)

- If overlay is already showing when off-hours start, leave it open. User can still complete/snooze/dismiss.
- No new reminders scheduled until next active window.

### Decay During Off-Hours

- `catchUpDecay()`: skip decay ticks that fall within off-schedule time. Only count ticks from minutes within active windows.
- Simplification: if nap state entered cleanly (timer stopped), decay timer is cleared anyway. Edge case is page reload during off-hours with a stale `pendingReminder` — just clear it on load if outside schedule.

## Dashboard — Nap State

When outside schedule and no wake override:
- Shrimp SVG gets sleep overlay (💤 or z-z-z element positioned near head)
- Status text: "Kevin is napping 💤 — back at 13:00"
- "Wake Kevin" button replaces pause button area
- Countdown hidden

### Wake Override

- "Wake Kevin" button sets `wakeOverrideUntil` to next natural off→on transition (or end of current off-window).
- `isWithinSchedule` returns true while override active.
- Override clears automatically when next active window starts.

## Settings UI

Collapsible section in Settings panel: **Work Schedule**

```
[x] Enable work schedule
─────────────────────────────
Days: [M] [T] [W] [T] [F] [ ] [ ]

Morning:  [09]:[00] — [12]:[00]
Afternoon:[13]:[00] — [17]:[00]
```

- Toggle disables/enables without losing saved config.
- Day buttons are pill-style toggles.
- Time inputs are `<input type="time">` (native HH:MM picker).
- Validation: block start < block end. Block 2 start >= block 1 end (no overlap). If invalid, show inline error, don't save.

## Edge Cases

| Case | Behavior |
|------|----------|
| Block2 start == block1 end (e.g. 9-17 + 17-17) | Effectively one continuous block. Block 2 ignored (0-width) |
| All days unchecked + enabled | Treated as always-napping (like manual pause but from schedule). Show warning |
| User manually pauses during nap | Pause takes precedence. On unpause, check schedule → may stay in nap |
| Page reload during off-hours | Detect on load, enter nap state, clear any stale pending reminder without penalty |
| Wake override active + user goes to settings + disables schedule | Override cleared, schedule disabled, always-active mode |

## Achievements

No new achievements for v1. Could add "Night Shift" (complete reminder outside schedule with wake override) later.

## Analytics

Track events:
- `schedule_wake_override` — user wakes Kevin manually
- `schedule_nap_enter` — transition to nap (automatic)
- `schedule_nap_exit` — transition to active (automatic)

## Files Affected

| File | Change |
|------|--------|
| `src/state.ts` | Add `WorkSchedule` interface, add to settings, bump schema, migration |
| `src/schedule.ts` | New — pure schedule logic |
| `src/app.ts` | Transition timer, reminder gating, nap state management |
| `src/ui.ts` | Nap dashboard state, schedule settings section, wake button |
| `src/analytics.ts` | New event trackers |
| `styles.css` | Schedule settings styles, nap state styles |
