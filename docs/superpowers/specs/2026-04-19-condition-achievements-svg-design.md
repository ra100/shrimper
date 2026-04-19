# Condition, Achievements, and Animated SVG — Design

**Date**: 2026-04-19
**Status**: Approved (brainstorm)
**Scope**: Replace XP/level progression with a bidirectional "condition" scalar plus a permanent achievements ratchet. Replace PNG character art with a single parametric SVG driven by CSS custom properties for smooth animation. Delete the abandoned ComfyUI/Flux pipeline.

## Motivation

The current progression system (XP-only-goes-up + level thresholds + discrete mood from `consecutiveIgnored`) creates two disconnected signals (level, mood) and loses the core posture metaphor: real posture degrades when neglected and improves when tended. A single "condition" scalar that moves both directions tells a more honest story and maps directly to one visual axis — spine curl, face, color — that an SVG can animate smoothly. Permanent achievements preserve the forward-motion reward loop that the now-volatile condition cannot provide on its own.

The PNG art pipeline (Flux Dev / ComfyUI) was an experiment that produced 15 static assets with no path to animation. SVG is a better fit for a character whose whole purpose is to express state change.

## Decisions

- **Condition** scalar: integer `0..100`, starts at `50` (neutral).
- **Deltas**: complete `+3`, ignore `-4` (asymmetric — bad is faster than good), snooze-then-complete `+1`, snooze itself `0`.
- **Idle behavior**: frozen. No decay when the tab is closed or no events happen. Condition only moves on user events.
- **Visual mapping**: continuous morph across the whole range. No discrete posture stages.
- **Achievements** (6 for v1): `firstStretch`, `threeInRow`, `streak7`, `streak30`, `total100`, `peakCondition`. Stored as timestamp-or-null map.
- **Migration**: none. Old localStorage schema is wiped on load — there are no existing users.
- **Cleanup**: delete PNG assets, `scripts/generate-shrimps.py`, `docs/art-prompts.md`, `flux2_dev_workflow.json` outright; git history preserves them.
- **SVG architecture**: single inline SVG mounted once; JS sets CSS custom properties; CSS `transition` + `@keyframes` handle all animation. No animation library.

## State Model

`src/state.ts`:

```ts
interface ShrimperSettings {
  minInterval: number  // minutes
  maxInterval: number  // minutes
}

interface ShrimperProgress {
  condition: number                // 0..100, start 50
  totalCompletions: number         // lifetime counter
  completionsToday: number         // resets per calendar day
  streak: number                   // consecutive days with >= 1 completion
  lastCompletionDate: string       // YYYY-MM-DD or ""
  completionsInRow: number         // consecutive completions since last ignore; drives threeInRow
  achievements: {
    firstStretch:  string | null   // ISO date on unlock
    threeInRow:    string | null
    streak7:       string | null
    streak30:      string | null
    total100:      string | null
    peakCondition: string | null
  }
}

interface ShrimperState {
  version: 2
  settings: ShrimperSettings
  progress: ShrimperProgress
}
```

Removed fields: `xp`, `level`, `consecutiveIgnored`. `consecutiveIgnored` is subsumed by `condition`; level/xp are gone entirely.

On load, if stored state has no `version` field or `version !== 2`, discard it and start fresh with defaults.

## Condition Math

```
recordCompletion(wasSnoozed):
  delta = wasSnoozed ? +1 : +3
  condition = clamp(condition + delta, 0, 100)
  totalCompletions += 1
  if lastCompletionDate !== today:
    streak = (lastCompletionDate == yesterday) ? streak + 1 : 1
    completionsToday = 1
  else:
    completionsToday += 1
  completionsInRow += 1
  lastCompletionDate = today
  checkAchievements() -> returns list of newly-unlocked ids

recordIgnored():
  condition = clamp(condition - 4, 0, 100)
  completionsInRow = 0
  // streak handling unchanged: streak naturally resets on the next
  // recordCompletion if a full day elapsed with no completion.

recordSnooze():
  // no condition change; a snooze is neutral until its outcome is known.
```

"Yesterday" check for streak continuity: parse `lastCompletionDate` and compare to `today - 1 day` in local time.

## Achievement Triggers

Checked inside `recordCompletion` after the state update. For each achievement whose key is currently `null` and whose trigger expression is now true, set the key to today's date string (`YYYY-MM-DD`). Return the list of newly-unlocked ids so the UI can queue celebrations.

| id              | name            | trigger                             |
| --------------- | --------------- | ----------------------------------- |
| `firstStretch`  | First Stretch   | `totalCompletions === 1`            |
| `threeInRow`    | Triple Threat   | `completionsInRow === 3`            |
| `streak7`       | Weekly Warrior  | `streak === 7`                      |
| `streak30`      | Monthly Master  | `streak === 30`                     |
| `total100`      | Century Shrimp  | `totalCompletions === 100`          |
| `peakCondition` | Peak Posture    | `condition === 100`                 |

Using `===` (not `>=`) is safe because achievements only unlock inside `recordCompletion`, and every completion increments the relevant counter by exactly one step, so the equality boundary is always hit. `peakCondition` hits when condition clamps to 100 on a `+3` (or `+1`) that would otherwise exceed it.

## SVG Character Architecture

File: `src/characters/shrimp.ts` — rewritten.

Public API:

```ts
export function renderShrimp(): string
// Returns static SVG markup. Mount once on init.

export function updateShrimp(root: HTMLElement, condition: number): void
// Sets CSS custom properties on the SVG root. CSS handles the rest.

export function flashShrimp(root: HTMLElement, kind: 'bounce' | 'deflate'): void
// Adds a class for ~400ms then removes it. Debounce if called again before it clears.
```

### Structure

```
<svg class="shrimp" viewBox="0 0 200 200">
  <g class="antennae">
    <path class="antenna left" />
    <path class="antenna right" />
  </g>
  <g class="body">
    <g class="segment s1"> <!-- head --> </g>
    <g class="segment s2"></g>
    <g class="segment s3"></g>
    <g class="segment s4"></g>
    <g class="tail"></g>
  </g>
  <g class="face">
    <g class="eye left">
      <circle class="eyeball" />
      <rect class="eyelid" />
    </g>
    <g class="eye right">
      <circle class="eyeball" />
      <rect class="eyelid" />
    </g>
    <path class="mouth smile" />
    <path class="mouth frown" />
  </g>
</svg>
```

### CSS-variable mapping

`updateShrimp` sets two variables on the `.shrimp` element:

- `--c`: condition normalized to `0..1` (= `condition / 100`).
- `--curl`: `calc(1 - var(--c))` — higher when sad; used to bend the spine.

CSS rules then derive all visuals:

- **Spine curl**: each `.segment` has `transform-origin` at its joint and `transform: rotate(calc(var(--curl) * Ndeg))` where `N` grows per segment (e.g. s1: 0, s2: 8, s3: 16, s4: 24, tail: 32). At condition=100 the shrimp is flat; at condition=0 it's a tight ball.
- **Eye droop**: on `.eye`, `transform: translateY(calc(var(--curl) * 3px)) scaleY(calc(0.5 + var(--c) * 0.5))`. The inner `.eyelid` is used only for blink, so eye droop and blink animate different elements and do not fight over the same property.
- **Mouth**: two paths, `.smile { opacity: var(--c); }` and `.frown { opacity: calc(1 - var(--c)); }`. Cross-fade.
- **Color tint**: `filter: hue-rotate(calc((var(--c) - 0.5) * 40deg)) saturate(calc(0.5 + var(--c) * 0.7))`. Desaturated and cool when sad, vivid and warm when happy.
- **Transitions**: applied only to elements that change with condition — `.segment`, `.tail`, `.eye`, `.mouth`, and `.shrimp` (for filter). Rule: `transition: transform 600ms ease, opacity 600ms ease, filter 600ms ease`. Idle-animated elements (`.body` for breathe, `.eyelid` for blink) are intentionally excluded so their CSS `@keyframes` run unthrottled.

### Idle loops

Always running, implemented as CSS `@keyframes`:

- **Breathe**: `.body { animation: breathe 3s ease-in-out infinite; }` — scales `1.00 → 1.02 → 1.00`.
- **Blink**: `.eyelid { animation: blink 6s infinite; }` with `.eye.right .eyelid { animation-delay: 0.3s; }` to stagger. Keyframe sets `scaleY(0)` (eye open) for most of the cycle and `scaleY(1)` (eye closed) for ~120ms. Transform origin is the top of the lid so it drops down and snaps back.

Each idle animation targets an element whose `transform` is not used by any condition-driven rule: breathe on `.body` (parent), curl on `.segment` (children of `.body`), eye droop on `.eye`, blink on `.eyelid` (child of `.eye`). Layers compose without fighting over the same property on the same element.

### Event reactions

`flashShrimp(root, 'bounce')` adds class `.bounce` for 400ms, which triggers a keyframe translating the shrimp `0 → -8px → 0`. `flashShrimp(root, 'deflate')` adds `.deflate`, a 400ms keyframe that nudges `filter: saturate(0.3)` and bumps `--curl` temporarily via an override.

Sparkle overlay on completion: a sibling element `<div class="sparkle-layer">` containing ~8 small absolutely-positioned span particles, each with a CSS keyframe that translates and fades. Added/removed by the UI layer when a completion fires.

## UI Integration

`src/ui.ts` changes:

- **Remove**: XP bar, level number display, level-up modal and its code path, `getMoodFromBehavior` usage.
- **Add**: condition bar rendering — a 0..100 horizontal bar with a gradient fill (red at 0, yellow at 50, green at 100). Optional numeric "% posture" label.
- **Add**: achievements grid — 6 tiles. Locked tiles show a grayscale silhouette icon and "?"; unlocked tiles show the color icon, the achievement name, and the unlock date.
- **Keep**: streak counter, completions today, settings panel, onboarding.

### Shrimp mount

Init calls `renderShrimp()` once and mounts the SVG. Every state update calls `updateShrimp(el, progress.condition)`. CSS transitions smooth the morph over 600ms. `flashShrimp` is called on completion (`bounce`) and ignore (`deflate`).

### Achievement celebration

New module `src/achievements.ts` (or a section inside `ui.ts`) exposes `celebrate(ids: string[])`. It maintains a queue so multiple unlocks in one event play sequentially.

Per celebration:

- Full-viewport transparent overlay appears.
- Centered card: large achievement icon, name, "Unlocked!" text.
- ~30 absolutely-positioned colored `<div>` particles fall with CSS keyframe `translateY + rotate + fade`, each with a random horizontal offset and delay via inline style.
- Auto-dismisses after 2.5s or on click/tap.
- Next queued celebration (if any) starts after dismissal.

### Escalation

`src/escalation.ts` is orthogonal to this change — it controls reminder interval timing, not progression. It stays as-is: shrink interval on ignore, restore on complete.

## Files Affected

Modified:

- `src/state.ts` — new schema, `recordCompletion` / `recordIgnored` / `recordSnooze`, achievement checker, hard-reset on old schema.
- `src/characters/shrimp.ts` — full rewrite per above.
- `src/ui.ts` — remove XP/level UI, add condition bar and achievements grid, wire `updateShrimp` / `flashShrimp` / `celebrate`.
- `src/app.ts` — replace XP event calls with condition event calls, route unlocked-achievement ids to celebration queue.
- `src/style.css` — all new CSS vars, transitions, idle keyframes, event keyframes, achievement grid, celebration overlay.
- `CLAUDE.md` — update architecture notes and the "XP only goes up" convention line.

Deleted:

- `public/characters/*.png` (15 files)
- `scripts/generate-shrimps.py`
- `docs/art-prompts.md`
- `flux2_dev_workflow.json`

## Testing Strategy

The project has no test framework and this change does not add one (YAGNI). Validation is:

- **Type check**: `npm run build` passes with strict TypeScript.
- **Manual dev-server pass**: exercise complete, ignore, snooze flows; confirm condition clamps at 0 and 100; force day rollover (temporarily edit `lastCompletionDate`) to confirm streak logic; trigger each achievement once; confirm old-schema localStorage is wiped on load.
- **Visual spot-check**: render shrimp at condition = 0, 25, 50, 75, 100; confirm spine, eyes, mouth, color move smoothly; confirm breathe + blink run continuously; confirm bounce and deflate fire and clear; confirm achievement celebration queues and auto-dismisses.

If automated tests are wanted later, a separate spec will cover test framework selection.

## Out of Scope

- Test framework selection.
- Migration from v1 state (no users).
- Additional achievements beyond the v1 six (follow-up pass if desired).
- Antenna wiggle and other idle flourishes (mentioned in brainstorm, deferred).
- Condition decay over time (explicitly rejected; frozen-while-idle is the model).
- Service workers / push notifications (pre-existing non-goal in `CLAUDE.md`).
